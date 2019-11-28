import { Meteor } from 'meteor/meteor';
import '../engine/engine.js';
import './ai.js';
import { packGameState } from '../utilities/utilities.js';

Server = function Server() {
    prometheus = require('prom-client');
    engine = new Engine();
    updateId = 0;
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
    server.setupMetrics();
    server.setupRouter();
    server.setupStreamPermissions();
    server.setupStreamListeners();
    server.startPhysicsLoop();
    server.startMessageLoop();
}

Server.prototype.setupMetrics = function () {
    collectDefaultMetrics = prometheus.collectDefaultMetrics;
    collectDefaultMetrics({ timeout: 5000 });
    
    clientConnectionsGauge = new prometheus.Gauge({
        name: 'sf_client_connections',
        help: 'Number of current connections'
    });
}

Server.prototype.setupRouter = function () {
    Picker.route('/metrics', function( params, request, response, next ) {
        response.setHeader( 'Content-Type', prometheus.register.contentType);
        response.end(prometheus.register.metrics());
    });
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
        engine.update(60);
    }, frameRate);
}

Server.prototype.startMessageLoop = function() {
    setInterval(function() {
        outputStream.emit('output', packGameState({updateId: updateId, gameState: gameObjects}));
        updateId++;
    }, messageOutputRate);
}

Meteor.methods({
    createNewPlayerShip: function() {
        
        var playerShip = new Ship();
        playerShip.init('Human');
        playerShip.setStartingHumanPosition();
        gameObjects.push(playerShip);

        for (var i=0, j=gameObjects.length; i<j; i++) {
            if (gameObjects[i].Type == 'Player') {
                if (gameObjects[i].Id == this.connection.id) {
                    gameObjects[i].ShipId = playerShip.Id;
                }
            }
        }

        return playerShip.Id;
    },

    getPlayerId: function() {
        return this.connection.id;
    },

    updatePlayerName: function(name) {
        for (var i=0, j=gameObjects.length; i<j; i++) {
            if (gameObjects[i].Type == 'Player') {
                if (gameObjects[i].Id == this.connection.id) {
                    gameObjects[i].Name = name;
                }
            }
        }
    }
});