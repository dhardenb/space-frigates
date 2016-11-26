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
  gameOver = false;
  countdownTimer = 40;

  physics = new Physics();
  postOffice = new PostOffice();
  engine = new Engine();
  renderer = new Renderer();
  ai = new Ai();

  playerShip = new Ship('Human');
  gameObjects.push(playerShip);

  loopInterval = setInterval("game.loop()", 40);
}

Game.prototype.setupEventHandlers = function() {
  document.documentElement.addEventListener("keydown", KeyPress, false);
}

Game.prototype.loop = function() {
  if (countdownTimer > 0) {
    if (gameOver == true) {
      countdownTimer--;
    }
    this.createAiShip();
    ai.issueCommands();
    engine.update();
    renderer.update();
  }
  else {
    window.clearInterval(loopInterval);
    game.init();
  }
}

Game.prototype.createAiShip = function() {
  var nextShipType = Math.floor((Math.random()*100)+1)
  if (nextShipType == 1) {
    gameObjects.push(new Ship('Alpha'));
  }
  else if (nextShipType == 2) {
    gameObjects.push(new Ship('Bravo'));
  }
}
