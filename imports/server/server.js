import { Meteor } from 'meteor/meteor';
import '../engine/engine.js';
import './ai.js';
import { packGameState } from '../utilities/utilities.js';

const accountSid = Meteor.settings.private.twillioAccountSid;
const authToken = Meteor.settings.private.authToken;
const twilioClient = require('twilio')(accountSid, authToken);

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
        outputStream.emit('output', packGameState({updateId: updateId, gameState: gameObjects}));
        engine.removeSoundObjects();
        updateId++;
    }, frameRate);
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

        if (Meteor.settings.public.environment == 'prod') {

            twilioClient.messages
                .create({
                    body: 'Somebody just started a game!',
                    from: '+17014011205',
                    to: '+12625011707'
                })
                .then(message => console.log(message.sid));
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