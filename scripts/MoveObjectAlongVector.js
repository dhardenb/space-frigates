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