import './engine/engine.js';

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

  setInterval(function() {
    console.log(gameObjects.length);
    engine.update();
  }, 40);

}

Meteor.methods({
  createNewPlayerShip: function () {
    playerShip = new Ship('Human');
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
