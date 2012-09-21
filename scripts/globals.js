// globals.js

// Various Object Arrays
var gameObjects = [];
var deadObjects = [];
var playerObjects = [];
var commands = [];

// Used to control and maintain the game loop
var gameOver = true;
var countdownTimer = 0;
var frameCounter = 0;
var framesPerSecond = 0;
var gameSpeed = .66;

// Used to help with the command timing. I'm not 100% sure how they work.
var commandDelay = 1;
var tick = 0;

// Should really be its own object
var explosionSize = 20;

// These are used to create unique IDs to track the DOM elements. Once I implement
// backbone MVC I should not need these anymore
var playerObjectId = 0;
var gameObjectId = 0;

// Used to maintain the GUI
var zoomLevel = 400;
var availableWidth = window.innerWidth - 22;
var availableHeight = window.innerHeight - 22;

if (availableHeight < availableWidth)
{
	availablePixels = availableHeight;
}
else
{
	availablePixels = availableWidth;
}

var currentScale = availablePixels / zoomLevel;

// Global GUI objects
var backgroundGroup;
var scopeGroup;
var portGroup;

function Init()
{
	new Map();
	NewGame();
}

function NewGame()
{
    ClearGameObjects()
    playerObjects= [];
    commands = [];
    
    gameOver = false;
    countdownTimer = 100;
    playerObjectId = 0;
    gameObjectId = 0;
  
    gameObjects = [];
  
    CreateShipObject('Human', 0);

    frameCounter = 0;

    FrameCounterInterval = setInterval("UpdateFramesPerSecond()", 1000);
    EnemyShipCreationInterval = setInterval("EnemyShipCreationLoop()", 1000);
    GameInterval = setInterval("GameLoop()", 40);
}

function ClearGameObjects()
{
    for (var i=0, j=gameObjects.length; i<j; i++)
    {
        deadObjects.push(gameObjects[i]);
    }
  
    RemoveDeadObjects();
}

function UpdateFramesPerSecond()
{
    framesPerSecond = frameCounter;
    frameCounter = 0;
}

function EnemyShipCreationLoop()
{
    CreateShipObject('Computer');
}
    
function GameLoop()
{
    frameCounter++;
  
    if(countdownTimer < 1)
    {
        window.clearInterval(FrameCounterInterval);
        window.clearInterval(GameInterval);
        window.clearInterval(EnemyShipCreationInterval);
        NewGame();
    }
    else
    {
        if (gameOver == true)
        {
            countdownTimer = countdownTimer - 1;
        }
    
        issueAiCommands();
        UpdateGameObjects();
        CollisionDetection();
        // BoundryChecking();
        UpdateGameElements();
    
        tick++;
    }
}

function issueAiCommands()
{
    if (frameCounter == 10)
    {
        for (var x=1; x<playerObjects.length; x++)
        {
            Think(playerObjects[x]);
        }
    }
}

function Think(PlayerObject)
{
    switch (Math.floor(Math.random()*11+1))
    {
        case 1:
            var thrusterCommand = new Command({command: 2, targetId: PlayerObject.shipId, tick: tick+commandDelay});
            commands.push(thrusterCommand);
            break;
        case 3:
        case 4:
        case 11:
            var fireCommand = new Command({command: 0, targetId: PlayerObject.shipId, tick: tick+commandDelay});
            commands.push(fireCommand);
            break;
        case 6:
        case 7:
            var rotateCounterClockwiseCommand = new Command({command: 1, targetId: PlayerObject.shipId, tick: tick+commandDelay});
            commands.push(rotateCounterClockwiseCommand);
            break;
        case 8:
        case 9:
            var rotateClockwiseCommand = new Command({command: 3, targetId: PlayerObject.shipId, tick: tick+commandDelay});
            commands.push(rotateClockwiseCommand);
            break;
        case 2:
        case 5:
        case 10:
            var brakesCommand = new Command({command: 4, targetId: PlayerObject.shipId, tick: tick+commandDelay});
            commands.push(brakesCommand);
            break;
    }
}

