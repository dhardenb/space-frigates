import {Engine} from '../engine/engine.js';
import {Ship} from '../engine/ship.js';

export class Ai {

    constructor(mapRadius, options = {}) {
        this.mapRadius = mapRadius;
        this.selectShipType = typeof options.selectShipType === 'function' ? options.selectShipType : (() => 'Turtle');
        this.scanIntervalMs = Number.isFinite(options.scanIntervalMs) && options.scanIntervalMs > 0 ? options.scanIntervalMs : 1000;
        this.energyFullTolerance = 0.25;
        this.patrolCapacitorThreshold = 0.66;
        this.sensorRangeScale = Number.isFinite(options.sensorRangeScale) && options.sensorRangeScale > 0 ? options.sensorRangeScale : 20;
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
        if (radius <= 0) {
            return 0;
        }

        // Scale sensor reach to align with the visual scale used when rendering ships so that
        // attack behavior triggers at comparable on-screen distances.
        return radius * this.sensorRangeScale;
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
        const profile = gameObject.aiProfile || 'bot';
        gameObject.lastScan = this.scanForNearbyObjects(gameObject);
        if (profile !== 'bot') {
            return;
        }

        const modeContext = this.determineMode(gameObject);
        gameObject.aiMode = modeContext.mode;
        if (modeContext.mode) {
            gameObject.Name = modeContext.mode;
        }

        switch (modeContext.mode) {
            case 'recharge':
                this.recharge(gameObject, commands);
                break;
            case 'attack':
                this.attack(gameObject, modeContext, commands);
                break;
            case 'patrol':
            default:
                this.patrol(gameObject, commands);
                break;
        }
    }

    determineMode(gameObject) {
        const scan = gameObject.lastScan || {contacts: []};
        const humanContacts = scan.contacts.filter(contact => contact && contact.pilotType === 'Human');
        const capacitorRatio = this.getCapacitorRatio(gameObject);

        if (humanContacts.length > 0) {
            return {mode: 'attack', target: humanContacts[0]};
        }

        if (humanContacts.length === 0 && capacitorRatio < this.patrolCapacitorThreshold) {
            return {mode: 'recharge'};
        }

        return {mode: 'patrol'};
    }

    isCapacitorFull(gameObject) {
        if (!Number.isFinite(gameObject?.Capacitor)) {
            return false;
        }
        const maxCapacitor = Number.isFinite(gameObject?.MaxCapacitor) ? gameObject.MaxCapacitor : gameObject.Capacitor;
        const tolerance = Number.isFinite(this.energyFullTolerance) ? this.energyFullTolerance : 0;
        return gameObject.Capacitor >= maxCapacitor - tolerance;
    }

    isShieldFull(gameObject) {
        if (!Number.isFinite(gameObject?.ShieldStatus)) {
            return false;
        }
        const maxShield = Number.isFinite(gameObject?.MaxShieldStrength) ? gameObject.MaxShieldStrength : gameObject.ShieldStatus;
        const tolerance = Number.isFinite(this.energyFullTolerance) ? this.energyFullTolerance : 0;
        return gameObject.ShieldStatus >= maxShield - tolerance;
    }

    getCapacitorRatio(gameObject) {
        const capacitor = Number.isFinite(gameObject?.Capacitor) ? gameObject.Capacitor : 0;
        const maxCapacitor = Number.isFinite(gameObject?.MaxCapacitor) ? gameObject.MaxCapacitor : capacitor;
        if (maxCapacitor <= 0) {
            return 0;
        }
        return capacitor / maxCapacitor;
    }

    recharge(gameObject, commands) {
        commands.push({command: 4, targetId: gameObject.Id});
        if (gameObject.ShieldOn === 1) {
            commands.push({command: 5, targetId: gameObject.Id});
        }
    }

    patrol(gameObject, commands) {
        const capacitorRatio = this.getCapacitorRatio(gameObject);
        if (capacitorRatio < this.patrolCapacitorThreshold) {
            return;
        }

        if (!gameObject.patrolState || typeof gameObject.patrolState !== 'object') {
            gameObject.patrolState = {
                rotationDirection: Math.random() < 0.5 ? 'Clockwise' : 'CounterClockwise',
                step: 0
            };
        }

        const rotationCommand = gameObject.patrolState.rotationDirection === 'Clockwise' ? 3 : 1;
        const shouldRotate = gameObject.patrolState.step % 3 === 0;

        commands.push({
            command: shouldRotate ? rotationCommand : 2,
            targetId: gameObject.Id
        });

        gameObject.patrolState.step += 1;
    }

    attack(gameObject, modeContext, commands) {
        const target = modeContext.target;
        if (!target) {
            return;
        }

        const facing = Ship.normalizeAngle(Number.isFinite(gameObject.Facing) ? gameObject.Facing : 0);
        const desiredFacing = Ship.normalizeAngle(target.bearingDegrees);
        const angleDelta = Ship.normalizeSignedAngle(desiredFacing - facing);
        const angleTolerance = 5;

        if (Math.abs(angleDelta) > angleTolerance) {
            const rotateCommand = angleDelta > 0 ? 1 : 3;
            commands.push({command: rotateCommand, targetId: gameObject.Id});
            return;
        }

        commands.push({command: 0, targetId: gameObject.Id});
    }
}
