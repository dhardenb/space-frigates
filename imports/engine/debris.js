import {Physics} from './physics.js';
import {Utilities} from '../utilities/utilities.js';
import {COLLISION_DIMENSIONS} from './config/collisionDimensions.js';

export class Debris {

    // Size should probbaly be configurable
    constructor(id, sourceObject = null) {
        this.Id = id;
        this.Type = "Debris";
        const debrisCollisionSpec = COLLISION_DIMENSIONS.Debris;
        // Collision dimensions must stay in sync with COLLISION_DIMENSIONS.
        this.collisionLengthMeters = debrisCollisionSpec.length;
        this.collisionWidthMeters = debrisCollisionSpec.width;

        this.setFromSource(sourceObject);
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
        this.setFromSource(sourceObject);
    }

    setFromSource(sourceObject = null) {
        const source = sourceObject || {};

        this.Size = 4.0;
        this.LocationX = source.LocationX ?? 0;
        this.LocationY = source.LocationY ?? 0;
        this.Facing = source.Facing ?? 0;
        this.Heading = source.Heading ?? this.Facing;
        this.Velocity = source.Velocity ?? 0;
        this.RotationDirection = source.RotationDirection || Debris.setIntitialRotationDirection();
        this.RotationVelocity = source.RotationVelocity || Debris.setInitialRotationVelocity();

        if (sourceObject) {
            this.Mass = Math.max((source.Mass || 0) * 0.1, 1);
            this.MaxHullStrength = Math.max((source.MaxHullStrength || 0) * 0.1, 1);
        } else {
            this.Mass = 10;
            this.MaxHullStrength = 1;
        }

        this.HullStrength = this.MaxHullStrength;
    }

    // physics is a gloabl, need to fix that!
    //
    // I think passing self by reference here is okay?
    update(commands, framesPerSecond) {
        Physics.findNewFacing(this);
            Physics.moveObjectAlongVector(this);
    }

    takeDamage(damage) {
        this.HullStrength -= damage;
        if (this.HullStrength < 0) {
            this.HullStrength = 0;
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
