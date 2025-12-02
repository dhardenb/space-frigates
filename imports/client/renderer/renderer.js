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

export class Renderer {
    constructor(mapRadius) {
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
        this.focalX = 0;
        this.focalY = 0;
        this.camera = {"centerX":0, "centerY":0, "prevCenterX":0, "prevCenterY":0, "boundry": {"left":0, "right":0, "top":0, "bottom":0}};
        this.map = document.getElementById("map").getContext('2d');
        this.background = document.getElementById("background").getContext('2d');
        this.starField = {"upperLeft": {"x":0, "y":0}, "upperRight": {"x":0, "y":0}, "lowerLeft": {"x":0, "y":0}, "lowerRight": {"x":0, "y":0}};
        this.createBackground();
        this.playerId = 0;
        this.playerName = "";
        this.zoomFactor = 1;
        this.minZoomFactor = 0.5;
        this.maxZoomFactor = 2.5;
        this.renderTimeSeconds = 0;
        this.landingOverlayAlpha = 0;
        this.showBoundingBoxes = true;
    }

    createBackground() {

        // This should be handled in a dedicated event handler...
        let windowOffset = 22;
        this.availableWidth = window.innerWidth - windowOffset;
        this.availableHeight = window.innerHeight - windowOffset;
        this.availablePixels = this.availableHeight < this.availableWidth ? this.availableWidth : this.availableHeight;
        this.pixelsPerMeter = this.availablePixels / 2 / this.visualRange;
        this.worldPixelsPerMeter = this.pixelsPerMeter;
        this.background.canvas.width = this.availableWidth;
        this.background.canvas.height = this.availableHeight;

        this.starFieldCanvas = document.createElement('canvas');
        this.starFieldCanvas.width = this.availableWidth;
        this.starFieldCanvas.height = this.availableHeight;
        this.starFieldContext = this.starFieldCanvas.getContext('2d');

        for (let x = 0; x < this.availableWidth; x++) {
            for (let y = 0; y < this.availableHeight; y++) {
                if (Math.floor((Math.random()*1000)+1) == 1) {
                    this.starFieldContext.beginPath();
                    this.starFieldContext.arc(x, y, 1, 0, 2 * Math.PI);
                    this.starFieldContext.fillStyle = "rgba(100, 100, 255, " + Math.random() + ")";
                    this.starFieldContext.fill();
                }
            }
        }

        this.starField.upperLeft.x = -this.availableWidth / 2;
        this.starField.upperLeft.y = -this.availableHeight / 2;
        this.starField.upperRight.x = this.availableWidth / 2;
        this.starField.upperRight.y = -this.availableHeight / 2;
        this.starField.lowerLeft.x = -this.availableWidth / 2;
        this.starField.lowerLeft.y = this.availableHeight / 2;
        this.starField.lowerRight.x = this.availableWidth / 2;
        this.starField.lowerRight.y = this.availableHeight / 2;

        this.background.drawImage(this.starFieldCanvas, 0, 0);
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

        // WARNING! This only works right now if I set the players starting
        // position in the world to (0,0)
        //
        // I need to figure out how to know when I player just started so that
        // I cn reorient the background to the player position
        //
        // A possible solution is to add a field to the ship itself to
        // indicate it's "age" Then, the rendering code can use this to know
        // that if the ship is new that it should realign the scrolling to
        // the new ships location
        //
        // Also, I kind of need this new porerty anyway so that I can implemnt
        // the feature that a ship is "transparent" when it very first enters
        // the battle so it can not blow up immeditalty
       
        this.horizontalScrollAdjustment = this.camera.prevCenterX - this.camera.centerX;
        this.verticalScrollAdjustment = this.camera.prevCenterY - this.camera.centerY;

        this.starField.upperLeft.x += this.horizontalScrollAdjustment * this.worldPixelsPerMeter;
        this.starField.upperLeft.y += this.verticalScrollAdjustment * this.worldPixelsPerMeter;
        this.starField.upperRight.x += this.horizontalScrollAdjustment * this.worldPixelsPerMeter;
        this.starField.upperRight.y += this.verticalScrollAdjustment * this.worldPixelsPerMeter;
        this.starField.lowerLeft.x += this.horizontalScrollAdjustment * this.worldPixelsPerMeter;
        this.starField.lowerLeft.y += this.verticalScrollAdjustment * this.worldPixelsPerMeter;
        this.starField.lowerRight.x += this.horizontalScrollAdjustment * this.worldPixelsPerMeter;
        this.starField.lowerRight.y += this.verticalScrollAdjustment * this.worldPixelsPerMeter;

        // upperLeft
        if (this.starField.upperLeft.x > this.camera.boundry.right) {
            this.starField.upperLeft.x -= this.availableWidth * 2;
        }
        if (this.starField.upperLeft.x +this.availableWidth < this.camera.boundry.left) {
            this.starField.upperLeft.x += this.availableWidth * 2;
        }
        if (this.starField.upperLeft.y > this.camera.boundry.bottom) {
            this.starField.upperLeft.y -= this.availableHeight * 2;
        }
        if (this.starField.upperLeft.y + this.availableHeight < this.camera.boundry.top) {
            this.starField.upperLeft.y += this.availableHeight * 2;
        }

        // upperRight
        if (this.starField.upperRight.x > this.camera.boundry.right) {
            this.starField.upperRight.x -= this.availableWidth * 2;
        }
        if (this.starField.upperRight.x +this.availableWidth < this.camera.boundry.left) {
            this.starField.upperRight.x += this.availableWidth * 2;
        }
        if (this.starField.upperRight.y > this.camera.boundry.bottom) {
            this.starField.upperRight.y -= this.availableHeight * 2;
        }
        if (this.starField.upperRight.y + this.availableHeight < this.camera.boundry.top) {
            this.starField.upperRight.y += this.availableHeight * 2;
        }

        // lowerLeft
        if (this.starField.lowerLeft.x > this.camera.boundry.right) {
            this.starField.lowerLeft.x -= this.availableWidth * 2;
        }
        if (this.starField.lowerLeft.x +this.availableWidth < this.camera.boundry.left) {
            this.starField.lowerLeft.x += this.availableWidth * 2;
        }
        if (this.starField.lowerLeft.y > this.camera.boundry.bottom) {
            this.starField.lowerLeft.y -= this.availableHeight * 2;
        }
        if (this.starField.lowerLeft.y + this.availableHeight < this.camera.boundry.top) {
            this.starField.lowerLeft.y += this.availableHeight * 2;
        }

        // lowerRight
        if (this.starField.lowerRight.x > this.camera.boundry.right) {
            this.starField.lowerRight.x -= this.availableWidth * 2;
        }
        if (this.starField.lowerRight.x +this.availableWidth < this.camera.boundry.left) {
            this.starField.lowerRight.x += this.availableWidth * 2;
        }
        if (this.starField.lowerRight.y > this.camera.boundry.bottom) {
            this.starField.lowerRight.y -= this.availableHeight * 2;
        }
        if (this.starField.lowerRight.y + this.availableHeight < this.camera.boundry.top) {
            this.starField.lowerRight.y += this.availableHeight * 2;
        }
        
        this.background.clearRect(0,0, this.availableWidth, this.availableHeight);

        this.background.drawImage(this.starFieldCanvas, this.starField.upperLeft.x, this.starField.upperLeft.y);
        this.background.drawImage(this.starFieldCanvas, this.starField.upperRight.x, this.starField.upperRight.y);
        this.background.drawImage(this.starFieldCanvas, this.starField.lowerLeft.x, this.starField.lowerLeft.y);
        this.background.drawImage(this.starFieldCanvas, this.starField.lowerRight.x, this.starField.lowerRight.y);
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

        let windowOffset = 22;
        this.availableWidth = window.innerWidth - windowOffset;
        this.availableHeight = window.innerHeight - windowOffset;
        this.availablePixels = this.availableHeight < this.availableWidth ? this.availableWidth : this.availableHeight;
        this.pixelsPerMeter = this.availablePixels / 2 / this.visualRange;
        this.worldPixelsPerMeter = this.pixelsPerMeter;
        this.map.canvas.width = this.availableWidth;
        this.map.canvas.height = this.availableHeight;

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

                else if (gameObjects[i].type == 'Particle') {

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
            }
        }

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

    renderSound(sound) {

        if (Client.gameMode == 'PLAY_MODE') {

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
