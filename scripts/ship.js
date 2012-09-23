// ship.js

function Ship(shipType)
{
    this.Id = gameObjectId;
    this.Type = shipType;
	this.LocationX = 0;
	this.LocationY = 0;
	this.Facing = 0;
	this.Heading = 0;
	this.Velocity = 0;
	this.ShieldStatus = "hidden";
	this.Size = 5;
	this.RotationDirection = "None";
	this.RotationVelocity = 0;
	this.Fuel = 1000;
	this.Capacitor = 10;
	
	if (shipType == 'Human')
	{
    	var HumanPlayer = new PlayerObject(-1, gameObjectId);
    	playerObjects.push(HumanPlayer);
	}
	else
	{
    	var ComputerPlayer = new PlayerObject(playerObjectId, gameObjectId);
    	playerObjects.push(ComputerPlayer);
    	SetStartingPosition(this);
	}
	
	CreateShipElement(this);
    UpdateShipElement(this);
    
	playerObjectId++;
	gameObjectId++;
}

function UpdateShipObject(ShipObject)
{
	for(x = 0; x < commands.length; x++)
	{
	    if (commands[x].targetId == ShipObject.Id)
	    {
	    	ProcessShipCommand(commands[x].command, ShipObject);
	    }
    }
  
  if (ShipObject.RotationVelocity > 0)
  {
    if (ShipObject.RotationDirection == 'CounterClockwise')
    {
      ShipObject.Facing = ShipObject.Facing - ShipObject.RotationVelocity * 1 * gameSpeed; 
    }
    else
    {
      ShipObject.Facing = ShipObject.Facing + ShipObject.RotationVelocity * 1 * gameSpeed;
    }
  }

  // This code keeps the Facing Number from 0 to 359. It will break for
  // numbers smaller than -360 and larger than 719
  if (ShipObject.Facing < 0)
  {
    ShipObject.Facing = 360 - ShipObject.Facing * -1;
  }
  else if (ShipObject.Facing > 359)
  {
    ShipObject.Facing = ShipObject.Facing - 360;
  }

  physics.moveObjectAlongVector(ShipObject);
}

function CreateShipElement(ShipObject)
{
  ShipObject.svgElement = document.createElementNS("http://www.w3.org/2000/svg","path");

  if (ShipObject.Type == 'Human')
  {
    ShipObject.svgElement.setAttributeNS(null, 'stroke', 'green');
  }
  else // Must be a ComputerShip
  {
    ShipObject.svgElement.setAttributeNS(null, 'stroke', 'red');
  }
  
  ShipObject.svgElement.setAttributeNS(null, 'd', 'M -1 -5 L 1 -5 L 2 -4 L 2 -3 L 1 -3 L 1 1 L 3 3 L 3 4 L 2 5 L -2 5 L -3 4 L -3 3 L -1 1 L -1 -3 L -2 -3 L -2 -4 Z');
  ShipObject.svgElement.setAttributeNS(null, 'stroke-linejoin', 'round');
  ShipObject.svgElement.setAttributeNS(null, 'stroke-width', 2 / currentScale);
  ShipObject.svgElement.setAttributeNS(null, 'fill', 'black');
  ShipObject.svgElement.setAttribute('transform', 'translate('+ShipObject.LocationX+','+ShipObject.LocationY+') rotate('+ShipObject.Facing+')');

  mapGroup.appendChild(ShipObject.svgElement);
}

function UpdateShipElement(ShipObject)
{  
  ShipObject.svgElement.setAttribute('transform', 'translate('+ShipObject.LocationX+','+ShipObject.LocationY+') rotate('+ShipObject.Facing+')');
  
  if (ShipObject.Type == 'Human')
  {
    var x = 0 - ShipObject.LocationX;
    var y = 0 - ShipObject.LocationY;
    var z = 0 - ShipObject.Facing;
    
    rotateGroup.setAttribute('transform', 'translate('+ 0 +','+ 0 +') rotate('+ z +')');
    translateGroup.setAttribute('transform', 'translate('+ x +','+ y +') rotate('+ 0 +')');
  }
}

