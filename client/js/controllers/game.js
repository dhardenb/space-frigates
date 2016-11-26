Game = function Game() {

}

Game.prototype.init = function() {

  this.setupEventHandlers();

  gameObjects = [];
  deadObjects = [];
  commands = [];
  gameSpeed = .66;
  explosionSize = 20;
  gameObjectId = 0;
  zoomLevel = 400;
  mapRadius = 500;
  physics = new Physics();
  postOffice = new PostOffice();
  engine = new Engine();

  new Renderer();

  this.gameOver = false;
  this.countdownTimer = 40;
  playerShip = new Ship('Human');
  gameObjects.push(playerShip);
  loopInterval = setInterval("game.loop()", 40);
}

Game.prototype.setupEventHandlers = function() {
  document.documentElement.addEventListener("keydown", KeyPress, false);
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
    this.issueAiCommands();
    engine.update();
    this.updateGameElements();
  }
  else {
    window.clearInterval(loopInterval);
    game.init();
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

Game.prototype.issueAiCommands = function () {
  for (var x = 0, y = gameObjects.length; x < y; x++) {
    if (gameObjects[x].Type != 'Human') {
      if (Math.floor((Math.random()*25)+1) == 1) {
        this.think(gameObjects[x]);
      }
    }
  }
}

Game.prototype.think = function (gameObject) {
  var commandType = 0;

  if (gameObject.Type == 'Alpha') {

      switch (Math.floor(Math.random()*11+1)) {
      case 1:
          commandType = 2;
          break;
      case 3:
      case 4:
      case 11:
      case 10:
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
          commandType = 4;
          break;
      }
  }
  else if (gameObject.Type == 'Bravo') {
      switch (Math.floor(Math.random()*11+1)) {
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
  }

  commands.push(new Command({command: commandType, targetId: gameObject.Id}));
}

Game.prototype.updateGameElements = function () {
  for (var i=0, j=gameObjects.length; i<j; i++) {
    if (gameObjects[i].Type != 'Particle' && gameObjects[i].Type != 'Thruster') {
      gameObjects[i].updateView();
    }
  }
}
