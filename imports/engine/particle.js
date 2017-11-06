Particle = function Particle(sourceObject, jsonObject) {

  if (sourceObject) {

    this.Id = gameObjectId;
  	this.Type = "Particle";
  	this.LocationX = sourceObject.LocationX;
  	this.LocationY = sourceObject.LocationY;
  	this.Facing = 0;
  	this.Heading = Math.random() * 360;
  	this.Velocity = Math.random() * 100;
  	this.Size = 2.0;
  	this.RotationDirection = "None";
  	this.RotationVelocity = 0;

    // Last on average about 1 seconds. I make it random because when the
    // particles have different life spans the effect is much more realistic
    // than if they all just burn out at the same rate.
  	this.Fuel = Math.random() * 2;

    // I adjust the vector of the particle based on what is exploding. This
    // creates the cool affect of the explosion kind of moving with the
    // enertia of the source object.
  	// physics.findNewVelocity(this, sourceObject.Heading, sourceObject.Velocity);
  }
  else {
    for (var prop in jsonObject) this[prop] = jsonObject[prop];
  }

	gameObjectId++;
}

Particle.prototype.update = function() {

    this.Fuel = this.Fuel - 1 / framesPerSecond;

    physics.moveObjectAlongVector(this);

}
