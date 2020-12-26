import { getRandomInt } from '../utilities/utilities.js';
import {Physics} from './physics.js';

export class Debris {
    
    // Still hate that I have to maintain a defaul
    // constructor and init function to handle obejcts
    // created from scratch and objects cloned from
    // another object
    //
    // Size should probbaly be configurable
    constructor() {
        this.Size = 4.0;
    }

    // Variable names need to be changed but can't do it
    // until I chnage them for ALL classes which is going
    // to be a major effort!
    //
    // Engine is a global, need to fix that!
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
        this.Id = engine.getNextGameObjectId();
        this.Type = "Debris";
        this.Fuel = sourceObject.Fuel;
        this.LocationX = sourceObject.LocationX;
        this.LocationY = sourceObject.LocationY;
        this.Facing = sourceObject.Facing;
        this.Heading = sourceObject.Heading;
        this.Velocity = sourceObject.Velocity;
        this.RotationDirection = Debris.setIntitialRotationDirection();
        this.RotationVelocity = Debris.setInitialRotationVelocity();
    }

    // physics is a gloabl, need to fix that!
    //
    // I think passing self by reference here is okay?
    update(framesPerSecond) {
        Physics.findNewFacing(this);
	    Physics.moveObjectAlongVector(this);
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
        return getRandomInt(0,1) == 0 ? 'Clockwise' : 'CounterClockwise';
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
        return getRandomInt(1,3);
    }
}
