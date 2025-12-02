import {Physics} from './physics.js';

export class Thruster {
    static DEFAULT_SIZE = 6.0;

    constructor(id, size = Thruster.DEFAULT_SIZE) {
        this.id = id;
        this.type = "Thruster";
        this.size = size;
        this.thrusterOffset = 2.0;
        this.initialVelocity = 0;
        this.fuelConsumptionRate = 1;
    }

    init(sourceObject, options = {}) {
        this.locationX = sourceObject.locationX;
        this.locationY = sourceObject.locationY;
        this.facing = typeof options.facing === 'number' ? options.facing : sourceObject.facing;
        this.heading = sourceObject.heading;
        this.velocity = sourceObject.velocity;
        this.size = typeof options.size === 'number' ? options.size : this.size;
        this.fuel = 0.1;
        if (options.offset) {
            this.locationX += options.offset.x;
            this.locationY += options.offset.y;
        } else {
            this.calclulateInitialPosition(sourceObject);
        }
        Physics.findNewVelocity(this, this.facing, this.initialVelocity);
    }

    update(commands, framesPerSecond) {
        this.fuel = this.fuel - this.fuelConsumptionRate / framesPerSecond;
	    Physics.moveObjectAlongVector(this);
    }

    calclulateInitialPosition(sourceObject) {

        if (sourceObject.facing == 0) {

            this.locationY = this.locationY + sourceObject.size / 2 + this.size / 2 + this.thrusterOffset;
        }
        else if (sourceObject.facing == 90) {

            this.locationX = this.locationX - sourceObject.size / 2 - this.size / 2 - this.thrusterOffset;
        }
        else if (sourceObject.facing == 180) {

            this.locationY = this.locationY - sourceObject.size / 2 - this.size / 2 - this.thrusterOffset;
        }
        else if (sourceObject.facing == 270) {

            this.locationX = this.locationX + sourceObject.size / 2 + this.size / 2 + this.thrusterOffset;
        }
        else if (sourceObject.facing < 90) {

            this.locationX = this.locationX - (sourceObject.size / 2 + this.size / 2 + this.thrusterOffset)*(Math.sin(sourceObject.facing * 0.0174532925));
            this.locationY = this.locationY + (sourceObject.size / 2 + this.size / 2 + this.thrusterOffset)*(Math.cos(sourceObject.facing * 0.0174532925));
        }
        else if (sourceObject.facing < 180) {

            this.locationX = this.locationX - (sourceObject.size / 2 + this.size / 2 + this.thrusterOffset)*(Math.sin((180 - sourceObject.facing) * 0.0174532925));
            this.locationY = this.locationY - (sourceObject.size / 2 + this.size / 2 + this.thrusterOffset)*(Math.cos((180 - sourceObject.facing) * 0.0174532925));
        }
        else if (sourceObject.facing < 270) {

            this.locationX = this.locationX + (sourceObject.size / 2 + this.size / 2 + this.thrusterOffset)*(Math.sin((sourceObject.facing - 180) * 0.0174532925));
            this.locationY = this.locationY - (sourceObject.size / 2 + this.size / 2 + this.thrusterOffset)*(Math.cos((sourceObject.facing - 180) * 0.0174532925));
        }
        else {

            this.locationX = this.locationX + (sourceObject.size / 2 + this.size / 2 + this.thrusterOffset)*(Math.sin((360 - sourceObject.facing) * 0.0174532925));
            this.locationY = this.locationY + (sourceObject.size / 2 + this.size / 2 + this.thrusterOffset)*(Math.cos((360 - sourceObject.facing) * 0.0174532925));
        }
    }
}
