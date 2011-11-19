function KeyPress(evt)
{
  // ENTER - Start
  if(evt.keyCode==13 && GameOver == true && CountdownTimer < 1)
  {
    evt.preventDefault();
    NewGame();
  }
  
  // SPACE_BAR - Fire
  else if(evt.keyCode == 32)
  {
    evt.preventDefault();
    var newCommand = new CommandObject(0, 0, PlayerObjects[0].ship, tick+commandDelay);
    CommandObjects.push(newCommand);
  }
  
  // LEFT_ARROW - Rotate CounterClockwise
  else if(evt.keyCode == 37)
  {
    evt.preventDefault();
    var newCommand = new CommandObject(0, 1, PlayerObjects[0].ship, tick+commandDelay);
    CommandObjects.push(newCommand);
  }
  
  // UP_ARROW - Forward Thruster
  else if(evt.keyCode==38)
  {
    evt.preventDefault();
    var newCommand = new CommandObject(0, 2, PlayerObjects[0].ship, tick+commandDelay);
    CommandObjects.push(newCommand);
  }
  
  // RIGHT_ARROW - Rotate Clockwise
  else if(evt.keyCode==39)
  {
    evt.preventDefault();
    var newCommand = new CommandObject(0, 3, PlayerObjects[0].ship, tick+commandDelay);
    CommandObjects.push(newCommand);
  }
  
  // DOWN_ARROW - Stop
  else if(evt.keyCode==40)
  {
    evt.preventDefault();
    var newCommand = new CommandObject(0, 4, PlayerObjects[0].ship, tick+commandDelay);
    CommandObjects.push(newCommand);
  }
}