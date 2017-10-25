
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

    sentCommands = [];

    gameObjectId = 0;

    playerShipId = 0;

    seqNum = 0;

    mapRadius = Meteor.settings.public.mapRadius;

    playerId = 0;

}

Client.prototype.init = function() {

    client.setupEventHandlers();

    client.setupStreamListeners();

    client.animationLoop();

    client.getPlayerId();

}

Client.prototype.setupEventHandlers = function() {

    document.documentElement.addEventListener("keydown", keyboard.handleKeyPressEvents, false);

}

Client.prototype.setupStreamListeners = function() {

    outputStream.on('output', function(serverUpdate) {

        gameObjects = engine.convertObjects(serverUpdate.gameState);

        var lastCommandServerProcessed;

        for (x = 0; x < serverUpdate.players.length; x++) {

            if (serverUpdate.players[x].id == client.playerId) {

                lastCommandServerProcessed = serverUpdate.players[x].lastSeqNum;

            }

        }

        for (x = 0; x < sentCommands.length; x++) {

            if (sentCommands[x].seqNum > lastCommandServerProcessed) {

                console.log("Last Command Server Processed: " + lastCommandServerProcessed + " Repushing Command: " + sentCommands[x].seqNum);

                commands.push(sentCommands[x]);

            }

            else {

                // Purge the command since the server has already run it!

            }

        }

    });

}

Client.prototype.animationLoop = function() {

    window.requestAnimationFrame(client.animationLoop);

    engine.update();

    renderer.renderMap();

}

Client.prototype.getPlayerId = function() {

    Meteor.call('getPlayerId', (err, res) => {

        if (err) {

            alert(err);

        } else {

            this.playerId = res;

        }

    });

}

Client.prototype.requestShip = function() {

    Meteor.call('createNewPlayerShip', (err, res) => {

        if (err) {

            alert(err);

        } else {

            playerShipId = res;

        }

    });

}

// NOTE: I should really insert the sequence number here at not

// in the KeyBoard Event handleKeyPressEvents

Client.prototype.commandHandler = function(input) {

    commands.push(input);

    sentCommands.push(input);

    inputStream.emit('input', input);

    seqNum++;

}
