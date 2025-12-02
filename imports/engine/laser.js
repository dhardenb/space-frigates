import {Physics} from './physics.js';

export class Laser {

        constructor(id) {
                this.id = id;
                this.type = "Laser";
                this.mass = 0;
                this.laserLaunchOffset = 1.0;
                this.initialVelocity = 100;
                this.velocity = 0;
                this.fuelConsumptionRate = 30; // default, can be overridden
                this.maxFuel = 30;
		this.lengthInMeters = 3;
		this.widthInMeters = 1;
	}

	init(sourceObject) {
		this.locationX = sourceObject.locationX;
		this.locationY = sourceObject.locationY;
		this.facing = sourceObject.facing;
		this.heading = sourceObject.heading;
		this.maxFuel = sourceObject.laserFuelCapacity || this.maxFuel;
		this.fuelConsumptionRate = sourceObject.laserFuelConsumptionRate || this.fuelConsumptionRate;
		this.fuel = this.maxFuel;
		this.owner = sourceObject.id;
		this.calclulateInitialPosition(sourceObject);
		Physics.findNewVelocity(this, sourceObject.facing, this.initialVelocity);
	}

	update(commands, framesPerSecond) {	
		this.fuel = this.fuel - this.fuelConsumptionRate / framesPerSecond;
		Physics.moveObjectAlongVector(this);
	}

	calclulateInitialPosition(sourceObject) {

		if (sourceObject.facing == 0) {

			this.locationY = this.locationY - sourceObject.lengthInMeters / 2 - this.lengthInMeters / 2 - this.laserLaunchOffset;

		}
		else if (sourceObject.facing == 90) {

			this.locationX = this.locationX + sourceObject.lengthInMeters / 2 + this.lengthInMeters / 2 + this.laserLaunchOffset;
		}
		else if (sourceObject.facing == 180) {

			this.locationY = this.locationY + sourceObject.lengthInMeters / 2 + this.lengthInMeters / 2 + this.laserLaunchOffset;
		}
		else if (sourceObject.facing == 270) {

			this.locationX = this.locationX - sourceObject.lengthInMeters / 2 - this.lengthInMeters / 2 - this.laserLaunchOffset;
		}
		else if (sourceObject.facing < 90) {

			this.locationX = this.locationX + (sourceObject.lengthInMeters / 2 + this.lengthInMeters / 2 + this.laserLaunchOffset)*(Math.sin(sourceObject.facing * 0.0174532925));
			this.locationY = this.locationY - (sourceObject.lengthInMeters / 2 + this.lengthInMeters / 2 + this.laserLaunchOffset)*(Math.cos(sourceObject.facing * 0.0174532925));
		}
		else if (sourceObject.facing < 180) {

			this.locationX = this.locationX + (sourceObject.lengthInMeters / 2 + this.lengthInMeters / 2 + this.laserLaunchOffset)*(Math.sin((180 - sourceObject.facing) * 0.0174532925));
			this.locationY = this.locationY + (sourceObject.lengthInMeters / 2 + this.lengthInMeters / 2 + this.laserLaunchOffset)*(Math.cos((180 - sourceObject.facing) * 0.0174532925));
		}
		else if (sourceObject.facing < 270) {

			this.locationX = this.locationX - (sourceObject.lengthInMeters / 2 + this.lengthInMeters / 2 + this.laserLaunchOffset)*(Math.sin((sourceObject.facing - 180) * 0.0174532925));
			this.locationY = this.locationY + (sourceObject.lengthInMeters / 2 + this.lengthInMeters / 2 + this.laserLaunchOffset)*(Math.cos((sourceObject.facing - 180) * 0.0174532925));
		}
		else {

			this.locationX = this.locationX - (sourceObject.lengthInMeters / 2 + this.lengthInMeters / 2 + this.laserLaunchOffset)*(Math.sin((360 - sourceObject.facing) * 0.0174532925));
			this.locationY = this.locationY - (sourceObject.lengthInMeters / 2 + this.lengthInMeters / 2 + this.laserLaunchOffset)*(Math.cos((360 - sourceObject.facing) * 0.0174532925));
		}
	}
}