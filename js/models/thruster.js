// thruster.js

function Thruster(sourceObject) {

	this.Id = gameObjectId;
	this.Type = "Thruster";
	this.LocationX = sourceObject.LocationX;
	this.LocationY = sourceObject.LocationY;
	this.Facing = 0;
	this.Heading = Math.random() * 360;
	this.Velocity = Math.random() * 10;
	this.Size = 1;
	this.RotationDirection = "None";
	this.RotationVelocity = 0;
	this.Fuel = 5;
	
	physics.findNewVelocity(this, sourceObject.Heading, sourceObject.Velocity);
	
	gameObjectId++;
}

Thruster.prototype.update = function() {
    this.Fuel--;
	physics.moveObjectAlongVector(this);
	postOffice.publish("ThrusterMoved" + this.Id, [this.LocationX, this.LocationY])
}