import {Ai} from './ai.js';
import {Engine} from '../engine/engine.js';
import {Meteor} from 'meteor/meteor';
import {ViperShip} from '../engine/viperShip.js';
import {TurtleShip} from '../engine/turtleShip.js';
import {Utilities} from '../utilities/utilities.js';

export class Server {

    static getInstance() {
        return Server.instance;
    }

    constructor() {
        
        this.mapRadius = Meteor.settings.public.mapRadius;
        this.commands = [];
        this.frameRate = Number(Meteor.settings.private.frameRate) || 60;
        this.tickIntervalMs = 1000 / this.frameRate;
        this.spawnPreferences = {
            human: 'Viper',
            ai: 'Turtle'
        };
        this.ai = new Ai(this.mapRadius, {selectShipType: this.resolveAiShipType.bind(this)});
        this.inputStream = new Meteor.Streamer('input');
        this.outputStream = new Meteor.Streamer('output');
        this.updateId = 0;
        this.engine = new Engine(this.mapRadius);
        this.soundBuffer = [];
        this.explosionBuffer = [];
        this.lastBroadcastAt = 0;

        const configuredInterval = Number(Meteor.settings.private && Meteor.settings.private.messageOutputRate);
        const hasCustomInterval = Number.isFinite(configuredInterval) && configuredInterval > 0;
        const sanitizedInterval = hasCustomInterval ? Math.max(configuredInterval, this.tickIntervalMs) : this.tickIntervalMs;

        this.defaultNetworkIntervalMs = sanitizedInterval;
        this.networkThrottle = {
            enabled: hasCustomInterval,
            intervalMs: sanitizedInterval
        };

        // Inactivity timeout in milliseconds (default 60 seconds)
        const configuredTimeout = Number(Meteor.settings.private && Meteor.settings.private.playerInactivityTimeoutMs);
        this.playerInactivityTimeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout > 0
            ? configuredTimeout
            : 60000;

        // How often to check for inactive players (default every 10 seconds)
        this.inactivityCheckIntervalMs = 10000;

        global.gameObjects = [];
        Server.instance = this;
    }

    init() {
        this.setupStreamPermissions();
        this.setupStreamListeners();
        this.startPhysicsLoop();
        this.startInactivityCleanup();
    }

    setupStreamPermissions() {
        this.inputStream.allowRead('all');
        this.inputStream.allowWrite('all');
        this.outputStream.allowRead('all');
        this.outputStream.allowWrite('all');
    }

    setupStreamListeners() {
        this.inputStream.on('input', (input) => {
            this.commands.push(input);
            this.updatePlayerActivity(input);
        });
    }

    /**
     * Update the last activity timestamp for the player who sent the command.
     * Commands have a targetId which is the ship ID; we find the player by matching shipId.
     * @param {Object} input - The command input containing targetId (ship ID)
     */
    updatePlayerActivity(input) {
        if (!input || typeof input.targetId === 'undefined') {
            return;
        }
        const shipId = input.targetId;
        for (let i = 0; i < gameObjects.length; i++) {
            const obj = gameObjects[i];
            if (obj.type === 'Player' && obj.shipId === shipId) {
                obj.updateActivity();
                break;
            }
        }
    }

    /**
     * Remove players who have been inactive for longer than the configured timeout.
     * Also removes their associated ships.
     */
    removeInactivePlayers() {
        const playersToRemove = [];

        // Find inactive players
        for (let i = 0; i < gameObjects.length; i++) {
            const obj = gameObjects[i];
            if (obj.type === 'Player' && obj.name !== '' && obj.isInactive(this.playerInactivityTimeoutMs)) {
                playersToRemove.push({
                    playerId: obj.id,
                    shipId: obj.shipId
                });
            }
        }

        // Remove inactive players and their ships
        for (const player of playersToRemove) {
            if (player.shipId) {
                gameObjects = Utilities.removeByAttr(gameObjects, 'id', player.shipId);
            }
            gameObjects = Utilities.removeByAttr(gameObjects, 'id', player.playerId);
        }
    }

    startInactivityCleanup() {
        setInterval(() => this.removeInactivePlayers(), this.inactivityCheckIntervalMs);
    }

    bufferSoundObjects() {
        const sounds = [];

        for (let i = 0; i < gameObjects.length; i++) {
            if (gameObjects[i].type === 'Sound') {
                sounds.push(gameObjects[i]);
            }
        }

        if (sounds.length) {
            Array.prototype.push.apply(this.soundBuffer, sounds);
            this.engine.removeSoundObjects();
        }
    }

    bufferExplosionObjects() {
        const explosions = [];

        for (let i = 0; i < gameObjects.length; i++) {
            if (gameObjects[i].type === 'Explosion') {
                explosions.push(gameObjects[i]);
            }
        }

        if (explosions.length) {
            Array.prototype.push.apply(this.explosionBuffer, explosions);
            this.engine.removeExplosionObjects();
        }
    }

    shouldEmitSnapshot(now) {
        if (!this.networkThrottle.enabled) {
            return true;
        }
        if (!this.lastBroadcastAt) {
            return true;
        }
        return (now - this.lastBroadcastAt) >= this.networkThrottle.intervalMs;
    }

    getEffectiveNetworkInterval() {
        return this.networkThrottle.enabled ? this.networkThrottle.intervalMs : this.tickIntervalMs;
    }

