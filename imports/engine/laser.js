import {Physics} from './physics.js';
import {COLLISION_DIMENSIONS} from './config/collisionDimensions.js';

export class Laser {

        constructor(id) {
                this.Id = id;
                this.Type = "Laser";
                this.Size = 3.0;
                this.Mass = 0;
                this.LaserLaunchOffset = 1.0;
                this.initialVelocity = 100;
                this.Velocity = 0;
                this.fuelConsumptionRate = 60; // default, can be overridden
                this.MaxFuel = 60;
		const laserCollisionSpec = COLLISION_DIMENSIONS.Laser;
		// Collision dimensions must stay in sync with COLLISION_DIMENSIONS.
		this.collisionLengthMeters = laserCollisionSpec.length;
		this.collisionWidthMeters = laserCollisionSpec.width;
	}

	init(sourceObject) {
		this.LocationX = sourceObject.LocationX;
		this.LocationY = sourceObject.LocationY;
		this.Facing = sourceObject.Facing;
		this.Heading = sourceObject.Heading;
		this.MaxFuel = sourceObject.LaserFuelCapacity || this.MaxFuel;
		this.fuelConsumptionRate = sourceObject.LaserFuelConsumptionRate || this.fuelConsumptionRate;
		this.Fuel = this.MaxFuel;
		this.Owner = sourceObject.Id;
		this.calclulateInitialPosition(sourceObject);
		Physics.findNewVelocity(this, sourceObject.Facing, this.initialVelocity);
	}

	update(commands, framesPerSecond) {	
		this.Fuel = this.Fuel - this.fuelConsumptionRate / framesPerSecond;
		Physics.moveObjectAlongVector(this);
	}

	calclulateInitialPosition(sourceObject) {

		if (sourceObject.Facing == 0) {

			this.LocationY = this.LocationY - sourceObject.Size / 2 - this.Size / 2 - this.LaserLaunchOffset;

		}
		else if (sourceObject.Facing == 90) {

			this.LocationX = this.LocationX + sourceObject.Size / 2 + this.Size / 2 + this.LaserLaunchOffset;
		}
		else if (sourceObject.Facing == 180) {

			this.LocationY = this.LocationY + sourceObject.Size / 2 + this.Size / 2 + this.LaserLaunchOffset;
		}
		else if (sourceObject.Facing == 270) {

			this.LocationX = this.LocationX - sourceObject.Size / 2 - this.Size / 2 - this.LaserLaunchOffset;
		}
		else if (sourceObject.Facing < 90) {

			this.LocationX = this.LocationX + (sourceObject.Size / 2 + this.Size / 2 + this.LaserLaunchOffset)*(Math.sin(sourceObject.Facing * 0.0174532925));
			this.LocationY = this.LocationY - (sourceObject.Size / 2 + this.Size / 2 + this.LaserLaunchOffset)*(Math.cos(sourceObject.Facing * 0.0174532925));
		}
		else if (sourceObject.Facing < 180) {

			this.LocationX = this.LocationX + (sourceObject.Size / 2 + this.Size / 2 + this.LaserLaunchOffset)*(Math.sin((180 - sourceObject.Facing) * 0.0174532925));
			this.LocationY = this.LocationY + (sourceObject.Size / 2 + this.Size / 2 + this.LaserLaunchOffset)*(Math.cos((180 - sourceObject.Facing) * 0.0174532925));
		}
		else if (sourceObject.Facing < 270) {

			this.LocationX = this.LocationX - (sourceObject.Size / 2 + this.Size / 2 + this.LaserLaunchOffset)*(Math.sin((sourceObject.Facing - 180) * 0.0174532925));
			this.LocationY = this.LocationY + (sourceObject.Size / 2 + this.Size / 2 + this.LaserLaunchOffset)*(Math.cos((sourceObject.Facing - 180) * 0.0174532925));
		}
		else {

			this.LocationX = this.LocationX - (sourceObject.Size / 2 + this.Size / 2 + this.LaserLaunchOffset)*(Math.sin((360 - sourceObject.Facing) * 0.0174532925));
			this.LocationY = this.LocationY - (sourceObject.Size / 2 + this.Size / 2 + this.LaserLaunchOffset)*(Math.cos((360 - sourceObject.Facing) * 0.0174532925));
		}
	}
}