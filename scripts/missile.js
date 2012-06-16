
// Should be attributes of missile
var MissileVelocity = 5;
var MissileFuel = 100;

function CreateMissileObject(MissileSource)
{
  var MissileLaunchOffset = 10;

  // Create new GameObject
  MissileObject = new GameObject(gameObjectId, 'Missile', MissileSource.LocationX, MissileSource.LocationY, 0, MissileSource.Heading, MissileSource.Velocity, 'visible', 1, 0, 'None', MissileFuel, 0);
  gameObjectId++;
  
  if (MissileSource.Facing == 0)
  {
    MissileObject.LocationY = MissileObject.LocationY - MissileSource.Size - MissileObject.Size - MissileLaunchOffset;
  }
  else if (MissileSource.Facing == 90)
  {
    MissileObject.LocationX = MissileObject.LocationX + MissileSource.Size + MissileObject.Size + MissileLaunchOffset;
  }
  else if (MissileSource.Facing == 180)
  {
    MissileObject.LocationY = MissileObject.LocationY + MissileSource.Size + MissileObject.Size + MissileLaunchOffset;
  }
  else if (MissileSource.Facing == 270)
  {
    MissileObject.LocationX = MissileObject.LocationX - MissileSource.Size - MissileObject.Size - MissileLaunchOffset;
  }
  else if (MissileSource.Facing < 90)
  {
    MissileObject.LocationX = MissileObject.LocationX + (MissileSource.Size + MissileObject.Size + MissileLaunchOffset)*(Math.sin(MissileSource.Facing * 0.0174532925));
    MissileObject.LocationY = MissileObject.LocationY - (MissileSource.Size + MissileObject.Size + MissileLaunchOffset)*(Math.cos(MissileSource.Facing * 0.0174532925));
  }
  else if (MissileSource.Facing < 180)
  {
    MissileObject.LocationX = MissileObject.LocationX + (MissileSource.Size + MissileObject.Size + MissileLaunchOffset)*(Math.sin((180 - MissileSource.Facing) * 0.0174532925));
    MissileObject.LocationY = MissileObject.LocationY + (MissileSource.Size + MissileObject.Size + MissileLaunchOffset)*(Math.cos((180 - MissileSource.Facing) * 0.0174532925));
  }
  else if (MissileSource.Facing < 270)
  {
    MissileObject.LocationX = MissileObject.LocationX - (MissileSource.Size + MissileObject.Size + MissileLaunchOffset)*(Math.sin((MissileSource.Facing - 180) * 0.0174532925));
    MissileObject.LocationY = MissileObject.LocationY + (MissileSource.Size + MissileObject.Size + MissileLaunchOffset)*(Math.cos((MissileSource.Facing - 180) * 0.0174532925));
  }
  else
  {
    MissileObject.LocationX = MissileObject.LocationX - (MissileSource.Size + MissileObject.Size + MissileLaunchOffset)*(Math.sin((360 - MissileSource.Facing) * 0.0174532925));
    MissileObject.LocationY = MissileObject.LocationY - (MissileSource.Size + MissileObject.Size + MissileLaunchOffset)*(Math.cos((360 - MissileSource.Facing) * 0.0174532925));
  }

  // The missile starts out with the same velocity as the ship but we then have to factor in it's own initial acceleration. Onces fired, the missile no longer accelerates.
  FindNewVelocity(MissileObject, MissileSource.Facing, MissileVelocity);

  GameObjects.push(MissileObject);

  CreateMissileElement(MissileObject);
}

function UpdateMissileObject(MissileObject)
{
  MissileObject.Fuel--;
  MoveObjectAlongVector(MissileObject);
}

function CreateMissileElement(MissileObject)
{
  MissileObject.svgElement = document.createElementNS("http://www.w3.org/2000/svg","circle");
  MissileObject.svgElement.setAttributeNS(null, 'cx', MissileObject.LocationX);
  MissileObject.svgElement.setAttributeNS(null, 'cy', MissileObject.LocationY);
  MissileObject.svgElement.setAttributeNS(null, 'r', MissileObject.Size);		
  MissileObject.svgElement.setAttributeNS(null, 'fill', 'yellow');
  mapGroup.appendChild(MissileObject.svgElement);
}

function UpdateMissileElement(MissileObject)
{
  MissileObject.svgElement.setAttributeNS(null, 'cx', MissileObject.LocationX);
  MissileObject.svgElement.setAttributeNS(null, 'cy', MissileObject.LocationY);
}