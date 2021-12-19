import {Ai} from './ai.js';
import {Engine} from '../engine/engine.js';
import {Meteor} from 'meteor/meteor';
import {Ship} from '../engine/ship.js';
import {Utilities} from '../utilities/utilities.js';

Server = function Server() {
    engine = new Engine();
    updateId = 0;
    ai = new Ai();
    gameObjects = [];
    commands = [];
    players = [];
    gameObjectId = 0;
    frameRate = Meteor.settings.private.frameRate;
    messageOutputRate = Meteor.settings.private.messageOutputRate;
    mapRadius = Meteor.settings.public.mapRadius;
}

Server.prototype.init = function() {
    server.setupStreamPermissions();
    server.setupStreamListeners();
    server.startPhysicsLoop();
}

Server.prototype.setupStreamPermissions = function() {
    inputStream.allowRead('all');
    inputStream.allowWrite('all');
    outputStream.allowRead('all');
    outputStream.allowWrite('all');
}

Server.prototype.setupStreamListeners = function() {
    inputStream.on('input', function(input) {
        commands.push(input);
    });
}

Server.prototype.startPhysicsLoop = function() {
    setInterval(function() {
        ai.createNewShip();
        ai.issueCommands();
        engine.update(60);
        outputStream.emit('output', Utilities.packGameState({updateId: updateId, gameState: gameObjects}));
        engine.removeSoundObjects();
        updateId++;
    }, frameRate);
}

Meteor.methods({
    createNewPlayerShip: function(name) {
        
        var playerShip = new Ship();
        playerShip.init('Human');
        playerShip.setStartingHumanPosition();
        gameObjects.push(playerShip);

        for (var i=0, j=gameObjects.length; i<j; i++) {
            if (gameObjects[i].Type == 'Player') {
                if (gameObjects[i].Id == this.connection.id) {
                    gameObjects[i].ShipId = playerShip.Id;
                    gameObjects[i].Name = name;
                }
            }
        }

        return playerShip.Id;
    },

    getPlayerId: function() {
        return this.connection.id;
    }
    
});