    getNetworkThrottleState() {
        return {
            enabled: this.networkThrottle.enabled,
            intervalMs: this.networkThrottle.intervalMs,
            effectiveIntervalMs: this.getEffectiveNetworkInterval(),
            defaultIntervalMs: this.defaultNetworkIntervalMs,
            tickIntervalMs: this.tickIntervalMs
        };
    }

    getSpawnPreferences() {
        return Object.assign({}, this.spawnPreferences);
    }

    setSpawnPreferences(patch = {}) {
        const allowed = new Set(['Viper', 'Turtle', 'Random']);
        const next = Object.assign({}, this.spawnPreferences);

        if (typeof patch.human === 'string' && allowed.has(patch.human)) {
            next.human = patch.human;
        }
        if (typeof patch.ai === 'string' && allowed.has(patch.ai)) {
            next.ai = patch.ai;
        }

        this.spawnPreferences = next;
        return this.getSpawnPreferences();
    }

    resolveHumanShipType() {
        return this.resolveShipPreference(this.spawnPreferences.human, 'Viper');
    }

    resolveAiShipType() {
        return this.resolveShipPreference(this.spawnPreferences.ai, 'Turtle');
    }

    resolveShipPreference(preference, fallback) {
        const pref = typeof preference === 'string' ? preference : fallback;
        if (pref === 'Random') {
            return Math.random() < 0.5 ? 'Viper' : 'Turtle';
        }
        if (pref === 'Viper' || pref === 'Turtle') {
            return pref;
        }
        return fallback;
    }

    setNetworkThrottleState(patch = {}) {
        const nextState = {
            enabled: this.networkThrottle.enabled,
            intervalMs: this.networkThrottle.intervalMs
        };

        if (typeof patch.enabled === 'boolean') {
            nextState.enabled = patch.enabled;
        }

        if (typeof patch.intervalMs === 'number' && Number.isFinite(patch.intervalMs) && patch.intervalMs > 0) {
            nextState.intervalMs = Math.max(patch.intervalMs, this.tickIntervalMs);
        }

        this.networkThrottle = nextState;
        return this.getNetworkThrottleState();
    }

    updateLoop() {
        this.ai.createNewShip();
        this.ai.issueCommands(this.commands);
        this.engine.update(this.commands, this.frameRate);
        this.commands = [];
        this.bufferSoundObjects();
        this.bufferExplosionObjects();

        const now = Date.now();
        if (this.shouldEmitSnapshot(now)) {
            const soundsToSend = this.soundBuffer;
            const explosionsToSend = this.explosionBuffer;
            this.soundBuffer = [];
            this.explosionBuffer = [];
            this.outputStream.emit('output', Utilities.packGameState({updateId: this.updateId, gameState: gameObjects.concat(soundsToSend, explosionsToSend)}));
            this.lastBroadcastAt = now;
        }
        this.updateId++;
    }

    startPhysicsLoop() {
        setInterval(this.updateLoop.bind(this), this.tickIntervalMs);
    }
}

Server.instance = null;

Meteor.methods({
    createNewPlayerShip: function(name, mapRadius) {
        
        const server = Server.getInstance();
        const shipTypeId = server ? server.resolveHumanShipType() : 'Viper';
        const playerId = Utilities.hashStringToUint32(this.connection.id);
        let playerShip = shipTypeId === 'Viper' 
            ? new ViperShip(Engine.getNextGameObjectId(), {pilotType: 'Human'})
            : new TurtleShip(Engine.getNextGameObjectId(), {pilotType: 'Human'});
        playerShip.Name = name;
        playerShip.setStartingHumanPosition(mapRadius);
        gameObjects.push(playerShip);

        for (let i=0, j=gameObjects.length; i<j; i++) {
            if (gameObjects[i].type == 'Player') {
                if (gameObjects[i].id == playerId) {
                    gameObjects[i].shipId = playerShip.id;
                    gameObjects[i].name = name;
                }
            }
        }

        return playerShip.id;
    },

    getPlayerId: function() {
        return Utilities.hashStringToUint32(this.connection.id);
    },

    getNetworkThrottle: function() {
        const server = Server.getInstance();
        if (!server) {
            throw new Meteor.Error('server-unavailable', 'Server not initialized');
        }

        return server.getNetworkThrottleState();
    },

    setNetworkThrottle: function(options) {
        const server = Server.getInstance();
        if (!server) {
            throw new Meteor.Error('server-unavailable', 'Server not initialized');
        }

        const environment = Meteor.settings.public && Meteor.settings.public.environment ? Meteor.settings.public.environment : 'prod';
        if (environment === 'prod') {
            throw new Meteor.Error('not-authorized', 'Network throttling controls are disabled in production.');
        }

        const sanitizedOptions = {};
        if (options && typeof options.enabled !== 'undefined') {
            sanitizedOptions.enabled = Boolean(options.enabled);
        }

        if (options && typeof options.intervalMs !== 'undefined') {
            const interval = Number(options.intervalMs);
            if (!Number.isFinite(interval) || interval <= 0) {
                throw new Meteor.Error('invalid-input', 'intervalMs must be a number greater than 0.');
            }
            sanitizedOptions.intervalMs = interval;
        }

        return server.setNetworkThrottleState(sanitizedOptions);
    }
    
});