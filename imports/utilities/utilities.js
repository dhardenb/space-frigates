const BINARY_MAGIC = 0x53464753; // 'SFGS'
const BINARY_VERSION = 4;

const TYPE_CODES = {
    Player: 1,
    Ship: 2,
    Debris: 3,
    Laser: 4,
    Sound: 5,
    Thruster: 6
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

        unpackedGameState.gameState = Utilities.removeByAttr(unpackedGameState.gameState, "Type", "Particle");

        const filteredGameState = [];
        for (let i = 0; i < unpackedGameState.gameState.length; i++) {
            const typeCode = Utilities.getTypeCode(unpackedGameState.gameState[i].Type);
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
        const typeCode = Utilities.getTypeCode(gameObject.Type);
        if (!typeCode) {
            return 0;
        }

        const BASE = 1; // type code

        switch (typeCode) {
            case TYPE_CODES.Player: {
                const nameBytes = Utilities.encodeString(gameObject.Name || "");
                const nameLength = Math.min(nameBytes.length, 255);
                return BASE + 4 /* Id */ + 1 /* name len */ + nameLength + 4 /* ShipId */ + 2 /* Kills */ + 2 /* Deaths */;
            }
            case TYPE_CODES.Ship: {
                return BASE + 4 /* Id */ + (4 * 10) /* numeric floats */ + 1 /* ShieldOn */ + 1 /* ship type */ + 1 /* pilot type */ + 1 /* auto pilot */;
            }
            case TYPE_CODES.Debris: {
                return BASE + 4 /* Id */ + (4 * 7);
            }
            case TYPE_CODES.Laser: {
                return BASE + 4 /* Id */ + (4 * 6) + 4 /* Owner */;
            }
            case TYPE_CODES.Sound: {
                const soundBytes = Utilities.encodeString(gameObject.SoundType || "");
                const soundLength = Math.min(soundBytes.length, 255);
                return BASE + 1 /* sound len */ + soundLength + (4 * 2);
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
        const typeCode = Utilities.getTypeCode(gameObject.Type);
        if (!typeCode) {
            return offset;
        }

        view.setUint8(offset, typeCode); offset += 1;

        switch (typeCode) {
            case TYPE_CODES.Player:
                view.setUint32(offset, (gameObject.Id >>> 0) || 0, true); offset += 4;
                offset = Utilities.writeShortString(view, offset, gameObject.Name || "");
                view.setUint32(offset, (gameObject.ShipId >>> 0) || 0, true); offset += 4;
                view.setUint16(offset, (gameObject.Kills >>> 0) || 0, true); offset += 2;
                view.setUint16(offset, (gameObject.Deaths >>> 0) || 0, true); offset += 2;
                break;
            case TYPE_CODES.Ship:
                view.setUint32(offset, (gameObject.Id >>> 0) || 0, true); offset += 4;
                offset = Utilities.writeFloatFields(view, offset, [
                    gameObject.LocationX,
                    gameObject.LocationY,
                    gameObject.Facing,
                    gameObject.Heading,
                    gameObject.Velocity,
                    gameObject.RotationDirection,
                    gameObject.RotationVelocity,
                    gameObject.ShieldStatus,
                    gameObject.HullStrength,
                    gameObject.Capacitor
                ]);
                view.setUint8(offset, gameObject.ShieldOn ? 1 : 0); offset += 1;
                view.setUint8(offset, SHIP_TYPE_CODES[gameObject.shipTypeId] || 0); offset += 1;
                view.setUint8(offset, PILOT_TYPE_CODES[gameObject.pilotType] || 0); offset += 1;
                view.setUint8(offset, gameObject.autoPilotEngaged ? 1 : 0); offset += 1;
                break;
            case TYPE_CODES.Debris:
                view.setUint32(offset, (gameObject.Id >>> 0) || 0, true); offset += 4;
                offset = Utilities.writeFloatFields(view, offset, [
                    gameObject.LocationX,
                    gameObject.LocationY,
                    gameObject.Facing,
                    gameObject.Heading,
                    gameObject.Velocity,
                    gameObject.RotationDirection,
                    gameObject.RotationVelocity
                ]);
                break;
            case TYPE_CODES.Laser:
                view.setUint32(offset, (gameObject.Id >>> 0) || 0, true); offset += 4;
                offset = Utilities.writeFloatFields(view, offset, [
                    gameObject.Fuel,
                    gameObject.LocationX,
                    gameObject.LocationY,
                    gameObject.Facing,
                    gameObject.Heading,
                    gameObject.Velocity
                ]);
                view.setUint32(offset, (gameObject.Owner >>> 0) || 0, true); offset += 4;
                break;
            case TYPE_CODES.Sound:
                offset = Utilities.writeShortString(view, offset, gameObject.SoundType || "");
                offset = Utilities.writeFloatFields(view, offset, [
                    gameObject.LocationX,
                    gameObject.LocationY
                ]);
                break;
            case TYPE_CODES.Thruster:
                view.setUint32(offset, (gameObject.Id >>> 0) || 0, true); offset += 4;
                offset = Utilities.writeFloatFields(view, offset, [
                    gameObject.Fuel,
                    gameObject.LocationX,
                    gameObject.LocationY,
                    gameObject.Facing,
                    gameObject.Heading,
                    gameObject.Velocity,
                    gameObject.Size
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

        const object = { Type: typeName };

        switch (typeCode) {
            case TYPE_CODES.Player: {
                object.Id = view.getUint32(offset, true); offset += 4;
                const result = Utilities.readShortString(view, offset);
                object.Name = result.value;
                offset = result.offset;
                object.ShipId = view.getUint32(offset, true); offset += 4;
                object.Kills = view.getUint16(offset, true); offset += 2;
                object.Deaths = view.getUint16(offset, true); offset += 2;
                break;
            }
            case TYPE_CODES.Ship: {
                object.Id = view.getUint32(offset, true); offset += 4;
                const values = Utilities.readFloatFields(view, offset, 10);
                offset = values.offset;
                [
                    object.LocationX,
                    object.LocationY,
                    object.Facing,
                    object.Heading,
                    object.Velocity,
                    object.RotationDirection,
                    object.RotationVelocity,
                    object.ShieldStatus,
                    object.HullStrength,
                    object.Capacitor
                ] = values.values;
                object.ShieldOn = view.getUint8(offset) === 1; offset += 1;
                object.shipTypeId = SHIP_TYPE_NAMES[view.getUint8(offset)] || null; offset += 1;
                object.pilotType = PILOT_TYPE_NAMES[view.getUint8(offset)] || 'Unknown'; offset += 1;
                object.autoPilotEngaged = view.getUint8(offset) === 1; offset += 1;
                break;
            }
            case TYPE_CODES.Debris: {
                object.Id = view.getUint32(offset, true); offset += 4;
                const values = Utilities.readFloatFields(view, offset, 7);
                offset = values.offset;
                [
                    object.LocationX,
                    object.LocationY,
                    object.Facing,
                    object.Heading,
                    object.Velocity,
                    object.RotationDirection,
                    object.RotationVelocity
                ] = values.values;
                break;
            }
            case TYPE_CODES.Laser: {
                object.Id = view.getUint32(offset, true); offset += 4;
                const values = Utilities.readFloatFields(view, offset, 6);
                offset = values.offset;
                [
                    object.Fuel,
                    object.LocationX,
                    object.LocationY,
                    object.Facing,
                    object.Heading,
                    object.Velocity
                ] = values.values;
                object.Owner = view.getUint32(offset, true); offset += 4;
                break;
            }
            case TYPE_CODES.Sound: {
                const result = Utilities.readShortString(view, offset);
                object.SoundType = result.value;
                offset = result.offset;
                const values = Utilities.readFloatFields(view, offset, 2);
                offset = values.offset;
                [
                    object.LocationX,
                    object.LocationY
                ] = values.values;
                break;
            }
            case TYPE_CODES.Thruster: {
                object.Id = view.getUint32(offset, true); offset += 4;
                const values = Utilities.readFloatFields(view, offset, 7);
                offset = values.offset;
                [
                    object.Fuel,
                    object.LocationX,
                    object.LocationY,
                    object.Facing,
                    object.Heading,
                    object.Velocity,
                    object.Size
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
