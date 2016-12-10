import './engine/engine.js';
import './ai.js';

Server = function Server() {

}

Server.prototype.init = function() {

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
  engine = new Engine();
  ai = new Ai();

  setInterval(function() {
    console.log(gameObjects.length);
    server.createAiShip();
    ai.issueCommands();
    engine.update();
  }, 40);

}

Server.prototype.createAiShip = function() {
  var nextShipType = Math.floor((Math.random()*100)+1);
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
    return gameObjects;
  },
  putCommands: function (command) {
    commands.push(command);
  }
});
