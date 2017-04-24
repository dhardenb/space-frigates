
import { Meteor } from 'meteor/meteor';

import '../engine/engine.js';

import './ai.js';

Server = function Server() {

    engine = new Engine();

    ai = new Ai();

    gameObjects = [];

    deadObjects = [];

    commands = [];

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

        outputStream.emit('output', {gameState: gameObjects});

    }, messageOutputRate);

}

Meteor.methods({

    createNewPlayerShip: function() {

        var playerShip = new Ship('Human');

        playerShip.setStartingHumanPosition();

        gameObjects.push(playerShip);

        return playerShip.Id;

    }

});
