function Init()
{
  // Resize the canvas
  var CanvasElement = document.getElementById("Canvas");
  CanvasElement.setAttributeNS(null, "height", availableHeight);	
  CanvasElement.setAttributeNS(null, "width", availableWidth);

  // Render the ConsoleGroup
  var ConsoleGroupElement = document.createElementNS(svgNS,"g");
  verticalMargins = (availableWidth - AvailablePixels) / 2;
  horizontalMargins = (availableHeight - AvailablePixels) / 2;
  ConsoleGroupElement.setAttribute('transform', 'translate('+verticalMargins+','+horizontalMargins+')');
  CanvasElement.appendChild(ConsoleGroupElement);

  // Render the Console
  var ShipConsoleElement = document.createElementNS(svgNS,"rect");
  ShipConsoleElement.setAttributeNS(null, "x", 0);	
  ShipConsoleElement.setAttributeNS(null, "y", 0);
  ShipConsoleElement.setAttributeNS(null, "rx", roundingConstant);
  ShipConsoleElement.setAttributeNS(null, "ry", roundingConstant);
  ShipConsoleElement.setAttributeNS(null, "height", AvailablePixels);	
  ShipConsoleElement.setAttributeNS(null, "width", AvailablePixels);
  ShipConsoleElement.setAttributeNS(null, "fill", 'gray');
  ConsoleGroupElement.appendChild(ShipConsoleElement);

  // Render the Scope
  renderScope(ConsoleGroupElement);
  // renderRibbon(ConsoleGroupElement);
  // renderMissionSummary(ConsoleGroupElement);
  // renderCapacitor(ConsoleGroupElement);
  // renderDebugger(ConsoleGroupElement);
  // renderAutoPilot(ConsoleGroupElement);
  // renderFireButton(ConsoleGroupElement);
}

function NewGame()
{
  ClearGameObjects()
  PlayerObjects.length = 0;
  CommandObjects.length = 0;
  CommandRequestObjects.length = 0;
    
  GameOver = false;
  CountdownTimer = 25;
  Level = Level + 1;
  EnemyCount = Level;
  gameObjectId = 0;
  
  GameObjects.length = 0;
  
  CreateShipObject('Human', 0);

  for (var i=0, j=Level; i<j; i++)
  {
    CreateShipObject('Computer', i);
  }

  FrameCounter = 0;

  Timer = setInterval("UpdateFramesPerSecond()", 1000);
  GameLoopInterval = setInterval("GameLoop()", 40);
}

function ClearGameObjects()
{
  for (var i=0, j=GameObjects.length; i<j; i++)
  {
    DeadObjects.push(GameObjects[i]);
  }
  
  RemoveDeadObjects();
}

function UpdateFramesPerSecond()
{
  FramesPerSecond = FrameCounter;
  FrameCounter = 0;
}
    
function GameLoop()
{
  FrameCounter++;
  
  if(CountdownTimer < 1)
  {
    window.clearInterval(Timer);
    window.clearInterval(GameLoopInterval);
  }
  else
  {
    if (GameOver == true)
    {
      CountdownTimer = CountdownTimer - 1;
    }
    
    SendCommandsToServer();
    UpdateGameObjects();
    CollisionDetection();
    UpdateMap(); // I put this here because updatign the map is based on the new position of the local players ship.
    UpdateGameElements();
    
    tick++;
  }
}

function SendCommandsToServer()
{
  for (var i=1, j=PlayerObjects.length; i<j; i++)
  {
    if (FrameCounter == i+1)
    {
      Think(PlayerObjects[i]);
    }
  }
}

function Think(PlayerObject)
{
  switch (Math.floor(Math.random()*11+1))
  {
    case 1:
      var ThrusterCommand = new CommandObject(PlayerObject.id, 2, PlayerObject.ship, tick+commandDelay);
      IssueCommand(ThrusterCommand);
      break;
    case 3:
    case 4:
    case 11:
      var FireCommand = new CommandObject(PlayerObject.id, 0, PlayerObject.ship, tick+commandDelay);
      IssueCommand(FireCommand);
      break;
    case 6:
    case 7:
      var RotateCounterClockwiseCommand = new CommandObject(PlayerObject.id, 1, PlayerObject.ship, tick+commandDelay);
      IssueCommand(RotateCounterClockwiseCommand);
      break;
    case 8:
    case 9:
      var RotateClockwiseCommand = new CommandObject(PlayerObject.id, 3, PlayerObject.ship, tick+commandDelay);
      IssueCommand(RotateClockwiseCommand);
      break;
    case 2:
    case 5:
    case 10:
      var BrakesCommand = new CommandObject(PlayerObject.id, 4, PlayerObject.ship, tick+commandDelay);
      IssueCommand(BrakesCommand);
      break;
  }
}

