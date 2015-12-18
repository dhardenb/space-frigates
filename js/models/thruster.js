// thruster.js

function Thruster(sourceObject) {

	this.Id = gameObjectId;
	this.Type = "Thruster";
	this.LocationX = sourceObject.LocationX;
	this.LocationY = sourceObject.LocationY;
	this.Facing = sourceObject.Facing;
	this.Heading = sourceObject.Heading;
	this.Velocity = sourceObject.Velocity;
	this.RotationDirection = "None";
	this.RotationVelocity = 0;
	this.Size = 5;
	this.RotationDirection = "None";
	this.RotationVelocity = 0;
	this.Fuel = 5;
	
	this.ThrusterOffset = 2;
	this.initialVelocity = 0;

	this.calclulateInitialPosition(sourceObject);
	physics.findNewVelocity(this, sourceObject.Facing, this.initialVelocity);
	
	gameObjectId++;
}

Thruster.prototype.calclulateInitialPosition = function(sourceObject) {

	if (sourceObject.Facing == 0) {
	
		this.LocationY = this.LocationY + sourceObject.Size + this.ThrusterOffset;
	}
	else if (sourceObject.Facing == 90) {
	
    	this.LocationX = this.LocationX - sourceObject.Size - this.ThrusterOffset;
    }
    else if (sourceObject.Facing == 180) {
    
    	this.LocationY = this.LocationY - sourceObject.Size - this.ThrusterOffset;
    }
    else if (sourceObject.Facing == 270) {
    
    	this.LocationX = this.LocationX + sourceObject.Size + this.ThrusterOffset;
    }
    else if (sourceObject.Facing < 90) {
    
    	this.LocationX = this.LocationX - (sourceObject.Size + this.ThrusterOffset)*(Math.sin(sourceObject.Facing * 0.0174532925));
    	this.LocationY = this.LocationY + (sourceObject.Size + this.ThrusterOffset)*(Math.cos(sourceObject.Facing * 0.0174532925));
    }
    else if (sourceObject.Facing < 180) {
    
    	this.LocationX = this.LocationX - (sourceObject.Size + this.ThrusterOffset)*(Math.sin((180 - sourceObject.Facing) * 0.0174532925));
    	this.LocationY = this.LocationY - (sourceObject.Size + this.ThrusterOffset)*(Math.cos((180 - sourceObject.Facing) * 0.0174532925));
    }
    else if (sourceObject.Facing < 270) {
    
    	this.LocationX = this.LocationX + (sourceObject.Size + this.ThrusterOffset)*(Math.sin((sourceObject.Facing - 180) * 0.0174532925));
    	this.LocationY = this.LocationY - (sourceObject.Size + this.ThrusterOffset)*(Math.cos((sourceObject.Facing - 180) * 0.0174532925));
    }
    else {
    
    	this.LocationX = this.LocationX + (sourceObject.Size + this.ThrusterOffset)*(Math.sin((360 - sourceObject.Facing) * 0.0174532925));
    	this.LocationY = this.LocationY + (sourceObject.Size + this.ThrusterOffset)*(Math.cos((360 - sourceObject.Facing) * 0.0174532925));
    }
}

Thruster.prototype.update = function() {
    this.Fuel--;
	physics.moveObjectAlongVector(this);
	postOffice.publish("ThrusterMoved" + this.Id, [this.LocationX, this.LocationY, this.Facing])
}