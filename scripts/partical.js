function CreateParticalObject(ParticalSource)
{
  var NewPartical = new GameObject(gameObjectId, 'Partical', ParticalSource.LocationX, ParticalSource.LocationY, 0, Math.random()*360, Math.random()*10, 'hidden', 1, 'None', 0, 0, Math.random()*10);
  gameObjectId++;
  GameObjects.push(NewPartical);
  CreateParticalElement(NewPartical);
  FindNewVelocity(NewPartical, ParticalSource.Heading, ParticalSource.Velocity); 
}

function UpdateParticalObject(ParticalObject)
{
  ParticalObject.Capacitor = ParticalObject.Capacitor - 1;

  if (ParticalObject.Capacitor < 1)
  {
    RemoveGameObject(ParticalObject);
  }
  else
  {
    MoveObjectAlongVector(ParticalObject);
  }
}

function CreateParticalElement(ParticalObject)
{
  ParticalObject.svgElement = document.createElementNS(svgNS,"circle");
  ParticalObject.svgElement.setAttributeNS(null, 'cx', ParticalObject.LocationX);	
  ParticalObject.svgElement.setAttributeNS(null, 'cy', ParticalObject.LocationY);	
  ParticalObject.svgElement.setAttributeNS(null, 'r', ParticalObject.Size);		
  ParticalObject.svgElement.setAttributeNS(null, 'fill', 'yellow');
  MapGroupElement.appendChild(ParticalObject.svgElement);
}

function UpdateParticalElement(ParticalObject)
{
  ParticalObject.svgElement.setAttributeNS(null, 'cx', ParticalObject.LocationX);	
  ParticalObject.svgElement.setAttributeNS(null, 'cy', ParticalObject.LocationY);
}