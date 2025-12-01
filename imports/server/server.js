import {Ai} from './ai.js';
import {Engine} from '../engine/engine.js';
import {Meteor} from 'meteor/meteor';
import {Ship} from '../engine/ship.js';
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
        this.pendingEvents = [];
        this.eventBuffer = [];
        this.engine.setEventRecorder(this.recordEvent.bind(this));
        this.lastBroadcastAt = 0;

        const configuredInterval = Number(Meteor.settings.private && Meteor.settings.private.messageOutputRate);
        const hasCustomInterval = Number.isFinite(configuredInterval) && configuredInterval > 0;
        const sanitizedInterval = hasCustomInterval ? Math.max(configuredInterval, this.tickIntervalMs) : this.tickIntervalMs;

        this.defaultNetworkIntervalMs = sanitizedInterval;
        this.networkThrottle = {
            enabled: hasCustomInterval,
            intervalMs: sanitizedInterval
        };

        global.gameObjects = [];
        Server.instance = this;
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

    recordEvent(event) {
        this.pendingEvents.push(event);
    }

    flushPendingEventsIntoBuffer() {
        if (this.pendingEvents.length) {
            Array.prototype.push.apply(this.eventBuffer, this.pendingEvents);
        }
        this.pendingEvents = [];
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
        this.flushPendingEventsIntoBuffer();

        const now = Date.now();
        if (this.shouldEmitSnapshot(now)) {
            const eventsToSend = this.eventBuffer;
            this.eventBuffer = [];
            this.outputStream.emit('output', Utilities.packGameState({updateId: this.updateId, gameState: gameObjects, events: eventsToSend}));
            this.lastBroadcastAt = now;
        }

        this.engine.removeSoundObjects();
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
        let playerShip = new Ship(Engine.getNextGameObjectId());
        playerShip.init({shipTypeId, pilotType: 'Human'});
        playerShip.Name = name;
        playerShip.setStartingHumanPosition(mapRadius);
        gameObjects.push(playerShip);

        for (let i=0, j=gameObjects.length; i<j; i++) {
            if (gameObjects[i].Type == 'Player') {
                if (gameObjects[i].Id == playerId) {
                    gameObjects[i].ShipId = playerShip.Id;
                    gameObjects[i].Name = name;
                }
            }
        }

        return playerShip.Id;
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