function SetStartingPosition(GameObject)
{
  var angle = Math.floor(Math.random() * 360);
  
  var distanceFromCenter = Math.floor(Math.random() * (availablePixels) / 2 / currentScale + 1);
  
  if (angle == 0)
  {
    GameObject.LocationX = 0;
    GameObject.LocationY = distanceFromCenter * -1;
  }
  else if (angle == 90)
  {
    GameObject.LocationX = distanceFromCenter;
    GameObject.LocationY = 0;
  }
  else if (angle == 180)
  {
    GameObject.LocationX = 0;
    GameObject.LocationY = distanceFromCenter;
  }
  else if (angle == 270)
  {
    GameObject.LocationX = distanceFromCenter * -1;
    GameObject.LocationY = 0;
  }
  else if (angle < 90)
  {
    GameObject.LocationX = distanceFromCenter * Math.sin(angle * 0.0174532925);
    GameObject.LocationY = distanceFromCenter * Math.cos(angle * 0.0174532925) * -1;
  }
  else if (angle < 180)
  {
    GameObject.LocationX = distanceFromCenter * Math.sin((180 - angle) * 0.0174532925);
    GameObject.LocationY = distanceFromCenter * Math.cos((180 - angle) * 0.0174532925);
  }
  else if (angle < 270)
  {
    GameObject.LocationX = distanceFromCenter * Math.sin((angle - 180) * 0.0174532925) * -1;
    GameObject.LocationY = distanceFromCenter * Math.cos((angle - 180) * 0.0174532925);
  }
  else // 360
  {
    GameObject.LocationX = distanceFromCenter * Math.sin((360 - angle) * 0.0174532925) * -1;
    GameObject.LocationY = distanceFromCenter * Math.cos((360 - angle) * 0.0174532925) * -1;
  }

  GameObject.Facing = Math.random()*360+1;
}

function ProcessShipCommand(Command, GameObject)
{
  switch (Command)
  {
    case 0: // Fire
      if (GameObject.Capacitor > 2)
      {
        gameObjects.push(new Missile(GameObject));
      }
      break;
    case 3: // Rotate Right
        if (GameObject.RotationDirection == 'None')
        {
          GameObject.RotationVelocity = GameObject.RotationVelocity + 1;
          GameObject.RotationDirection = 'Clockwise';
        }
        else if (GameObject.RotationDirection == 'CounterClockwise')
        {
          GameObject.RotationVelocity = GameObject.RotationVelocity - 1;
       
          if (GameObject.RotationVelocity == 0)
          {
            GameObject.RotationDirection = 'None';
          }
        }
      break;
    case 1: // Rotate Left
        if (GameObject.RotationDirection == 'None')
        {
          GameObject.RotationVelocity = GameObject.RotationVelocity + 1;
          GameObject.RotationDirection = 'CounterClockwise';
        }
        else if (GameObject.RotationDirection == 'Clockwise')
        {
          GameObject.RotationVelocity = GameObject.RotationVelocity - 1;
          
          if (GameObject.RotationVelocity == 0)
          {
            GameObject.RotationDirection = 'None';
          }
        }
      break;
    case 2: // Accelerate
      if (GameObject.Capacitor > 0)
      {
        physics.findNewVelocity(GameObject, GameObject.Facing, 1)
        // GameObject.Capacitor = GameObject.Capacitor - 1;
      }
      break;
    case 4: // Brake
      if (GameObject.Velocity > 0 && GameObject.Capacitor > 0)
      {
        GameObject.Velocity = GameObject.Velocity - 1;
        // GameObject.Capacitor = GameObject.Capacitor - 1;
      }
      
      if (GameObject.RotationVelocity > 0 && GameObject.Capacitor > 0)
      {
        GameObject.RotationVelocity = GameObject.RotationVelocity - 1;
          
        if (GameObject.RotationVelocity == 0)
        {
          GameObject.RotationDirection = 'None';
        }
      }
      break;
  }

  // This should really get checked by each indivifual command
  // but I'm feeling lzy tonight...
  if (GameObject.Velocity < 0)
  {
    GameObject.Velocity = 0;
  }
}