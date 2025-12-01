import {Engine} from '../engine/engine.js';
import {Ship} from '../engine/ship.js';

export class Ai {

    constructor(mapRadius, options = {}) {
        this.mapRadius = mapRadius;
        this.selectShipType = typeof options.selectShipType === 'function' ? options.selectShipType : (() => 'Turtle');
        this.scanIntervalMs = Number.isFinite(options.scanIntervalMs) && options.scanIntervalMs > 0 ? options.scanIntervalMs : 1000;
    }

    createNewShip() {
        let players = [];
        for (let i=0, j=gameObjects.length; i<j; i++) {
            if (gameObjects[i].Type == 'Player') {
                players.push(gameObjects[i]);
            }
        }
        let numberOfPlayers = players.length;
        let nextShipType = 0;
        if (numberOfPlayers == 0) {
            nextShipType = 0;
        } else if (numberOfPlayers == 1) {
            nextShipType = Math.floor((Math.random()*400)+1);
        } else if (numberOfPlayers == 2) {
            nextShipType = Math.floor((Math.random()*1600)+1);
        } else if (numberOfPlayers == 3) {
            nextShipType = Math.floor((Math.random()*3200)+1);
        } else {
            nextShipType = Math.floor((Math.random()*6400)+1);
        }
        if (nextShipType == 1 || nextShipType == 2) {
            const aiProfile = 'bot';
            const newAiShip = new Ship(Engine.getNextGameObjectId());
            const shipTypeId = this.selectShipType();
            newAiShip.init({shipTypeId, pilotType: 'Bot', aiProfile});
            newAiShip.setStartingAiPosition(this.mapRadius);
            gameObjects.push(newAiShip);
        }
    }       

    issueCommands(commands) {
        const now = Date.now();
        for (let x = 0, y = gameObjects.length; x < y; x++) {
            const gameObject = gameObjects[x];
            if (gameObject.Type === 'Ship' && gameObject.pilotType === 'Bot') {
                if (!Number.isFinite(gameObject.nextScanAt) || now >= gameObject.nextScanAt) {
                    this.think(commands, gameObject);
                    gameObject.nextScanAt = now + this.scanIntervalMs;
                }
            }
        }
    }

    scanForNearbyObjects(origin) {
        const sensorRadius = this.getSensorRadius(origin);
        if (!sensorRadius) {
            return {radius: 0, contacts: [], timestamp: Date.now()};
        }

        const radiusSquared = sensorRadius * sensorRadius;
        const pilotKillsByShipId = this.getPilotKillsByShipId();
        const contacts = [];
        for (let i = 0; i < gameObjects.length; i++) {
            const candidate = gameObjects[i];
            if (!candidate || candidate.Id === origin.Id) {
                continue;
            }
            if (!this.isObservable(candidate)) {
                continue;
            }
            const dx = candidate.LocationX - origin.LocationX;
            const dy = candidate.LocationY - origin.LocationY;
            const distanceSquared = dx * dx + dy * dy;
            if (distanceSquared > radiusSquared) {
                continue;
            }

            contacts.push(this.describeObservation(candidate, dx, dy, distanceSquared, pilotKillsByShipId));
        }

        contacts.sort((a, b) => a.distance - b.distance);

        return {
            radius: sensorRadius,
            contacts,
            timestamp: Date.now()
        };
    }

    getSensorRadius(origin) {
        if (!origin || !Number.isFinite(origin.Size)) {
            return 0;
        }
        const radius = origin.Size / 2;
        return radius > 0 ? radius * 10 : 0;
    }

    isObservable(candidate) {
        return candidate && Number.isFinite(candidate.LocationX) && Number.isFinite(candidate.LocationY);
    }

    describeObservation(candidate, dx, dy, distanceSquared, pilotKillsByShipId) {
        const distance = Math.sqrt(distanceSquared);
        const bearingRadians = Math.atan2(dy, dx);
        const hullStrength = Number.isFinite(candidate.HullStrength) ? candidate.HullStrength : undefined;
        const capacitor = Number.isFinite(candidate.Capacitor) ? candidate.Capacitor : undefined;
        const shieldStatus = Number.isFinite(candidate.ShieldStatus) ? candidate.ShieldStatus : undefined;
        const kills = pilotKillsByShipId?.get(candidate.Id);
        const killCount = Number.isFinite(kills) ? kills : undefined;
        return {
            id: candidate.Id,
            type: candidate.Type,
            shipTypeId: candidate.shipTypeId,
            pilotType: candidate.pilotType,
            distance,
            bearingRadians,
            bearingDegrees: bearingRadians * 180 / Math.PI,
            location: {
                x: candidate.LocationX,
                y: candidate.LocationY
            },
            velocity: candidate.Velocity,
            heading: candidate.Heading,
            facing: candidate.Facing,
            size: candidate.Size,
            hullStrength,
            capacitor,
            shieldStatus,
            kills: killCount
        };
    }

    getPilotKillsByShipId() {
        const killsByShipId = new Map();
        for (let i = 0; i < gameObjects.length; i++) {
            const pilot = gameObjects[i];
            if (!pilot || pilot.Type !== 'Player') {
                continue;
            }
            if (!Number.isFinite(pilot.ShipId)) {
                continue;
            }
            const kills = Number.isFinite(pilot.Kills) ? pilot.Kills : undefined;
            killsByShipId.set(pilot.ShipId, kills);
        }
        return killsByShipId;
    }

    think(commands, gameObject) {
        let commandType = 0;
        const profile = gameObject.aiProfile || 'bot';
        gameObject.lastScan = this.scanForNearbyObjects(gameObject);
        if (profile == 'bot') {
            switch (Math.floor(Math.random()*11+1)) {
                case 1:
                    commandType = 2;
                    break;
                case 3:
                case 4:
                case 11:
                case 10:
                    commandType = 0;
                    break;
                case 6:
                case 7:
                    commandType = 1;
                    break;
                case 8:
                case 9:
                    commandType = 3;
                    break;
                case 2:
                case 5:
                    commandType = 4;
                    break;
            }
        }
        commands.push({command: commandType, targetId: gameObject.Id});
    }
}
