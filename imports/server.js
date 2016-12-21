import './engine/engine.js';
import './ai.js';

Server = function Server() {

}

Server.prototype.init = function() {

  gameObjects = [];
  deadObjects = [];
  commands = [];

  framesPerSecond = 60;

  explosionSize = 20;
  gameObjectId = 0;
  zoomLevel = 400;
  mapRadius = 500;

  physics = new Physics();
  engine = new Engine();
  ai = new Ai();

  setInterval(function() {

    server.createAiShip();

    ai.issueCommands();

    engine.update();

  }, 1000/60);

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

        console.log(this.connection);

        return playerShip.Id;

    },

    getGameObjects: function () {

        return {gameState: gameObjects};

    },

    putCommands: function (command) {

        commands.push(command);

    }

});
