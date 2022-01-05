import {Ai} from './ai.js';
import {Engine} from '../engine/engine.js';
import {Meteor} from 'meteor/meteor';
import {Ship} from '../engine/ship.js';
import {Utilities} from '../utilities/utilities.js';

export class Server {

    constructor() {
        
        this.mapRadius = Meteor.settings.public.mapRadius;
        this.commands = [];
        this.frameRate = Meteor.settings.private.frameRate;
        this.ai = new Ai(this.mapRadius);
        this.inputStream = new Meteor.Streamer('input');
        this.outputStream = new Meteor.Streamer('output');
        this.updateId = 0;
        this.engine = new Engine(this.mapRadius);

        global.gameObjects = [];
    }

    init() {
        this.setupStreamPermissions();
        this.setupStreamListeners();
        this.startPhysicsLoop();
    }

    setupStreamPermissions() {
        this.inputStream.allowRead('all');
        this.inputStream.allowWrite('all');
        this.outputStream.allowRead('all');
        this.outputStream.allowWrite('all');
    }

    setupStreamListeners() {
        this.inputStream.on('input', (input) => {this.commands.push(input)});
    }

    updateLoop() {
        this.ai.createNewShip(); 
        this.ai.issueCommands(this.commands);
        this.engine.update(this.commands, 1000 / this.frameRate);
        this.commands = [];
        this.outputStream.emit('output', Utilities.packGameState({updateId: this.updateId, gameState: gameObjects}));
        this.engine.removeSoundObjects();
        this.updateId++;
    }

    startPhysicsLoop() {
        setInterval(this.updateLoop.bind(this), this.frameRate);
    }
}

Meteor.methods({
    createNewPlayerShip: function(name, mapRadius) {
        
        let playerShip = new Ship(Engine.getNextGameObjectId());
        playerShip.init('Human');
        playerShip.setStartingHumanPosition(mapRadius);
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