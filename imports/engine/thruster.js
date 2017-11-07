Thruster = function Thruster() {

    this.Type = "Thruster";
    this.Size = 6.0;
    this.ThrusterOffset = 2.0;
    this.initialVelocity = 0;
    this.fuelConsumptionRate = 1;

}

Thruster.prototype.init = function(sourceObject) {

    this.Id = engine.getNextGameObjectId;
    this.LocationX = sourceObject.LocationX;
    this.LocationY = sourceObject.LocationY;
    this.Facing = sourceObject.Facing;
    this.Heading = sourceObject.Heading;
    this.Velocity = sourceObject.Velocity;
    this.Fuel = 0.1;

    this.calclulateInitialPosition(sourceObject);
    physics.findNewVelocity(this, sourceObject.Facing, this.initialVelocity);

}

Thruster.prototype.update = function() {

    this.Fuel = this.Fuel - this.fuelConsumptionRate / framesPerSecond;

	physics.moveObjectAlongVector(this);

}


Thruster.prototype.calclulateInitialPosition = function(sourceObject) {

	if (sourceObject.Facing == 0) {

		this.LocationY = this.LocationY + sourceObject.Size / 2 + this.Size / 2 + this.ThrusterOffset;
	}
	else if (sourceObject.Facing == 90) {

    	this.LocationX = this.LocationX - sourceObject.Size / 2 - this.Size / 2 - this.ThrusterOffset;
    }
    else if (sourceObject.Facing == 180) {

    	this.LocationY = this.LocationY - sourceObject.Size / 2 - this.Size / 2 - this.ThrusterOffset;
    }
    else if (sourceObject.Facing == 270) {

    	this.LocationX = this.LocationX + sourceObject.Size / 2 + this.Size / 2 + this.ThrusterOffset;
    }
    else if (sourceObject.Facing < 90) {

    	this.LocationX = this.LocationX - (sourceObject.Size / 2 + this.Size / 2 + this.ThrusterOffset)*(Math.sin(sourceObject.Facing * 0.0174532925));
    	this.LocationY = this.LocationY + (sourceObject.Size / 2 + this.Size / 2 + this.ThrusterOffset)*(Math.cos(sourceObject.Facing * 0.0174532925));
    }
    else if (sourceObject.Facing < 180) {

    	this.LocationX = this.LocationX - (sourceObject.Size / 2 + this.Size / 2 + this.ThrusterOffset)*(Math.sin((180 - sourceObject.Facing) * 0.0174532925));
    	this.LocationY = this.LocationY - (sourceObject.Size / 2 + this.Size / 2 + this.ThrusterOffset)*(Math.cos((180 - sourceObject.Facing) * 0.0174532925));
    }
    else if (sourceObject.Facing < 270) {

    	this.LocationX = this.LocationX + (sourceObject.Size / 2 + this.Size / 2 + this.ThrusterOffset)*(Math.sin((sourceObject.Facing - 180) * 0.0174532925));
    	this.LocationY = this.LocationY - (sourceObject.Size / 2 + this.Size / 2 + this.ThrusterOffset)*(Math.cos((sourceObject.Facing - 180) * 0.0174532925));
    }
    else {

    	this.LocationX = this.LocationX + (sourceObject.Size / 2 + this.Size / 2 + this.ThrusterOffset)*(Math.sin((360 - sourceObject.Facing) * 0.0174532925));
    	this.LocationY = this.LocationY + (sourceObject.Size / 2 + this.Size / 2 + this.ThrusterOffset)*(Math.cos((360 - sourceObject.Facing) * 0.0174532925));
    }
}
