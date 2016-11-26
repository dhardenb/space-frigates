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
  renderer = new Renderer();
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
    renderer.updateGameElements();
  }
  else {
    window.clearInterval(loopInterval);
    game.init();
  }
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
