import {Player} from './player.js';
import {Laser} from './laser.js';
import {Ship} from './ship.js';
import {ViperShip} from './viperShip.js';
import {TurtleShip} from './turtleShip.js';
import {FireParticle} from './fireParticle.js';
import {LaserParticle} from './laserParticle.js';
import {Thruster} from './thruster.js';
import {Debris} from './debris.js';
import {Sound} from './sound.js';
import {Explosion} from './explosion.js';
import {Physics} from './physics.js';
import {Utilities} from '../utilities/utilities.js';

export class Engine {

    static gameObjectId = 0;

    constructor(mapRadius) {
        this.deadObjects = [];
        this.explosionSize = 20;
        this.mapRadius = mapRadius;
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
        const isShip = (obj) => obj && obj.type === 'Ship';

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
        const deltaX = (objectA.locationX || 0) - (objectB.locationX || 0);
        const deltaY = (objectA.locationY || 0) - (objectB.locationY || 0);
        const radiusA = (objectA.lengthInMeters || objectA.size || 0) / 2;
        const radiusB = (objectB.lengthInMeters || objectB.size || 0) / 2;
        const radiusSum = radiusA + radiusB;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY) < radiusSum;
    }

    buildBoundingBox(gameObject) {
        if (!gameObject) {
            return null;
        }
        const spec = this.getBoundingBoxSpec(gameObject);
        const centerX = Number(gameObject.locationX);
        const centerY = Number(gameObject.locationY);
        if (!Number.isFinite(centerX) || !Number.isFinite(centerY)) {
            return null;
        }

        const headingDegrees = Number.isFinite(gameObject.heading)
            ? gameObject.heading
            : (Number.isFinite(gameObject.facing) ? gameObject.facing : 0);
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

        const objectLength = Number(gameObject.lengthInMeters);
        const objectWidth = Number(gameObject.widthInMeters);
        if (objectLength > 0 && objectWidth > 0) {
            return {length: objectLength, width: objectWidth};
        }

        // Fallback: return default dimensions if lengthInMeters/widthInMeters not set
        return {length: 1, width: 1};
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
            const damage = laser.fuel;
            target.takeDamage(damage);
            this.createLaserExplosion(laser);
            if (target.hullStrength <= 0) {
                if (target.type !== 'Debris') {
                    this.createDebris(target);
                }
                this.createExplosion(target);
                this.deadObjects.push(target);
                if (target.type === 'Ship') {
                    this.scoreDeath(target.id);
                    this.scoreKill(laser.owner);
                }
            }
            return true;
        };

        if (objectA.type === 'Laser' && isShip(objectB)) {
            return laserHitsTarget(objectA, objectB);
        }
        if (objectB.type === 'Laser' && isShip(objectA)) {
            return laserHitsTarget(objectB, objectA);
        }
        if (objectA.type === 'Laser' && objectB.type === 'Debris') {
            return laserHitsTarget(objectA, objectB);
        }
        if (objectB.type === 'Laser' && objectA.type === 'Debris') {
            return laserHitsTarget(objectB, objectA);
        }
        return false;
    }

    isLaserLaserCollision(objectA, objectB) {
        if (objectA.type !== 'Laser' || objectB.type !== 'Laser') {
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
        if (!objectA.mass || !objectB.mass) {
            return;
        }

        const normalX = objectB.locationX - objectA.locationX;
        const normalY = objectB.locationY - objectA.locationY;
        const normalMagnitude = Math.sqrt(normalX * normalX + normalY * normalY) || 1;
        const unitNormalX = normalX / normalMagnitude;
        const unitNormalY = normalY / normalMagnitude;

        const velocityAX = Physics.getXaxisComponent(objectA.heading, objectA.velocity);
        const velocityAY = Physics.getYaxisComponent(objectA.heading, objectA.velocity);
        const velocityBX = Physics.getXaxisComponent(objectB.heading, objectB.velocity);
        const velocityBY = Physics.getYaxisComponent(objectB.heading, objectB.velocity);

        const relativeVelocityX = velocityAX - velocityBX;
        const relativeVelocityY = velocityAY - velocityBY;
        const relativeVelocityAlongNormal = relativeVelocityX * unitNormalX + relativeVelocityY * unitNormalY;

        // If objects are already moving apart, no need to resolve
        if (relativeVelocityAlongNormal <= 0) {
            return;
        }

        const restitution = 0.2; // low bounce to avoid ships ricocheting around
        const inverseMassA = 1 / objectA.mass;
        const inverseMassB = 1 / objectB.mass;
        const impulseScalar = -(1 + restitution) * relativeVelocityAlongNormal / (inverseMassA + inverseMassB);

        const impulseX = impulseScalar * unitNormalX;
        const impulseY = impulseScalar * unitNormalY;

        const newVelocityAX = velocityAX + impulseX * inverseMassA;
        const newVelocityAY = velocityAY + impulseY * inverseMassA;
        const newVelocityBX = velocityBX - impulseX * inverseMassB;
        const newVelocityBY = velocityBY - impulseY * inverseMassB;

        const headingVelocityA = Physics.vectorToHeadingAndVelocity(newVelocityAX, newVelocityAY);
        objectA.heading = headingVelocityA.heading;
        objectA.velocity = headingVelocityA.velocity;

        const headingVelocityB = Physics.vectorToHeadingAndVelocity(newVelocityBX, newVelocityBY);
        objectB.heading = headingVelocityB.heading;
        objectB.velocity = headingVelocityB.velocity;

        this.applyCollisionDamage(objectA, objectB, relativeVelocityAlongNormal);
        this.createImpactExplosion(objectA, objectB);
    }

    applyCollisionDamage(objectA, objectB, relativeVelocityAlongNormal) {
        const reducedMass = (objectA.mass * objectB.mass) / (objectA.mass + objectB.mass);
        const impactSpeed = Math.abs(relativeVelocityAlongNormal);
        const impactEnergy = 0.5 * reducedMass * impactSpeed * impactSpeed;
        const damageScale = 10000;
        const damage = impactEnergy / damageScale;

        const totalMass = objectA.mass + objectB.mass;
        const damageToA = damage * (objectB.mass / totalMass);
        const damageToB = damage * (objectA.mass / totalMass);

        if (objectA.hullStrength !== undefined) {
            objectA.takeDamage(damageToA);
        }
        if (objectB.hullStrength !== undefined) {
            objectB.takeDamage(damageToB);
        }

        this.handleDestroyedObject(objectA, objectB);
        this.handleDestroyedObject(objectB, objectA);
    }

    handleDestroyedObject(targetObject, sourceObject) {
        if (targetObject.hullStrength !== undefined && targetObject.hullStrength <= 0) {
            if (targetObject.type !== 'Debris') {
                this.createDebris(targetObject);
            }
            this.createExplosion(targetObject);
            this.deadObjects.push(targetObject);
            if (targetObject.type === 'Ship') {
                this.scoreDeath(targetObject.id);
                if (sourceObject && sourceObject.id) {
                    this.scoreKill(sourceObject.id);
                }
            }
        }
    }

    createImpactExplosion(objectA, objectB, useLaserParticles = false) {
        const sizeA = objectA.lengthInMeters || objectA.size || 0;
        const sizeB = objectB.lengthInMeters || objectB.size || 0;
        const impactPoint = {
            locationX: (objectA.locationX + objectB.locationX) / 2,
            locationY: (objectA.locationY + objectB.locationY) / 2,
            size: Math.max(sizeA, sizeB)
        };
        if (useLaserParticles) {
            const laserFuel = this.sumLaserFuel(objectA, objectB);
            if (laserFuel.maxFuel > 0) {
                impactPoint.fuel = laserFuel.remainingFuel;
                impactPoint.maxFuel = laserFuel.maxFuel;
            }
            this.createLaserExplosion(impactPoint);
        }
        else {
            this.createExplosion(impactPoint);
        }
    }

    sumLaserFuel(...objects) {
        return objects.reduce((totals, object) => {
            if (object && object.type === 'Laser') {
                totals.remainingFuel += Math.max(0, object.fuel || 0);
                totals.maxFuel += Math.max(0, object.maxFuel || 0);
            }
            return totals;
        }, {remainingFuel: 0, maxFuel: 0});
    }

    createDebris(sourceGameObject) {
        const newDebris = new Debris(Engine.getNextGameObjectId(), {sourceObject: sourceGameObject});
        gameObjects.push(newDebris);
    }

    createExplosion(sourceGameObject) {
        this.queueExplosion(sourceGameObject, {explosionType: 'Standard'});
    }

    createLaserExplosion(sourceGameObject) {
        const explosionOptions = {explosionType: 'Laser'};

        if (sourceGameObject && typeof sourceGameObject.fuel !== 'undefined') {
            explosionOptions.fuel = sourceGameObject.fuel;
        }
        if (sourceGameObject && typeof sourceGameObject.maxFuel !== 'undefined') {
            explosionOptions.maxFuel = sourceGameObject.maxFuel;
        }
        if (sourceGameObject && typeof sourceGameObject.size !== 'undefined') {
            explosionOptions.size = sourceGameObject.size;
        }

        this.queueExplosion(sourceGameObject, explosionOptions);
    }

    queueExplosion(sourceGameObject, options = {}) {
        const explosionSource = sourceGameObject ? Object.assign({}, sourceGameObject) : {};
        if (typeof explosionSource.LocationX === 'number') {
            explosionSource.locationX = explosionSource.locationX || explosionSource.LocationX;
        }
        if (typeof explosionSource.LocationY === 'number') {
            explosionSource.locationY = explosionSource.locationY || explosionSource.LocationY;
        }

        const newExplosion = new Explosion();
        newExplosion.init(explosionSource, options);
        gameObjects.push(newExplosion);
    }

    spawnExplosionParticles(explosion) {
        if (!explosion) {
            return;
        }
        for (let i = 0; i < this.explosionSize; i++) {
            const newParticle = new FireParticle(Engine.getNextGameObjectId());
            newParticle.init(explosion);
            gameObjects.push(newParticle);
        }
    }

    spawnLaserExplosionParticles(explosion) {
        if (!explosion) {
            return;
        }
        const fuelRatio = explosion && explosion.maxFuel
            ? Math.max(0, Math.min(1, (explosion.fuel || 0) / explosion.maxFuel))
            : null;
        const sparksToSpawn = fuelRatio === null
            ? this.explosionSize
            : Math.max(1, Math.round(this.explosionSize * fuelRatio));

        for (let i = 0; i < sparksToSpawn; i++) {
            const newParticle = new LaserParticle(Engine.getNextGameObjectId());
            newParticle.init(explosion);
            gameObjects.push(newParticle);
        }
    }

    fuelDetection() {
        for (let x = 0, y = gameObjects.length; x < y; x++) {
            if (gameObjects[x].fuel < 0) {
                this.deadObjects.push(gameObjects[x]);
            }
        }
        this.removeDeadObjects();
    }

    findSolidObjects() {
        const solidObjects = [];
        for (let x = 0, y = gameObjects.length; x < y; x++) {
            if (gameObjects[x].type != 'FireParticle' && gameObjects[x].type != 'LaserParticle' && gameObjects[x].type != 'Thruster' && gameObjects[x].type != 'Player' && gameObjects[x].type != 'Sound' && gameObjects[x].type != 'Explosion') {
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
            if (!(solidObjects[x].locationX * solidObjects[x].locationX + solidObjects[x].locationY * solidObjects[x].locationY < this.mapRadius * this.mapRadius)) {
                if (solidObjects[x].type === 'Laser') {
                    this.createLaserExplosion(solidObjects[x]);
                }
                else {
                    this.createExplosion(solidObjects[x]);
                }
                this.scoreDeath(solidObjects[x].id);
                this.deadObjects.push(solidObjects[x]);
            }
        }
        this.removeDeadObjects();
    }

    removeDeadObjects() {
        for (let x = 0, y = this.deadObjects.length; x < y; x++) {
            let i = 0;
            for (let j = 0; j < gameObjects.length; j++) {
                if (gameObjects[j].id == this.deadObjects[x].id) {
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
        gameObjects = Utilities.removeByAttr(gameObjects, "type", "Sound");
    }

    removeExplosionObjects() {
        gameObjects = Utilities.removeByAttr(gameObjects, "type", "Explosion");
    }

    convertObjects(localGameObjects, remoteGameObjects) {
        // Reconcile remote snapshots into the existing array to avoid thrashing
        const constructors = {
            Player: Player,
            Ship: Ship,
            Laser: Laser,
            Debris: Debris,
            Sound: Sound,
            Explosion: Explosion,
            Thruster: Thruster
        };

        const managedTypes = new Set(Object.keys(constructors));
        const existingById = new Map();
        const preservedObjects = [];
        for (let i = 0; i < localGameObjects.length; i++) {
            const obj = localGameObjects[i];

            if (!obj || !obj.type) {
                continue;
            }

            if (!managedTypes.has(obj.type)) {
                preservedObjects.push(obj);
                continue;
            }

            if (obj && typeof obj.id !== 'undefined') {
                existingById.set(obj.id, obj);
            }
        }

        const mergedObjects = [];
        for (let i = 0; i < remoteGameObjects.length; i++) {
            const remoteObject = remoteGameObjects[i];
            let ctor = constructors[remoteObject.type];

            if (!ctor) {
                continue;
            }

            // For Ship objects, select the correct subclass based on shipTypeId
            if (remoteObject.type === 'Ship' && remoteObject.shipTypeId) {
                if (remoteObject.shipTypeId === 'Viper') {
                    ctor = ViperShip;
                } else if (remoteObject.shipTypeId === 'Turtle') {
                    ctor = TurtleShip;
                }
            }

            const hasStableId = typeof remoteObject.id !== 'undefined';
            let instance = null;

            if (hasStableId && existingById.has(remoteObject.id)) {
                const candidate = existingById.get(remoteObject.id);
                if (candidate && candidate.type === remoteObject.type) {
                    instance = candidate;
                }
            }

            if (instance) {
                Object.assign(instance, remoteObject);
            } else {
                // Create ship without initialization for deserialization
                instance = new ctor(remoteObject.id, {initializeState: false});
                Object.assign(instance, remoteObject);
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

    scoreKill(shipId) {
        for (let x = 0, y = gameObjects.length; x < y; x++) {
            if (gameObjects[x].type == 'Player') {
                if (gameObjects[x].shipId == shipId) {
                    gameObjects[x].kills += 1;
                }
            }
        }
    }

    scoreDeath(shipId) {
        for (let x = 0, y = gameObjects.length; x < y; x++) {
            if (gameObjects[x].type == 'Player') {
                if (gameObjects[x].shipId == shipId) {
                    gameObjects[x].deaths += 1;
                }
            }
        }
    }
}