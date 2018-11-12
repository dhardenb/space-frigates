import { getRandomInt } from '../utilities/utilities.js';

Debris = function Debris() {
    this.Type = "Debris";
    this.Size = 4.0;
}

Debris.prototype.init = function(sourceObject) {
    this.Id = engine.getNextGameObjectId();
    this.Fuel = sourceObject.Fuel;
    this.LocationX = sourceObject.LocationX;
  	this.LocationY = sourceObject.LocationY;
  	this.Facing = sourceObject.Facing;
  	this.Heading = sourceObject.Heading;
    this.Velocity = sourceObject.Velocity;
    this.RotationDirection = "None";
  	this.RotationVelocity = 0;

    this.initRotation();
}

Debris.prototype.copy = function(jsonObject) {
    this.Id = jsonObject.Id;
    this.Fuel = jsonObject.Fuel;
  	this.LocationX = jsonObject.LocationX;
  	this.LocationY = jsonObject.LocationY;
  	this.Facing = jsonObject.Facing;
  	this.Heading = jsonObject.Heading;
  	this.Velocity = jsonObject.Velocity;
    this.RotationDirection = jsonObject.RotationDirection;
  	this.RotationVelocity = jsonObject.RotationVelocity;
}

Debris.prototype.update = function() {
    physics.findNewFacing(this);
	physics.moveObjectAlongVector(this);
}

Debris.prototype.initRotation() {

    var rotatationDirection = getRandomInt(0,1);

    if (rotatationDirection = 0) {
        this.rotatationDirection = 'Clockwise';
    } else {
        this.rotatationDirection = 'CounterClockwise';
    }

    this.RotationVelocity = getRandomInt(1,3);
}