function IssueCommand(newCommand)
{
  if (singlePlayer == true)
  {
    httpObject = getHTTPObject();
    if (httpObject != null)
    {
      httpObject.open("GET", "space_battle_server.php?player=" + newCommand.player + "&type=" + newCommand.command + "&target=" + newCommand.target + "&tick=" + newCommand.tick, true);
      httpObject.send(null);
    }
  }
  CommandObjects.push(newCommand);
}

function UpdateGameObjects()
{
  // Can not optimize this loop because the ProcessCommand can
  // add new objects tothe GameObjects array!!!
  for (var i=0; i<GameObjects.length; i++)
  {
    switch (GameObjects[i].Type)
    {
      case 'HumanShip':
      case 'ComputerShip':
        UpdateShipObject(GameObjects[i])
        break;
      case 'Missile':
        UpdateMissileObject(GameObjects[i]);
        break;
      case 'Partical':
        UpdateParticalObject(GameObjects[i]);
        break;
    }
  }
  
  DeleteOldCommands();
}

function getHTTPObject()
{
  if (window.ActiveXObject)
  {
    return new ActiveXObject("Microsoft.XMLHTTP");
  }
  else if (window.XMLHttpRequest)
  {
    return new XMLHttpRequest();
  }
  else 
  {
    alert("Your browser does not support AJAX.");
    return null;
  }
}

function KeyPress(evt)
{
  // Spare Bar: Fire!
  if(evt.keyCode == 32)
  {
    evt.preventDefault();
    var newCommand = new CommandObject(0, 0, PlayerObjects[0].ship, tick+commandDelay);
    IssueCommand(newCommand);
  }
  // Rotate CounterClockwise
  else if(evt.keyCode == 37)
  {
    evt.preventDefault();
    var newCommand = new CommandObject(0, 1, PlayerObjects[0].ship, tick+commandDelay);
    IssueCommand(newCommand);
  }
  // Forward Thruster
  else if(evt.keyCode==38)
  {
    evt.preventDefault();
    var newCommand = new CommandObject(0, 2, PlayerObjects[0].ship, tick+commandDelay);
    IssueCommand(newCommand);
  }
  // Rotate Clockwise
  else if(evt.keyCode==39)
  {
    evt.preventDefault();
    var newCommand = new CommandObject(0, 3, PlayerObjects[0].ship, tick+commandDelay);
    IssueCommand(newCommand);
  }
  // Brakes
  else if(evt.keyCode==40)
  {
    evt.preventDefault();
    var newCommand = new CommandObject(0, 4, PlayerObjects[0].ship, tick+commandDelay);
    IssueCommand(newCommand);
  }
  // Center Map on Ship
  else if(evt.keyCode==67)
  {
    evt.preventDefault();
  }
  // Shields
  else if(evt.keyCode==83) 
  {
    evt.preventDefault();
  }
  // enter - newgame
  else if(evt.keyCode==13 && GameOver == true)
  {
    evt.preventDefault();
    NewGame();
  }
}

function CreateShieldObject(ShieldSource)
{
  var NewShield = new GameObject(gameObjectId, 'Shield', ShieldSource.LocationX, ShieldSource.LocationY, 0, Math.random()*360, Math.random()*10, 'hidden', 1, 'None', 0, 0, Math.random()*10);
  gameObjectId++;
  GameObjects.push(NewPartical);
  CreateParticalElement(NewPartical);
  FindNewVelocity(NewPartical, ParticalSource.Heading, ParticalSource.Velocity); 
}

function CreateExplosion(SourceGameObject)
{
  for (var i=0; i<ExplosionSize; i++)
  {
    CreateParticalObject(SourceGameObject);
  }
}

