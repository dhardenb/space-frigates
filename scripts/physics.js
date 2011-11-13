function MoveObjectAlongVector(GameObject) 
{
  if (GameObject.Heading == 0)
  {
    GameObject.LocationY = GameObject.LocationY - GameObject.Velocity * GameSpeed;
  }
  else if (GameObject.Heading == 90)
  {
    GameObject.LocationX = GameObject.LocationX + GameObject.Velocity * GameSpeed;
  }
  else if (GameObject.Heading == 180)
  {
    GameObject.LocationY = GameObject.LocationY + GameObject.Velocity * GameSpeed;
  }
  else if (GameObject.Heading == 270)
  {
    GameObject.LocationX = GameObject.LocationX - GameObject.Velocity * GameSpeed;
  }
  else if (GameObject.Heading < 90)
  {
    GameObject.LocationX = GameObject.LocationX + GameObject.Velocity * GameSpeed * (Math.sin(GameObject.Heading * 0.0174532925));
    GameObject.LocationY = GameObject.LocationY - GameObject.Velocity * GameSpeed * (Math.cos(GameObject.Heading * 0.0174532925));
  }
  else if (GameObject.Heading < 180)
  {
    GameObject.LocationX = GameObject.LocationX + GameObject.Velocity * GameSpeed * (Math.sin((180 - GameObject.Heading) * 0.0174532925));
    GameObject.LocationY = GameObject.LocationY + GameObject.Velocity * GameSpeed * (Math.cos((180 - GameObject.Heading) * 0.0174532925));
  }
  else if (GameObject.Heading < 270)
  {
    GameObject.LocationX = GameObject.LocationX - GameObject.Velocity * GameSpeed * (Math.sin((GameObject.Heading - 180) * 0.0174532925));
    GameObject.LocationY = GameObject.LocationY + GameObject.Velocity * GameSpeed * (Math.cos((GameObject.Heading - 180) * 0.0174532925));
  }
  else
  {
    GameObject.LocationX = GameObject.LocationX - GameObject.Velocity * GameSpeed * (Math.sin((360 - GameObject.Heading) * 0.0174532925));
    GameObject.LocationY = GameObject.LocationY - GameObject.Velocity * GameSpeed * (Math.cos((360 - GameObject.Heading) * 0.0174532925));
  }
}

function FindNewVelocity(GameObject, NewHeading, NewVelocity)
{
  NewXaxisComponent = GetXaxisComponent(GameObject.Heading, GameObject.Velocity) + GetXaxisComponent(NewHeading, NewVelocity);
  NewYaxisComponent = GetYaxisComponent(GameObject.Heading, GameObject.Velocity) + GetYaxisComponent(NewHeading, NewVelocity);

  if (NewXaxisComponent == 0 && NewYaxisComponent == 0)
  {
    GameObject.Heading = 0;
    GameObject.Velocity = 0;
  }
  else if (NewXaxisComponent == 0 && NewYaxisComponent < 0)
  {
    GameObject.Heading = 0;
    GameObject.Velocity = Math.abs(NewYaxisComponent);
  }
  else if (NewXaxisComponent > 0 && NewYaxisComponent == 0)
  {
    GameObject.Heading = 90;
    GameObject.Velocity = Math.abs(NewXaxisComponent);
  }
  else if (NewXaxisComponent == 0 && NewYaxisComponent > 0)
  {
    GameObject.Heading = 180;
    GameObject.Velocity = Math.abs(NewYaxisComponent);
  }
  else if (NewXaxisComponent < 0 && NewYaxisComponent == 0)
  {
    GameObject.Heading = 270;
    GameObject.Velocity = Math.abs(NewXaxisComponent);
  }
  else if (NewXaxisComponent < 0 && NewYaxisComponent < 0)
  {
    GameObject.Velocity = Math.sqrt(NewXaxisComponent * NewXaxisComponent + NewYaxisComponent * NewYaxisComponent);
    GameObject.Heading = 360 - Math.atan(NewXaxisComponent / NewYaxisComponent) / 0.0174532925;
  }
  else if (NewXaxisComponent < 0 && NewYaxisComponent > 0)
  {
    GameObject.Velocity = Math.sqrt(NewXaxisComponent * NewXaxisComponent + NewYaxisComponent * NewYaxisComponent);
    GameObject.Heading = (Math.atan(Math.abs(NewXaxisComponent) / NewYaxisComponent) / 0.0174532925) - 180;
  }
  else if (NewXaxisComponent > 0 && NewYaxisComponent < 0)
  {
    GameObject.Velocity = Math.sqrt(NewXaxisComponent * NewXaxisComponent + NewYaxisComponent * NewYaxisComponent);
    GameObject.Heading = Math.atan(NewXaxisComponent / Math.abs(NewYaxisComponent)) / 0.0174532925;
  }
  else if (NewXaxisComponent > 0 && NewYaxisComponent > 0)
  {
    GameObject.Velocity = Math.sqrt(NewXaxisComponent * NewXaxisComponent + NewYaxisComponent * NewYaxisComponent);
    GameObject.Heading = 180 - Math.atan(NewXaxisComponent / NewYaxisComponent) / 0.0174532925;
  }
}

function GetXaxisComponent(Direction, Magnitude)
{
  var XaxisComponent = 0;

  if (Direction == 0)
  {
    XaxisComponent = 0;
  }
  else if (Direction == 90)
  {
     XaxisComponent = Magnitude;
  }
  else if (Direction == 180)
  {
    XaxisComponent = 0;
  }
  else if (Direction == 270)
  {
    XaxisComponent = -1 * Magnitude;
  }
  else if (Direction < 90)
  {
    XaxisComponent = Magnitude * (Math.sin(Direction * 0.0174532925));
  }
  else if (Direction < 180)
  {
    XaxisComponent = Magnitude * (Math.sin((180 - Direction) * 0.0174532925));
  }
  else if (Direction < 270)
  {
    XaxisComponent = -1 * Magnitude * (Math.sin((Direction - 180) * 0.0174532925));
  }
  else
  {
    XaxisComponent = -1 * Magnitude * (Math.sin((360 - Direction) * 0.0174532925));
  }

  return XaxisComponent;
}

function GetYaxisComponent(Direction, Magnitude)
{
  var YaxisComponent = 0;

  if (Direction == 0)
  {
    YaxisComponent = -1 * Magnitude;
  }
  else if (Direction == 90)
  {
    YaxisComponent = 0;
  }
  else if (Direction == 180)
  {
    YaxisComponent = Magnitude;
  }
  else if (Direction == 270)
  {
    YaxisComponent = 0;
  }
  else if (Direction < 90)
  {
    YaxisComponent =  -1 * Magnitude * (Math.cos(Direction * 0.0174532925));
  }
  else if (Direction < 180)
  {
    YaxisComponent =  Magnitude * (Math.cos((180 - Direction) * 0.0174532925));
  }
  else if (Direction < 270)
  {
    YaxisComponent =  Magnitude * (Math.cos((Direction - 180) * 0.0174532925));
  }
  else
  {
    YaxisComponent =  -1 * Magnitude * (Math.cos((360 - Direction) * 0.0174532925));
  }

  return YaxisComponent;
}