// globals.js

// Various Object Arrays
var gameObjects = [];
var deadObjects = [];
var commands = [];

// Used to control and maintain the game loop

var gameSpeed = .66;

// Should really be its own object
var explosionSize = 20;


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

var physics = new Physics();
var game = new Game();

function Init()
{
    new Map();
	game.reset();
}

function issueAiCommands()
{
    for (var x = 0, y = gameObjects.length; x < y; x++)
    {
        if (gameObjects[x].Type == 'Computer')
        {
            if (Math.floor((Math.random()*25)+1) == 1)
            {
                think(gameObjects[x]);
            }
        }
    }
}

function think(gameObject)
{
    var commandType = 0;
    
    switch (Math.floor(Math.random()*11+1))
    {
        case 1:
            commandType = 2;
            break;
        case 3:
        case 4:
        case 11:
            commandType = 0;
            break;
        case 6:
        case 7:
            commandType = 1;
            break;
        case 8:
        case 9:
            commandType = 3;
            break;
        case 2:
        case 5:
        case 10:
            commandType = 4;
            break;
    }
    
    commands.push(new Command({command: commandType, targetId: gameObject.Id}));
}

function UpdateGameObjects()
{
    for (var i = 0; i < gameObjects.length; i++)
    {
        gameObjects[i].update();
    }

    commands = [];
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
        gameObjects[i].updateView();
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
    
    game.emoveDeadObjects()
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
        if (gameObjects[k].Fuel < 1)
        {
            deadObjects.push(gameObjects[k]);
        }
    }
  
    game.removeDeadObjects();
}