function DeleteOldCommands()
{
  numberOfCommandsToDelete = 0;
  
  for (var i=0, j=CommandObjects.length; i<j; i++)
  {
    if (CommandObjects[i].tick > tick)
    {
      numberOfCommandsToDelete = i;
      break;
    }
  }
  
  CommandObjects.splice(0, numberOfCommandsToDelete)
}

function UpdateGameElements()
{
  for (var i=0, j=GameObjects.length; i<j; i++)
  {
    switch (GameObjects[i].Type)
    {
      case 'ComputerShip':
      case 'HumanShip':
        UpdateShipElement(GameObjects[i])
        break;
      case 'Missile':
        UpdateMissileElement(GameObjects[i]);
        break;
      case 'Partical':
        UpdateParticalElement(GameObjects[i]);
        break;
    }
  }
  
  
}

function ProcessCommand(Command, GameObject)
{
  switch (Command)
  {
    case 0:
      if (GameObject.Capacitor > 2)
      {
        CreateMissileObject(GameObject);
        GameObject.Capacitor = GameObject.Capacitor - 3;
      }
      break;
    case 3:
      if (GameObject.Capacitor > 0)
      {
        if (GameObject.RotationDirection == 'Clockwise')
        {
          GameObject.RotationVelocity = GameObject.RotationVelocity + 1;
        }
        else if (GameObject.RotationDirection == 'None')
        {
          GameObject.RotationVelocity = GameObject.RotationVelocity + 1;
          GameObject.RotationDirection = 'Clockwise';
        }
        else // GameObject.RotationDirection == 'CounterClockwise'
        {
          GameObject.RotationVelocity = GameObject.RotationVelocity - 1;
       
          if (GameObject.RotationVelocity == 0)
          {
            GameObject.RotationDirection = 'None';
          }
        }
        GameObject.Capacitor = GameObject.Capacitor - 1;
      }
      break;
    case 1:
      if (GameObject.Capacitor > 0)
      {
        if (GameObject.RotationDirection == 'CounterClockwise')
        {
          GameObject.RotationVelocity = GameObject.RotationVelocity + 1;
        }
        else if (GameObject.RotationDirection == 'None')
        {
          GameObject.RotationVelocity = GameObject.RotationVelocity + 1;
          GameObject.RotationDirection = 'CounterClockwise';
        }
        else
        {
          GameObject.RotationVelocity = GameObject.RotationVelocity - 1;
          
          if (GameObject.RotationVelocity == 0)
          {
            GameObject.RotationDirection = 'None';
          }
        }
        GameObject.Capacitor = GameObject.Capacitor - 1;
      }
      break;
    case 2:
      if (GameObject.Capacitor > 0)
      {
        FindNewVelocity(GameObject, GameObject.Facing, 1)
        GameObject.Capacitor = GameObject.Capacitor - 1;
      }
      break;
    case 4:
      if (GameObject.Velocity > 0 && GameObject.Capacitor > 0)
      {
        GameObject.Velocity = GameObject.Velocity - 1;
        GameObject.Capacitor = GameObject.Capacitor - 1;
      }
      
      if (GameObject.RotationVelocity > 0 && GameObject.Capacitor > 0)
      {
        GameObject.RotationVelocity = GameObject.RotationVelocity - 1;
          
        if (GameObject.RotationVelocity == 0)
        {
          GameObject.RotationDirection = 'None';
        }

        GameObject.Capacitor = GameObject.Capacitor - 1;
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

function BoundryChecking()
{
  for (var i = 0; i < GameObjects.length; i++)
  {
    // Check to see if GameObject has flown past the border. I do this by measuring the distance
    // from the Game Object to the center of the screen and making sure the distance is smaller
    // than the radius of the screen.
    if (!(GameObjects[i].LocationX * GameObjects[i].LocationX + GameObjects[i].LocationY * GameObjects[i].LocationY < MapRadius * MapRadius))
    {
      DeadObjects.push(GameObjects[i]);
    }
  }
  RemoveDeadObjects()
}
     
function CollisionDetection()
{
  // Run Colision Detection for each GameObject
  for (var i = 0; i < GameObjects.length; i++)
  {
    // Ignore Particle objects when looking for collisions
    if (GameObjects[i].Type != 'Partical')
    {
      // Find this distance between this and every other object in the game and check to see if it
      // is smaller than the combined radius of the two objects.
      for (var j = 0; j < GameObjects.length; j++)
      {
        // Don't let objects colide with themselves or particals!
        if (GameObjects[i] != GameObjects[j] && GameObjects[j].Type != 'Partical')
        {
          if (Math.sqrt((GameObjects[i].LocationX - GameObjects[j].LocationX) * (GameObjects[i].LocationX - GameObjects[j].LocationX) + (GameObjects[i].LocationY - GameObjects[j].LocationY) * (GameObjects[i].LocationY - GameObjects[j].LocationY)) < (GameObjects[i].Size + GameObjects[j].Size))
          {
            // This object has collided with something so we get to blow it up!!!
            CreateExplosion(GameObjects[i]);

            // I created this array of objects to remove because removing objects from
            // an array while you are still iterating over the same array is generaly
            // a bad thing!
            DeadObjects.push(GameObjects[i]);
            
            // No use blowing this up twice!
            break;
          }
        }
      }
    }
  }
  
  RemoveDeadObjects();
  
  for (var k = 0; k < GameObjects.length; k++)
  {
    if ((GameObjects[k].Type == "Missile") && (GameObjects[k].Fuel < 1))
    {
      DeadObjects.push(GameObjects[k]);
    }
  }
  
  RemoveDeadObjects();
}

function RemoveDeadObjects()
{
  for (var i=0, j=DeadObjects.length; i<j; i++)
  {
    RemoveGameObject(DeadObjects[i]);
  }
  
  DeadObjects.length = 0;
}
    
function RemoveGameObject(GameObject)
{
  SvgElementToDelete = GameObject.svgElement;
  SvgElementToDelete.parentNode.removeChild(SvgElementToDelete);
  
  var i = 0;

  switch (GameObject.Type)
  {
    case 'HumanShip':
      GameOver = true;
      break;
    case 'ComputerShip':
      EnemyCount = EnemyCount - 1;
      if (EnemyCount < 1)
      {
        GameOver = true;
      }
      break;
  }
  
  for (var j = 0; j < GameObjects.length; j++)
  {
    if (GameObjects[j] == GameObject)
    {
      GameObjects.splice(i, 1);
    }
    else
    {
      i++;
    }
  }
}

function SetStartingPosition(GameObject, Angle)
{
  if (Angle == 0)
  {
    GameObject.LocationX = 0;
    GameObject.LocationY = StartingDistanceFromCenter * -1;
  }
  else if (Angle == 90)
  {
    GameObject.LocationX = StartingDistanceFromCenter;
    GameObject.LocationY = 0;
  }
  else if (Angle == 180)
  {
    GameObject.LocationX = 0;
    GameObject.LocationY = StartingDistanceFromCenter;
  }
  else if (Angle == 270)
  {
    GameObject.LocationX = StartingDistanceFromCenter * -1;
    GameObject.LocationY = 0;
  }
  else if (Angle < 90)
  {
    GameObject.LocationX = StartingDistanceFromCenter * Math.sin(Angle * 0.0174532925);
    GameObject.LocationY = StartingDistanceFromCenter * Math.cos(Angle * 0.0174532925) * -1;
  }
  else if (Angle < 180)
  {
    GameObject.LocationX = StartingDistanceFromCenter * Math.sin((180 - Angle) * 0.0174532925);
    GameObject.LocationY = StartingDistanceFromCenter * Math.cos((180 - Angle) * 0.0174532925);
  }
  else if (Angle < 270)
  {
    GameObject.LocationX = StartingDistanceFromCenter * Math.sin((Angle - 180) * 0.0174532925) * -1;
    GameObject.LocationY = StartingDistanceFromCenter * Math.cos((Angle - 180) * 0.0174532925);
  }
  else // 360
  {
    GameObject.LocationX = StartingDistanceFromCenter * Math.sin((360 - Angle) * 0.0174532925) * -1;
    GameObject.LocationY = StartingDistanceFromCenter * Math.cos((360 - Angle) * 0.0174532925) * -1;
  }

  GameObject.Facing = Angle + 180;
}
    
function UpdateMap()
{
  newCurrentScale = AvailablePixels / ZoomLevel;
  x = HumanShip.LocationX * -1;
  y = HumanShip.LocationY * -1;
  MapGroupElement.setAttribute('transform', 'scale(' + newCurrentScale + ') translate('+ x +','+ y +')');
}

