const BINARY_MAGIC = 0x53464753; // 'SFGS'
const BINARY_VERSION = 6;

const TYPE_CODES = {
    Player: 1,
    Ship: 2,
    Debris: 3,
    Laser: 4,
    Sound: 5,
    Thruster: 6,
    Explosion: 7
};

const TYPE_NAMES = Object.entries(TYPE_CODES).reduce((acc, [name, code]) => {
    acc[code] = name;
    return acc;
}, {});

const SHIP_TYPE_CODES = {
    Viper: 1,
    Turtle: 2
};

const SHIP_TYPE_NAMES = Object.entries(SHIP_TYPE_CODES).reduce((acc, [name, code]) => {
    acc[code] = name;
    return acc;
}, {});

const PILOT_TYPE_CODES = {
    Human: 1,
    Bot: 2
};

const PILOT_TYPE_NAMES = Object.entries(PILOT_TYPE_CODES).reduce((acc, [name, code]) => {
    acc[code] = name;
    return acc;
}, {});

const ROTATION_DIRECTION_CODES = {
    'None': 0,
    'Clockwise': 1,
    'CounterClockwise': 2
};

const ROTATION_DIRECTION_NAMES = Object.entries(ROTATION_DIRECTION_CODES).reduce((acc, [name, code]) => {
    acc[code] = name;
    return acc;
}, {});

const EVENT_CODES = {
    ShipDestroyed: 1
};

const EVENT_NAMES = Object.entries(EVENT_CODES).reduce((acc, [name, code]) => {
    acc[code] = name;
    return acc;
}, {});

const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
const textDecoder = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null;

const HEADER_SIZE =
    /* magic */ 4 +
    /* version */ 2 +
    /* updateId */ 4 +
    /* timestamp */ 8 +
    /* objectCount */ 4 +
    /* eventCount */ 4;

export class Utilities {

    static hashStringToUint32(value) {
        if (typeof value !== 'string') {
            return 0;
        }

        // FNV-1a hash for stable, fast 32-bit ids
        let hash = 0x811c9dc5;
        for (let i = 0; i < value.length; i++) {
            hash ^= value.charCodeAt(i);
            hash = Math.imul(hash, 0x01000193);
        }

        return hash >>> 0;
    }

