// missile.js

function Missile(sourceObject)
{
    this.Id = gameObjectId; // This is a global variable that gets incremented everytime a new game object gets created.
	this.Type = "Missile";
	this.LocationX = sourceObject.LocationX;
	this.LocationY = sourceObject.LocationY;
	this.Facing = 0;
	this.Heading = sourceObject.Heading;
	this.Velocity = sourceObject.Velocity;
	this.ShieldStatus = "visable"; // The shield feature was never imlpemented.
	this.Size = 1;
	this.RotationDirection = "None"; // Does not rotate.
	this.RotationVelocity = 0; // Does not rotate.
	this.Fuel = 100; // Does not use fuel.
	this.Capacitor = 0; // Does not use capacitor.
	
	this.MissileLaunchOffset = 10;
	this.initialVelocity = 5;
	
	// Increment the global gameObjectId variable.
	gameObjectId++;
	
	this.calclulateInitialPosition(sourceObject);
  
	// The missile starts out with the same velocity as the ship but we then have to factor in it's own initial acceleration. Onces fired, the missile no longer accelerates.
	physics.findNewVelocity(this, sourceObject.Facing, this.initialVelocity);
	
	this.createView();
}

Missile.prototype.calclulateInitialPosition = function(sourceObject)
{
	if (sourceObject.Facing == 0)
	{
		this.LocationY = this.LocationY - sourceObject.Size - this.Size - this.MissileLaunchOffset;
	}
	else if (sourceObject.Facing == 90)
	{
    	this.LocationX = this.LocationX + sourceObject.Size + this.Size + this.MissileLaunchOffset;
    }
    else if (sourceObject.Facing == 180)
    {
    	this.LocationY = this.LocationY + sourceObject.Size + this.Size + this.MissileLaunchOffset;
    }
    else if (sourceObject.Facing == 270)
    {
    	this.LocationX = this.LocationX - sourceObject.Size - this.Size - this.MissileLaunchOffset;
    }
    else if (sourceObject.Facing < 90)
    {
    	this.LocationX = this.LocationX + (sourceObject.Size + this.Size + this.MissileLaunchOffset)*(Math.sin(sourceObject.Facing * 0.0174532925));
    	this.LocationY = this.LocationY - (sourceObject.Size + this.Size + this.MissileLaunchOffset)*(Math.cos(sourceObject.Facing * 0.0174532925));
    }
    else if (sourceObject.Facing < 180)
    {
    	this.LocationX = this.LocationX + (sourceObject.Size + this.Size + this.MissileLaunchOffset)*(Math.sin((180 - sourceObject.Facing) * 0.0174532925));
    	this.LocationY = this.LocationY + (sourceObject.Size + this.Size + this.MissileLaunchOffset)*(Math.cos((180 - sourceObject.Facing) * 0.0174532925));
    }
    else if (sourceObject.Facing < 270)
    {
    	this.LocationX = this.LocationX - (sourceObject.Size + this.Size + this.MissileLaunchOffset)*(Math.sin((sourceObject.Facing - 180) * 0.0174532925));
    	this.LocationY = this.LocationY + (sourceObject.Size + this.Size + this.MissileLaunchOffset)*(Math.cos((sourceObject.Facing - 180) * 0.0174532925));
    }
    else
    {
    	this.LocationX = this.LocationX - (sourceObject.Size + this.Size + this.MissileLaunchOffset)*(Math.sin((360 - sourceObject.Facing) * 0.0174532925));
    	this.LocationY = this.LocationY - (sourceObject.Size + this.Size + this.MissileLaunchOffset)*(Math.cos((360 - sourceObject.Facing) * 0.0174532925));
    }
}

Missile.prototype.update = function()
{
	this.Fuel--;
	physics.moveObjectAlongVector(this);
}

Missile.prototype.createView = function()
{
	this.svgElement = document.createElementNS("http://www.w3.org/2000/svg","circle");
	this.svgElement.setAttributeNS(null, 'cx', this.LocationX);
	this.svgElement.setAttributeNS(null, 'cy', this.LocationY);
	this.svgElement.setAttributeNS(null, 'r', this.Size);		
	this.svgElement.setAttributeNS(null, 'fill', 'yellow');
	mapGroup.appendChild(this.svgElement);
}

Missile.prototype.updateView = function()
{
	this.svgElement.setAttributeNS(null, 'cx', this.LocationX);
	this.svgElement.setAttributeNS(null, 'cy', this.LocationY);
}