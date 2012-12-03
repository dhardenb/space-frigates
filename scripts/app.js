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

var mapRadius = 500;

var physics = new Physics();
var game = new Game();
var postOffice = new PostOffice();

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
    // Can't pre calculate the length of the array because some of the command create new objects
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
	    var newParticle = new Particle(SourceGameObject); 
		gameObjects.push(newParticle);
		var newParticleView = new ParticleView(newParticle);
		postOffice.subscribe(newParticle.Id, newParticleView.update.bind(newParticleView));
	}
}

function UpdateGameElements()
{
    for (var i=0, j=gameObjects.length; i<j; i++)
    {
        if (gameObjects[i].Type != 'Particle')
        {
            gameObjects[i].updateView();
        }
    }
}

function findSolidObjects()
{
    var solidObjects = [];
    
    for (var x = 0, y = gameObjects.length; x < y; x++)
    {
        if (gameObjects[x].Type != 'Particle')
        {
            solidObjects.push(gameObjects[x])
        }
    }
    
    return solidObjects;
}

function BoundryChecking()
{
    solidObjects = findSolidObjects();
    
    for (var x = 0, y = solidObjects.length; x < y; x++)
    {
        // Check to see if GameObject has flown past the border. I do this by measuring the distance
        // from the Game Object to the center of the screen and making sure the distance is smaller
        // than the radius of the screen.
        if (!(solidObjects[x].LocationX * solidObjects[x].LocationX + solidObjects[x].LocationY * solidObjects[x].LocationY < mapRadius * mapRadius))
        {
            CreateExplosion(solidObjects[x]);
            deadObjects.push(solidObjects[x]);
        }
    }
    
    game.removeDeadObjects();
}
     
function CollisionDetection()
{
    var solidObjects = [];
    
    for (var x = 0, y = gameObjects.length; x < y; x++)
    {
        if (gameObjects[x].Type != 'Particle')
        {
            solidObjects.push(gameObjects[x])
        }
    }
    
    // Run colision detection for each solidObject
    for (var i = 0, j = solidObjects.length; i < j; i++)
    {
        // Find this distance between this and every other object in the game and check to see if it
        // is smaller than the combined radius of the two objects.
        for (var k = 0, l = solidObjects.length; k < l; k++)
        {
            // Don't let objects colide with themselves!
            if (i != k)
            {
                if (Math.sqrt((solidObjects[i].LocationX - solidObjects[k].LocationX) * (solidObjects[i].LocationX - solidObjects[k].LocationX) + (solidObjects[i].LocationY - solidObjects[k].LocationY) * (solidObjects[i].LocationY - solidObjects[k].LocationY)) < (solidObjects[i].Size + solidObjects[k].Size))
                {
                    // This object has collided with something so we get to blow it up!!!
                    CreateExplosion(solidObjects[k]);

                    // I created this array of objects to remove because removing objects from
                    // an array while you are still iterating over the same array is generaly
                    // a bad thing!
                    deadObjects.push(solidObjects[k]);
            
                    // No use blowing this up twice!
                    break;
                }
            }
        }
    }
  
    game.removeDeadObjects();
}

function fuelDetection()
{
    for (var x = 0, y = gameObjects.length; x < y; x++)
    {
        if (gameObjects[x].Fuel < 1)
        {
            deadObjects.push(gameObjects[x]);
        }
    }
    
    game.removeDeadObjects();
}