function UpdateGameObjects()
{
    for (var i=0; i<gameObjects.length; i++)
    {
        switch (gameObjects[i].Type)
        {
            case 'HumanShip':
            case 'ComputerShip':
                UpdateShipObject(gameObjects[i])
                break;
            case 'Missile':
                gameObjects[i].update();
                break;
            case 'Particle':
                gameObjects[i].update();
                break;
        }
    }
}

function CreateExplosion(SourceGameObject)
{
	for (var i = 0; i < explosionSize; i++)
	{
		gameObjects.push(new Particle(SourceGameObject)); 
	}
}

function UpdateGameElements()
{
    for (var i=0, j=gameObjects.length; i<j; i++)
    {
        switch (gameObjects[i].Type)
        {
            case 'ComputerShip':
            case 'HumanShip':
                UpdateShipElement(gameObjects[i])
                break;
                case 'Missile':
                gameObjects[i].updateView();
                break;
            case 'Particle':
                gameObjects[i].updateView();
                break;
        }
    }
}

function BoundryChecking()
{
    var MapRadius = availablePixels / 2 / currentScale;
    
    for (var i = 0; i < gameObjects.length; i++)
    {
        // Check to see if GameObject has flown past the border. I do this by measuring the distance
        // from the Game Object to the center of the screen and making sure the distance is smaller
        // than the radius of the screen.
        if (!(gameObjects[i].LocationX * gameObjects[i].LocationX + gameObjects[i].LocationY * gameObjects[i].LocationY < MapRadius * MapRadius))
        {
            deadObjects.push(gameObjects[i]);
        }
    }
    
    RemoveDeadObjects()
}
     
function CollisionDetection()
{
    // Run Colision Detection for each GameObject
    for (var i = 0; i < gameObjects.length; i++)
    {
        // Ignore Particle objects when looking for collisions
        if (gameObjects[i].Type != 'Particle')
        {
            // Find this distance between this and every other object in the game and check to see if it
            // is smaller than the combined radius of the two objects.
            for (var j = 0; j < gameObjects.length; j++)
            {
                // Don't let objects colide with themselves or Particles!
                if (gameObjects[i] != gameObjects[j] && gameObjects[j].Type != 'Particle')
                {
                    if (Math.sqrt((gameObjects[i].LocationX - gameObjects[j].LocationX) * (gameObjects[i].LocationX - gameObjects[j].LocationX) + (gameObjects[i].LocationY - gameObjects[j].LocationY) * (gameObjects[i].LocationY - gameObjects[j].LocationY)) < (gameObjects[i].Size + gameObjects[j].Size))
                    {
                        // This object has collided with something so we get to blow it up!!!
                        CreateExplosion(gameObjects[j]);

                        // I created this array of objects to remove because removing objects from
                        // an array while you are still iterating over the same array is generaly
                        // a bad thing!
                        deadObjects.push(gameObjects[j]);
            
                        // No use blowing this up twice!
                        break;
                    }
                }
            }
        }
    }
    
    for (var k = 0; k < gameObjects.length; k++)
    {
        if ((gameObjects[k].Type == "Missile") && (gameObjects[k].Fuel < 1))
        {
            deadObjects.push(gameObjects[k]);
        }
    }
  
    RemoveDeadObjects();
}

function RemoveDeadObjects()
{
    for (var i = 0, j = deadObjects.length; i < j; i++)
    {
        RemoveGameObject(deadObjects[i]);
    }
  
    deadObjects.length = 0;
}
    
function RemoveGameObject(GameObject)
{
    SvgElementToDelete = GameObject.svgElement;
    SvgElementToDelete.parentNode.removeChild(SvgElementToDelete);
  
    var i = 0;

    switch (GameObject.Type)
    {
        case 'HumanShip':
            gameOver = true;
            break;
        case 'ComputerShip':
            break;
    }
  
    for (var j = 0; j < gameObjects.length; j++)
    {
        if (gameObjects[j] == GameObject)
        {
            gameObjects.splice(i, 1);
        }
        else
        {
            i++;
        }
    }
}

function removePlayerObject(GameObject)
{
    for (var x=0; x < playerObjects.length; x++)
    {
        if (PlayerObject[x].shipId == GameObject.id)
        {
            playerObjects.splice(x,1);
        }
    }
}

