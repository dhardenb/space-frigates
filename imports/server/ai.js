import {Engine} from '../engine/engine.js';
import {ViperShip} from '../engine/viperShip.js';
import {TurtleShip} from '../engine/turtleShip.js';
import {Ship} from '../engine/ship.js';

export class Ai {

    constructor(mapRadius, options = {}) {
        this.mapRadius = mapRadius;
        this.selectShipType = typeof options.selectShipType === 'function' ? options.selectShipType : (() => 'Turtle');
        this.scanIntervalMs = Number.isFinite(options.scanIntervalMs) && options.scanIntervalMs > 0 ? options.scanIntervalMs : 1000;
        this.attackScanIntervalMs = Number.isFinite(options.attackScanIntervalMs) && options.attackScanIntervalMs > 0 ? options.attackScanIntervalMs : 200;
        this.energyFullTolerance = 0.25;
        this.patrolCapacitorThreshold = 0.66;
        this.sensorRangeScale = Number.isFinite(options.sensorRangeScale) && options.sensorRangeScale > 0 ? options.sensorRangeScale : 40;
    }

    createNewShip() {
        let players = [];
        for (let i=0, j=gameObjects.length; i<j; i++) {
            if (gameObjects[i].type == 'Player') {
                players.push(gameObjects[i]);
            }
        }
        let numberOfPlayers = players.length;
        if (numberOfPlayers == 0) {
            return; // Don't create bots if no players
        }
        
        // Probability-based ship creation
        let spawnChance = 0;
        if (numberOfPlayers == 1) {
            spawnChance = 0.005; // 0.5% per frame (~0.3 ships/second at 60fps)
        } else if (numberOfPlayers == 2) {
            spawnChance = 0.00125; // 0.125% per frame (~0.075 ships/second at 60fps)
        } else if (numberOfPlayers == 3) {
            spawnChance = 0.000625; // 0.0625% per frame (~0.0375 ships/second at 60fps)
        } else {
            spawnChance = 0.0003125; // 0.03125% per frame (~0.01875 ships/second at 60fps)
        }
        
        if (Math.random() < spawnChance) {
            const aiProfile = 'bot';
            const shipTypeId = this.selectShipType();
            const newAiShip = shipTypeId === 'Viper'
                ? new ViperShip(Engine.getNextGameObjectId(), {pilotType: 'Bot', aiProfile})
                : new TurtleShip(Engine.getNextGameObjectId(), {pilotType: 'Bot', aiProfile});
            newAiShip.setStartingAiPosition(this.mapRadius);
            gameObjects.push(newAiShip);
        }
    }       

