import {Physics} from './physics.js';
import {Utilities} from '../utilities/utilities.js';

export class Debris {
    
    // Size should probbaly be configurable
    constructor(id, {sourceObject = null, initializeState = true} = {}) {
        this.id = id;
        this.type = "Debris";
        this.lengthInMeters = 4;
        this.widthInMeters = 4;
        this.mass = 10; // default placeholder, overwritten if sourceObject provided
        this.maxHullStrength = 1;

        // Initialize from source object if provided
        if (sourceObject) {
            this.locationX = sourceObject.locationX;
            this.locationY = sourceObject.locationY;
            this.facing = sourceObject.facing;
            this.heading = sourceObject.heading;
            this.velocity = sourceObject.velocity;
            this.rotationDirection = Debris.setIntitialRotationDirection();
            this.rotationVelocity = Debris.setInitialRotationVelocity();
            this.mass = Math.max((sourceObject.mass || 0) * 0.1, 1);
            this.maxHullStrength = Math.max((sourceObject.maxHullStrength || 0) * 0.1, 1);
            this.hullStrength = this.maxHullStrength;
        }

        // Initialize runtime state if requested (default true, false for deserialization)
        if (initializeState && !sourceObject) {
            this.locationX = 0;
            this.locationY = 0;
            this.facing = 0;
            this.heading = 0;
            this.velocity = 0;
            this.rotationDirection = Debris.setIntitialRotationDirection();
            this.rotationVelocity = Debris.setInitialRotationVelocity();
            this.hullStrength = this.maxHullStrength;
        }
    }

    // physics is a gloabl, need to fix that!
    //
    // I think passing self by reference here is okay?
    update(commands, framesPerSecond) {
        Physics.findNewFacing(this);
            Physics.moveObjectAlongVector(this);
    }

    takeDamage(damage) {
        this.hullStrength -= damage;
        if (this.hullStrength < 0) {
            this.hullStrength = 0;
        }
    }

    // I have a feeling that the is a better way to express
    // angular velocity. Seems like this should be one value,
    // rather than direction and velocity
    //
    // The use of these hard coded values below is bad, should
    // be using an enumeration
    //
    // Not sure just straight up random determination here is 
    // very elegent
    static setIntitialRotationDirection() {
        return Utilities.getRandomInt(0,1) == 0 ? 'Clockwise' : 'CounterClockwise';
    }

    // I have a feeling that the is a better way to express
    // angular velocity. Seems like this should be one value,
    // rather than direction and velocity
    //
    // Returning a straight up hard coded random number does
    // not seem very elegent. Should maybe take more into
    // consideration to determine and / or have some configuration
    // settings
    static setInitialRotationVelocity() {
        return Utilities.getRandomInt(1,3);
    }
}
