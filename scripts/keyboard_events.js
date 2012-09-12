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
    var newCommand = new CommandModel({playerId: 0, command: 0, targetId: PlayerObjects[0].shipId, tick: tick+commandDelay});
    commandCollection.add(newCommand);
  }
  
  // LEFT_ARROW - Rotate CounterClockwise
  else if(evt.keyCode == 37)
  {
    evt.preventDefault();
    var newCommand = new CommandModel({playerId: 0, command: 1, targetId: PlayerObjects[0].shipId, tick: tick+commandDelay});
    commandCollection.add(newCommand);
  }
  
  // UP_ARROW - Forward Thruster
  else if(evt.keyCode==38)
  {
    evt.preventDefault();
    var newCommand = new CommandModel({playerId: 0, command: 2, targetId: PlayerObjects[0].shipId, tick: tick+commandDelay});
    commandCollection.add(newCommand);
  }
  
  // RIGHT_ARROW - Rotate Clockwise
  else if(evt.keyCode==39)
  {
    evt.preventDefault();
    var newCommand = new CommandModel({playerId: 0, command: 3, targetId: PlayerObjects[0].shipId, tick: tick+commandDelay});
    commandCollection.add(newCommand);
  }
  
  // DOWN_ARROW - Stop
  else if(evt.keyCode==40)
  {
    evt.preventDefault();
    var newCommand = new CommandModel({playerId: 0, command: 4, targetId: PlayerObjects[0].shipId, tick: tick+commandDelay});
    commandCollection.add(newCommand);
  }
}