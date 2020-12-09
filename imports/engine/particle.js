Particle = function Particle() {

    this.Type = "Particle";
    this.Facing = 0;
    this.Size = 2.0;
    this.fuelConsumptionRate = 1; // 1 per second!

}

Particle.prototype.init = function(sourceObject) {

    this.Id = engine.getNextGameObjectId();
  	this.LocationX = sourceObject.LocationX;
  	this.LocationY = sourceObject.LocationY;
  	this.Heading = Math.random() * 360;
  	this.Velocity = Math.random() * 100;
  	this.Fuel = Math.random() * 0.5;

}

Particle.prototype.update = function() {

    this.Fuel = this.Fuel - this.fuelConsumptionRate / framesPerSecond;

    physics.moveObjectAlongVector(this);

}
