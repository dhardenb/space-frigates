// game.js

function Game()
{
    this.gameOver = true;
    this.countdownTimer = 0;
}

Game.prototype.reset = function()
{
    this.clearGameObjects();
    playerObjects= [];
    commands = [];
    
    this.gameOver = false;
    this.countdownTimer = 40;
    playerObjectId = 0;
    gameObjectId = 0;
  
    gameObjects = [];
  
    CreateShipObject('Human', 0);

    loopInterval = setInterval("game.loop()", 40);
}

Game.prototype.loop = function()
{ 
    if (this.countdownTimer > 0)
    {
        if (this.gameOver == true)
        {
            this.countdownTimer--;
        }
    
        if (Math.floor((Math.random()*50)+1) == 1)
        {
            CreateShipObject('Computer');
        }
        
        issueAiCommands();
        UpdateGameObjects();
        CollisionDetection();
        // BoundryChecking();
        UpdateGameElements();
    }
    else
    {
        window.clearInterval(loopInterval);
        this.reset();
    }
}

Game.prototype.clearGameObjects = function()
{
    for (var i=0, j=gameObjects.length; i<j; i++)
    {
        deadObjects.push(gameObjects[i]);
    }
  
    this.removeDeadObjects();
}

Game.prototype.removeGameObject = function(GameObject)
{
    var SvgElementToDelete = GameObject.svgElement;
    SvgElementToDelete.parentNode.removeChild(SvgElementToDelete);
  
    var i = 0;

    switch (GameObject.Type)
    {
        case 'HumanShip':
            this.gameOver = true;
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

Game.prototype.removeDeadObjects = function()
{
    for (var i = 0, j = deadObjects.length; i < j; i++)
    {
        game.removeGameObject(deadObjects[i]);
    }
  
    deadObjects.length = 0;
}