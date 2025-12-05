import {Howl} from 'howler';
import {Client} from '../client.js';
import {renderLandingScreen} from './landingUi.js';
import {renderMiniMap} from './miniMap.js';
import {renderLeaderboard} from './leaderboard.js';
import {renderDebris} from './worldObjects/debris.js';
import {renderLaser} from './worldObjects/laser.js';
import {renderParticle} from './worldObjects/particle.js';
import {renderLaserParticle} from './worldObjects/laserParticle.js';
import {renderShip} from './worldObjects/ship.js';
import {renderThruster} from './worldObjects/thruster.js';
import {renderCapacitorStatus, renderHullStrength, renderShieldStatus} from './hudMeters.js';
import {renderControlButtons} from './controlButtons.js';
import {renderDamgeIndicator} from './damageIndicator.js';
import {renderTargetSelector} from './worldObjects/targetSelector.js';

export class Renderer {
    constructor(mapRadius, options = {}) {
        this.visualRange = 150;
        this.audioRange = 50;
        this.pixelsPerMeter = 0;
        this.worldPixelsPerMeter = 0;
        this.miniMapZoomLevel = 0.03;
        this.availableWidth = 0;
        this.availableHeight = 0;
        this.version = Meteor.settings.public.version;
        this.gameVolume = Meteor.settings.public.gameVolume;
        this.mapRadius = mapRadius;
        this.playerShip = {};
        this.explosionEffectHandler = typeof options.onExplosionEffect === 'function'
            ? options.onExplosionEffect
            : null;
        this.focalX = 0;
        this.focalY = 0;
        this.camera = {"centerX":0, "centerY":0, "prevCenterX":0, "prevCenterY":0, "boundry": {"left":0, "right":0, "top":0, "bottom":0}};
        this.map = document.getElementById("map").getContext('2d');
        this.background = document.getElementById("background").getContext('2d');
        this.devicePixelRatio = (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 1;
        this.starFieldConfig = {
            tileSizeCss: 2048,
            densityPerPixel: 1 / 1000,
            minRadiusCss: 0.5,
            maxRadiusCss: 1.25,
            seed: 1337,
        };
        this.starTile = null;
        this.createBackground();
        this.playerId = 0;
        this.playerName = "";
        this.zoomFactor = 1;
        this.minZoomFactor = 0.5;
        this.maxZoomFactor = 2.5;
        this.renderTimeSeconds = 0;
        this.renderTimestampMs = 0;
        this.landingOverlayAlpha = 0;
        this.showBoundingBoxes = true;
        this.recentSoundKeys = [];
        this.soundDedupIntervalMs = 500;
        this.recentExplosionKeys = [];
        this.explosionDedupIntervalMs = 500;
    }

    refreshViewportMeasurements() {
        const windowOffset = 22;
        const availableWidth = window.innerWidth - windowOffset;
        const availableHeight = window.innerHeight - windowOffset;
        const availablePixels = availableHeight < availableWidth ? availableWidth : availableHeight;
        const devicePixelRatio = (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 1;
        const viewportWidthPx = Math.max(1, Math.floor(availableWidth * devicePixelRatio));
        const viewportHeightPx = Math.max(1, Math.floor(availableHeight * devicePixelRatio));

        const changed = availableWidth !== this.availableWidth
            || availableHeight !== this.availableHeight
            || availablePixels !== this.availablePixels
            || viewportWidthPx !== this.viewportWidthPx
            || viewportHeightPx !== this.viewportHeightPx
            || devicePixelRatio !== this.devicePixelRatio;

        this.availableWidth = availableWidth;
        this.availableHeight = availableHeight;
        this.availablePixels = availablePixels;
        this.viewportWidthPx = viewportWidthPx;
        this.viewportHeightPx = viewportHeightPx;
        this.devicePixelRatio = devicePixelRatio;
        this.pixelsPerMeter = this.availablePixels / 2 / this.visualRange;
        this.worldPixelsPerMeter = this.pixelsPerMeter;

        return changed;
    }

    createBackground({skipViewportRefresh = false} = {}) {
        if (!skipViewportRefresh) {
            this.refreshViewportMeasurements();
        }

        this.background.canvas.width = this.viewportWidthPx;
        this.background.canvas.height = this.viewportHeightPx;
        this.background.canvas.style.width = `${this.availableWidth}px`;
        this.background.canvas.style.height = `${this.availableHeight}px`;
        this.background.setTransform(1, 0, 0, 1, 0, 0);
        this.background.imageSmoothingEnabled = false;

        const desiredTileSizePx = Math.max(1, Math.floor(this.starFieldConfig.tileSizeCss * this.devicePixelRatio));
        const tileNeedsRebuild = !this.starTile
            || this.starTile.sizePx !== desiredTileSizePx
            || this.starTile.devicePixelRatio !== this.devicePixelRatio;

        if (tileNeedsRebuild) {
            this.starTile = this.createStarTile(desiredTileSizePx);
        }

        this.background.clearRect(0, 0, this.viewportWidthPx, this.viewportHeightPx);
    }

    createStarTile(tileSizePx) {
        const devicePixelRatio = this.devicePixelRatio || 1;
        const tileSizeCss = tileSizePx / devicePixelRatio;
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = tileSizePx;
        tileCanvas.height = tileSizePx;
        const tileContext = tileCanvas.getContext('2d');
        const areaCss = tileSizeCss * tileSizeCss;
        const starCount = Math.max(1, Math.round(areaCss * this.starFieldConfig.densityPerPixel));
        const rng = this.createSeededRng(this.starFieldConfig.seed);
        const radiusRangeCss = this.starFieldConfig.maxRadiusCss - this.starFieldConfig.minRadiusCss;

        for (let i = 0; i < starCount; i++) {
            const x = Math.floor(rng() * tileSizePx);
            const y = Math.floor(rng() * tileSizePx);
            const radiusCss = this.starFieldConfig.minRadiusCss + rng() * radiusRangeCss;
            // Ensure minimum 1 physical pixel radius to prevent subpixel antialiasing
            // which causes stars to appear dim on high-DPI monitors with fractional scaling
            const radiusPx = Math.max(1, radiusCss * devicePixelRatio);
            const alpha = rng();

            tileContext.beginPath();
            tileContext.arc(x, y, radiusPx, 0, 2 * Math.PI);
            tileContext.fillStyle = `rgba(100, 100, 255, ${alpha})`;
            tileContext.fill();
        }

        return {
            canvas: tileCanvas,
            sizePx: tileSizePx,
            tileSizeCss,
            devicePixelRatio,
        };
    }

    createSeededRng(seed) {
        let state = seed >>> 0;
        return () => {
            state = (state * 1664525 + 1013904223) >>> 0;
            return state / 0x100000000;
        };
    }

    setZoomFactor(factor) {
        if (!Number.isFinite(factor)) {
            return;
        }
        const clamped = Math.min(this.maxZoomFactor, Math.max(this.minZoomFactor, factor));
        this.zoomFactor = clamped;
    }

    getZoomFactor() {
        return this.zoomFactor;
    }

    getZoomBounds() {
        return {min: this.minZoomFactor, max: this.maxZoomFactor};
    }

    setLandingOverlayAlpha(alpha) {
        if (!Number.isFinite(alpha)) {
            return;
        }
        const clamped = Math.min(1, Math.max(0, alpha));
        this.landingOverlayAlpha = clamped;
    }

    getLandingOverlayAlpha() {
        return this.landingOverlayAlpha;
    }

    setShowBoundingBoxes(enabled) {
        if (typeof enabled !== 'boolean') {
            return;
        }
        this.showBoundingBoxes = enabled;
    }

    getShowBoundingBoxes() {
        return this.showBoundingBoxes;
    }

    determineIfObjectShouldBeRendered(objectToInspect) {
        if (objectToInspect.locationX > this.camera.left && objectToInspect.locationX <  this.camera.right && objectToInspect.locationY > this.camera.top && objectToInspect.locationY < this.camera.bottom) {
            return true;
        } else {
            return false;
        } 
    }

    updateCamera() {
        this.camera.prevCenterX = this.camera.centerX;
        this.camera.prevCenterY = this.camera.centerY;
        if (typeof this.playerShip.locationX === 'undefined') {
            this.camera.centerX = 0;
        } else {
            this.camera.centerX = this.playerShip.locationX;
        }
        if (typeof this.playerShip.locationY === 'undefined') {
            this.camera.centerY = 0;
        } else {
            this.camera.centerY = this.playerShip.locationY;
        }
        this.camera.left = this.playerShip.locationX - this.availableWidth / 2;
        this.camera.right = this.playerShip.locationX + this.availableWidth / 2;
        this.camera.top = this.playerShip.locationY - this.availableHeight / 2;
        this.camera.bottom = this.playerShip.locationY + this.availableHeight / 2;
    }

    updateLocationOffset() {
        this.focalX = -this.playerShip.locationX * this.worldPixelsPerMeter;
        this.focalY = -this.playerShip.locationY * this.worldPixelsPerMeter;
    }

    scrollTheBackground() {
        if (!this.starTile) {
            return;
        }

        const pixelsPerMeterPx = this.worldPixelsPerMeter * this.devicePixelRatio;
        const cameraXPx = (typeof this.playerShip.locationX === 'number' ? this.playerShip.locationX : 0) * pixelsPerMeterPx;
        const cameraYPx = (typeof this.playerShip.locationY === 'number' ? this.playerShip.locationY : 0) * pixelsPerMeterPx;
        const tileSizePx = this.starTile.sizePx;
        const offsets = [-tileSizePx, 0, tileSizePx];

        const baseOffsetX = ((-cameraXPx % tileSizePx) + tileSizePx) % tileSizePx;
        const baseOffsetY = ((-cameraYPx % tileSizePx) + tileSizePx) % tileSizePx;
        const offsetX = Math.round(baseOffsetX) - tileSizePx;
        const offsetY = Math.round(baseOffsetY) - tileSizePx;

        this.background.clearRect(0, 0, this.viewportWidthPx, this.viewportHeightPx);

        for (let i = 0; i < offsets.length; i++) {
            for (let j = 0; j < offsets.length; j++) {
                const drawX = offsetX + offsets[i];
                const drawY = offsetY + offsets[j];

                if (drawX >= this.viewportWidthPx || drawX + tileSizePx <= 0) {
                    continue;
                }
                if (drawY >= this.viewportHeightPx || drawY + tileSizePx <= 0) {
                    continue;
                }

                this.background.drawImage(this.starTile.canvas, drawX, drawY);
            }
        }
    }
 
    // This is dumb, I should be able to set a pointer when the player
    // is firts assigned a ship. It won't change after that until
    // the player dies and restarts
    updatePlayerShip(playerShipId) {
        for (let i = 0, j = gameObjects.length; i < j; i++) {
            if (gameObjects[i].id == playerShipId) {
                this.playerShip = gameObjects[i];
            }
        }
    }

    renderMap(playerId, playerName, playerShipId) {

        this.playerId = playerId;
        this.playerName = playerName;
        const nowMs = (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now();
        this.renderTimeSeconds = nowMs / 1000;
        this.renderTimestampMs = nowMs;
        this.pruneRecentSounds(nowMs);
        this.pruneRecentExplosions(nowMs);

        const viewportChanged = this.refreshViewportMeasurements();
        this.map.canvas.width = this.availableWidth;
        this.map.canvas.height = this.availableHeight;

        const desiredTileSizePx = Math.max(1, Math.floor(this.starFieldConfig.tileSizeCss * this.devicePixelRatio));
        const backgroundSizeChanged = viewportChanged
            || this.background.canvas.width !== this.viewportWidthPx
            || this.background.canvas.height !== this.viewportHeightPx
            || !this.starTile
            || this.starTile.sizePx !== desiredTileSizePx
            || this.starTile.devicePixelRatio !== this.devicePixelRatio;

        if (backgroundSizeChanged) {
            this.createBackground({skipViewportRefresh: true});
        }

        this.updatePlayerShip(playerShipId);
        this.updateCamera();
        this.updateLocationOffset();
        this.scrollTheBackground();

        const shipNamesById = new Map();
        for (let i = 0; i < gameObjects.length; i++) {
            const gameObject = gameObjects[i];
            const name = (gameObject && typeof gameObject.name === 'string') ? gameObject.name.trim() : '';

            if (name === '') {
                continue;
            }

            if (gameObject.type === 'Player' && typeof gameObject.shipId !== 'undefined') {
                shipNamesById.set(gameObject.shipId, name);
            }

            if (gameObject.type === 'Ship' && typeof gameObject.id !== 'undefined') {
                shipNamesById.set(gameObject.id, name);
            }
        }

        this.map.clearRect(0, 0, this.availableWidth, this.availableHeight);
        this.map.save();
        this.map.translate(this.availableWidth / 2, this.availableHeight / 2);
        this.map.scale(this.zoomFactor, this.zoomFactor);
        this.map.translate(this.focalX, this.focalY);
        this.renderBoundry(this.pixelsPerMeter);

        for (let i = 0, j = gameObjects.length; i < j; i++) {

            if (this.determineIfObjectShouldBeRendered(gameObjects[i])) {

                if (gameObjects[i].type == 'Ship') {

                    renderShip(this.map, gameObjects[i], {
                        pixelsPerMeter: this.pixelsPerMeter,
                        worldPixelsPerMeter: this.worldPixelsPerMeter,
                        renderTimeSeconds: this.renderTimeSeconds,
                        playerShip: this.playerShip,
                        playerName: this.playerName,
                        shipNamesById
                    });
                    this.renderBoundingBox(gameObjects[i]);

                }

                else if (gameObjects[i].type == 'FireParticle') {

                    renderParticle(this.map, gameObjects[i], this.worldPixelsPerMeter);

                }

                else if (gameObjects[i].type == 'LaserParticle') {

                    renderLaserParticle(this.map, gameObjects[i], this.worldPixelsPerMeter);

                }

                else if (gameObjects[i].type == 'Thruster') {

                    renderThruster(this.map, gameObjects[i], this.worldPixelsPerMeter);

                }

                else if (gameObjects[i].type == 'Laser') {

                    renderLaser(this.map, gameObjects[i], this.worldPixelsPerMeter);
                    this.renderBoundingBox(gameObjects[i]);

                }

                else if (gameObjects[i].type == 'Debris') {

                    renderDebris(this.map, gameObjects[i], this.worldPixelsPerMeter);
                    this.renderBoundingBox(gameObjects[i]);

                }

                else if (gameObjects[i].type == 'Sound') {

                    this.renderSound(gameObjects[i]);

                }
                else if (gameObjects[i].type == 'Explosion') {

                    this.renderExplosion(gameObjects[i]);

                }
            }
        }

        this.renderTargetSelectorOverlay(gameObjects);

        this.map.restore();

        this.map.save();

        renderMiniMap(this.map, {
            availableWidth: this.availableWidth,
            availablePixels: this.availablePixels,
            miniMapZoomLevel: this.miniMapZoomLevel,
            focalX: this.focalX,
            focalY: this.focalY,
            worldPixelsPerMeter: this.worldPixelsPerMeter,
            pixelsPerMeter: this.pixelsPerMeter,
            mapRadius: this.mapRadius,
            gameObjects,
            playerShipId,
        });

        const landingOverlayAlpha = this.getLandingOverlayAlpha();
        const overlayActive = landingOverlayAlpha > 0;

        if (Client.gameMode == 'PLAY_MODE') {

            renderLeaderboard(this.map, {
                gameObjects,
                playerId: this.playerId,
            });

            renderHullStrength(this.map, {
                availableHeight: this.availableHeight,
                hullStrength: this.playerShip.hullStrength,
            });

            renderCapacitorStatus(this.map, {
                availableHeight: this.availableHeight,
                capacitor: this.playerShip.capacitor,
            });

            renderShieldStatus(this.map, {
                availableHeight: this.availableHeight,
                shieldStatus: this.playerShip.shieldStatus,
                shieldOn: this.playerShip.shieldOn,
            });

            renderDamgeIndicator(this.map, {
                availableWidth: this.availableWidth,
                availableHeight: this.availableHeight,
                pixelsPerMeter: this.pixelsPerMeter,
                playerShip: this.playerShip,
            });

            const showControlButtons = false;

            if (showControlButtons) {
                renderControlButtons(this.map, {
                    availableHeight: this.availableHeight,
                    availablePixels: this.availablePixels,
                    availableWidth: this.availableWidth,
                });
            }

        }

        if (Client.gameMode == 'START_MODE' || overlayActive) {
            const landingOpacity = Client.gameMode == 'START_MODE' ? 1 : landingOverlayAlpha;
            renderLandingScreen(this.map, {
                alpha: landingOpacity,
                availableWidth: this.availableWidth,
                availableHeight: this.availableHeight,
                version: this.version,
                playerName: this.playerName,
                renderTimeSeconds: this.renderTimeSeconds,
                gameMode: Client.gameMode,
                renderLeaderboard: () => renderLeaderboard(this.map, {
                    gameObjects,
                    playerId: this.playerId,
                }),
            });
        }

        this.map.restore();

    }

    renderStar(star) {

        this.map.save();

        this.map.translate(star.locationX * this.worldPixelsPerMeter, star.locationY * this.worldPixelsPerMeter);

        this.map.beginPath();

        this.map.arc(0, 0, 0.25 * this.worldPixelsPerMeter, 0, 2 * Math.PI);

        this.map.fillStyle = "rgba(255, 255, 255," + star.alpha + ")";

        this.map.fill();

        this.map.restore();

    }

    renderBoundry(pixelsPerMeterOverride) {

        this.map.save();

        this.map.beginPath();

        const ppm = typeof pixelsPerMeterOverride === 'number' ? pixelsPerMeterOverride : this.worldPixelsPerMeter;
        this.map.arc(0, 0, this.mapRadius * ppm, 0, 2 * Math.PI);

        this.map.strokeStyle = "rgba(255, 255, 0, 0.5)";

        this.map.lineWidth = 5;

        this.map.stroke();

        this.map.restore();

    }

    renderTargetSelectorOverlay(gameObjects) {
        const ship = this.playerShip;
        if (!ship) {
            return;
        }
        const {locationX, locationY, facing, id: playerShipId} = ship;
        if (!Number.isFinite(locationX) || !Number.isFinite(locationY) || !Number.isFinite(facing)) {
            return;
        }

        const targetDistanceMeters = 75;
        const forwardVector = getFacingUnitVector(facing);
        const targetLocation = {
            x: locationX + forwardVector.x * targetDistanceMeters,
            y: locationY + forwardVector.y * targetDistanceMeters,
        };

        const targetOverEnemyOrDebris = isTargetOverEnemyOrDebris({
            targetLocation,
            gameObjects,
            playerShipId,
        });

        const selectorColor = targetOverEnemyOrDebris ? 'rgba(200, 40, 40, 0.95)' : 'rgba(150, 150, 150, 0.9)';
        const selectorFillColor = targetOverEnemyOrDebris ? 'rgba(200, 40, 40, 0.25)' : null;

        renderTargetSelector(this.map, {
            targetX: targetLocation.x,
            targetY: targetLocation.y,
            worldPixelsPerMeter: this.worldPixelsPerMeter,
            color: selectorColor,
            fillColor: selectorFillColor,
        });
    }

    renderSound(sound) {

        if (Client.gameMode == 'PLAY_MODE') {

            const timestampMs = this.renderTimestampMs || Date.now();
            const soundKey = this.buildSoundKey(sound);

            if (soundKey) {
                if (this.wasSoundRecentlyPlayed(soundKey, timestampMs)) {
                    return;
                }
                this.markSoundPlayed(soundKey, timestampMs);
            }

            let distanceFromPlayersShip = 0;

            let soundVolume = 1.0;

            if (this.playerShip != null) {
                
                distanceFromPlayersShip = Math.sqrt((this.playerShip.locationX - sound.locationX) * (this.playerShip.locationX - sound.locationX) + (this.playerShip.locationY - sound.locationY) * (this.playerShip.locationY - sound.locationY)) / this.pixelsPerMeter;

            }

            soundVolume = (this.audioRange - distanceFromPlayersShip) / this.audioRange * this.gameVolume;

            if (soundVolume < 0) {

                soundVolume = 0;

            }

            let srcFile = '';

            if (sound.soundType == "LaserFired") {
                
                soundVolume = soundVolume * 1.0;
                
                srcFile = '/lazer.mp3';

            }

            let howl = new Howl({
                    
                src: [srcFile],

                volume: soundVolume
            
            });
            
            howl.play();

        }

    }

    renderExplosion(explosion) {

        if (Client.gameMode !== 'PLAY_MODE') {
            return;
        }

        const timestampMs = this.renderTimestampMs || Date.now();
        const explosionKey = this.buildExplosionKey(explosion);

        if (explosionKey) {
            if (this.wasExplosionRecentlyRendered(explosionKey, timestampMs)) {
                return;
            }
            this.markExplosionRendered(explosionKey, timestampMs);
        }

        if (typeof this.explosionEffectHandler === 'function') {
            this.explosionEffectHandler(explosion);
        }

    }

    buildSoundKey(sound) {
        if (!sound || typeof sound.soundType !== 'string') {
            return null;
        }

        const x = Number(sound.locationX);
        const y = Number(sound.locationY);

        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            return null;
        }

        const roundedX = Math.round(x * 100) / 100;
        const roundedY = Math.round(y * 100) / 100;

        return `${sound.soundType}:${roundedX}:${roundedY}`;
    }

    wasSoundRecentlyPlayed(key, timestampMs) {
        return this.recentSoundKeys.some((entry) => entry.key === key && (timestampMs - entry.playedAt) <= this.soundDedupIntervalMs);
    }

    markSoundPlayed(key, timestampMs) {
        this.recentSoundKeys.push({key, playedAt: timestampMs});
    }

    pruneRecentSounds(timestampMs) {
        const cutoff = timestampMs - this.soundDedupIntervalMs;
        this.recentSoundKeys = this.recentSoundKeys.filter((entry) => entry.playedAt >= cutoff);
    }

    buildExplosionKey(explosion) {
        if (!explosion) {
            return null;
        }

        const x = Number(explosion.locationX);
        const y = Number(explosion.locationY);

        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            return null;
        }

        const roundedX = Math.round(x * 100) / 100;
        const roundedY = Math.round(y * 100) / 100;
        const explosionType = typeof explosion.explosionType === 'string' ? explosion.explosionType : 'Standard';

        return `${explosionType}:${roundedX}:${roundedY}`;
    }

    wasExplosionRecentlyRendered(key, timestampMs) {
        return this.recentExplosionKeys.some((entry) => entry.key === key && (timestampMs - entry.renderedAt) <= this.explosionDedupIntervalMs);
    }

    markExplosionRendered(key, timestampMs) {
        this.recentExplosionKeys.push({key, renderedAt: timestampMs});
    }

    pruneRecentExplosions(timestampMs) {
        const cutoff = timestampMs - this.explosionDedupIntervalMs;
        this.recentExplosionKeys = this.recentExplosionKeys.filter((entry) => entry.renderedAt >= cutoff);
    }

    renderBoundingBox(gameObject) {
        if (!this.showBoundingBoxes) {
            return;
        }
        if (!gameObject || !BOUNDING_BOX_RENDER_TYPES.has(gameObject.type)) {
            return;
        }
        const box = buildBoundingBoxForRender(gameObject);
        if (!box) {
            return;
        }
        const corners = getBoundingBoxCorners(box);
        if (!corners || corners.length !== 4) {
            return;
        }
        const ppm = this.worldPixelsPerMeter;
        this.map.save();
        this.map.beginPath();
        this.map.moveTo(corners[0].x * ppm, corners[0].y * ppm);
        for (let i = 1; i < corners.length; i++) {
            this.map.lineTo(corners[i].x * ppm, corners[i].y * ppm);
        }
        this.map.closePath();
        this.map.strokeStyle = 'rgba(255, 255, 0, 0.9)';
        this.map.lineWidth = Math.max(1 / Math.max(this.zoomFactor, 0.001), 0.5);
        this.map.stroke();
        this.map.restore();
    }

    }

const BOUNDING_BOX_RENDER_TYPES = new Set(['Ship', 'Debris', 'Laser']);

function buildBoundingBoxForRender(gameObject) {
    if (!gameObject) {
        return null;
    }
    const spec = getBoundingBoxSpec(gameObject);
    const centerX = Number(gameObject.locationX);
    const centerY = Number(gameObject.locationY);
    if (!Number.isFinite(centerX) || !Number.isFinite(centerY)) {
        return null;
    }
    const orientationDegrees = Number.isFinite(gameObject.facing)
        ? gameObject.facing
        : (Number.isFinite(gameObject.heading) ? gameObject.heading : 0);
    const orientationRadians = orientationDegrees * Math.PI / 180;
    const axisLength = normalizeAxis({
        x: Math.sin(orientationRadians),
        y: -Math.cos(orientationRadians)
    });
    const axisWidth = normalizeAxis({
        x: Math.cos(orientationRadians),
        y: Math.sin(orientationRadians)
    });
    return {
        center: {x: centerX, y: centerY},
        halfLength: spec.length / 2,
        halfWidth: spec.width / 2,
        axisLength,
        axisWidth
    };
}

function getBoundingBoxSpec(gameObject) {
    const objectLength = Number(gameObject.lengthInMeters);
    const objectWidth = Number(gameObject.widthInMeters);
    if (objectLength > 0 && objectWidth > 0) {
        return {length: objectLength, width: objectWidth};
    }
    // Fallback: return default dimensions if lengthInMeters/widthInMeters not set
    return {length: 1, width: 1};
}

function normalizeAxis(axis) {
    const magnitude = Math.sqrt(axis.x * axis.x + axis.y * axis.y) || 1;
    return {
        x: axis.x / magnitude,
        y: axis.y / magnitude
    };
}

function getBoundingBoxCorners(box) {
    if (!box) {
        return [];
    }
    const lengthVector = {
        x: box.axisLength.x * box.halfLength,
        y: box.axisLength.y * box.halfLength
    };
    const widthVector = {
        x: box.axisWidth.x * box.halfWidth,
        y: box.axisWidth.y * box.halfWidth
    };
    return [
        {
            x: box.center.x + lengthVector.x + widthVector.x,
            y: box.center.y + lengthVector.y + widthVector.y
        },
        {
            x: box.center.x - lengthVector.x + widthVector.x,
            y: box.center.y - lengthVector.y + widthVector.y
        },
        {
            x: box.center.x - lengthVector.x - widthVector.x,
            y: box.center.y - lengthVector.y - widthVector.y
        },
        {
            x: box.center.x + lengthVector.x - widthVector.x,
            y: box.center.y + lengthVector.y - widthVector.y
        }
    ];
}

function getFacingUnitVector(compassFacingDegrees) {
    const clampedDegrees = Number.isFinite(compassFacingDegrees) ? compassFacingDegrees % 360 : 0;
    const orientationRadians = clampedDegrees * Math.PI / 180;
    return {
        x: Math.sin(orientationRadians),
        y: -Math.cos(orientationRadians)
    };
}

function isTargetOverEnemyOrDebris({targetLocation, gameObjects, playerShipId}) {
    if (!targetLocation || !gameObjects || !Array.isArray(gameObjects)) {
        return false;
    }
    for (let i = 0; i < gameObjects.length; i++) {
        const candidate = gameObjects[i];
        const isEnemyShip = candidate && candidate.type === 'Ship' && candidate.id !== playerShipId;
        const isDebris = candidate && candidate.type === 'Debris';
        if (!isEnemyShip && !isDebris) {
            continue;
        }
        const box = buildBoundingBoxForRender(candidate);
        if (box && isPointInsideBoundingBox(box, targetLocation)) {
            return true;
        }
    }
    return false;
}

function isPointInsideBoundingBox(box, point) {
    if (!box || !point) {
        return false;
    }
    const relative = {
        x: point.x - box.center.x,
        y: point.y - box.center.y
    };
    const projectionLength = relative.x * box.axisLength.x + relative.y * box.axisLength.y;
    const projectionWidth = relative.x * box.axisWidth.x + relative.y * box.axisWidth.y;
    return Math.abs(projectionLength) <= box.halfLength && Math.abs(projectionWidth) <= box.halfWidth;
}
