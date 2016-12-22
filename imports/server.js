import './engine/engine.js';
import './ai.js';

const inboundCommands = new Meteor.Streamer('inboundControls');

const outboundState = new Meteor.Streamer('outboundState');

Server = function Server() {

    inboundCommands.allowRead('all');

    inboundCommands.allowWrite('all');

    outboundState.allowRead('all');

    outboundState.allowWrite('all');
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

    server.setupStreamListeners();

    setInterval(function() {

        server.createAiShip();

        ai.issueCommands();

        engine.update();

    }, 15);

    setInterval(function() {

        outboundState.emit('outboundState', {gameState: gameObjects});

    }, 45);

}

Server.prototype.setupStreamListeners = function() {

    inboundCommands.on('inboundCommands', function(inboundCommand) {

        commands.push(inboundCommand);

    });

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

    }

});
