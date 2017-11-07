Particle = function Particle() {

    this.Type = "Particle";
    this.Facing = 0;
    this.Size = 2.0;
    this.fuelConsumptionRate = 1;

}

Particle.prototype.init = function(sourceObject) {

    this.Id = engine.getNextGameObjectId();
  	this.LocationX = sourceObject.LocationX;
  	this.LocationY = sourceObject.LocationY;
  	this.Heading = Math.random() * 360;
  	this.Velocity = Math.random() * 100;
  	this.Fuel = Math.random() * 0.5;

}

Particle.prototype.copy = function(jsonObject) {

    this.Id = jsonObject.Id;
    this.LocationX = jsonObject.LocationX;
    this.LocationY = jsonObject.LocationY;
    this.Heading = jsonObject.Heading;
    this.Velocity = jsonObject.Velocity;
    this.Fuel = jsonObject.Fuel;

}

Particle.prototype.update = function() {

    this.Fuel = this.Fuel - this.fuelConsumptionRate / framesPerSecond;

    physics.moveObjectAlongVector(this);

}
