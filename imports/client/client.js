import {Engine} from '../engine/engine.js';
import {Keyboard} from './keyboard.js';
import {Renderer} from './renderer.js';
import {Utilities} from '../utilities/utilities.js';
import {Ship} from '../engine/ship.js';

export class Client {

    constructor() {
        
        this.mapRadius = Meteor.settings.public.mapRadius;
        this.commands = [];
        this.inputStream = new Meteor.Streamer('input');
        this.outputStream = new Meteor.Streamer('output');
        this.renderer = new Renderer(this.mapRadius);
        this.keyboard = new Keyboard();
        this.currentFrameRate = 0;
        this.previousTimeStamp = 0;
        this.localMode = false;
        this.playerId = 0;
        this.playerName = "";
        this.playerShipId = -1;

        window.engine = new Engine(this.mapRadius); // 12 files
        window.gameObjects = []; // 7 files
        window.gameObjectId = 0; // 8 files
        window.gameMode = 'START_MODE'; // client, keyboard, renderer
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
                if (gameObjects[x].Id == this.playerShipId) {
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
        this.renderer.renderMap(this.playerId, this.playerName, this.playerShipId);
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
            Meteor.call('createNewPlayerShip', this.playerName, this.mapRadius, (err, res) => {
                if (err) {
                    alert(err);
                } else {
                    gameMode = 'PLAY_MODE';
                    this.playerShipId = res;
                }
            });
        } else {
            let playerShip = new Ship();
            playerShip.init('Human');
            playerShip.Name = this.playerName;
            playerShip.setStartingHumanPosition(this.mapRadius);
            gameObjects.push(playerShip);
            this.playerShipId = playerShip.Id;
        }
    }

    commandHandler(input) {
        this.commands.push(input);
        input.targetId = this.playerShipId;
        if (!this.localMode) this.inputStream.emit('input', input);
    }
}