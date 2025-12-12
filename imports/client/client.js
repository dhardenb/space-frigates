import {Engine} from '../engine/engine.js';
import {Keyboard} from './keyboard.js';
import {Renderer} from './renderer/renderer.js';
import {Utilities} from '../utilities/utilities.js';
import {ViperShip} from '../engine/viperShip.js';
import {DebugOverlay} from './renderer/debugOverlay.js';

export class Client {

    static gameMode = 'START_MODE';

    constructor() {
        
        this.mapRadius = Meteor.settings.public.mapRadius;
        this.commands = [];
        this.inputStream = new Meteor.Streamer('input');
        this.outputStream = new Meteor.Streamer('output');
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
        this.renderer = new Renderer(this.mapRadius, {
            onExplosionEffect: this.handleExplosionEffect.bind(this),
            onTargetStatusChange: this.handleTargetSelectorChange.bind(this)
        });
        this.debugOverlay = null;
        this.autopilotIndicator = document.getElementById('autopilot-indicator');
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
        this.pendingMissileLock = false;
        this.lastMissileArmed = false;
        this.pendingMissileToggleAt = null; // Timestamp of last missile toggle command
        this.missileToggleGracePeriodMs = 500; // Grace period to protect local state from stale server snapshots

        // Settings menu state
        this.settingsOpen = false;
        this.settingsButtonBounds = null;
        this.settingsButtonHovered = false;
        this.fullscreenEnabled = false;
        this.fullscreenToggleHovered = false;
        this.closeButtonHovered = false;
        this.volume = 50; // 0-100, where 50 = 1x volume, 100 = 2x volume, 0 = muted
        this.volumeSliderHovered = false;
        this.volumeSliderDragging = false;
        this.zoomSliderHovered = false;
        this.zoomSliderDragging = false;

        // Custom cursor element
        this.customCursor = null;
        this.canvasInteractiveHovered = false; // Track canvas-based interactive elements

        window.gameObjects = []; // 7 files
    }

