// particle.js

function Particle(sourceObject)
{
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
	
	this.createView();
	
	gameObjectId++; 
}

Particle.prototype.update = function()
{
	this.Fuel--;
	physics.moveObjectAlongVector(this);
}

Particle.prototype.createView = function()
{
	this.svgElement = document.createElementNS("http://www.w3.org/2000/svg","circle");
	this.svgElement.setAttributeNS(null, 'cx', this.LocationX);	
	this.svgElement.setAttributeNS(null, 'cy', this.LocationY);	
	this.svgElement.setAttributeNS(null, 'r', this.Size / currentScale);		
	this.svgElement.setAttributeNS(null, 'fill', 'red');
	mapGroup.appendChild(this.svgElement);
}

Particle.prototype.updateView = function()
{
	this.svgElement.setAttributeNS(null, 'cx', this.LocationX);	
	this.svgElement.setAttributeNS(null, 'cy', this.LocationY);
}