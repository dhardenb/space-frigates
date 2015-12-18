// game.js

Game = function () {

    this.gameOver = true;
    this.countdownTimer = 0;
}

Game.prototype.reset = function() {

    this.gameOver = false;

    this.countdownTimer = 40;

    playerShip = new Ship('Human');
  
    gameObjects.push(playerShip);

    loopInterval = setInterval("game.loop()", 40);
}

Game.prototype.loop = function() {
 
    if (this.countdownTimer > 0) {
    
        if (this.gameOver == true) {
        
            this.countdownTimer--;
        }

        var nextShipType = Math.floor((Math.random()*100)+1)
    
        if (nextShipType == 1) {
            gameObjects.push(new Ship('Alpha'));
        }
        else if (nextShipType == 2) {
            gameObjects.push(new Ship('Bravo'));
        }
        
        issueAiCommands();
        updateGameObjects();
        collisionDetection();
        fuelDetection();
        // boundryChecking();
        updateGameElements();
    }
    else {
    
        window.clearInterval(loopInterval);

        init();
    }
}

Game.prototype.removeDeadObjects = function() {

    for (var x = 0, y = deadObjects.length; x < y; x++) {
    
        // I had to filter out the particle objects because they do NOT 
        // have an svgElement!!!
        if (deadObjects[x].Type != 'Particle' && deadObjects[x].Type != 'Thruster') {
        
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