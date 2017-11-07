Particle = function Particle() {

}

Particle.prototype.init = function(sourceObject) {

    this.Id = engine.getNextGameObjectId();
  	this.Type = "Particle";
  	this.LocationX = sourceObject.LocationX;
  	this.LocationY = sourceObject.LocationY;
  	this.Facing = 0;
  	this.Heading = Math.random() * 360;
  	this.Velocity = Math.random() * 100;
  	this.Size = 2.0;
  	this.RotationDirection = "None";
  	this.RotationVelocity = 0;
  	this.Fuel = Math.random() * 0.5;

}

Particle.prototype.copy = function(jsonObject) {

    this.Id = jsonObject.Id;
    this.Type = jsonObject.Type;
    this.LocationX = jsonObject.LocationX;
    this.LocationY = jsonObject.LocationY;
    this.Facing = jsonObject.Facing;
    this.Heading = jsonObject.Heading;
    this.Velocity = jsonObject.Velocity;
    this.Size = jsonObject.Size;
    this.RotationDirection = jsonObject.RotationDirection;
    this.RotationVelocity = jsonObject.RotationVelocity;
    this.Fuel = jsonObject.Fuel;

}

Particle.prototype.update = function() {

    this.Fuel = this.Fuel - 1 / framesPerSecond;

    physics.moveObjectAlongVector(this);

}
