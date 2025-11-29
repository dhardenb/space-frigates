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
        this.lastSnapshotSizeBytes = 0;
        this.snapshotSizeAvgBytes = 0;
        this.snapshotSizeSamples = 0;
        this.playerWasAlive = false;
        this.deathTransition = {
            state: 'idle',
            elapsedMs: 0,
            holdDurationMs: 3000,
            fadeDurationMs: 1500
        };
        
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
            let snapshotBytes = 0;
            try {
                snapshotBytes = Utilities.getBinaryPayloadSize(serverUpdate);
                serverUpdate = Utilities.unpackGameState(serverUpdate);
            } catch (err) {
                console.error('Failed to unpack server snapshot', err);
                return;
            }
            this.lastServerUpdateId = serverUpdate.update && serverUpdate.update.id ? serverUpdate.update.id : null;
            this.recordSnapshotSize(snapshotBytes);
            
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

            const wasAlive = this.playerWasAlive;
            this.playerWasAlive = playerIsAlive;

            if (playerIsAlive) {
                this.handlePlayerAliveState(wasAlive);
            } else {
                this.handlePlayerDeathState(wasAlive);
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

        this.updateDeathTransition(deltaMs);

        this.currentFrameRate = this.targetFrameRate;
        this.previousTimeStamp = currentTimeStamp;
        this.commands = [];
        this.renderer.renderMap(this.playerId, this.playerName, this.playerShipId);
        this.engine.removeSoundObjects();
        if (this.debugOverlay) {
            this.debugOverlay.updateStats({
                fps: this.currentFrameRate,
                updateId: this.lastServerUpdateId,
                snapshotBytes: this.lastSnapshotSizeBytes,
                snapshotAvgBytes: this.snapshotSizeAvgBytes
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
            playerShip.init({shipTypeId: 'Viper', pilotType: 'Human'});
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
            onApplyThrottle: this.applyNetworkThrottle.bind(this),
            onZoomChange: (value) => this.renderer.setZoomFactor(value),
            onZoomDelta: (delta) => this.adjustZoom(delta),
            initialZoom: this.renderer.getZoomFactor(),
            zoomBounds: this.renderer.getZoomBounds()
        });

        if (!this.debugOverlay.isAvailable()) {
            this.debugOverlay = null;
            return;
        }

        this.debugOverlay.setRefreshCallback(() => this.fetchNetworkThrottleState());
        this.fetchNetworkThrottleState();
    }

    adjustZoom(delta) {
        if (!Number.isFinite(delta) || delta === 0) {
            return;
        }
        const current = this.renderer.getZoomFactor();
        const next = current + delta;
        this.renderer.setZoomFactor(next);
        if (this.debugOverlay && this.debugOverlay.dom && this.debugOverlay.dom.zoomSlider) {
            const clamped = this.renderer.getZoomFactor();
            this.debugOverlay.dom.zoomSlider.value = clamped;
            this.debugOverlay.setZoomDisplay(clamped);
        }
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

    recordSnapshotSize(snapshotBytes) {
        if (!Number.isFinite(snapshotBytes) || snapshotBytes <= 0) {
            return;
        }
        this.lastSnapshotSizeBytes = snapshotBytes;
        this.snapshotSizeSamples += 1;
        const alpha = Math.min(1, 2 / (this.snapshotSizeSamples + 1));
        if (this.snapshotSizeSamples === 1) {
            this.snapshotSizeAvgBytes = snapshotBytes;
        } else {
            this.snapshotSizeAvgBytes = (1 - alpha) * this.snapshotSizeAvgBytes + alpha * snapshotBytes;
        }
    }

    handlePlayerAliveState(wasAlive) {
        if (!wasAlive || this.deathTransition.state !== 'idle') {
            this.resetDeathTransition();
        }
        Client.gameMode = 'PLAY_MODE';
    }

    handlePlayerDeathState(wasAlive) {
        if (wasAlive) {
            this.startDeathTransition();
        } else if (this.deathTransition.state === 'idle') {
            Client.gameMode = 'START_MODE';
            if (this.renderer && typeof this.renderer.setLandingOverlayAlpha === 'function') {
                this.renderer.setLandingOverlayAlpha(0);
            }
        }
    }

    startDeathTransition() {
        if (this.deathTransition.state === 'hold' || this.deathTransition.state === 'fade') {
            return;
        }
        this.deathTransition.state = 'hold';
        this.deathTransition.elapsedMs = 0;
        if (this.renderer && typeof this.renderer.setLandingOverlayAlpha === 'function') {
            this.renderer.setLandingOverlayAlpha(0);
        }
    }

    resetDeathTransition() {
        this.deathTransition.state = 'idle';
        this.deathTransition.elapsedMs = 0;
        if (this.renderer && typeof this.renderer.setLandingOverlayAlpha === 'function') {
            this.renderer.setLandingOverlayAlpha(0);
        }
    }

    updateDeathTransition(deltaMs) {
        if (!Number.isFinite(deltaMs) || deltaMs <= 0) {
            return;
        }
        const transition = this.deathTransition;
        if (!transition || transition.state === 'idle') {
            return;
        }

        if (transition.state === 'hold') {
            transition.elapsedMs += deltaMs;
            if (transition.elapsedMs >= transition.holdDurationMs) {
                transition.state = 'fade';
                transition.elapsedMs = 0;
            }
            Client.gameMode = 'PLAY_MODE';
            if (this.renderer && typeof this.renderer.setLandingOverlayAlpha === 'function') {
                this.renderer.setLandingOverlayAlpha(0);
            }
            return;
        }

        if (transition.state === 'fade') {
            transition.elapsedMs += deltaMs;
            const progress = Math.min(1, transition.elapsedMs / transition.fadeDurationMs);
            if (this.renderer && typeof this.renderer.setLandingOverlayAlpha === 'function') {
                this.renderer.setLandingOverlayAlpha(progress);
            }
            if (progress >= 1) {
                transition.state = 'idle';
                transition.elapsedMs = 0;
                Client.gameMode = 'START_MODE';
            } else {
                Client.gameMode = 'PLAY_MODE';
            }
        }
    }

}