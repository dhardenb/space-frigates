import {Engine} from '../engine/engine.js';
import {Keyboard} from './keyboard.js';
import {Renderer} from './renderer.js';
import {Utilities} from '../utilities/utilities.js';
import {Ship} from '../engine/ship.js';

export class Client {

    constructor() {
        window.engine = new Engine(); // 12 files
        window.keyboard = new Keyboard(); // client
        window.renderer = new Renderer(); // client
        window.gameObjects = []; // 7 files
        window.deadObjects = []; // client, server, engine
        window.commands = []; // 5 files
        window.gameObjectId = 0; // 8 files
        window.playerShipId = -1; // client, keyboard, renderer
        window.mapRadius = Meteor.settings.public.mapRadius; // 6 files
        window.playerId = 0; // client, server, renderer
        window.gameMode = 'START_MODE'; // client, keyboard, renderer
        window.playerName  = ""; // client, keyboard, renderer
        this.currentFrameRate = 0; // client
        this.previousTimeStamp = 0; // client

        this.localMode = false;
    }

    init() {
        client.setupEventHandlers();
        client.setupStreamListeners();
        window.requestAnimationFrame(this.gameLoop.bind(this));
        client.getPlayerId();
    }

    setupEventHandlers() {
        document.documentElement.addEventListener("keydown", keyboard.handleKeyPressEvents, false);
    }

    setupStreamListeners() {
        outputStream.on('output', function(serverUpdate) {
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
        engine.update(this.currentFrameRate);
        renderer.renderMap();
        engine.removeSoundObjects();
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }

    getPlayerId() {
        Meteor.call('getPlayerId', (err, res) => {
            if (err) {
                alert(err);
            } else {
                playerId = res;
            }
        });
    }

    requestShip() {
        if (playerName == "") {
            playerName = "GUEST";
            }

        if (!this.localMode) {
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

    commandHandler(input) {
        commands.push(input);
        inputStream.emit('input', input);
    }
}