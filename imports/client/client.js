import {Engine} from '../engine/engine.js';
import {Keyboard} from './keyboard.js';
import {Renderer} from './renderer.js';
import {Utilities} from '../utilities/utilities.js';
import {Ship} from '../engine/ship.js';
import {DebugOverlay} from './debugOverlay.js';

export class Client {

    static gameMode = 'START_MODE';

    constructor() {
        
        this.mapRadius = Meteor.settings.public.mapRadius;
        this.commands = [];
        this.inputStream = new Meteor.Streamer('input');
        this.outputStream = new Meteor.Streamer('output');
        this.renderer = new Renderer(this.mapRadius);
        this.keyboard = new Keyboard();
        this.currentFrameRate = 0;
        this.previousTimeStamp = null;
        this.fixedStepMs = 1000 / 60; // 60 Hz simulation
        this.accumulatorMs = 0;
        this.maxDeltaMs = 250; // prevent spiral of death after long pauses
        this.targetFrameRate = 1000 / this.fixedStepMs;
        this.localMode = false;
        this.playerId = 0;
        this.playerName = "";
        this.playerShipId = -1;
        this.engine = new Engine(this.mapRadius);
        this.debugOverlay = null;
        this.lastServerUpdateId = null;
        
        window.gameObjects = []; // 7 files
    }

    init() {
        this.getPlayerId();
        this.setupStreamListeners();
        this.setupDebugOverlay();
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }

    setupStreamListeners() {
        this.outputStream.on('output', (serverUpdate) => {
            serverUpdate = Utilities.unpackGameState(serverUpdate);
            this.lastServerUpdateId = serverUpdate.update && serverUpdate.update.id ? serverUpdate.update.id : null;
            
            if (!this.localMode) {
                gameObjects = this.engine.convertObjects(gameObjects, serverUpdate.gameState);
            }  

            this.replayEvents(serverUpdate.events);

            let playerIsAlive = false;        

            for (let x = 0; x < gameObjects.length; x++) {
                if (gameObjects[x].Id == this.playerShipId) {
                    playerIsAlive = true;
                }
            }

            if (playerIsAlive) {
                Client.gameMode = 'PLAY_MODE';
            } else {
                Client.gameMode = 'START_MODE';
            }
        });
    }

    gameLoop(currentTimeStamp) {
        if (this.previousTimeStamp === null) {
            this.previousTimeStamp = currentTimeStamp;
        }

        let deltaMs = currentTimeStamp - this.previousTimeStamp;
        if (deltaMs < 0) {
            deltaMs = 0;
        }
        if (deltaMs > this.maxDeltaMs) {
            deltaMs = this.maxDeltaMs; // clamp long pauses/hitches
        }

        this.accumulatorMs += deltaMs;

        while (this.accumulatorMs >= this.fixedStepMs) {
            this.engine.update(this.commands, this.targetFrameRate);
            this.accumulatorMs -= this.fixedStepMs;
        }

        this.currentFrameRate = this.targetFrameRate;
        this.previousTimeStamp = currentTimeStamp;
        this.commands = [];
        this.renderer.renderMap(this.playerId, this.playerName, this.playerShipId);
        this.engine.removeSoundObjects();
        if (this.debugOverlay) {
            this.debugOverlay.updateStats({
                fps: this.currentFrameRate,
                updateId: this.lastServerUpdateId
            });
        }
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
                    Client.gameMode = 'PLAY_MODE';
                    this.playerShipId = res;
                }
            });
        } else {
            let playerShip = new Ship(Engine.getNextGameObjectId());
            playerShip.init('Human');
            playerShip.Name = this.playerName;
            playerShip.setStartingHumanPosition(this.mapRadius);
            gameObjects.push(playerShip);
            this.playerShipId = playerShip.Id;
        }
    }

    replayEvents(events) {
        if (!Array.isArray(events)) {
            return;
        }

        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            if (event.type === 'ShipDestroyed') {
                // Use the engine helper to spawn local particles where the ship died
                this.engine.createExplosion({
                    LocationX: event.locationX,
                    LocationY: event.locationY
                });
            }
        }
    }

    commandHandler(input) {
        this.commands.push(input);
        input.targetId = this.playerShipId;
        if (!this.localMode) this.inputStream.emit('input', input);
    }

    setupDebugOverlay() {
        this.debugOverlay = new DebugOverlay({
            environment: Meteor.settings.public.environment,
            onApplyThrottle: this.applyNetworkThrottle.bind(this)
        });

        if (!this.debugOverlay.isAvailable()) {
            this.debugOverlay = null;
            return;
        }

        this.debugOverlay.setRefreshCallback(() => this.fetchNetworkThrottleState());
        this.fetchNetworkThrottleState();
    }

    fetchNetworkThrottleState() {
        if (!this.debugOverlay) {
            return;
        }

        Meteor.call('getNetworkThrottle', (err, res) => {
            if (err) {
                this.debugOverlay.setStatus(err.message || 'Failed to load throttle state', 'error');
            } else {
                this.debugOverlay.setThrottleState(res);
            }
        });
    }

    applyNetworkThrottle(payload) {
        if (!this.debugOverlay) {
            return;
        }

        const request = {};
        if (typeof payload.enabled === 'boolean') {
            request.enabled = payload.enabled;
        }

        if (!Number.isFinite(payload.intervalMs) || payload.intervalMs <= 0) {
            this.debugOverlay.setStatus('Enter a valid interval greater than 0 milliseconds.', 'error');
            return;
        }

        request.intervalMs = payload.intervalMs;

        Meteor.call('setNetworkThrottle', request, (err, res) => {
            if (err) {
                this.debugOverlay.setStatus(err.message || 'Throttle update failed', 'error');
            } else {
                this.debugOverlay.setThrottleState(res);
            }
        });
    }
}