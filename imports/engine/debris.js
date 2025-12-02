import {Physics} from './physics.js';
import {Utilities} from '../utilities/utilities.js';
import {COLLISION_DIMENSIONS} from './config/collisionDimensions.js';

export class Debris {
    
    // Still hate that I have to maintain a default
    // constructor and init function to handle obejcts
    // created from scratch and objects cloned from
    // another object
    //
    // Size should probbaly be configurable
    constructor(id) {
        this.id = id;
        this.size = 4.0;
        this.mass = 10; // default placeholder, overwritten during init
        this.maxHullStrength = 1;
        this.hullStrength = this.maxHullStrength;
        const debrisCollisionSpec = COLLISION_DIMENSIONS.Debris;
        // Collision dimensions must stay in sync with COLLISION_DIMENSIONS.
        this.collisionLengthMeters = debrisCollisionSpec.length;
        this.collisionWidthMeters = debrisCollisionSpec.width;
    }

    // Variable names need to be changed but can't do it
    // until I chnage them for ALL classes which is going
    // to be a major effort!
    //
    // Need to remove the type object and use instanceof 
    // instead. Will also need to be done across all
    // objects and will be a major effort. Will also have
    // to remember to retain a type code when packing
    // and unpacking
    //
    // Heading and Velocity can probably be combined 
    // in a Vector object
    //
    // Most of these can be refactored out into a parent
    // class. Will require all classes to be updated, a
    // major undertaking
    init(sourceObject) {
        this.type = "Debris";
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
