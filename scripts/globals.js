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
  
  // Render the score view
  renderScore(ConsoleGroupElement);
  
  NewGame();
}

function NewGame()
{
  ClearGameObjects()
  PlayerObjects.length = 0;
  CommandObjects.length = 0;
  CommandRequestObjects.length = 0;
    
  GameOver = false;
  CountdownTimer = 100;
  playerObjectId = 0;
  gameObjectId = 0;
  
  GameObjects.length = 0;
  
  CreateShipObject('Human', 0);

  FrameCounter = 0;
  score = 0;
  ScoreText.firstChild.nodeValue = score;

  FrameCounterInterval = setInterval("UpdateFramesPerSecond()", 1000);
  EnemyShipCreationInterval = setInterval("EnemyShipCreationLoop()", 1000);
  GameInterval = setInterval("GameLoop()", 40);
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

function EnemyShipCreationLoop()
{
    CreateShipObject('Computer');
}
    
function GameLoop()
{
  FrameCounter++;
  
  if(CountdownTimer < 1)
  {
    window.clearInterval(FrameCounterInterval);
    window.clearInterval(GameInterval);
    window.clearInterval(EnemyShipCreationInterval);
    NewGame();
  }
  else
  {
    if (GameOver == true)
    {
      CountdownTimer = CountdownTimer - 1;
    }
    
    issueAiCommands();
    UpdateGameObjects();
    CollisionDetection();
    BoundryChecking();
    UpdateGameElements();
    
    tick++;
  }
}

function issueAiCommands()
{
  if (FrameCounter == 10)
  {
    for (var x=1; x<PlayerObjects.length; x++)
    {
      Think(PlayerObjects[x]);
    }
  }
}

function Think(PlayerObject)
{
  switch (Math.floor(Math.random()*11+1))
  {
    case 1:
      var ThrusterCommand = new CommandObject(PlayerObject.id, 2, PlayerObject.shipId, tick+commandDelay);
      CommandObjects.push(ThrusterCommand);
      break;
    case 3:
    case 4:
    case 11:
      var FireCommand = new CommandObject(PlayerObject.id, 0, PlayerObject.shipId, tick+commandDelay);
      CommandObjects.push(FireCommand);
      break;
    case 6:
    case 7:
      var RotateCounterClockwiseCommand = new CommandObject(PlayerObject.id, 1, PlayerObject.shipId, tick+commandDelay);
      CommandObjects.push(RotateCounterClockwiseCommand);
      break;
    case 8:
    case 9:
      var RotateClockwiseCommand = new CommandObject(PlayerObject.id, 3, PlayerObject.shipId, tick+commandDelay);
      CommandObjects.push(RotateClockwiseCommand);
      break;
    case 2:
    case 5:
    case 10:
      var BrakesCommand = new CommandObject(PlayerObject.id, 4, PlayerObject.shipId, tick+commandDelay);
      CommandObjects.push(BrakesCommand);
      break;
  }
}

function UpdateGameObjects()
{
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
}

function CreateExplosion(SourceGameObject)
{
  for (var i=0; i<ExplosionSize; i++)
  {
    CreateParticalObject(SourceGameObject);
  }
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

function ProcessShipCommand(Command, GameObject)
{
  switch (Command)
  {
    case 0: // Fire
      if (GameObject.Capacitor > 2)
      {
        CreateMissileObject(GameObject);
        // GameObject.Capacitor = GameObject.Capacitor - 3;
      }
      break;
    case 3: // Rotate Right
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
        // GameObject.Capacitor = GameObject.Capacitor - 1;
      }
      break;
    case 1: // Rotate Left
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
        // GameObject.Capacitor = GameObject.Capacitor - 1;
      }
      break;
    case 2: // Accelerate
      if (GameObject.Capacitor > 0)
      {
        FindNewVelocity(GameObject, GameObject.Facing, 1)
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

        // GameObject.Capacitor = GameObject.Capacitor - 1;
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
  var MapRadius = (AvailablePixels - componentOffset * 4) / 2 / CurrentScale;
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
      score++;
      ScoreText.firstChild.nodeValue = score;
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

function removePlayerObject(GameObject)
{
  for (var x=0; x < PlayerObjects.length; x++)
  {
    if (PlayerObject[x].shipId == GameObject.id)
    {
      PlayerObjects.splice(x,1);
    }
  }
}

