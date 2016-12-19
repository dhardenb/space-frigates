import './engine/engine.js';
import './ai.js';

Server = function Server() {

}

Server.prototype.init = function() {

  gameObjects = [];
  deadObjects = [];
  commands = [];

  lastLoop = new Date;
  currentLoop = new Date;
  framesPerSecond = 60;

  lastUpdateRunAt = new Date;

  explosionSize = 20;
  gameObjectId = 0;
  zoomLevel = 400;
  mapRadius = 1000;
  gameOver = false;
  countdownTimer = 40;

  physics = new Physics();
  engine = new Engine();
  ai = new Ai();

  setInterval(function() {

    currentLoop = new Date;

    framesPerSecond = 1000 / (currentLoop - lastLoop);

    lastLoop = currentLoop;

    server.createAiShip();

    ai.issueCommands();

    engine.update();

  }, 45);

}

Server.prototype.createAiShip = function() {
  var nextShipType = Math.floor((Math.random()*200)+1);
  var newAiShip;
  if (nextShipType == 1) {
    newAiShip = new Ship('Alpha');
    newAiShip.setStartingAiPosition();
    gameObjects.push(newAiShip);
  }
  else if (nextShipType == 2) {
    newAiShip = new Ship('Bravo');
    newAiShip.setStartingAiPosition();
    gameObjects.push(newAiShip);
  }
}

Meteor.methods({
  createNewPlayerShip: function () {
    playerShip = new Ship('Human');
    playerShip.setStartingHumanPosition();
    gameObjects.push(playerShip);
    return playerShip.Id;
  },
  getGameObjects: function () {
    return {serverLastUpdatedAt: lastUpdateRunAt, gameState: gameObjects};
  },
  putCommands: function (command) {
    commands.push(command);
  }
});