    static removeByAttr(arr, attr, value) {
        let i = arr.length;
        while(i--) {
            if( arr[i]
                && arr[i].hasOwnProperty(attr)
                && (arguments.length > 2 && arr[i][attr] === value ) ) {
                    arr.splice(i,1);
                }
            }
        return arr;
    }

    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
    }

    static packGameState(unpackedGameState) {

        unpackedGameState.gameState = Utilities.removeByAttr(unpackedGameState.gameState, "type", "Particle");

        const filteredGameState = [];
        for (let i = 0; i < unpackedGameState.gameState.length; i++) {
            const typeCode = Utilities.getTypeCode(unpackedGameState.gameState[i].type);
            if (typeCode) {
                filteredGameState.push(unpackedGameState.gameState[i]);
            }
        }

        const candidateEvents = Array.isArray(unpackedGameState.events) ? unpackedGameState.events : [];
        const filteredEvents = [];
        for (let i = 0; i < candidateEvents.length; i++) {
            if (EVENT_CODES[candidateEvents[i].type]) {
                filteredEvents.push(candidateEvents[i]);
            }
        }
        const header = {
            updateId: Number(unpackedGameState.updateId) >>> 0,
            timestamp: Date.now(),
            objectCount: filteredGameState.length,
            eventCount: filteredEvents.length
        };

        const totalBytes = Utilities.calculateBinarySize(filteredGameState, filteredEvents);
        const buffer = new ArrayBuffer(totalBytes);
        const view = new DataView(buffer);
        let offset = 0;

        offset = Utilities.writeHeader(view, offset, header);

        for (let i = 0; i < filteredGameState.length; i++) {
            offset = Utilities.writeGameObject(view, offset, filteredGameState[i]);
        }

        for (let i = 0; i < filteredEvents.length; i++) {
            offset = Utilities.writeEvent(view, offset, filteredEvents[i]);
        }

        return new Uint8Array(buffer, 0, offset);

    }

    static unpackGameState(packedGameState) {
        if (!packedGameState) {
            throw new Error('Packed game state payload is empty');
        }

        let view;
        if (packedGameState instanceof ArrayBuffer) {
            view = new DataView(packedGameState);
        } else if (ArrayBuffer.isView(packedGameState)) {
            view = new DataView(
                packedGameState.buffer,
                packedGameState.byteOffset,
                packedGameState.byteLength
            );
        } else if (Array.isArray(packedGameState)) {
            if (packedGameState.length && Array.isArray(packedGameState[0])) {
                throw new Error('Legacy snapshot format is not supported by the binary decoder');
            }
            const uint = Uint8Array.from(packedGameState);
            view = new DataView(uint.buffer);
        } else {
            throw new Error('Packed game state must be an ArrayBuffer or TypedArray');
        }

        let offset = 0;

        const magic = view.getUint32(offset, true); offset += 4;
        if (magic !== BINARY_MAGIC) {
            throw new Error('Unknown game state payload');
        }

        const version = view.getUint16(offset, true); offset += 2;
        if (version !== BINARY_VERSION) {
            throw new Error(`Unsupported game state version: ${version}`);
        }

        const updateId = view.getUint32(offset, true); offset += 4;
        const timestamp = view.getFloat64(offset, true); offset += 8;
        const objectCount = view.getUint32(offset, true); offset += 4;
        const eventCount = view.getUint32(offset, true); offset += 4;

        const unpackedGameState = {
            update: {
                id: updateId,
                createdAt: timestamp
            },
            gameState: [],
            events: []
        };

        for (let i = 0; i < objectCount; i++) {
            const result = Utilities.readGameObject(view, offset);
            unpackedGameState.gameState.push(result.object);
            offset = result.offset;
        }

        for (let i = 0; i < eventCount; i++) {
            const result = Utilities.readEvent(view, offset);
            unpackedGameState.events.push(result.event);
            offset = result.offset;
        }

        return unpackedGameState;

    }

    static getTypeCode(typeName) {
        return TYPE_CODES[typeName] || null;
    }

    static encodeString(value = '') {
        const encoder = textEncoder;
        if (!encoder) {
            throw new Error('TextEncoder is not available in this environment');
        }
        return encoder.encode(String(value));
    }

    static decodeString(buffer) {
        const decoder = textDecoder;
        if (!decoder) {
            throw new Error('TextDecoder is not available in this environment');
        }
        return decoder.decode(buffer);
    }

    static getBinaryPayloadSize(payload) {
        if (!payload) {
            return 0;
        }
        if (typeof payload.byteLength === 'number') {
            return payload.byteLength;
        }
        if (ArrayBuffer.isView(payload)) {
            return payload.byteLength;
        }
        if (payload instanceof ArrayBuffer) {
            return payload.byteLength;
        }
        if (Array.isArray(payload)) {
            return payload.length;
        }
        return 0;
    }

    static calculateBinarySize(gameObjects, events) {
        let size = HEADER_SIZE;

        for (let i = 0; i < gameObjects.length; i++) {
            size += Utilities.calculateObjectSize(gameObjects[i]);
        }

        for (let i = 0; i < events.length; i++) {
            size += Utilities.calculateEventSize(events[i]);
        }

        return size;
    }

    static calculateObjectSize(gameObject) {
        const typeCode = Utilities.getTypeCode(gameObject.type);
        if (!typeCode) {
            return 0;
        }

        const BASE = 1; // type code

        switch (typeCode) {
            case TYPE_CODES.Player: {
                const nameBytes = Utilities.encodeString(gameObject.name || "");
                const nameLength = Math.min(nameBytes.length, 255);
                return BASE + 4 /* Id */ + 1 /* name len */ + nameLength + 4 /* ShipId */ + 2 /* Kills */ + 2 /* Deaths */;
            }
            case TYPE_CODES.Ship: {
                const nameBytes = Utilities.encodeString(gameObject.Name || "");
                const nameLength = Math.min(nameBytes.length, 255);
                return BASE + 4 /* Id */ + 1 /* name len */ + nameLength + (4 * 11) /* numeric floats */ + 1 /* ShieldOn */ + 1 /* ship type */ + 1 /* pilot type */ + 1 /* auto pilot */;
            }
            case TYPE_CODES.Debris: {
                return BASE + 4 /* Id */ + (4 * 7);
            }
            case TYPE_CODES.Laser: {
                return BASE + 4 /* Id */ + (4 * 6) + 4 /* Owner */;
            }
            case TYPE_CODES.Sound: {
                const soundBytes = Utilities.encodeString(gameObject.soundType || "");
                const soundLength = Math.min(soundBytes.length, 255);
                return BASE + 1 /* sound len */ + soundLength + (4 * 2);
            }
            case TYPE_CODES.Explosion: {
                const explosionBytes = Utilities.encodeString(gameObject.explosionType || "");
                const explosionLength = Math.min(explosionBytes.length, 255);
                return BASE + 1 /* explosion len */ + explosionLength + (4 * 5);
            }
            case TYPE_CODES.Thruster: {
                return BASE + 4 /* Id */ + (4 * 7);
            }
            default:
                return 0;
        }
    }

    static calculateEventSize(event) {
        const typeCode = EVENT_CODES[event.type];
        if (!typeCode) {
            return 0;
        }

        switch (typeCode) {
            case EVENT_CODES.ShipDestroyed:
                return 1 /* type */ + 4 /* shipId */ + 4 /* LocationX */ + 4 /* LocationY */;
            default:
                return 0;
        }
    }

    static writeHeader(view, offset, header) {
        view.setUint32(offset, BINARY_MAGIC, true); offset += 4;
        view.setUint16(offset, BINARY_VERSION, true); offset += 2;
        view.setUint32(offset, header.updateId >>> 0, true); offset += 4;
        view.setFloat64(offset, Number(header.timestamp) || 0, true); offset += 8;
        view.setUint32(offset, header.objectCount >>> 0, true); offset += 4;
        view.setUint32(offset, header.eventCount >>> 0, true); offset += 4;
        return offset;
    }

    static writeGameObject(view, offset, gameObject) {
        const typeCode = Utilities.getTypeCode(gameObject.type);
        if (!typeCode) {
            return offset;
        }

        view.setUint8(offset, typeCode); offset += 1;

        switch (typeCode) {
            case TYPE_CODES.Player:
                view.setUint32(offset, (gameObject.id >>> 0) || 0, true); offset += 4;
                offset = Utilities.writeShortString(view, offset, gameObject.name || "");
                view.setUint32(offset, (gameObject.shipId >>> 0) || 0, true); offset += 4;
                view.setUint16(offset, (gameObject.kills >>> 0) || 0, true); offset += 2;
                view.setUint16(offset, (gameObject.deaths >>> 0) || 0, true); offset += 2;
                break;
            case TYPE_CODES.Ship:
                view.setUint32(offset, (gameObject.id >>> 0) || 0, true); offset += 4;
                offset = Utilities.writeShortString(view, offset, gameObject.Name || "");
                const rotationDirectionCode = ROTATION_DIRECTION_CODES[gameObject.rotationDirection] || 0;
                offset = Utilities.writeFloatFields(view, offset, [
                    gameObject.locationX,
                    gameObject.locationY,
                    gameObject.facing,
                    gameObject.heading,
                    gameObject.velocity,
                    rotationDirectionCode,
                    gameObject.rotationVelocity,
                    gameObject.shieldStatus,
                    gameObject.hullStrength,
                    gameObject.capacitor
                ]);
                view.setUint8(offset, gameObject.shieldOn ? 1 : 0); offset += 1;
                view.setUint8(offset, SHIP_TYPE_CODES[gameObject.shipTypeId] || 0); offset += 1;
                view.setUint8(offset, PILOT_TYPE_CODES[gameObject.pilotType] || 0); offset += 1;
                view.setUint8(offset, gameObject.autoPilotEngaged ? 1 : 0); offset += 1;
                break;
            case TYPE_CODES.Debris:
                view.setUint32(offset, (gameObject.id >>> 0) || 0, true); offset += 4;
                const debrisRotationCode = ROTATION_DIRECTION_CODES[gameObject.rotationDirection] || 0;
                offset = Utilities.writeFloatFields(view, offset, [
                    gameObject.locationX,
                    gameObject.locationY,
                    gameObject.facing,
                    gameObject.heading,
                    gameObject.velocity,
                    debrisRotationCode,
                    gameObject.rotationVelocity
                ]);
                break;
            case TYPE_CODES.Laser:
                view.setUint32(offset, (gameObject.id >>> 0) || 0, true); offset += 4;
                offset = Utilities.writeFloatFields(view, offset, [
                    gameObject.fuel,
                    gameObject.locationX,
                    gameObject.locationY,
                    gameObject.facing,
                    gameObject.heading,
                    gameObject.velocity
                ]);
                view.setUint32(offset, (gameObject.owner >>> 0) || 0, true); offset += 4;
                break;
            case TYPE_CODES.Sound:
                offset = Utilities.writeShortString(view, offset, gameObject.soundType || "");
                offset = Utilities.writeFloatFields(view, offset, [
                    gameObject.locationX,
                    gameObject.locationY
                ]);
                break;
            case TYPE_CODES.Explosion:
                offset = Utilities.writeShortString(view, offset, gameObject.explosionType || "");
                offset = Utilities.writeFloatFields(view, offset, [
                    gameObject.locationX,
                    gameObject.locationY,
                    gameObject.size,
                    gameObject.fuel,
                    gameObject.maxFuel
                ]);
                break;
            case TYPE_CODES.Thruster:
                view.setUint32(offset, (gameObject.id >>> 0) || 0, true); offset += 4;
                offset = Utilities.writeFloatFields(view, offset, [
                    gameObject.fuel,
                    gameObject.locationX,
                    gameObject.locationY,
                    gameObject.facing,
                    gameObject.heading,
                    gameObject.velocity,
                    gameObject.size
                ]);
                break;
            default:
                break;
        }

        return offset;
    }

    static writeEvent(view, offset, event) {
        const typeCode = EVENT_CODES[event.type];
        if (!typeCode) {
            return offset;
        }

        view.setUint8(offset, typeCode); offset += 1;

        switch (typeCode) {
            case EVENT_CODES.ShipDestroyed:
                view.setUint32(offset, (event.shipId >>> 0) || 0, true); offset += 4;
                offset = Utilities.writeFloatFields(view, offset, [
                    event.locationX,
                    event.locationY
                ]);
                break;
            default:
                break;
        }

        return offset;
    }

    static readGameObject(view, offset) {
        const typeCode = view.getUint8(offset); offset += 1;
        const typeName = TYPE_NAMES[typeCode] || 'Unknown';

        const object = { type: typeName };

        switch (typeCode) {
            case TYPE_CODES.Player: {
                object.id = view.getUint32(offset, true); offset += 4;
                const result = Utilities.readShortString(view, offset);
                object.name = result.value;
                offset = result.offset;
                object.shipId = view.getUint32(offset, true); offset += 4;
                object.kills = view.getUint16(offset, true); offset += 2;
                object.deaths = view.getUint16(offset, true); offset += 2;
                break;
            }
            case TYPE_CODES.Ship: {
                object.id = view.getUint32(offset, true); offset += 4;
                const result = Utilities.readShortString(view, offset);
                object.Name = result.value;
                offset = result.offset;
                const values = Utilities.readFloatFields(view, offset, 10);
                offset = values.offset;
                let rotationDirectionCode;
                [
                    object.locationX,
                    object.locationY,
                    object.facing,
                    object.heading,
                    object.velocity,
                    rotationDirectionCode,
                    object.rotationVelocity,
                    object.shieldStatus,
                    object.hullStrength,
                    object.capacitor
                ] = values.values;
                // Convert rotationDirection from code to string
                object.rotationDirection = ROTATION_DIRECTION_NAMES[Math.round(rotationDirectionCode)] || 'None';
                object.shieldOn = view.getUint8(offset) === 1; offset += 1;
                object.shipTypeId = SHIP_TYPE_NAMES[view.getUint8(offset)] || null; offset += 1;
                object.pilotType = PILOT_TYPE_NAMES[view.getUint8(offset)] || 'Unknown'; offset += 1;
                object.autoPilotEngaged = view.getUint8(offset) === 1; offset += 1;
                break;
            }
            case TYPE_CODES.Debris: {
                object.id = view.getUint32(offset, true); offset += 4;
                const values = Utilities.readFloatFields(view, offset, 7);
                offset = values.offset;
                [
                    object.locationX,
                    object.locationY,
                    object.facing,
                    object.heading,
                    object.velocity,
                    object.rotationDirection,
                    object.rotationVelocity
                ] = values.values;
                // Convert rotationDirection from code to string
                const debrisRotationCode = Math.round(object.rotationDirection);
                object.rotationDirection = ROTATION_DIRECTION_NAMES[debrisRotationCode] || 'None';
                break;
            }
            case TYPE_CODES.Laser: {
                object.id = view.getUint32(offset, true); offset += 4;
                const values = Utilities.readFloatFields(view, offset, 6);
                offset = values.offset;
                [
                    object.fuel,
                    object.locationX,
                    object.locationY,
                    object.facing,
                    object.heading,
                    object.velocity
                ] = values.values;
                object.owner = view.getUint32(offset, true); offset += 4;
                break;
            }
            case TYPE_CODES.Sound: {
                const result = Utilities.readShortString(view, offset);
                object.soundType = result.value;
                offset = result.offset;
                const values = Utilities.readFloatFields(view, offset, 2);
                offset = values.offset;
                [
                    object.locationX,
                    object.locationY
                ] = values.values;
                break;
            }
            case TYPE_CODES.Explosion: {
                const result = Utilities.readShortString(view, offset);
                object.explosionType = result.value;
                offset = result.offset;
                const values = Utilities.readFloatFields(view, offset, 5);
                offset = values.offset;
                [
                    object.locationX,
                    object.locationY,
                    object.size,
                    object.fuel,
                    object.maxFuel
                ] = values.values;
                break;
            }
            case TYPE_CODES.Thruster: {
                object.id = view.getUint32(offset, true); offset += 4;
                const values = Utilities.readFloatFields(view, offset, 7);
                offset = values.offset;
                [
                    object.fuel,
                    object.locationX,
                    object.locationY,
                    object.facing,
                    object.heading,
                    object.velocity,
                    object.size
                ] = values.values;
                break;
            }
            default:
                break;
        }

        return { object, offset };
    }

    static readEvent(view, offset) {
        const typeCode = view.getUint8(offset); offset += 1;
        const event = { type: EVENT_NAMES[typeCode] || 'Unknown' };

        switch (typeCode) {
            case EVENT_CODES.ShipDestroyed: {
                event.shipId = view.getUint32(offset, true); offset += 4;
                const values = Utilities.readFloatFields(view, offset, 2);
                offset = values.offset;
                [
                    event.locationX,
                    event.locationY
                ] = values.values;
                break;
            }
            default:
                break;
        }

        return { event, offset };
    }

    static writeShortString(view, offset, value) {
        const encoded = Utilities.encodeString(value);
        const length = Math.min(encoded.length, 255);
        view.setUint8(offset, length); offset += 1;
        for (let i = 0; i < length; i++) {
            view.setUint8(offset + i, encoded[i]);
        }
        offset += length;
        return offset;
    }

    static readShortString(view, offset) {
        const length = view.getUint8(offset); offset += 1;
        const bytes = new Uint8Array(view.buffer, view.byteOffset + offset, length);
        const value = Utilities.decodeString(bytes);
        offset += length;
        return { value, offset };
    }

    static writeFloatFields(view, offset, fields) {
        for (let i = 0; i < fields.length; i++) {
            view.setFloat32(offset, Number(fields[i]) || 0, true);
            offset += 4;
        }
        return offset;
    }

    static readFloatFields(view, offset, count) {
        const values = [];
        for (let i = 0; i < count; i++) {
            values.push(view.getFloat32(offset, true));
            offset += 4;
        }
        return { values, offset };
    }
}
