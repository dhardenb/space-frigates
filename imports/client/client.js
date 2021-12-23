import {Engine} from '../engine/engine.js';
import {Keyboard} from './keyboard.js';
import {Renderer} from './renderer.js';
import {Utilities} from '../utilities/utilities.js';
import {Ship} from '../engine/ship.js';

export class Client {

    constructor() {

        window.engine = new Engine(); // 12 files
        window.gameObjects = []; // 7 files
        window.gameObjectId = 0; // 8 files
        window.mapRadius = Meteor.settings.public.mapRadius; // 6 files
        window.playerShipId = -1; // client, keyboard, renderer
        window.gameMode = 'START_MODE'; // client, keyboard, renderer
        
        this.commands = [];
        this.inputStream = new Meteor.Streamer('input');
        this.outputStream = new Meteor.Streamer('output');
        this.renderer = new Renderer();
        this.keyboard = new Keyboard();
        this.currentFrameRate = 0;
        this.previousTimeStamp = 0;
        this.localMode = false;
        this.playerId = 0;
        this.playerName = "";
    }

    init() {
        this.getPlayerId();
        this.setupEventHandlers();
        this.setupStreamListeners();
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }

    setupEventHandlers() {
        document.documentElement.addEventListener("keydown", this.keyboard.handleKeyPressEvents.bind(this), false);
    }

    setupStreamListeners() {
        this.outputStream.on('output', (serverUpdate) => {
            serverUpdate = Utilities.unpackGameState(serverUpdate);
            
            if (!this.localMode) {
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
        });
    }

    gameLoop(currentTimeStamp) {
        this.currentFrameRate = 1000 / (currentTimeStamp - this.previousTimeStamp);
        this.previousTimeStamp = currentTimeStamp;
        engine.update(this.commands, this.currentFrameRate);
        this.commands = [];
        this.renderer.renderMap(this.playerId, this.playerName);
        engine.removeSoundObjects();
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }

    getPlayerId() {
        Meteor.call('getPlayerId', (err, res) => {
            if (err) {
                alert(err);
            } else {
                this.playerId = res;
            }
        });
    }

    requestShip() {
        if (this.playerName == "") {
            this.playerName = "GUEST";
            }

        if (!this.localMode) {
            Meteor.call('createNewPlayerShip', this.playerName, (err, res) => {
                if (err) {
                    alert(err);
                } else {
                    gameMode = 'PLAY_MODE';
                    playerShipId = res;
                }
            });
        } else {
            let playerShip = new Ship();
            playerShip.init('Human');
            playerShip.Name = this.playerName;
            playerShip.setStartingHumanPosition();
            gameObjects.push(playerShip);
            playerShipId = playerShip.Id;
        }
    }

    commandHandler(input) {
        this.commands.push(input);
        if (!this.localMode) this.inputStream.emit('input', input);
    }
}