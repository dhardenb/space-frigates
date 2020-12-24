import { getRandomInt } from '../utilities/utilities.js';

export class Debris {
    
    constructor() {
        this.Type = "Debris";
        this.Size = 4.0;
    }

    init(sourceObject) {
        this.Id = engine.getNextGameObjectId();
        this.Fuel = sourceObject.Fuel;
        this.LocationX = sourceObject.LocationX;
        this.LocationY = sourceObject.LocationY;
        this.Facing = sourceObject.Facing;
        this.Heading = sourceObject.Heading;
        this.Velocity = sourceObject.Velocity;
        this.RotationDirection = "None";
        this.RotationVelocity = 0;

        this.initRotation();
    }

    update() {
        physics.findNewFacing(this);
	    physics.moveObjectAlongVector(this);
    }

    initRotation() {
        var randomNumber = getRandomInt(0,1);

        if (randomNumber == 0) {
            this.RotationDirection = 'Clockwise';
        } else {
            this.RotationDirection = 'CounterClockwise';
        }

        this.RotationVelocity = getRandomInt(1,3);
    }
}
