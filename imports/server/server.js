import {Ai} from './ai.js';
import {Engine} from '../engine/engine.js';
import {Meteor} from 'meteor/meteor';
import {Ship} from '../engine/ship.js';
import {Utilities} from '../utilities/utilities.js';

export class Server {

    constructor() {
        global.outputStream = new Meteor.Streamer('output');
        global.engine = new Engine();
        global.updateId = 0;
        global.ai = new Ai();
        global.gameObjects = [];
        global.commands = [];
        global.players = [];
        global.gameObjectId = 0;
        global.frameRate = Meteor.settings.private.frameRate;
        global.messageOutputRate = Meteor.settings.private.messageOutputRate;
        global.mapRadius = Meteor.settings.public.mapRadius;

        this.inputStream = new Meteor.Streamer('input');
    }

    init() {
        this.setupStreamPermissions();
        this.setupStreamListeners();
        this.startPhysicsLoop();
    }

    setupStreamPermissions() {
        this.inputStream.allowRead('all');
        this.inputStream.allowWrite('all');
        global.outputStream.allowRead('all');
        global.outputStream.allowWrite('all');
    }

    setupStreamListeners() {
        this.inputStream.on('input', function(input) {
            commands.push(input);
        });
    }

    startPhysicsLoop() {
        setInterval(function() {
            ai.createNewShip();
            ai.issueCommands();
            engine.update(60);
            global.outputStream.emit('output', Utilities.packGameState({updateId: updateId, gameState: gameObjects}));
            engine.removeSoundObjects();
            updateId++;
        }, frameRate);
    }
}

Meteor.methods({
    createNewPlayerShip: function(name) {
        
        let playerShip = new Ship();
        playerShip.init('Human');
        playerShip.setStartingHumanPosition();
        gameObjects.push(playerShip);

        for (let i=0, j=gameObjects.length; i<j; i++) {
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