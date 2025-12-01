import {Player} from './player.js';
import {Laser} from './laser.js';
import {Ship} from './ship.js';
import {Particle} from './particle.js';
import {LaserParticle} from './laserParticle.js';
import {Thruster} from './thruster.js';
import {Debris} from './debris.js';
import {Sound} from './sound.js';
import {Physics} from './physics.js';
import {Utilities} from '../utilities/utilities.js';
import {COLLISION_DIMENSIONS} from './config/collisionDimensions.js';

// IMPORTANT: COLLISION_DIMENSIONS drives both the per-object metadata
// (collisionLengthMeters/collisionWidthMeters) and these engine-level
// fallbacks. Update the shared configuration before relying on new sizes.
const COLLISION_BOX_SPECS = COLLISION_DIMENSIONS;

export class Engine {

    static gameObjectId = 0;

    constructor(mapRadius) {
        this.deadObjects = [];
        this.explosionSize = 20;
        this.mapRadius = mapRadius;
        this.eventRecorder = null;
    }

    static getNextGameObjectId() {
        return ++Engine.gameObjectId;
    }

    update(commands, framesPerSecond) {
        // Can't pre calculate the length of the array because some of the command create new objects
        for (let i = 0; i < gameObjects.length; i++) {
            gameObjects[i].update(commands, framesPerSecond);
        }
        this.collisionDetection();
        this.boundryChecking();
        this.fuelDetection();
    }

    collisionDetection() {
        const solidObjects = this.findSolidObjects();
        // Run colision detection for each solidObject
        const isShip = (obj) => obj && obj.Type === 'Ship';

        for (let i = 0, j = solidObjects.length; i < j; i++) {
            for (let k = i + 1, l = solidObjects.length; k < l; k++) {
                if (this.objectsCollide(solidObjects[i], solidObjects[k])) {
                    const handled = this.handleSpecialCollisionCases(solidObjects[i], solidObjects[k], isShip);
                    if (!handled) {
                        this.resolveInelasticCollision(solidObjects[i], solidObjects[k]);
                    }
                }
            }
        }
        this.removeDeadObjects();
    }

