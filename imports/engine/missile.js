Missile = function Missile() {

    this.Type = "Missile";
    this.Size = 3.0;
    this.MissileLaunchOffset = 1.0;
  	this.initialVelocity = 100;
	this.Velocity = 0;
	this.fuelConsumptionRate = 60; // 60 per second!

}

Missile.prototype.init = function(sourceObject) {

    this.Id = engine.getNextGameObjectId();
  	this.LocationX = sourceObject.LocationX;
  	this.LocationY = sourceObject.LocationY;
  	this.Facing = sourceObject.Facing;
  	this.Heading = sourceObject.Heading;
	this.Fuel = 60;
	this.Owner = sourceObject.Id;

  	this.calclulateInitialPosition(sourceObject);
  	physics.findNewVelocity(this, sourceObject.Facing, this.initialVelocity);

}

Missile.prototype.copy = function(jsonObject) {

    this.Id = jsonObject.Id;
  	this.LocationX = jsonObject.LocationX;
  	this.LocationY = jsonObject.LocationY;
  	this.Facing = jsonObject.Facing;
  	this.Heading = jsonObject.Heading;
  	this.Velocity = jsonObject.Velocity;
	this.Fuel = jsonObject.Fuel;
	this.Owner = jsonObject.Owner;

}

Missile.prototype.update = function() {

	this.Fuel = this.Fuel - this.fuelConsumptionRate / framesPerSecond;

	physics.moveObjectAlongVector(this);

}

Missile.prototype.calclulateInitialPosition = function(sourceObject) {

	if (sourceObject.Facing == 0) {

		this.LocationY = this.LocationY - sourceObject.Size / 2 - this.Size / 2 - this.MissileLaunchOffset;

	}
	else if (sourceObject.Facing == 90) {

    	this.LocationX = this.LocationX + sourceObject.Size / 2 + this.Size / 2 + this.MissileLaunchOffset;
    }
    else if (sourceObject.Facing == 180) {

    	this.LocationY = this.LocationY + sourceObject.Size / 2 + this.Size / 2 + this.MissileLaunchOffset;
    }
    else if (sourceObject.Facing == 270) {

    	this.LocationX = this.LocationX - sourceObject.Size / 2 - this.Size / 2 - this.MissileLaunchOffset;
    }
    else if (sourceObject.Facing < 90) {

    	this.LocationX = this.LocationX + (sourceObject.Size / 2 + this.Size / 2 + this.MissileLaunchOffset)*(Math.sin(sourceObject.Facing * 0.0174532925));
    	this.LocationY = this.LocationY - (sourceObject.Size / 2 + this.Size / 2 + this.MissileLaunchOffset)*(Math.cos(sourceObject.Facing * 0.0174532925));
    }
    else if (sourceObject.Facing < 180) {

    	this.LocationX = this.LocationX + (sourceObject.Size / 2 + this.Size / 2 + this.MissileLaunchOffset)*(Math.sin((180 - sourceObject.Facing) * 0.0174532925));
    	this.LocationY = this.LocationY + (sourceObject.Size / 2 + this.Size / 2 + this.MissileLaunchOffset)*(Math.cos((180 - sourceObject.Facing) * 0.0174532925));
    }
    else if (sourceObject.Facing < 270) {

    	this.LocationX = this.LocationX - (sourceObject.Size / 2 + this.Size / 2 + this.MissileLaunchOffset)*(Math.sin((sourceObject.Facing - 180) * 0.0174532925));
    	this.LocationY = this.LocationY + (sourceObject.Size / 2 + this.Size / 2 + this.MissileLaunchOffset)*(Math.cos((sourceObject.Facing - 180) * 0.0174532925));
    }
    else {

    	this.LocationX = this.LocationX - (sourceObject.Size / 2 + this.Size / 2 + this.MissileLaunchOffset)*(Math.sin((360 - sourceObject.Facing) * 0.0174532925));
    	this.LocationY = this.LocationY - (sourceObject.Size / 2 + this.Size / 2 + this.MissileLaunchOffset)*(Math.cos((360 - sourceObject.Facing) * 0.0174532925));
    }
}
