
import { Meteor } from 'meteor/meteor';

import '../engine/engine.js';

import './ai.js';

import './player.js';

import { packGameState } from '../utilities/utilities.js';

Server = function Server() {

    engine = new Engine();

    ai = new Ai();

    gameObjects = [];

    deadObjects = [];

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

    server.startMessageLoop();

}

Server.prototype.setupStreamPermissions = function() {

    inputStream.allowRead('all');

    inputStream.allowWrite('all');

    outputStream.allowRead('all');

    outputStream.allowWrite('all');

}

Server.prototype.setupStreamListeners = function() {

    inputStream.on('input', function(input) {

        for (var x = 0, y = players.length; x < y; x++) {

            if (this.connection.id == players[x].id) {

                players[x].lastSeqNum = input.seqNum;

            }

        }

        // Not really sure I need to push the entire command anymore
        // because the engine doesn't care about the seq number....
        commands.push(input);

    });

}

Server.prototype.startPhysicsLoop = function() {

    setInterval(function() {

        ai.createNewShip();

        ai.issueCommands();

        engine.update();

    }, frameRate);

}

Server.prototype.startMessageLoop = function() {

    setInterval(function() {

        outputStream.emit('output', packGameState({players: players, gameState: gameObjects}));

    }, messageOutputRate);

}

Meteor.methods({

    createNewPlayerShip: function() {

        var playerShip = new Ship('Human');

        playerShip.setStartingHumanPosition();

        gameObjects.push(playerShip);

        return playerShip.Id;

    },

    getPlayerId: function() {

        return this.connection.id;

    }

});