    objectsCollide(objectA, objectB) {
        const boxA = this.buildBoundingBox(objectA);
        const boxB = this.buildBoundingBox(objectB);

        if (boxA && boxB) {
            return this.boxesOverlap(boxA, boxB);
        }

        // Fallback to legacy radius check if bounding box data is unavailable
        const deltaX = (objectA.LocationX || 0) - (objectB.LocationX || 0);
        const deltaY = (objectA.LocationY || 0) - (objectB.LocationY || 0);
        const radiusSum = (objectA.Size || 0) / 2 + (objectB.Size || 0) / 2;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY) < radiusSum;
    }

    buildBoundingBox(gameObject) {
        if (!gameObject) {
            return null;
        }
        const spec = this.getBoundingBoxSpec(gameObject);
        const centerX = Number(gameObject.LocationX);
        const centerY = Number(gameObject.LocationY);
        if (!Number.isFinite(centerX) || !Number.isFinite(centerY)) {
            return null;
        }

        const headingDegrees = Number.isFinite(gameObject.Heading)
            ? gameObject.Heading
            : (Number.isFinite(gameObject.Facing) ? gameObject.Facing : 0);
        const headingRadians = headingDegrees * Math.PI / 180;

        const axisLength = this.normalizeAxis({
            x: Math.sin(headingRadians),
            y: -Math.cos(headingRadians)
        });
        const axisWidth = this.normalizeAxis({
            x: Math.cos(headingRadians),
            y: Math.sin(headingRadians)
        });

        return {
            center: {x: centerX, y: centerY},
            halfLength: spec.length / 2,
            halfWidth: spec.width / 2,
            axisLength,
            axisWidth
        };
    }

    getBoundingBoxSpec(gameObject) {
        if (!gameObject) {
            return {length: 1, width: 1};
        }

        const objectLength = Number(gameObject.collisionLengthMeters);
        const objectWidth = Number(gameObject.collisionWidthMeters);
        if (objectLength > 0 && objectWidth > 0) {
            return {length: objectLength, width: objectWidth};
        }

        const explicitSpec = COLLISION_BOX_SPECS[gameObject.Type];
        if (explicitSpec) {
            return explicitSpec;
        }

        const fallbackSize = Number(gameObject.Size) || 1;
        return {length: fallbackSize, width: fallbackSize};
    }

    normalizeAxis(axis) {
        const magnitude = Math.sqrt(axis.x * axis.x + axis.y * axis.y) || 1;
        return {
            x: axis.x / magnitude,
            y: axis.y / magnitude
        };
    }

    projectBoxOntoAxis(box, axis) {
        const normalizedAxis = this.normalizeAxis(axis);
        const centerProjection = box.center.x * normalizedAxis.x + box.center.y * normalizedAxis.y;
        const lengthContribution = box.halfLength * Math.abs(box.axisLength.x * normalizedAxis.x + box.axisLength.y * normalizedAxis.y);
        const widthContribution = box.halfWidth * Math.abs(box.axisWidth.x * normalizedAxis.x + box.axisWidth.y * normalizedAxis.y);
        const radius = lengthContribution + widthContribution;
        return {
            min: centerProjection - radius,
            max: centerProjection + radius
        };
    }

    boxesOverlap(boxA, boxB) {
        const axes = [
            boxA.axisLength,
            boxA.axisWidth,
            boxB.axisLength,
            boxB.axisWidth
        ];

        for (let i = 0; i < axes.length; i++) {
            const axis = axes[i];
            if (!axis) {
                continue;
            }
            const projectionA = this.projectBoxOntoAxis(boxA, axis);
            const projectionB = this.projectBoxOntoAxis(boxB, axis);

            if (projectionA.max < projectionB.min || projectionB.max < projectionA.min) {
                return false;
            }
        }

        return true;
    }

    handleSpecialCollisionCases(objectA, objectB, isShip) {
        // ship hit by laser (any orientation of inputs)
        if (this.isLaserShipCollision(objectA, objectB, isShip)) {
            return true;
        }

        if (this.isLaserLaserCollision(objectA, objectB)) {
            return true;
        }

        return false;
    }

    isLaserShipCollision(objectA, objectB, isShip) {
        const laserHitsTarget = (laser, target) => {
            // The amount of damage that the laser does is determined by
            // the amount of fuel remaining. So, the amount of damage
            // done by the laser is reduced the farther it travels.
            // NOTE: Once a laser runs out of fuel it disappears
            const damage = laser.Fuel;
            target.takeDamage(damage);
            this.createLaserExplosion(laser);
            if (target.HullStrength <= 0) {
                if (target.Type !== 'Debris') {
                    this.createDebris(target);
                }
                this.createExplosion(target);
                this.deadObjects.push(target);
                if (target.Type === 'Ship') {
                    this.scoreDeath(target.Id);
                    this.scoreKill(laser.Owner);
                    this.recordShipDestroyed(target);
                }
            }
            return true;
        };

        if (objectA.Type === 'Laser' && isShip(objectB)) {
            return laserHitsTarget(objectA, objectB);
        }
        if (objectB.Type === 'Laser' && isShip(objectA)) {
            return laserHitsTarget(objectB, objectA);
        }
        if (objectA.Type === 'Laser' && objectB.Type === 'Debris') {
            return laserHitsTarget(objectA, objectB);
        }
        if (objectB.Type === 'Laser' && objectA.Type === 'Debris') {
            return laserHitsTarget(objectB, objectA);
        }
        return false;
    }

    isLaserLaserCollision(objectA, objectB) {
        if (objectA.Type !== 'Laser' || objectB.Type !== 'Laser') {
            return false;
        }

        this.createImpactExplosion(objectA, objectB, true);
        this.deadObjects.push(objectA, objectB);
        return true;
    }

    resolveInelasticCollision(objectA, objectB) {
        if (!objectA || !objectB) {
            return;
        }
        if (!objectA.Mass || !objectB.Mass) {
            return;
        }

        const normalX = objectB.LocationX - objectA.LocationX;
        const normalY = objectB.LocationY - objectA.LocationY;
        const normalMagnitude = Math.sqrt(normalX * normalX + normalY * normalY) || 1;
        const unitNormalX = normalX / normalMagnitude;
        const unitNormalY = normalY / normalMagnitude;

        const velocityAX = Physics.getXaxisComponent(objectA.Heading, objectA.Velocity);
        const velocityAY = Physics.getYaxisComponent(objectA.Heading, objectA.Velocity);
        const velocityBX = Physics.getXaxisComponent(objectB.Heading, objectB.Velocity);
        const velocityBY = Physics.getYaxisComponent(objectB.Heading, objectB.Velocity);

        const relativeVelocityX = velocityAX - velocityBX;
        const relativeVelocityY = velocityAY - velocityBY;
        const relativeVelocityAlongNormal = relativeVelocityX * unitNormalX + relativeVelocityY * unitNormalY;

        // If objects are already moving apart, no need to resolve
        if (relativeVelocityAlongNormal <= 0) {
            return;
        }

        const restitution = 0.2; // low bounce to avoid ships ricocheting around
        const inverseMassA = 1 / objectA.Mass;
        const inverseMassB = 1 / objectB.Mass;
        const impulseScalar = -(1 + restitution) * relativeVelocityAlongNormal / (inverseMassA + inverseMassB);

        const impulseX = impulseScalar * unitNormalX;
        const impulseY = impulseScalar * unitNormalY;

        const newVelocityAX = velocityAX + impulseX * inverseMassA;
        const newVelocityAY = velocityAY + impulseY * inverseMassA;
        const newVelocityBX = velocityBX - impulseX * inverseMassB;
        const newVelocityBY = velocityBY - impulseY * inverseMassB;

        const headingVelocityA = Physics.vectorToHeadingAndVelocity(newVelocityAX, newVelocityAY);
        objectA.Heading = headingVelocityA.heading;
        objectA.Velocity = headingVelocityA.velocity;

        const headingVelocityB = Physics.vectorToHeadingAndVelocity(newVelocityBX, newVelocityBY);
        objectB.Heading = headingVelocityB.heading;
        objectB.Velocity = headingVelocityB.velocity;

        this.applyCollisionDamage(objectA, objectB, relativeVelocityAlongNormal);
        this.createImpactExplosion(objectA, objectB);
    }

    applyCollisionDamage(objectA, objectB, relativeVelocityAlongNormal) {
        const reducedMass = (objectA.Mass * objectB.Mass) / (objectA.Mass + objectB.Mass);
        const impactSpeed = Math.abs(relativeVelocityAlongNormal);
        const impactEnergy = 0.5 * reducedMass * impactSpeed * impactSpeed;
        const damageScale = 10000;
        const damage = impactEnergy / damageScale;

        const totalMass = objectA.Mass + objectB.Mass;
        const damageToA = damage * (objectB.Mass / totalMass);
        const damageToB = damage * (objectA.Mass / totalMass);

        if (objectA.HullStrength !== undefined) {
            objectA.takeDamage(damageToA);
        }
        if (objectB.HullStrength !== undefined) {
            objectB.takeDamage(damageToB);
        }

        this.handleDestroyedObject(objectA, objectB);
        this.handleDestroyedObject(objectB, objectA);
    }

    handleDestroyedObject(targetObject, sourceObject) {
        if (targetObject.HullStrength !== undefined && targetObject.HullStrength <= 0) {
            if (targetObject.Type !== 'Debris') {
                this.createDebris(targetObject);
            }
            this.createExplosion(targetObject);
            this.deadObjects.push(targetObject);
            if (targetObject.Type === 'Ship') {
                this.scoreDeath(targetObject.Id);
                this.recordShipDestroyed(targetObject);
                if (sourceObject && sourceObject.Id) {
                    this.scoreKill(sourceObject.Id);
                }
            }
        }
    }

    createImpactExplosion(objectA, objectB, useLaserParticles = false) {
        const impactPoint = {
            LocationX: (objectA.LocationX + objectB.LocationX) / 2,
            LocationY: (objectA.LocationY + objectB.LocationY) / 2,
            Size: Math.max(objectA.Size, objectB.Size)
        };
        if (useLaserParticles) {
            const laserFuel = this.sumLaserFuel(objectA, objectB);
            if (laserFuel.maxFuel > 0) {
                impactPoint.Fuel = laserFuel.remainingFuel;
                impactPoint.MaxFuel = laserFuel.maxFuel;
            }
            this.createLaserExplosion(impactPoint);
        }
        else {
            this.createExplosion(impactPoint);
        }
    }

    sumLaserFuel(...objects) {
        return objects.reduce((totals, object) => {
            if (object && object.Type === 'Laser') {
                totals.remainingFuel += Math.max(0, object.Fuel || 0);
                totals.maxFuel += Math.max(0, object.MaxFuel || 0);
            }
            return totals;
        }, {remainingFuel: 0, maxFuel: 0});
    }

    createDebris(sourceGameObject) {
        const newDebris = new Debris(Engine.getNextGameObjectId(), sourceGameObject);
        gameObjects.push(newDebris);
    }

    createExplosion(sourceGameObject) {
        for (let i = 0; i < this.explosionSize; i++) {
            const newParticle = new Particle(Engine.getNextGameObjectId());
            newParticle.init(sourceGameObject);
            gameObjects.push(newParticle);
        }
    }

    createLaserExplosion(sourceGameObject) {
        const fuelRatio = sourceGameObject && sourceGameObject.MaxFuel
            ? Math.max(0, Math.min(1, (sourceGameObject.Fuel || 0) / sourceGameObject.MaxFuel))
            : null;
        const sparksToSpawn = fuelRatio === null
            ? this.explosionSize
            : Math.max(1, Math.round(this.explosionSize * fuelRatio));

        for (let i = 0; i < sparksToSpawn; i++) {
            const newParticle = new LaserParticle(Engine.getNextGameObjectId());
            newParticle.init(sourceGameObject);
            gameObjects.push(newParticle);
        }
    }

    fuelDetection() {
        for (let x = 0, y = gameObjects.length; x < y; x++) {
            if (gameObjects[x].Fuel < 0) {
                this.recordShipDestroyed(gameObjects[x]);
                this.deadObjects.push(gameObjects[x]);
            }
        }
        this.removeDeadObjects();
    }

    findSolidObjects() {
        const solidObjects = [];
        for (let x = 0, y = gameObjects.length; x < y; x++) {
            if (gameObjects[x].Type != 'Particle' && gameObjects[x].Type != 'LaserParticle' && gameObjects[x].Type != 'Thruster' && gameObjects[x].Type != 'Player' && gameObjects[x].Type != 'Sound') {
                solidObjects.push(gameObjects[x])
            }
        }
        return solidObjects;
    }

    boundryChecking() {
        const solidObjects = this.findSolidObjects();
        for (let x = 0, y = solidObjects.length; x < y; x++) {
            // Check to see if GameObject has flown past the border. I do this by measuring the distance
            // from the Game Object to the center of the screen and making sure the distance is smaller
            // than the radius of the screen.
            if (!(solidObjects[x].LocationX * solidObjects[x].LocationX + solidObjects[x].LocationY * solidObjects[x].LocationY < this.mapRadius * this.mapRadius)) {
                if (solidObjects[x].Type === 'Laser') {
                    this.createLaserExplosion(solidObjects[x]);
                }
                else {
                    this.createExplosion(solidObjects[x]);
                }
                this.scoreDeath(solidObjects[x].Id);
                this.deadObjects.push(solidObjects[x]);
                this.recordShipDestroyed(solidObjects[x]);
            }
        }
        this.removeDeadObjects();
    }

    removeDeadObjects() {
        for (let x = 0, y = this.deadObjects.length; x < y; x++) {
            let i = 0;
            for (let j = 0; j < gameObjects.length; j++) {
                if (gameObjects[j].Id == this.deadObjects[x].Id) {
                    gameObjects.splice(i, 1);
                }
                else {
                    i++;
                }
            }
        }
        this.deadObjects = [];
    }

    removeSoundObjects() {
        gameObjects = Utilities.removeByAttr(gameObjects, "Type", "Sound");
    }

    convertObjects(localGameObjects, remoteGameObjects) {
        // Reconcile remote snapshots into the existing array to avoid thrashing
        const constructors = {
            Player: Player,
            Ship: Ship,
            Laser: Laser,
            Debris: Debris,
            Sound: Sound,
            Thruster: Thruster
        };

        const managedTypes = new Set(Object.keys(constructors));
        const existingById = new Map();
        const preservedObjects = [];
        for (let i = 0; i < localGameObjects.length; i++) {
            const obj = localGameObjects[i];

            if (!obj || !obj.Type) {
                continue;
            }

            if (!managedTypes.has(obj.Type)) {
                preservedObjects.push(obj);
                continue;
            }

            if (obj && typeof obj.Id !== 'undefined') {
                existingById.set(obj.Id, obj);
            }
        }

        const mergedObjects = [];
        for (let i = 0; i < remoteGameObjects.length; i++) {
            const remoteObject = remoteGameObjects[i];
            const ctor = constructors[remoteObject.Type];

            if (!ctor) {
                continue;
            }

            const hasStableId = typeof remoteObject.Id !== 'undefined';
            let instance = null;

            if (hasStableId && existingById.has(remoteObject.Id)) {
                const candidate = existingById.get(remoteObject.Id);
                if (candidate && candidate.Type === remoteObject.Type) {
                    instance = candidate;
                }
            }

            if (instance) {
                Object.assign(instance, remoteObject);
            } else {
                instance = Object.assign(new ctor(), remoteObject);
            }

            if (instance instanceof Ship && typeof instance.applyShipTypeDefaults === 'function') {
                instance.applyShipTypeDefaults();
            }

            mergedObjects.push(instance);
        }

        localGameObjects.length = 0;
        for (let i = 0; i < mergedObjects.length; i++) {
            localGameObjects.push(mergedObjects[i]);
        }
        for (let i = 0; i < preservedObjects.length; i++) {
            localGameObjects.push(preservedObjects[i]);
        }

        return localGameObjects;
    }

    setEventRecorder(recorder) {
        this.eventRecorder = recorder;
    }

    recordEvent(event) {
        if (typeof this.eventRecorder === 'function' && event) {
            this.eventRecorder(event);
        }
    }

    recordShipDestroyed(gameObject) {
        if (!gameObject) {
            return;
        }
        if (gameObject.Type == 'Ship') {
            this.recordEvent({
                type: 'ShipDestroyed',
                shipId: gameObject.Id,
                locationX: gameObject.LocationX,
                locationY: gameObject.LocationY
            });
        }
    }

    scoreKill(shipId) {
        for (let x = 0, y = gameObjects.length; x < y; x++) {
            if (gameObjects[x].Type == 'Player') {
                if (gameObjects[x].ShipId == shipId) {
                    gameObjects[x].Kills += 1;
                }
            }
        }
    }

    scoreDeath(shipId) {
        for (let x = 0, y = gameObjects.length; x < y; x++) {
            if (gameObjects[x].Type == 'Player') {
                if (gameObjects[x].ShipId == shipId) {
                    gameObjects[x].Deaths += 1;
                }
            }
        }
    }
}