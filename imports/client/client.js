
import '../engine/engine.js';

import './keyboard.js';

import './renderer.js';

Client = function Client() {

    engine = new Engine();

    keyboard = new Keyboard();

    renderer = new Renderer();

    gameObjects = [];

    deadObjects = [];

    commands = [];

    gameObjectId = 0;

    playerShipId = 0;

    playerHasShip = false;

    mapRadius = 500;

}

Client.prototype.init = function() {

    client.setupEventHandlers();

    client.setupStreamListeners();

    client.animationLoop();

}

Client.prototype.setupEventHandlers = function() {

    document.documentElement.addEventListener("keydown", keyboard.handleKeyPressEvents, false);

}

Client.prototype.setupStreamListeners = function() {

    outputStream.on('output', function(gameState) {

        gameObjects = engine.convertObjects(gameState.gameState);

    });

}

Client.prototype.commandHandler = function(input) {

    commands.push(input);

    inputStream.emit('input', input);

}

Client.prototype.animationLoop = function() {

    window.requestAnimationFrame(client.animationLoop);

    engine.update();

    renderer.renderMap();

}

Client.prototype.requestShip = function() {

    Meteor.call('createNewPlayerShip', (err, res) => {

        if (err) {

            alert(err);

        } else {

            playerShipId = res;

            playerHasShip = false;

        }

    });

}
