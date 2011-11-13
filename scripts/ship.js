function CreateShipObject(ShipType, ComputerShipNumber)
{
  if (ShipType == 'Human')
  {
    // I'm making the human ship pointer global so that I can easily get it's coordinates for updating the map perspective.
    HumanShip = new GameObject(gameObjectId, 'HumanShip', 0, 0, 0, 0, 0, 'hidden', 5, 'None', 0, 1000, 10);
    var HumanPlayer = new PlayerObject(-1, gameObjectId)
    GameObjects.push(HumanShip);
    PlayerObjects.push(HumanPlayer);
    // SetStartingPosition(HumanShip, 180); // If I don't set the start position of the ship, it should get set to the very center
    CreateShipElement(HumanShip);
    UpdateShipElement(HumanShip);
  }
  else
  {
    var NewComputerShip = new GameObject(gameObjectId, 'ComputerShip', 0, 0, 0, 0, 0, 'hidden', 5, 'None', 0, 1000, 10);
    var ComputerPlayer = new PlayerObject(ComputerShipNumber, gameObjectId)
    GameObjects.push(NewComputerShip);
    PlayerObjects.push(ComputerPlayer);
    SetStartingPosition(NewComputerShip, 180 + ((360 / (Level + 1)) * (ComputerShipNumber + 1)));
    CreateShipElement(NewComputerShip);
    UpdateShipElement(NewComputerShip);
  }
  gameObjectId++;
}

function UpdateShipObject(ShipObject)
{
  for (var i=0, j=CommandObjects.length; i<j; i++)
  {
    if (CommandObjects[i].target == ShipObject.Id && CommandObjects[i].tick == tick)
    {
      ProcessCommand(CommandObjects[i].command, ShipObject)
    }
  }
  
  if (ShipObject.RotationVelocity > 0)
  {
    if (ShipObject.RotationDirection == 'CounterClockwise')
    {
      ShipObject.Facing = ShipObject.Facing - ShipObject.RotationVelocity * 5 * GameSpeed; 
    }
    else
    {
      ShipObject.Facing = ShipObject.Facing + ShipObject.RotationVelocity * 5 * GameSpeed;
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

  MoveObjectAlongVector(ShipObject);
    
  if (ShipObject.Capacitor < CapacitorMax)
  {
    ShipObject.Capacitor = ShipObject.Capacitor + CapacitorInput * GameSpeed;
  }
  
}

function CreateShipElement(ShipObject)
{
  ShipObject.svgElement = document.createElementNS(svgNS,"path");

  if (ShipObject.Type == 'HumanShip')
  {
    ShipObject.svgElement.setAttributeNS(null, 'stroke', 'green');
  }
  else // Must be a ComputerShip
  {
    ShipObject.svgElement.setAttributeNS(null, 'stroke', 'red');
  }
  
  ShipObject.svgElement.setAttributeNS(null, 'd', 'M -1 -5 L 1 -5 L 2 -4 L 2 -3 L 1 -3 L 1 1 L 3 3 L 3 4 L 2 5 L -2 5 L -3 4 L -3 3 L -1 1 L -1 -3 L -2 -3 L -2 -4 Z');
  ShipObject.svgElement.setAttributeNS(null, 'stroke-linejoin', 'round');
  ShipObject.svgElement.setAttributeNS(null, 'fill', 'black');
  ShipObject.svgElement.setAttribute('transform', 'translate('+ShipObject.LocationX+','+ShipObject.LocationY+') rotate('+ShipObject.Facing+')');

  MapGroupElement.appendChild(ShipObject.svgElement);
}

function UpdateShipElement(ShipObject)
{
  ShipObject.svgElement.setAttribute('transform', 'translate('+ShipObject.LocationX+','+ShipObject.LocationY+') rotate('+ShipObject.Facing+') ');
  
  if (ShipObject.Type == 'HumanShip')
  {
    // Capacitor_Current_Energy_Element.firstChild.nodeValue = 'Energy: ' + Math.ceil(ShipObject.Capacitor);
    // Debugger_Velocity.firstChild.nodeValue = 'Velocity: ' + Math.round(ShipObject.Velocity);
    // FramesPerSecondElement.firstChild.nodeValue = 'FPS: ' + FramesPerSecond;
    // Debugger_Heading.firstChild.nodeValue = 'Heading: ' + Math.round(ShipObject.Heading);
    // Mission_Summary_Level.firstChild.nodeValue = 'Level: ' + Level;
  }
}