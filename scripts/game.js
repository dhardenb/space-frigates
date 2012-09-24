// game.js

function Game()
{
    this.gameOver = true;
    this.countdownTimer = 0;
}

Game.prototype.reset = function()
{
    this.gameOver = false;
    this.countdownTimer = 40;
    
    commands = [];
    
    this.clearGameObjects();
    gameObjects = [];
    gameObjectId = 0;
  
    gameObjects.push(new Ship('Human'));

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
            gameObjects.push(new Ship('Computer'));
        }
        
        issueAiCommands();
        UpdateGameObjects();
        CollisionDetection();
        fuelDetection();
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
        case 'Human':
            this.gameOver = true;
            break;
        case 'Computer':
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