    init() {
        this.getPlayerId();
        this.setupStreamListeners();
        this.setupDebugOverlay();
        this.setupSettingsInteraction();
        this.setupCustomCursor();
        // Initialize volume to default (50% = 1x multiplier)
        this.setVolume(this.volume);
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * Sets up the custom cursor element and global mouse tracking.
     */
    setupCustomCursor() {
        this.customCursor = document.getElementById('custom-cursor');
        if (!this.customCursor) {
            return;
        }

        // Track mouse globally so cursor follows everywhere
        document.addEventListener('mousemove', (evt) => {
            const isInteractive = this._isOverInteractiveElement(evt.target) || this.canvasInteractiveHovered;
            this._updateCustomCursor(evt.clientX, evt.clientY, isInteractive);
        });

        // Hide cursor when mouse leaves window
        document.addEventListener('mouseleave', () => {
            if (this.customCursor) {
                this.customCursor.style.display = 'none';
            }
        });

        // Show cursor when mouse enters window
        document.addEventListener('mouseenter', () => {
            if (this.customCursor) {
                this.customCursor.style.display = 'block';
            }
        });
    }

    /**
     * Checks if an element is an interactive DOM element (button, input, etc.)
     * @param {Element} target - The element to check
     * @returns {boolean} True if interactive
     */
    _isOverInteractiveElement(target) {
        if (!target) return false;
        const interactiveTags = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'];
        if (interactiveTags.includes(target.tagName)) {
            return true;
        }
        // Check if it's a clickable element with cursor styling
        if (target.closest('button, input, select, textarea, a, [role="button"]')) {
            return true;
        }
        return false;
    }

    /**
     * Updates the custom cursor position and spinning state.
     * @param {number} x - Mouse X position
     * @param {number} y - Mouse Y position
     * @param {boolean} isInteractive - Whether hovering over an interactive element
     */
    _updateCustomCursor(x, y, isInteractive) {
        if (!this.customCursor) return;
        
        this.customCursor.style.left = x + 'px';
        this.customCursor.style.top = y + 'px';
        this.customCursor.style.display = 'block';
        
        if (isInteractive) {
            this.customCursor.classList.add('is-spinning');
        } else {
            this.customCursor.classList.remove('is-spinning');
        }
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
                // Capture local missile state before server sync if we have a pending toggle
                let preserveMissileState = null;
                if (this.pendingMissileToggleAt) {
                    const now = Date.now();
                    const elapsed = now - this.pendingMissileToggleAt;
                    if (elapsed < this.missileToggleGracePeriodMs) {
                        const playerShip = this.getPlayerShip();
                        if (playerShip) {
                            preserveMissileState = {
                                missilesArmed: playerShip.missilesArmed,
                                missileFireRequested: playerShip.missileFireRequested
                            };
                        }
                    } else {
                        // Grace period expired, clear the pending toggle
                        this.pendingMissileToggleAt = null;
                    }
                }

                gameObjects = this.engine.convertObjects(gameObjects, serverUpdate.gameState);

                // Restore local missile state if we were protecting it
                if (preserveMissileState) {
                    const playerShip = this.getPlayerShip();
                    if (playerShip) {
                        playerShip.missilesArmed = preserveMissileState.missilesArmed;
                        playerShip.missileFireRequested = preserveMissileState.missileFireRequested;
                    }
                }
            }  

            let playerIsAlive = false;

            for (let x = 0; x < gameObjects.length; x++) {
                if (gameObjects[x].id == this.playerShipId) {
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
        const playerShip = this.getPlayerShip();
        this.syncMissileArmingState(playerShip);
        this.renderer.renderMap(this.playerId, this.playerName, this.playerShipId);
        this.engine.removeSoundObjects();
        this.engine.removeExplosionObjects();
        if (this.debugOverlay) {
            this.debugOverlay.updateStats({
                fps: this.currentFrameRate,
                updateId: this.lastServerUpdateId,
                snapshotBytes: this.lastSnapshotSizeBytes,
                snapshotAvgBytes: this.snapshotSizeAvgBytes
            });
            this.debugOverlay.updateShipAttributes(playerShip);
        }
        this.updateAutoPilotIndicator(playerShip);
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
            let playerShip = new ViperShip(Engine.getNextGameObjectId(), {pilotType: 'Human'});
            playerShip.Name = this.playerName;
            playerShip.setStartingHumanPosition(this.mapRadius);
            gameObjects.push(playerShip);
            this.playerShipId = playerShip.id;
        }
    }

    handleExplosionEffect(explosion) {
        if (!explosion) {
            return;
        }
        if (explosion.explosionType === 'Laser') {
            this.engine.spawnLaserExplosionParticles(explosion);
        } else {
            this.engine.spawnExplosionParticles(explosion);
        }
    }

    commandHandler(input) {
        this.commands.push(input);
        input.targetId = this.playerShipId;
        // Track missile toggle commands for grace period protection against stale server snapshots
        if (input.command === 'TOGGLE_MISSILES') {
            this.pendingMissileToggleAt = Date.now();
        }
        if (!this.localMode) this.inputStream.emit('input', input);
    }

    setupDebugOverlay() {
        this.debugOverlay = new DebugOverlay({
            environment: Meteor.settings.public.environment,
            onApplyThrottle: this.applyNetworkThrottle.bind(this),
            onZoomChange: (value) => this.renderer.setZoomFactor(value),
            onZoomDelta: (delta) => this.adjustZoom(delta),
            initialZoom: this.renderer.getZoomFactor(),
            zoomBounds: this.renderer.getZoomBounds(),
            onApplyShipAttributes: this.applyShipAttributeOverrides.bind(this),
            onToggleBoundingBoxes: (enabled) => this.renderer.setShowBoundingBoxes(Boolean(enabled)),
            initialBoundingBoxesVisible: this.renderer.getShowBoundingBoxes()
        });

        if (!this.debugOverlay.isAvailable()) {
            this.debugOverlay = null;
            return;
        }

        this.debugOverlay.setRefreshCallback(() => this.fetchNetworkThrottleState());
        this.fetchNetworkThrottleState();
    }

    syncMissileArmingState(ship) {
        const missilesRemaining = ship ? ship.missilesRemaining : 0;
        const missilesArmed = !!(ship && ship.missilesArmed && missilesRemaining > 0);

        if (missilesRemaining <= 0) {
            this.pendingMissileLock = false;
        }

        if (missilesArmed && !this.lastMissileArmed) {
            this.pendingMissileLock = true;
            if (this.renderer) {
                this.renderer.resetTargetSelectorState();
            }
        } else if (!missilesArmed) {
            this.pendingMissileLock = false;
        }

        this.lastMissileArmed = missilesArmed;
    }

    handleTargetSelectorChange(isTargetHot) {
        if (!isTargetHot) {
            return;
        }

        const ship = this.getPlayerShip();
        if (!ship || !ship.missilesArmed || ship.missilesRemaining <= 0) {
            this.pendingMissileLock = false;
            return;
        }

        if (!this.pendingMissileLock) {
            return;
        }

        this.pendingMissileLock = false;
        this.commandHandler({command: 'FIRE_MISSILE'});
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

    getPlayerShip() {
        if (!this.playerShipId) {
            return null;
        }
        for (let i = 0; i < gameObjects.length; i++) {
            const obj = gameObjects[i];
            if (obj && obj.type === 'Ship' && obj.id === this.playerShipId) {
                return obj;
            }
        }
        return null;
    }

    updateAutoPilotIndicator(ship) {
        if (!this.autopilotIndicator) {
            this.autopilotIndicator = document.getElementById('autopilot-indicator');
        }
        if (!this.autopilotIndicator) {
            return;
        }
        const engaged = !!(ship && ship.autoPilotEngaged);
        if (engaged) {
            this.autopilotIndicator.classList.add('is-active');
            this.autopilotIndicator.classList.remove('hidden');
        } else {
            this.autopilotIndicator.classList.remove('is-active');
            this.autopilotIndicator.classList.add('hidden');
        }
    }

    applyShipAttributeOverrides(payload) {
        const ship = this.getPlayerShip();
        if (!ship || !this.debugOverlay) {
            if (this.debugOverlay) {
                this.debugOverlay.setShipStatus('Player ship not available.', 'error');
            }
            return;
        }

        const mapping = {
            mass: 'Mass',
            maxCapacitor: 'MaxCapacitor',
            reactorOutputPerSecond: 'ReactorOutputPerSecond',
            thrusterEnergyPerSecond: 'ThrusterEnergyPerSecond',
            thrusterForceProduced: 'ThrusterForceProduced',
            rotationEnergyPerSecond: 'RotationEnergyPerSecond',
            laserEnergyCost: 'LaserEnergyCost',
            laserFuelCapacity: 'LaserFuelCapacity',
            laserFuelConsumptionRate: 'LaserFuelConsumptionRate',
            maxShieldStrength: 'MaxShieldStrength',
            shieldRechargeRate: 'ShieldRechargeRate',
            shieldDecayRate: 'ShieldDecayRate'
        };

        Object.entries(mapping).forEach(([payloadKey, shipProp]) => {
            const value = Number(payload[payloadKey]);
            if (Number.isFinite(value)) {
                ship[shipProp] = value;
            }
        });

        if (ship.capacitor > ship.maxCapacitor) {
            ship.capacitor = ship.maxCapacitor;
        }
        if (ship.shieldStatus > ship.maxShieldStrength) {
            ship.shieldStatus = ship.maxShieldStrength;
        }

        this.debugOverlay.setShipStatus('Ship attributes updated.', 'success');
        this.debugOverlay.updateShipAttributes(ship);
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

    // Settings menu methods

    toggleSettings() {
        this.settingsOpen = !this.settingsOpen;
    }

    openSettings() {
        this.settingsOpen = true;
    }

    closeSettings() {
        this.settingsOpen = false;
    }

    isSettingsOpen() {
        return this.settingsOpen;
    }

    setSettingsButtonBounds(bounds) {
        this.settingsButtonBounds = bounds;
    }

    getSettingsButtonBounds() {
        return this.settingsButtonBounds;
    }

    setSettingsButtonHovered(hovered) {
        this.settingsButtonHovered = hovered;
    }

    isSettingsButtonHovered() {
        return this.settingsButtonHovered;
    }

    getSettings() {
        return {
            volume: this.volume,
            zoom: this.getZoomPercent(),
            fullscreen: this.fullscreenEnabled,
        };
    }

    /**
     * Converts zoom factor (0.5-2.5) to percentage (0-100).
     * Uses piecewise linear mapping: 0%=0.5, 50%=1.0, 100%=2.5
     * @returns {number} Zoom as percentage (0-100)
     */
    getZoomPercent() {
        if (!this.renderer) return 50;
        const zoom = this.renderer.getZoomFactor();
        const bounds = this.renderer.getZoomBounds();
        const min = bounds.min;
        const max = bounds.max;
        const defaultZoom = 1.0;
        
        if (zoom <= defaultZoom) {
            // Map min-default to 0-50%
            return ((zoom - min) / (defaultZoom - min)) * 50;
        } else {
            // Map default-max to 50-100%
            return 50 + ((zoom - defaultZoom) / (max - defaultZoom)) * 50;
        }
    }

    /**
     * Sets zoom from percentage (0-100).
     * Uses piecewise linear mapping: 0%=min, 50%=1.0, 100%=max
     * @param {number} percent - Zoom percentage (0-100)
     */
    setZoomFromPercent(percent) {
        if (!this.renderer) return;
        const bounds = this.renderer.getZoomBounds();
        const min = bounds.min;
        const max = bounds.max;
        const defaultZoom = 1.0;
        
        let zoomFactor;
        if (percent <= 50) {
            // Map 0-50% to min-default
            zoomFactor = min + (percent / 50) * (defaultZoom - min);
        } else {
            // Map 50-100% to default-max
            zoomFactor = defaultZoom + ((percent - 50) / 50) * (max - defaultZoom);
        }
        
        this.renderer.setZoomFactor(zoomFactor);
        
        // Sync debug overlay if present
        if (this.debugOverlay && this.debugOverlay.dom && this.debugOverlay.dom.zoomSlider) {
            const clamped = this.renderer.getZoomFactor();
            this.debugOverlay.dom.zoomSlider.value = clamped;
            this.debugOverlay.setZoomDisplay(clamped);
        }
    }

    getVolume() {
        return this.volume;
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(100, value));
        // Update the renderer's game volume
        // volume 50 = 1x multiplier, volume 100 = 2x, volume 0 = 0x
        if (this.renderer) {
            const multiplier = this.volume / 50; // 0-2 range
            this.renderer.gameVolume = Meteor.settings.public.gameVolume * multiplier;
        }
    }

    /**
     * Gets the volume multiplier for audio (0-2 range).
     * @returns {number} Volume multiplier
     */
    getVolumeMultiplier() {
        return this.volume / 50;
    }

    isVolumeSliderHovered() {
        return this.volumeSliderHovered;
    }

    setVolumeSliderHovered(hovered) {
        this.volumeSliderHovered = hovered;
    }

    isVolumeSliderDragging() {
        return this.volumeSliderDragging;
    }

    setVolumeSliderDragging(dragging) {
        this.volumeSliderDragging = dragging;
    }

    isZoomSliderHovered() {
        return this.zoomSliderHovered;
    }

    setZoomSliderHovered(hovered) {
        this.zoomSliderHovered = hovered;
    }

    isZoomSliderDragging() {
        return this.zoomSliderDragging;
    }

    setZoomSliderDragging(dragging) {
        this.zoomSliderDragging = dragging;
    }

    isFullscreenToggleHovered() {
        return this.fullscreenToggleHovered;
    }

    setFullscreenToggleHovered(hovered) {
        this.fullscreenToggleHovered = hovered;
    }

    isCloseButtonHovered() {
        return this.closeButtonHovered;
    }

    setCloseButtonHovered(hovered) {
        this.closeButtonHovered = hovered;
    }

    toggleFullscreen() {
        if (this.fullscreenEnabled) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }

    enterFullscreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().then(() => {
                this.fullscreenEnabled = true;
            }).catch((err) => {
                console.warn('Failed to enter fullscreen:', err);
            });
        } else if (elem.webkitRequestFullscreen) {
            // Safari
            elem.webkitRequestFullscreen();
            this.fullscreenEnabled = true;
        } else if (elem.mozRequestFullScreen) {
            // Firefox
            elem.mozRequestFullScreen();
            this.fullscreenEnabled = true;
        } else if (elem.msRequestFullscreen) {
            // IE/Edge
            elem.msRequestFullscreen();
            this.fullscreenEnabled = true;
        }
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
                this.fullscreenEnabled = false;
            }).catch((err) => {
                console.warn('Failed to exit fullscreen:', err);
            });
        } else if (document.webkitExitFullscreen) {
            // Safari
            document.webkitExitFullscreen();
            this.fullscreenEnabled = false;
        } else if (document.mozCancelFullScreen) {
            // Firefox
            document.mozCancelFullScreen();
            this.fullscreenEnabled = false;
        } else if (document.msExitFullscreen) {
            // IE/Edge
            document.msExitFullscreen();
            this.fullscreenEnabled = false;
        }
    }

    syncFullscreenState() {
        // Sync our state with actual browser fullscreen state
        const isFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
        this.fullscreenEnabled = isFullscreen;
    }

    setupSettingsInteraction() {
        const mapCanvas = document.getElementById('map');
        if (!mapCanvas) {
            return;
        }

        // Import hit testing functions dynamically to avoid circular deps
        import('./renderer/settingsMenu.js').then(({isPointInSettingsButton, isPointInBounds, getSettingsMenuBounds, getSliderValueFromPosition}) => {
            this._isPointInSettingsButton = isPointInSettingsButton;
            this._isPointInBounds = isPointInBounds;
            this._getSettingsMenuBounds = getSettingsMenuBounds;
            this._getSliderValueFromPosition = getSliderValueFromPosition;
        });

        // Listen for fullscreen change events to sync state
        document.addEventListener('fullscreenchange', () => this.syncFullscreenState());
        document.addEventListener('webkitfullscreenchange', () => this.syncFullscreenState());
        document.addEventListener('mozfullscreenchange', () => this.syncFullscreenState());
        document.addEventListener('MSFullscreenChange', () => this.syncFullscreenState());

        mapCanvas.addEventListener('mousedown', (evt) => {
            if (!this._isPointInSettingsButton) {
                return;
            }
            const rect = mapCanvas.getBoundingClientRect();
            const x = evt.clientX - rect.left;
            const y = evt.clientY - rect.top;

            // Check slider drag starts
            if (this.settingsOpen && this._getSettingsMenuBounds && this._isPointInBounds && this._getSliderValueFromPosition) {
                const menuBounds = this._getSettingsMenuBounds();
                
                if (menuBounds.volumeSlider && this._isPointInBounds(x, y, menuBounds.volumeSlider)) {
                    this.setVolumeSliderDragging(true);
                    const newVolume = this._getSliderValueFromPosition(x, menuBounds.volumeSlider, 0, 100);
                    this.setVolume(newVolume);
                }
                
                if (menuBounds.zoomSlider && this._isPointInBounds(x, y, menuBounds.zoomSlider)) {
                    this.setZoomSliderDragging(true);
                    const newZoom = this._getSliderValueFromPosition(x, menuBounds.zoomSlider, 0, 100);
                    this.setZoomFromPercent(newZoom);
                }
            }
        });

        mapCanvas.addEventListener('mouseup', () => {
            this.setVolumeSliderDragging(false);
            this.setZoomSliderDragging(false);
        });

        // Also handle mouseup outside the canvas
        document.addEventListener('mouseup', () => {
            this.setVolumeSliderDragging(false);
            this.setZoomSliderDragging(false);
        });

        mapCanvas.addEventListener('click', (evt) => {
            if (!this._isPointInSettingsButton) {
                return;
            }
            const rect = mapCanvas.getBoundingClientRect();
            const x = evt.clientX - rect.left;
            const y = evt.clientY - rect.top;

            // Check settings menu interactions first (when open)
            if (this.settingsOpen && this._getSettingsMenuBounds && this._isPointInBounds) {
                const menuBounds = this._getSettingsMenuBounds();
                
                // Close button
                if (menuBounds.closeButton && this._isPointInBounds(x, y, menuBounds.closeButton)) {
                    this.closeSettings();
                    return;
                }
                
                // Fullscreen toggle
                if (menuBounds.fullscreenToggle && this._isPointInBounds(x, y, menuBounds.fullscreenToggle)) {
                    this.toggleFullscreen();
                    return;
                }

                // Volume slider click (handled in mousedown, so just prevent gear toggle)
                if (menuBounds.volumeSlider && this._isPointInBounds(x, y, menuBounds.volumeSlider)) {
                    return;
                }

                // Zoom slider click (handled in mousedown, so just prevent gear toggle)
                if (menuBounds.zoomSlider && this._isPointInBounds(x, y, menuBounds.zoomSlider)) {
                    return;
                }
            }

            // Settings button (gear icon)
            if (this._isPointInSettingsButton(x, y, this.settingsButtonBounds)) {
                this.toggleSettings();
            }
        });

        mapCanvas.addEventListener('mousemove', (evt) => {
            if (!this._isPointInSettingsButton) {
                return;
            }
            const rect = mapCanvas.getBoundingClientRect();
            const x = evt.clientX - rect.left;
            const y = evt.clientY - rect.top;

            let cursorPointer = false;

            // Handle volume slider dragging
            if (this.volumeSliderDragging && this._getSettingsMenuBounds && this._getSliderValueFromPosition) {
                const menuBounds = this._getSettingsMenuBounds();
                if (menuBounds.volumeSlider) {
                    const newVolume = this._getSliderValueFromPosition(x, menuBounds.volumeSlider, 0, 100);
                    this.setVolume(newVolume);
                }
                cursorPointer = true;
            }

            // Handle zoom slider dragging
            if (this.zoomSliderDragging && this._getSettingsMenuBounds && this._getSliderValueFromPosition) {
                const menuBounds = this._getSettingsMenuBounds();
                if (menuBounds.zoomSlider) {
                    const newZoom = this._getSliderValueFromPosition(x, menuBounds.zoomSlider, 0, 100);
                    this.setZoomFromPercent(newZoom);
                }
                cursorPointer = true;
            }

            // Check settings menu hover states (when open)
            if (this.settingsOpen && this._getSettingsMenuBounds && this._isPointInBounds) {
                const menuBounds = this._getSettingsMenuBounds();
                
                // Close button hover
                const closeHovered = menuBounds.closeButton && this._isPointInBounds(x, y, menuBounds.closeButton);
                this.setCloseButtonHovered(closeHovered);
                if (closeHovered) {
                    cursorPointer = true;
                }
                
                // Fullscreen toggle hover
                const fullscreenHovered = menuBounds.fullscreenToggle && this._isPointInBounds(x, y, menuBounds.fullscreenToggle);
                this.setFullscreenToggleHovered(fullscreenHovered);
                if (fullscreenHovered) {
                    cursorPointer = true;
                }

                // Volume slider hover
                const volumeHovered = menuBounds.volumeSlider && this._isPointInBounds(x, y, menuBounds.volumeSlider);
                this.setVolumeSliderHovered(volumeHovered);
                if (volumeHovered || this.volumeSliderDragging) {
                    cursorPointer = true;
                }

                // Zoom slider hover
                const zoomHovered = menuBounds.zoomSlider && this._isPointInBounds(x, y, menuBounds.zoomSlider);
                this.setZoomSliderHovered(zoomHovered);
                if (zoomHovered || this.zoomSliderDragging) {
                    cursorPointer = true;
                }
            } else {
                this.setFullscreenToggleHovered(false);
                this.setCloseButtonHovered(false);
                this.setVolumeSliderHovered(false);
                this.setZoomSliderHovered(false);
            }

            // Settings button hover
            const buttonHovered = this._isPointInSettingsButton(x, y, this.settingsButtonBounds);
            this.setSettingsButtonHovered(buttonHovered);
            if (buttonHovered) {
                cursorPointer = true;
            }

            // Hide native cursor and track canvas interactive state for custom cursor
            mapCanvas.style.cursor = 'none';
            this.canvasInteractiveHovered = cursorPointer;
        });
    }

}