    issueCommands(commands) {
        const now = Date.now();
        for (let x = 0, y = gameObjects.length; x < y; x++) {
            const gameObject = gameObjects[x];
            if (gameObject.type === 'Ship' && gameObject.pilotType === 'Bot') {
                const shouldScan = !Number.isFinite(gameObject.nextScanAt) || now >= gameObject.nextScanAt;
                if (shouldScan) {
                    gameObject.lastScan = this.scanForNearbyObjects(gameObject);
                    const nextInterval = Number.isFinite(gameObject.activeScanIntervalMs) ? gameObject.activeScanIntervalMs : this.scanIntervalMs;
                    gameObject.nextScanAt = now + nextInterval;
                }

                this.think(commands, gameObject);
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
            if (!candidate || candidate.id === origin.id) {
                continue;
            }
            // Only scan Ship objects - other objects (Debris, Laser, etc.) should not be targeted
            if (candidate.type !== 'Ship') {
                continue;
            }
            if (!this.isObservable(candidate)) {
                continue;
            }
            const dx = candidate.locationX - origin.locationX;
            const dy = candidate.locationY - origin.locationY;
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
        if (!origin || !Number.isFinite(origin.lengthInMeters)) {
            return 0;
        }
        const radius = origin.lengthInMeters / 2;
        if (radius <= 0) {
            return 0;
        }

        // Scale sensor reach to align with the visual scale used when rendering ships so that
        // attack behavior triggers at comparable on-screen distances.
        return radius * this.sensorRangeScale;
    }

    isObservable(candidate) {
        return candidate && Number.isFinite(candidate.locationX) && Number.isFinite(candidate.locationY);
    }

    describeObservation(candidate, dx, dy, distanceSquared, pilotKillsByShipId) {
        const distance = Math.sqrt(distanceSquared);
        const bearingRadians = Math.atan2(dx, -dy);
        const hullStrength = Number.isFinite(candidate.hullStrength) ? candidate.hullStrength : undefined;
        const capacitor = Number.isFinite(candidate.capacitor) ? candidate.capacitor : undefined;
        const shieldStatus = Number.isFinite(candidate.shieldStatus) ? candidate.shieldStatus : undefined;
        const kills = pilotKillsByShipId?.get(candidate.id);
        const killCount = Number.isFinite(kills) ? kills : undefined;
        return {
            id: candidate.id,
            type: candidate.type,
            shipTypeId: candidate.shipTypeId,
            pilotType: candidate.pilotType,
            distance,
            bearingRadians,
            bearingDegrees: bearingRadians * 180 / Math.PI,
            location: {
                x: candidate.locationX,
                y: candidate.locationY
            },
            velocity: candidate.velocity,
            heading: candidate.heading,
            facing: candidate.facing,
            size: candidate.lengthInMeters || candidate.size,
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
            if (!pilot || pilot.type !== 'Player') {
                continue;
            }
            if (!Number.isFinite(pilot.shipId)) {
                continue;
            }
            const kills = Number.isFinite(pilot.kills) ? pilot.kills : undefined;
            killsByShipId.set(pilot.shipId, kills);
        }
        return killsByShipId;
    }

    think(commands, gameObject) {
        const profile = gameObject.aiProfile || 'bot';
        if (!gameObject.lastScan) {
            gameObject.lastScan = this.scanForNearbyObjects(gameObject);
        }
        if (profile !== 'bot') {
            return;
        }

        const previousMode = gameObject.aiMode;
        const modeContext = this.determineMode(gameObject, previousMode);
        gameObject.aiMode = modeContext.mode;
        gameObject.activeScanIntervalMs = this.getScanIntervalForMode(modeContext.mode);
        if (modeContext.mode) {
            gameObject.Name = modeContext.mode;
        }

        if (modeContext.mode === 'attack' && modeContext.target) {
            gameObject.attackTargetId = modeContext.target.id;
        } else {
            gameObject.attackTargetId = undefined;
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

    determineMode(gameObject, previousMode) {
        const scan = gameObject.lastScan || {contacts: []};
        const humanContacts = scan.contacts.filter(contact => contact && contact.pilotType === 'Human');
        const capacitorRatio = this.getCapacitorRatio(gameObject);

        if (humanContacts.length > 0) {
            const target = this.selectAttackTarget(gameObject, humanContacts, previousMode);
            return {mode: 'attack', target};
        }

        if (humanContacts.length === 0 && capacitorRatio < this.patrolCapacitorThreshold) {
            return {mode: 'recharge'};
        }

        return {mode: 'patrol'};
    }

    selectAttackTarget(gameObject, humanContacts, previousMode) {
        if (previousMode === 'attack' && Number.isFinite(gameObject.attackTargetId)) {
            const existingTarget = humanContacts.find(contact => contact.id === gameObject.attackTargetId);
            if (existingTarget) {
                return existingTarget;
            }
        }

        if (humanContacts.length === 0) {
            return undefined;
        }

        let closest = humanContacts[0];
        for (let i = 1; i < humanContacts.length; i++) {
            if (humanContacts[i].distance < closest.distance) {
                closest = humanContacts[i];
            }
        }
        return closest;
    }

    isCapacitorFull(gameObject) {
        if (!Number.isFinite(gameObject?.capacitor)) {
            return false;
        }
        const maxCapacitor = Number.isFinite(gameObject?.maxCapacitor) ? gameObject.maxCapacitor : gameObject.capacitor;
        const tolerance = Number.isFinite(this.energyFullTolerance) ? this.energyFullTolerance : 0;
        return gameObject.capacitor >= maxCapacitor - tolerance;
    }

    isShieldFull(gameObject) {
        if (!Number.isFinite(gameObject?.shieldStatus)) {
            return false;
        }
        const maxShield = Number.isFinite(gameObject?.maxShieldStrength) ? gameObject.maxShieldStrength : gameObject.shieldStatus;
        const tolerance = Number.isFinite(this.energyFullTolerance) ? this.energyFullTolerance : 0;
        return gameObject.shieldStatus >= maxShield - tolerance;
    }

    getCapacitorRatio(gameObject) {
        const capacitor = Number.isFinite(gameObject?.capacitor) ? gameObject.capacitor : 0;
        const maxCapacitor = Number.isFinite(gameObject?.maxCapacitor) ? gameObject.maxCapacitor : capacitor;
        if (maxCapacitor <= 0) {
            return 0;
        }
        return capacitor / maxCapacitor;
    }

    recharge(gameObject, commands) {
        commands.push({command: 4, targetId: gameObject.id});
        if (gameObject.shieldOn === 1) {
            commands.push({command: 5, targetId: gameObject.id});
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
            targetId: gameObject.id
        });

        gameObject.patrolState.step += 1;
    }

    attack(gameObject, modeContext, commands) {
        const target = modeContext.target;
        if (!target) {
            return;
        }

        // Find the target ship in gameObjects to get its current live position
        let targetShip = null;
        if (Number.isFinite(gameObject.attackTargetId)) {
            for (let i = 0; i < gameObjects.length; i++) {
                const candidate = gameObjects[i];
                // Verify it's the correct ID, is a Ship, and is a human-controlled ship
                if (candidate && candidate.id === gameObject.attackTargetId && candidate.type === 'Ship' && candidate.pilotType === 'Human') {
                    targetShip = candidate;
                    break;
                }
            }
        }

        // If target ship not found, fall back to scan data
        if (!targetShip || !Number.isFinite(targetShip.locationX) || !Number.isFinite(targetShip.locationY)) {
            // Use scan data as fallback
            const facing = Ship.normalizeAngle(Number.isFinite(gameObject.facing) ? gameObject.facing : 0);
            const desiredFacing = Ship.normalizeAngle(target.bearingDegrees);
            const angleDelta = Ship.normalizeSignedAngle(desiredFacing - facing);
            const angleTolerance = 10;
            const rotationVelocity = Math.abs(Number(gameObject.rotationVelocity) || 0);
            const rotationDirection = gameObject.rotationDirection || 'None';
            const rotationStopThreshold = 0.1;

            const desiredRotation = angleDelta > 0 ? 'Clockwise' : 'CounterClockwise';

            if (rotationDirection !== 'None' && rotationDirection !== desiredRotation && rotationVelocity > rotationStopThreshold) {
                const dampenCommand = rotationDirection === 'Clockwise' ? 1 : 3;
                commands.push({command: dampenCommand, targetId: gameObject.id});
                return;
            }

            if (Math.abs(angleDelta) > angleTolerance) {
                const rotateCommand = desiredRotation === 'Clockwise' ? 3 : 1;
                commands.push({command: rotateCommand, targetId: gameObject.id});
                return;
            }

            if (rotationVelocity > rotationStopThreshold && rotationDirection !== 'None') {
                const dampenCommand = rotationDirection === 'Clockwise' ? 1 : 3;
                commands.push({command: dampenCommand, targetId: gameObject.id});
                return;
            }

            commands.push({command: 0, targetId: gameObject.id});
            return;
        }

        // Calculate bearing from bot's current position to target's current position
        const dx = targetShip.locationX - gameObject.locationX;
        const dy = targetShip.locationY - gameObject.locationY;
        const bearingRadians = Math.atan2(dx, -dy);
        const bearingDegrees = bearingRadians * 180 / Math.PI;

        const facing = Ship.normalizeAngle(Number.isFinite(gameObject.facing) ? gameObject.facing : 0);
        const desiredFacing = Ship.normalizeAngle(bearingDegrees);
        const angleDelta = Ship.normalizeSignedAngle(desiredFacing - facing);
        const angleTolerance = 10;
        const rotationVelocity = Math.abs(Number(gameObject.rotationVelocity) || 0);
        const rotationDirection = gameObject.rotationDirection || 'None';
        const rotationStopThreshold = 0.1;

        const desiredRotation = angleDelta > 0 ? 'Clockwise' : 'CounterClockwise';

        // If rotating in wrong direction, dampen immediately
        if (rotationDirection !== 'None' && rotationDirection !== desiredRotation && rotationVelocity > rotationStopThreshold) {
            const dampenCommand = rotationDirection === 'Clockwise' ? 1 : 3;
            commands.push({command: dampenCommand, targetId: gameObject.id});
            return;
        }

        // If aligned (within tolerance), stop rotation if still rotating
        if (Math.abs(angleDelta) <= angleTolerance) {
            // Always try to stop rotation when aligned, even if velocity is low
            if (rotationDirection !== 'None' && rotationVelocity > 0) {
                const dampenCommand = rotationDirection === 'Clockwise' ? 1 : 3;
                commands.push({command: dampenCommand, targetId: gameObject.id});
                return;
            }
            // Aligned and stopped (rotationDirection is 'None' or velocity is 0), fire laser
            commands.push({command: 0, targetId: gameObject.id});
            return;
        }

        // Not aligned, rotate towards target
        // If already rotating in correct direction, check if we should start dampening early
        if (rotationDirection === desiredRotation) {
            // Estimate if we'll overshoot: if rotation velocity is high and we're close to alignment,
            // start dampening to prevent overshooting
            // Rotation formula from Physics.findNewFacing: rotationVelocity * 90 / framesPerSecond degrees per frame
            const framesPerSecond = 60; // Physics.framesPerSecond constant
            const estimatedRotationPerFrame = rotationVelocity * 90 / framesPerSecond;
            const framesToAlign = estimatedRotationPerFrame > 0 ? Math.abs(angleDelta) / estimatedRotationPerFrame : Infinity;
            // If we're close to alignment (within a few degrees) or will overshoot soon, start dampening
            // Also dampen if rotation velocity is already high (>= 2) to prevent excessive spinning
            if ((framesToAlign < 3 && rotationVelocity > 1) || rotationVelocity >= 2) {
                const dampenCommand = rotationDirection === 'Clockwise' ? 1 : 3;
                commands.push({command: dampenCommand, targetId: gameObject.id});
                return;
            }
            // Otherwise continue rotating (but only if velocity isn't too high)
            if (rotationVelocity < 2) {
                const rotateCommand = desiredRotation === 'Clockwise' ? 3 : 1;
                commands.push({command: rotateCommand, targetId: gameObject.id});
                return;
            }
            // Velocity is high but we're not close enough to dampen yet - don't issue command to let it coast
            // Actually, we should still dampen to prevent excessive velocity
            const dampenCommand = rotationDirection === 'Clockwise' ? 1 : 3;
            commands.push({command: dampenCommand, targetId: gameObject.id});
            return;
        }

        // Not rotating or rotating in wrong direction, start rotating
        const rotateCommand = desiredRotation === 'Clockwise' ? 3 : 1;
        commands.push({command: rotateCommand, targetId: gameObject.id});
    }

    getScanIntervalForMode(mode) {
        if (mode === 'attack') {
            return this.attackScanIntervalMs;
        }
        return this.scanIntervalMs;
    }
}
