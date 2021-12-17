import {Engine} from '../engine/engine.js';
import {Keyboard} from './keyboard.js';
import {Renderer} from './renderer.js';
import {Utilities} from '../utilities/utilities.js';
import {Ship} from '../engine/ship.js';

Client = function Client() {
    localMode = false;
    engine = new Engine();
    lastUpdateId = 0;
    keyboard = new Keyboard();
    renderer = new Renderer();
    gameObjects = [];
    deadObjects = [];
    commands = [];
    sentCommands = [];
    gameObjectId = 0;
    playerShipId = -1;
    seqNum = 0;
    mapRadius = Meteor.settings.public.mapRadius;
    playerId = 0;
    numberOfUpdates = 0;
    totalSizeOfUpdates = 0;
    smallestUpdate = 0;
    largestUpdate = 0;
    gameMode = 'START_MODE';
    playerName = "";
    lastTimeStamp = null;
    lastUpdateCreatedAt = null;
}

Client.prototype.init = function() {
    client.setupEventHandlers();
    client.setupStreamListeners();
    window.requestAnimationFrame(client.gameLoop);
    client.getPlayerId();
}

Client.prototype.setupEventHandlers = function() {
    document.documentElement.addEventListener("keydown", keyboard.handleKeyPressEvents, false);
}

Client.prototype.setupStreamListeners = function() {
    outputStream.on('output', function(serverUpdate) {
        serverUpdate = Utilities.unpackGameState(serverUpdate);
        
        if (!localMode) {
            gameObjects = engine.convertObjects(gameObjects, serverUpdate.gameState);
        }  

        let playerIsAlive = false;        

        for (let x = 0; x < gameObjects.length; x++) {
            if (gameObjects[x].Id == playerShipId) {
                playerIsAlive = true;
            }
        }

        if (playerIsAlive) {
            gameMode = 'PLAY_MODE';
        } else {
            gameMode = 'START_MODE';
        }
        
        lastUpdateId = serverUpdate.updateId;
    });
}

let currentFrameRate = 0;
let previousTimeStamp = 0;

Client.prototype.gameLoop = function(currentTimeStamp) {
    currentFrameRate = 1000 / (currentTimeStamp - previousTimeStamp);
    previousTimeStamp = currentTimeStamp;
    engine.update(currentFrameRate);
    renderer.renderMap();
    engine.removeSoundObjects();
    window.requestAnimationFrame(client.gameLoop);
}

Client.prototype.getPlayerId = function() {
    Meteor.call('getPlayerId', (err, res) => {
        if (err) {
            alert(err);
        } else {
            playerId = res;
        }
    });
}

Client.prototype.requestShip = function() {
    if (playerName == "") {
        playerName = "GUEST";
    }

    if (!localMode) {
        Meteor.call('createNewPlayerShip', playerName, (err, res) => {
            if (err) {
                alert(err);
            } else {
                gameMode = 'PLAY_MODE';
                playerShipId = res;
            }
        });
    } else {
        var playerShip = new Ship();
        playerShip.init('Human');
        playerShip.Name = playerName;
        playerShip.setStartingHumanPosition();
        gameObjects.push(playerShip);
        playerShipId = playerShip.Id;
    }
}

// NOTE: I should really insert the sequence number here at not
// in the KeyBoard Event handleKeyPressEvents
Client.prototype.commandHandler = function(input) {
    commands.push(input);
    sentCommands.push(input);
    inputStream.emit('input', input);
    seqNum++;
}