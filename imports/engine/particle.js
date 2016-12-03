Particle = function Particle(sourceObject, jsonObject) {

  if (sourceObject) {

    this.Id = gameObjectId;
  	this.Type = "Particle";
  	this.LocationX = sourceObject.LocationX;
  	this.LocationY = sourceObject.LocationY;
  	this.Facing = 0;
  	this.Heading = Math.random() * 360;
  	this.Velocity = Math.random() * 10;
  	this.Size = 1;
  	this.RotationDirection = "None";
  	this.RotationVelocity = 0;
  	this.Fuel = Math.random() * 10;

  	physics.findNewVelocity(this, sourceObject.Heading, sourceObject.Velocity);
  }
  else {
    for (var prop in jsonObject) this[prop] = jsonObject[prop];
  }

	gameObjectId++;
}

Particle.prototype.update = function() {
  this.Fuel--;
	physics.moveObjectAlongVector(this);
}
