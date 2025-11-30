import {Howl} from 'howler';
import {Client} from '../client.js';
import {renderMiniMap} from './miniMap.js';
import {renderDebris} from './worldObjects/debris.js';
import {renderLaser} from './worldObjects/laser.js';
import {renderParticle} from './worldObjects/particle.js';
import {renderShip} from './worldObjects/ship.js';
import {renderThruster} from './worldObjects/thruster.js';

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
        this._ = require('lodash');
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

    determineIfObjectShouldBeRendered(objectToInspect) {
        if (objectToInspect.LocationX > this.camera.left && objectToInspect.LocationX <  this.camera.right && objectToInspect.LocationY > this.camera.top && objectToInspect.LocationY < this.camera.bottom) {
            return true;
        } else {
            return false;
        } 
    }

    updateCamera() {
        this.camera.prevCenterX = this.camera.centerX;
        this.camera.prevCenterY = this.camera.centerY;
        if (typeof this.playerShip.LocationX === 'undefined') {
            this.camera.centerX = 0;
        } else {
            this.camera.centerX = this.playerShip.LocationX;
        }
        if (typeof this.playerShip.LocationY === 'undefined') {
            this.camera.centerY = 0;
        } else {
            this.camera.centerY = this.playerShip.LocationY;
        }
        this.camera.left = this.playerShip.LocationX - this.availableWidth / 2;
        this.camera.right = this.playerShip.LocationX + this.availableWidth / 2;
        this.camera.top = this.playerShip.LocationY - this.availableHeight / 2;
        this.camera.bottom = this.playerShip.LocationY + this.availableHeight / 2;
    }

    updateLocationOffset() {
        this.focalX = -this.playerShip.LocationX * this.worldPixelsPerMeter;
        this.focalY = -this.playerShip.LocationY * this.worldPixelsPerMeter;
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
            if (gameObjects[i].Id == playerShipId) {
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

        this.map.clearRect(0, 0, this.availableWidth, this.availableHeight);
        this.map.save();
        this.map.translate(this.availableWidth / 2, this.availableHeight / 2);
        this.map.scale(this.zoomFactor, this.zoomFactor);
        this.map.translate(this.focalX, this.focalY);
        this.renderBoundry(this.pixelsPerMeter);

        for (let i = 0, j = gameObjects.length; i < j; i++) {

            if (this.determineIfObjectShouldBeRendered(gameObjects[i])) {

                if (gameObjects[i].Type == 'Ship') {

                    renderShip(this.map, gameObjects[i], {
                        pixelsPerMeter: this.pixelsPerMeter,
                        worldPixelsPerMeter: this.worldPixelsPerMeter,
                        renderTimeSeconds: this.renderTimeSeconds,
                        playerShip: this.playerShip,
                        playerName: this.playerName
                    });

                }

                else if (gameObjects[i].Type == 'Particle') {

                    renderParticle(this.map, gameObjects[i], this.worldPixelsPerMeter);

                }

                else if (gameObjects[i].Type == 'Thruster') {

                    renderThruster(this.map, gameObjects[i], this.worldPixelsPerMeter);

                }

                else if (gameObjects[i].Type == 'Laser') {

                    renderLaser(this.map, gameObjects[i], this.worldPixelsPerMeter);

                }

                else if (gameObjects[i].Type == 'Debris') {

                    renderDebris(this.map, gameObjects[i], this.worldPixelsPerMeter);

                }

                else if (gameObjects[i].Type == 'Sound') {

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

            this.renderLeaderboard();

            this.renderHullStrength();
        
            this.renderCapacitorStatus();
        
            this.renderShieldStatus();

            this.renderDamgeIndicator();

            // this.renderRotateLeftButton();

            // this.renderRotateRightButton();

            // this.renderThrustButton();

            // this.renderBrakeButton();

            // this.renderShieldButton();

            // this.renderFireButton();

        }

        if (Client.gameMode == 'START_MODE' || overlayActive) {
            const landingOpacity = Client.gameMode == 'START_MODE' ? 1 : landingOverlayAlpha;
            this.renderLandingScreen(landingOpacity);
        }

        this.map.restore();

    }

    renderLandingScreen(opacity = 1) {

        const alpha = Math.min(1, Math.max(0, opacity));

        this.map.save();

        this.map.globalAlpha = alpha;

        this.renderLeaderboard();

        this.renderTitle();

        this.renderVersion();

        this.renderTwitter();

        this.renderBlog();

        this.renderEmail();

        this.renderInstructions();

        this.renderNameInputBox();

        this.renderName();

        this.renderStartInstructions();

        this.renderEnergyInstructions();

        this.map.restore();

    }

    renderStar(star) {

        this.map.save();

        this.map.translate(star.LocationX * this.worldPixelsPerMeter, star.LocationY * this.worldPixelsPerMeter);

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
                
                distanceFromPlayersShip = Math.sqrt((this.playerShip.LocationX - sound.LocationX) * (this.playerShip.LocationX - sound.LocationX) + (this.playerShip.LocationY - sound.LocationY) * (this.playerShip.LocationY - sound.LocationY)) / this.pixelsPerMeter;

            }

            soundVolume = (this.audioRange - distanceFromPlayersShip) / this.audioRange * this.gameVolume;

            if (soundVolume < 0) {

                soundVolume = 0;

            }

            let srcFile = '';

            if (sound.SoundType == "LaserFired") {
                
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

    renderTitle() {

        this.map.save();

        this.map.strokeStyle = "yellow";

        this.map.font = "60px Arial";

        this.map.translate(this.availableWidth / 2 - this.map.measureText("Space Frigates").width / 2, 50);

        this.map.strokeText("Space Frigates", 0, 0);

        this.map.restore();

    }

    renderVersion() {

        this.map.save();

        this.map.fillStyle = "yellow";

        this.map.font = "20px Arial";

        this.map.translate(this.availableWidth / 2 - this.map.measureText("PUBLIC ALPHA - " + this.version).width / 2, 90);

        this.map.fillText("PUBLIC ALPHA - " + this.version, 0, 0);

        this.map.restore();

    }

    renderTwitter() {

        this.map.save();

        this.map.fillStyle = "yellow";

        this.map.font = "20px Arial";

        this.map.translate(this.availableWidth / 2 - this.map.measureText("TWITTER: @spacefrigates").width / 2, 130);

        this.map.fillText("TWITTER: @spacefrigates", 0, 0);

        this.map.restore();

    }

    renderBlog() {

        this.map.save();

        this.map.fillStyle = "yellow";

        this.map.font = "20px Arial";

        this.map.translate(this.availableWidth / 2 - this.map.measureText("BLOG: blog.spacefrigates.com").width / 2, 170);

        this.map.fillText("BLOG: blog.spacefrigates.com", 0, 0);

        this.map.restore();

    }

    renderEmail() {

        this.map.save();

        this.map.fillStyle = "yellow";

        this.map.font = "20px Arial";

        this.map.translate(this.availableWidth / 2 - this.map.measureText("EMAIL: davehardenbrook@yahoo.com").width / 2, 210);

        this.map.fillText("EMAIL: davehardenbrook@yahoo.com", 0, 0);

        this.map.restore();

    }

    renderLeaderboard() {

        this.map.save();

        this.map.translate(10, 25);

        this.map.font = "20px Arial";

        this.map.fillStyle = "rgba(128, 128, 128, 0.5)";

        this.map.fillText("PILOT", 0, 0);

        this.map.save();

        this.map.translate(155, 0);

        this.map.fillText("K", 0, 0);

        this.map.translate(40, 0);

        this.map.fillText("D", 0, 0);

        this.map.restore();

        let players = [];

        for (let i=0, j=gameObjects.length; i<j; i++) {

            if (gameObjects[i].Type == 'Player') {

                if (gameObjects[i].Name != "") {

                    players.push(gameObjects[i]);

                }

            }

        }

        players = this._.orderBy(players, 'Kills', 'desc');

        for (let i=0, j=players.length; i<j; i++) {

            this.map.translate(0, 25);

            if (players[i].Id == this.playerId) {

                this.map.fillStyle = "rgba(255, 255, 0, 0.5)";

            } else {

                this.map.fillStyle = "rgba(128, 128, 128, 0.5)";

            }

            this.map.fillText(players[i].Name, 0, 0);

            this.map.save();

            this.map.translate(155, 0);

            this.map.fillText(players[i].Kills, 0, 0);

            this.map.translate(40, 0);

            this.map.fillText(players[i].Deaths, 0, 0);

            this.map.restore();

        }

        this.map.restore();

    }

    getNameInputMetrics() {
        const horizontalMargin = 40;
        const usableWidth = Math.max(140, this.availableWidth - horizontalMargin);
        let width = Math.min(320, Math.max(200, this.availableWidth * 0.35));
        width = Math.min(width, usableWidth);
        const height = 70;
        const x = (this.availableWidth - width) / 2;
        const y = this.availableHeight / 2 - height * 0.5;
        const paddingX = 20;
        const baselineY = y + height / 2;
        const caretHeight = Math.max(16, Math.min(32, height - 16));
        return {width, height, x, y, paddingX, baselineY, caretHeight};
    }

    renderNameInputBox() {

        this.map.save();

        const metrics = this.getNameInputMetrics();
        const isActive = Client.gameMode == 'START_MODE';

        this.map.translate(metrics.x, metrics.y);
        this.map.lineJoin = "round";

        const edgeColor = isActive ? "rgba(255, 255, 0, 0.9)" : "rgba(200, 200, 200, 0.35)";
        this.map.lineWidth = 2;
        this.map.strokeStyle = edgeColor;
        this.map.strokeRect(0, 0, metrics.width, metrics.height);

        this.map.strokeStyle = "rgba(255, 255, 255, 0.12)";
        this.map.lineWidth = 1;
        this.map.strokeRect(1.5, 1.5, metrics.width - 3, metrics.height - 3);

        this.map.restore();

    }

    renderName() {

        this.map.save();

        const metrics = this.getNameInputMetrics();
        const hasName = this.playerName !== "";
        const isActive = Client.gameMode == 'START_MODE';
        const textColor = hasName ? "rgba(255, 255, 128, 0.95)" : "rgba(200, 200, 200, 0.6)";
        const fontStyle = hasName ? "20px Arial" : "italic 20px Arial";

        this.map.font = fontStyle;
        this.map.fillStyle = textColor;
        this.map.textAlign = "left";
        this.map.textBaseline = "middle";

        const baselineY = metrics.baselineY;
        const textStartX = metrics.x + metrics.paddingX;

        this.map.translate(textStartX, baselineY);

        if (hasName) {
            this.map.fillText(this.playerName, 0, 0);
        } else {
            this.map.globalAlpha = 0.65;
            this.map.fillText("GUEST", 0, 0);
            this.map.globalAlpha = 1;
        }

        const renderedText = hasName ? this.playerName : "";
        const textMetrics = this.map.measureText(renderedText);
        const caretOffset = hasName ? textMetrics.width : 0;
        const caretColor = isActive ? "rgba(255, 255, 0, 0.9)" : "rgba(200, 200, 200, 0.35)";
        const shouldShowCaret = isActive;
        const caretBlinkOn = Math.floor(this.renderTimeSeconds * 2) % 2 === 0;

        if (shouldShowCaret && caretBlinkOn) {
            this.map.beginPath();
            const caretHeight = metrics.caretHeight;
            const halfCaret = caretHeight / 2;
            this.map.moveTo(caretOffset + 2, -halfCaret);
            this.map.lineTo(caretOffset + 2, halfCaret);
            this.map.lineWidth = 2;
            this.map.strokeStyle = caretColor;
            this.map.stroke();
        }

        this.map.restore();

    }

    renderStartInstructions() {

        this.map.save();

        let textToRender = "PRESS ENTER TO START";

        this.map.fillStyle = "yellow";

        this.map.font = "20px Arial";

        this.map.translate(this.availableWidth / 2 - this.map.measureText(textToRender).width / 2, this.availableHeight / 2 + 95);

        this.map.fillText(textToRender, 0, 0);

        this.map.restore();

    }

    renderEnergyInstructions() {

        this.map.save();

        let textToRender = "COLLECT DEBRIS TO INCREASE ENERGY";

        this.map.fillStyle = "yellow";

        this.map.font = "20px Arial";

        this.map.translate(this.availableWidth / 2 - this.map.measureText(textToRender).width / 2, this.availableHeight / 2 + 155);

        this.map.fillText(textToRender, 0, 0);

        this.map.restore();

    }

    renderHullStrength() {

        let ship = {};
        let hullStrengthDisplayValue;

        hullStrengthDisplayValue = Math.floor(this.playerShip.HullStrength);

        this.map.save();

        this.map.translate(0, this.availableHeight - 90);

        this.map.fillStyle = "rgba(128, 128, 128, 0.5)";

        this.map.font = "20px Arial";

        this.map.fillText("HULL ", 0, 0);

        this.map.restore();

        this.map.save();

        this.map.translate(125, this.availableHeight - 108);

        this.renderMeter(hullStrengthDisplayValue);

        this.map.restore();

    }

    renderCapacitorStatus() {

        let capacitorDisplayValue = Math.floor(this.playerShip.Capacitor);

        this.map.save();

        this.map.translate(0, this.availableHeight - 55);

        this.map.fillStyle = "rgba(128, 128, 128, 0.5)";

        this.map.font = "20px Arial";

        this.map.fillText("CAPACITOR ", 0, 0);

        this.map.restore();

        this.map.save();

        this.map.translate(125, this.availableHeight - 72);

        this.renderMeter(capacitorDisplayValue);

        this.map.restore();

    }

    renderShieldStatus() {

        let shieldDisplayValue;

        shieldDisplayValue = Math.floor(this.playerShip.ShieldStatus);

        this.map.save();

        this.map.translate(0, this.availableHeight - 20);

        this.map.fillStyle = "rgba(128, 128, 128, 0.5)";

        this.map.font = "20px Arial";

        this.map.fillText("SHIELDS ", 0, 0);

        this.map.restore();

        this.map.save();

        this.map.translate(125, this.availableHeight - 37);

        if (this.playerShip.ShieldOn == 0 && shieldDisplayValue == 0) {

            shieldDisplayValue = -1;

        }

        this.renderMeter(shieldDisplayValue);

        this.map.restore();

    }

    renderInstructions() {

        this.map.save();

        this.map.fillStyle = "yellow";

        this.map.font = "20px Arial";

        this.map.translate(0, this.availableHeight - 160);

        this.map.fillText("ENTER => New Ship", 0, 0);

        this.map.translate(0, 25);

        this.map.fillText("W or UP ARROW => Thrust", 0, 0);

        this.map.translate(0, 25);

        this.map.fillText("A or LEFT ARROW => Rotate Left", 0, 0);

        this.map.translate(0, 25);

        this.map.fillText("D or RIGHT ARROW => Rotate Right", 0, 0);

        this.map.translate(0, 25);

        this.map.fillText("S or DOWN ARROW => Auto Brake", 0, 0);

        this.map.translate(0, 25);

        this.map.fillText("ALT => Toggle Shields", 0, 0);

        this.map.translate(0, 25);

        this.map.fillText("SPACEBAR => Fire", 0, 0);

        this.map.restore();

    }

    renderMeter(percentage) {
    
        this.map.save();

        let color = "";

        if (percentage == -1) {
            color = "gray";
        } else if (percentage <= 33) {
            color = "red";
        } else if (percentage <= 66) {
            color = "yellow";
        } else {
            color = "green";
        }
        
        if (percentage <= 0) {
            this.renderMeterBar(0, 0, false, color);
        } else {
            this.renderMeterBar(0, 0, true, color);
        }

        if (percentage < 11) {
            this.renderMeterBar(20, 0, false, color);
        } else {
            this.renderMeterBar(20, 0, true, color);
        }

        if (percentage < 21) {
            this.renderMeterBar(40, 0, false, color);
        } else {
            this.renderMeterBar(40, 0, true, color);
        }

        if (percentage < 31) {
            this.renderMeterBar(60, 0, false, color);
        } else {
            this.renderMeterBar(60, 0, true, color);
        }

        if (percentage < 41) {
            this.renderMeterBar(80, 0, false, color);
        } else {
            this.renderMeterBar(80, 0, true, color);
        }

        if (percentage < 51) {
            this.renderMeterBar(100, 0, false, color);
        } else {
            this.renderMeterBar(100, 0, true, color);
        }

        if (percentage < 61) {
            this.renderMeterBar(120, 0, false, color);
        } else {
            this.renderMeterBar(120, 0, true, color);
        }

        if (percentage < 71) {
            this.renderMeterBar(140, 0, false, color);
        } else {
            this.renderMeterBar(140, 0, true, color);
        }

        if (percentage < 81) {
            this.renderMeterBar(160, 0, false, color);
        } else {
            this.renderMeterBar(160, 0, true, color);
        }

        if (percentage < 91) {
            this.renderMeterBar(180, 0, false, color);
        } else {
            this.renderMeterBar(180, 0, true, color);
        }

        this.map.restore();
    }

    renderMeterBar(x, y, filled, color) {
    
        this.map.save();

        let fillColor = "";
        let strokeColor = color;
        
        if (filled) {
            if (color == "gray") {
                fillColor = "rgba(128, 128, 128, 0.25)";
            } else if (color == "green") {
                fillColor = "rgba(0, 128, 0, 0.25)";
            } else if (color == "yellow") {
                fillColor = "rgba(255, 255, 0, 0.25)";
            } else if (color == "red") {
                fillColor = "rgba(255, 0, 0, 0.25)";
            }
        } else {
            fillColor = "rgba(0,0,0,0.5)";
        }

        this.map.fillStyle = fillColor;

        this.map.strokeStyle = strokeColor;
        
        this.map.beginPath();
        
        this.map.rect(x, y, 10, 20);
        
        this.map.fill();

        this.map.stroke();

        this.map.restore();
    }

    renderRotateLeftButton() {

        this.map.save();

        this.map.translate(0 + this.availablePixels * 0.1, this.availableHeight - this.availablePixels * 0.2);

        this.renderButton();

        this.map.restore();

    }

    renderRotateRightButton() {

        this.map.save();

        this.map.translate(0 + this.availablePixels * 0.25, this.availableHeight - this.availablePixels * 0.2);

        this.renderButton();

        this.map.restore();

    }

    renderThrustButton() {

        this.map.save();

        this.map.translate(0 + this.availablePixels * 0.175, this.availableHeight - this.availablePixels * 0.3);

        this.renderButton();

        this.map.restore();

    }

    renderBrakeButton() {

        this.map.save();

        this.map.translate(0 + this.availablePixels * 0.175, this.availableHeight - this.availablePixels * 0.1);

        this.renderButton();

        this.map.restore();

    }

    renderShieldButton() {

        this.map.save();

        this.map.translate(this.availableWidth - this.availablePixels * 0.25, this.availableHeight - this.availablePixels * 0.1);

        this.renderButton();

        this.map.restore();

    }

    renderFireButton() {

        this.map.save();

        this.map.translate(this.availableWidth - this.availablePixels * 0.1, this.availableHeight - this.availablePixels * 0.1);

        this.renderButton();

        this.map.restore();
    }

    renderButton() {

        this.map.save();

        this.map.strokeStyle = "rgba(128, 128, 128, 0.5)";

        this.map.lineWidth = availablePixels * 0.005;
        
        this.map.beginPath();
        
        this.map.arc(0, 0, this.availablePixels * 0.05, 0, 2 * Math.PI);

        this.map.stroke();

        this.map.restore();

    }

    renderDamgeIndicator() {

        const totalLengthOfObject = 32;

        //////////
        // Hull //
        //////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        if (this.playerShip.HullStrength / this.playerShip.MaxHullStrength <= .33) {
            this.map.strokeStyle = "rgba(255, 0, 0, 1.0)";
            this.map.fillStyle = "rgba(100, 0, 0, 1.0)";
        }
        else if (this.playerShip.HullStrength / this.playerShip.MaxHullStrength <= .66) {
            this.map.strokeStyle = "rgba(255, 255, 0, 1.0)";
            this.map.fillStyle = "rgba(100, 100, 0, 1.0)";
        }
        else {
            this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";
            this.map.fillStyle = "rgba(0, 100, 0, 1.0)";
        }
        
        this.map.lineWidth =  0.01;

        this.map.lineJoin = "round";

        this.map.beginPath();

        this.map.moveTo(-0.05, -0.5);

        this.map.lineTo(0.05, -0.5);

        this.map.lineTo(0.1, -0.2);

        this.map.lineTo(0.2, -0.1);

        this.map.lineTo(0.2, 0.1);

        this.map.lineTo(0.4, 0.3);

        this.map.lineTo(0.4, 0.4);

        this.map.lineTo(0.2, 0.4);

        this.map.lineTo(0.2, 0.5);

        this.map.lineTo(-0.2, 0.5);

        this.map.lineTo(-0.2, 0.4);

        this.map.lineTo(-0.4, 0.4);

        this.map.lineTo(-0.4, 0.3);

        this.map.lineTo(-0.2, 0.1);

        this.map.lineTo(-0.2, -0.1);

        this.map.lineTo(-0.1, -0.2);

        this.map.closePath();

        this.map.stroke();

        // map.fill();

        this.map.restore();

        ///////////////////
        // Plasma Cannon //
        ///////////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        if (this.playerShip.PlasmaCannonStrength / this.playerShip.MaxPlasmaCannonStrength <= .33) {
            this.map.strokeStyle = "rgba(255, 0, 0, 1.0)";
            this.map.fillStyle = "rgba(100, 0, 0, 1.0)";
        }
        else if (this.playerShip.PlasmaCannonStrength / this.playerShip.MaxPlasmaCannonStrength <= .66) {
            this.map.strokeStyle = "rgba(255, 255, 0, 1.0)";
            this.map.fillStyle = "rgba(100, 100, 0, 1.0)";
        }
        else {
            this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";
            this.map.fillStyle = "rgba(0, 100, 0, 1.0)";
        }

        this.map.lineWidth =  0.01;

        this.map.lineJoin = "round";

        this.map.beginPath();

        this.map.moveTo(-0.025, -0.48);

        this.map.lineTo(0.025, -0.48);

        this.map.lineTo(0.065, -0.22);

        this.map.lineTo(-0.065, -0.22);

        this.map.closePath();

        this.map.stroke();

        // map.fill();

        this.map.restore();

        this.map.restore();

        /////////////
        // Cockpit //
        /////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";

        this.map.fillStyle = "rgba(0, 100, 0, 1.0)";

        this.map.lineWidth =  0.01;

        this.map.lineJoin = "round";

        this.map.beginPath();

        this.map.moveTo(-0.05, -0.08);

        this.map.lineTo(0.05, -0.08);

        this.map.lineTo(0.08, -0.02);

        this.map.lineTo(0.08, 0.18);

        this.map.lineTo(-0.08, 0.18);

        this.map.lineTo(-0.08, -0.02);

        this.map.closePath();

        this.map.stroke();

        // map.fill();

        this.map.restore();

        this.map.restore();

        ///////////////////
        // Main Thruster //
        ///////////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        if (this.playerShip.ThrusterStrength / this.playerShip.MaxThrusterStrength <= .33) {
            this.map.strokeStyle = "rgba(255, 0, 0, 1.0)";
            this.map.fillStyle = "rgba(100, 0, 0, 1.0)";
        }
        else if (this.playerShip.ThrusterStrength / this.playerShip.MaxThrusterStrength <= .66) {
            this.map.strokeStyle = "rgba(255, 255, 0, 1.0)";
            this.map.fillStyle = "rgba(100, 100, 0, 1.0)";
        }
        else {
            this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";
            this.map.fillStyle = "rgba(0, 100, 0, 1.0)";
        }

        this.map.lineWidth =  0.01;

        this.map.lineJoin = "round";

        this.map.beginPath();

        this.map.moveTo(-0.08, 0.32);

        this.map.lineTo(0.08, 0.32);

        this.map.lineTo(0.08, 0.45);

        this.map.lineTo(0.05, 0.48);

        this.map.lineTo(-0.05, 0.48);

        this.map.lineTo(-0.08, 0.45);

        this.map.closePath();

        this.map.stroke();

        // map.fill();

        this.map.restore();

        this.map.restore();

        /////////////////////
        // Right Capacitor //
        /////////////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";

        this.map.fillStyle = "rgba(0, 100, 0, 1.0)";

        this.map.lineWidth =  0.01;

        this.map.lineJoin = "round";

        this.map.beginPath();

        this.map.moveTo(0.22, 0.16);

        this.map.lineTo(0.38, 0.32);

        this.map.lineTo(0.38, 0.38);

        this.map.lineTo(0.22, 0.38);

        this.map.closePath();

        this.map.stroke();

        this.map.restore();

        this.map.restore();

        /////////////////////
        // Left Capacitor ///
        /////////////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";

        this.map.fillStyle = "rgba(0, 100, 0, 1.0)";

        this.map.lineWidth =  0.01;

        this.map.lineJoin = "round";

        this.map.beginPath();

        this. map.moveTo(-0.22, 0.16);

        this.map.lineTo(-0.38, 0.32);

        this.map.lineTo(-0.38, 0.38);

        this.map.lineTo(-0.22, 0.38);

        this.map.closePath();

        this.map.stroke();

        this.map.restore();

        this.map.restore();

        ////////////////////
        // Ship Computer ///
        ////////////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";

        this.map.fillStyle = "rgba(0, 100, 0, 1.0)";

        this.map.lineWidth =  0.01;

        this.map.lineJoin = "round";

        this.map.beginPath();

        this.map.moveTo(-0.06, -0.02);

        this.map.lineTo(-0.04, -0.06);

        this.map.lineTo(0.04, -0.06);

        this.map.lineTo(0.06, -0.02);

        this.map.closePath();

        this.map.stroke();

        this.map.restore();

        this.map.restore();

        //////////////////////////
        // Life Support System ///
        //////////////////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";

        this.map.fillStyle = "rgba(0, 100, 0, 1.0)";

        this.map.lineWidth =  0.01;

        this.map.lineJoin = "round";

        this.map.beginPath();

        this.map.moveTo(-0.06, 0.12);

        this.map.lineTo(0.06, 0.12);

        this.map.lineTo(0.06, 0.16);

        this.map.lineTo(-0.06, 0.16);

        this.map.closePath();

        this.map.stroke();

        this.map.restore();

        this.map.restore();

        ////////////
        // Pilot ///
        ////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";

        this.map.fillStyle = "rgba(0, 100, 0, 1.0)";

        this.map.lineWidth =  0.01;

        this.map.beginPath();

        this.map.arc(0, 0.05, 0.05, 0, 2 * Math.PI);

        this.map.stroke();

        this.map.restore();

        this.map.restore();

        /////////////
        // Reactor //
        /////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";

        this.map.fillStyle = "rgba(0, 100, 0, 1.0)";

        this.map.lineWidth =  0.01;

        this.map.beginPath();

        this.map.moveTo(-0.05, 0.22);

        this.map.lineTo(0.05, 0.22);

        this.map.bezierCurveTo(0.1, 0.22, 0.1, 0.28, 0.05, 0.28);

        this.map.lineTo(-0.05, 0.28);

        this.map.bezierCurveTo(-0.1, 0.28, -0.1, 0.22, -0.05, 0.22);

        this.map.stroke();

        this.map.restore();

        //////////////////////
        // Shield Generator //
        //////////////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";

        this.map.fillStyle = "rgba(0, 100, 0, 1.0)";

        this.map.lineWidth =  0.01;

        this.map.beginPath();

        this.map.arc(0, -0.15, 0.04, 0, 2 * Math.PI);

        this.map.stroke();

        this.map.restore();

    }
}