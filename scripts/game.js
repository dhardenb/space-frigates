// game.js

function Game() {

    this.gameOver = true;
    this.countdownTimer = 0;
}

Game.prototype.reset = function() {

    this.gameOver = false;
    this.countdownTimer = 40;
    
    commands = [];
    
    this.clearGameObjects();
    gameObjects = [];
    gameObjectId = 0;
  
    gameObjects.push(new Ship('Human'));

    loopInterval = setInterval("game.loop()", 40);
}

Game.prototype.loop = function() {
 
    if (this.countdownTimer > 0) {
    
        if (this.gameOver == true) {
        
            this.countdownTimer--;
        }
    
        if (Math.floor((Math.random()*50)+1) == 1) {
        
            gameObjects.push(new Ship('Computer'));
        }
        
        issueAiCommands();
        updateGameObjects();
        collisionDetection();
        fuelDetection();
        boundryChecking();
        updateGameElements();
    }
    else {
    
        window.clearInterval(loopInterval);
        this.reset();
    }
}

Game.prototype.clearGameObjects = function() {

    for (var x = 0, y = gameObjects.length; x < y; x++) {
    
        deadObjects.push(gameObjects[x]);
    }
      
    this.removeDeadObjects();
}

Game.prototype.removeDeadObjects = function() {

    for (var x = 0, y = deadObjects.length; x < y; x++) {
    
        if (deadObjects[x].Type != 'Particle') {
        
            // Delete the SVG element out of the DOM
            deadObjects[x].svgElement.parentNode.removeChild(deadObjects[x].svgElement);
        }

        // If the dead object was the human ship, trip the game over flag
        if (deadObjects[x].Type == "Human") {
        
            this.gameOver = true;
        }
        
        var i = 0;
  
        for (var j = 0; j < gameObjects.length; j++) {
        
            if (gameObjects[j].Id == deadObjects[x].Id) {
            
                gameObjects.splice(i, 1);
            }
            else {
            
                i++;
            }
        }
    }
  
    deadObjects = [];
}