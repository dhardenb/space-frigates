// particle.js

function Particle(sourceObject)
{
	this.Id = gameObjectId; // This is a global variable that gets incremented everytime a new game object gets created.
	this.Type = "Particle";
	this.LocationX = sourceObject.LocationX;
	this.LocationY = sourceObject.LocationY;
	this.Facing = 0;
	this.Heading = Math.random() * 360; // Starts out moving in a random direction.
	this.Velocity = Math.random() * 10; // Starts out moving at a random speed from 1 to 10.
	this.ShieldStatus = "hidden"; // The shield feature was never imlpemented.
	this.Size = 1;
	this.RotationDirection = "None"; // Does not rotate.
	this.RotationVelocity = 0; // Does not rotate.
	this.Fuel = 0; // Does not use fuel.
	this.Capacitor = Math.random() * 10; // Does not use capacitor.
	
	// Increment the global gameObjectId variable.
	gameObjectId++;  
	
	// Adjust the objects velocity.
	FindNewVelocity(this, sourceObject.Heading, sourceObject.Velocity);
	
	this.createView();
}

Particle.prototype.update = function()
{
	this.Capacitor = this.Capacitor - 1;

	if (this.Capacitor < 1)
	{
    	RemoveGameObject(this);
    }
    else
    {
    	MoveObjectAlongVector(this);
    }
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