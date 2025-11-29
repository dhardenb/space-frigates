import {Player} from './player.js';
import {Laser} from './laser.js';
import {Ship} from './ship.js';
import {Particle} from './particle.js';
import {Thruster} from './thruster.js';
import {Debris} from './debris.js';
import {Sound} from './sound.js';
import {Utilities} from '../utilities/utilities.js';

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
            // Find this distance between this and every other object in the game and check to see if it
            // is smaller than the combined radius of the two objects.
            for (let k = 0, l = solidObjects.length; k < l; k++) {
                // Don't let objects colide with themselves!
                if (i != k) {
                    if (Math.sqrt((solidObjects[i].LocationX - solidObjects[k].LocationX) * (solidObjects[i].LocationX - solidObjects[k].LocationX) + (solidObjects[i].LocationY - solidObjects[k].LocationY) * (solidObjects[i].LocationY - solidObjects[k].LocationY)) < (solidObjects[i].Size / 2 + solidObjects[k].Size / 2)) {
                        // ship hit by laser
                        if (isShip(solidObjects[k]) && (solidObjects[i].Type == "Laser")) {
                            // The amount of damage that the laser does is determined by
                            // the amount of fuel remaining. So, the amount of damage
                            // done by the laser is reduced the farther it travels.
                            // NOTE: Once a laser runs out of fuel it disappears
                            const damage = solidObjects[i].Fuel;
                            // Apply the damage to the taregt ship
                            solidObjects[k].takeDamage(damage);
                            // If the struck ship has less than zero hull points then
                            // it explodes and is destroyed!
                            if (solidObjects[k].HullStrength <= 0) {
                                this.createDebris(solidObjects[k]);
                                this.createExplosion(solidObjects[k]);
                                this.deadObjects.push(solidObjects[k]);
                                this.scoreDeath(solidObjects[k].Id);
                                this.scoreKill(solidObjects[i].Owner);
                                this.recordShipDestroyed(solidObjects[k]);
                            }
                            break;
                            // Ship hit by debris
                        } else if (isShip(solidObjects[k]) && (solidObjects[i].Type == "Debris")) {
                            // Ships no longer harvest debris; just clear it.
                            this.deadObjects.push(solidObjects[i]);
                            break;
                        // debris hit by ship
                        } else if ((solidObjects[k].Type == "Debris") && isShip(solidObjects[i])) {
                            this.deadObjects.push(solidObjects[k]);
                            break;
                        // anything else hit by anything
                        } else {
                            // This object has collided with something so we get to blow it up!!!
                            if (solidObjects[k].Type != "Debris") {
                                this.createExplosion(solidObjects[k]);
                                this.scoreDeath(solidObjects[k].Id);
                                this.recordShipDestroyed(solidObjects[k]);
                            }
                            // I created this array of objects to remove because removing objects from
                            // an array while you are still iterating over the same array is generaly
                            // a bad thing!
                            this.deadObjects.push(solidObjects[k]);
                            // No use blowing this up twice!
                            break;
                        }
                    }
                }
            }
        }
        this.removeDeadObjects();
    }

    createDebris(sourceGameObject) {
        const newDebris = new Debris(Engine.getNextGameObjectId());
        newDebris.init(sourceGameObject);
        gameObjects.push(newDebris);
    }

    createExplosion(sourceGameObject) {
        for (let i = 0; i < this.explosionSize; i++) {
            const newParticle = new Particle(Engine.getNextGameObjectId());
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
            if (gameObjects[x].Type != 'Particle' && gameObjects[x].Type != 'Thruster' && gameObjects[x].Type != 'Player' && gameObjects[x].Type != 'Sound') {
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
                    this.createExplosion(solidObjects[x]);
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