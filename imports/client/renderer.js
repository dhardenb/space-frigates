import {Howl} from 'howler';
import {Client} from './client.js';

const HUMAN_SHIP_BASE_LENGTH = 208;

function colorWithAlpha(color, alpha) {
    if (typeof color !== 'string') {
        return color;
    }
    if (color.startsWith('rgba')) {
        return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)/, (match, r, g, b) => `rgba(${r},${g},${b},${alpha})`);
    }
    if (color.startsWith('rgb')) {
        return color.replace(/rgb\(([^,]+),([^,]+),([^,]+)\)/, (match, r, g, b) => `rgba(${r},${g},${b},${alpha})`);
    }
    return color;
}

function roundRectPath(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

function metalGradient(ctx, x0, y0, x1, y1, strength = 1) {
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0.00, `rgba(25,28,36,${strength})`);
    gradient.addColorStop(0.18, `rgba(95,102,116,${strength})`);
    gradient.addColorStop(0.40, `rgba(42,46,58,${strength})`);
    gradient.addColorStop(0.62, `rgba(150,155,168,${strength})`);
    gradient.addColorStop(1.00, `rgba(35,38,49,${strength})`);
    return gradient;
}

function paintPanelLines(ctx, cx, cy, scale = 1) {
    ctx.save();
    ctx.strokeStyle = "rgba(210,220,255,0.20)";
    ctx.lineWidth = Math.max(1, 1.2 * scale);
    for (let i = -2; i <= 2; i++) {
        const x = cx + i * 10 * scale;
        ctx.beginPath();
        ctx.moveTo(x, cy - 155 * scale);
        ctx.lineTo(x, cy + 135 * scale);
        ctx.stroke();
    }
    const ribs = [-120,-90,-60,-30,0,30,60,90,120];
    for (const r of ribs) {
        ctx.beginPath();
        ctx.moveTo(cx - 24 * scale, cy + r * scale);
        ctx.lineTo(cx + 24 * scale, cy + r * scale);
        ctx.stroke();
    }
    ctx.restore();
}

function drawFederationSymbol(ctx, x, y, r) {
    ctx.save();
    ctx.lineWidth = Math.max(1, r * 0.14);
    ctx.strokeStyle = "rgba(170,220,255,0.85)";
    ctx.fillStyle = "rgba(15,40,70,0.55)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(210,245,255,0.9)";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - r * 0.42, y);
    ctx.lineTo(x + r * 0.42, y);
    ctx.moveTo(x, y - r * 0.42);
    ctx.lineTo(x, y + r * 0.42);
    ctx.stroke();
    const hg = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, 0, x, y, r);
    hg.addColorStop(0, "rgba(255,255,255,0.20)");
    hg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function glowDot(ctx, x, y, r, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.35, colorWithAlpha(color, 0.35));
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawRunningLights(ctx, timeSeconds) {
    const pulseL = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(timeSeconds * 2.8));
    const pulseR = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(timeSeconds * 2.8 + Math.PI));
    glowDot(ctx, -125, 30, 18, "rgba(255,80,80,1)", 0.55 * pulseL);
    glowDot(ctx, 125, 30, 18, "rgba(80,255,140,1)", 0.55 * pulseR);
    const beacon = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(timeSeconds * 6.0));
    glowDot(ctx, 0, -150, 12, "rgba(120,190,255,1)", 0.35 * beacon);
    const startY = -110;
    const endY = 120;
    const phase = (timeSeconds * 0.55) % 1;
    const y = startY + (endY - startY) * phase;
    const intensity = 0.15 + 0.85 * (1 - Math.abs(phase - 0.5) * 2);
    glowDot(ctx, 0, y, 22, "rgba(90,170,255,1)", 0.25 * intensity);
    const nodes = [-80, -50, -20, 10, 40, 70, 100];
    for (let i = 0; i < nodes.length; i++) {
        const localPhase = (timeSeconds * 1.4 - i * 0.22);
        const alpha = 0.12 + 0.28 * (0.5 + 0.5 * Math.sin(localPhase * 2.2));
        glowDot(ctx, 0, nodes[i], 10, "rgba(120,210,255,1)", alpha);
    }
}

function drawHumanShip(ctx, pixelScale, cockpitColor, timeSeconds = 0) {
    const scaleFactor = pixelScale / HUMAN_SHIP_BASE_LENGTH;
    ctx.save();
    ctx.scale(scaleFactor, scaleFactor);

    const bob = Math.sin(timeSeconds * 1.1) * 1.8;
    ctx.translate(0, bob);

    // main fuselage body
    roundRectPath(ctx, -26, -160, 52, 310, 18);
    ctx.fillStyle = metalGradient(ctx, -26, -160, 26, 160);
    ctx.fill();
    ctx.strokeStyle = "rgba(10,12,16,0.65)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // nose cone
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-22, -160);
    ctx.lineTo(0, -192);
    ctx.lineTo(22, -160);
    ctx.quadraticCurveTo(0, -148, -22, -160);
    ctx.closePath();
    const ng = ctx.createLinearGradient(0, -200, 0, -150);
    ng.addColorStop(0, "rgba(200,206,220,0.9)");
    ng.addColorStop(1, "rgba(40,44,58,0.95)");
    ctx.fillStyle = ng;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.stroke();
    ctx.restore();

    // canopy glass + health tint overlay
    ctx.save();
    roundRectPath(ctx, -16, -128, 32, 58, 14);
    const cg = ctx.createLinearGradient(-16, -128, 16, -70);
    cg.addColorStop(0, "rgba(30,80,210,0.70)");
    cg.addColorStop(0.5, "rgba(40,150,255,0.55)");
    cg.addColorStop(1, "rgba(20,60,140,0.55)");
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.strokeStyle = "rgba(180,220,255,0.28)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.ellipse(-6, -110, 6, 16, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = cockpitColor;
    roundRectPath(ctx, -16, -128, 32, 58, 14);
    ctx.fill();
    ctx.restore();

    paintPanelLines(ctx, 0, 0, 1);

    function drawWing(sign) {
        // swept wing plate with inset stripe and emblem
        ctx.save();
        ctx.translate(sign * 52, -5);
        ctx.beginPath();
        ctx.moveTo(0, -42);
        ctx.lineTo(sign * 70, -22);
        ctx.lineTo(sign * 70, 50);
        ctx.lineTo(0, 62);
        ctx.quadraticCurveTo(-8, 10, 0, -42);
        ctx.closePath();
        const wg = ctx.createLinearGradient(0, -40, sign * 90, 70);
        wg.addColorStop(0, "rgba(55,58,72,0.95)");
        wg.addColorStop(0.35, "rgba(135,140,152,0.92)");
        wg.addColorStop(1, "rgba(28,30,40,0.96)");
        ctx.fillStyle = wg;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sign * 10, -30);
        ctx.lineTo(sign * 56, -16);
        ctx.lineTo(sign * 56, 34);
        ctx.lineTo(sign * 10, 44);
        ctx.closePath();
        const bg = ctx.createLinearGradient(sign * 10, -30, sign * 60, 45);
        bg.addColorStop(0, "rgba(15,60,140,0.85)");
        bg.addColorStop(0.5, "rgba(35,120,220,0.70)");
        bg.addColorStop(1, "rgba(10,40,110,0.85)");
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.strokeStyle = "rgba(200,230,255,0.18)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (sign < 0) {
            drawFederationSymbol(ctx, sign * 28, 22, 14);
        }
        ctx.strokeStyle = "rgba(225,235,255,0.18)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(sign * 18, -6);
        ctx.lineTo(sign * 60, 6);
        ctx.moveTo(sign * 16, 52);
        ctx.lineTo(sign * 56, 40);
        ctx.stroke();
        ctx.restore();
    }
    drawWing(-1);
    drawWing(1);

    // blended wing root
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = metalGradient(ctx, -40, -30, 40, 30, 0.95);
    roundRectPath(ctx, -44, -30, 88, 80, 28);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    function drawEngine(sign) {
        // engine pod, coil, and flickering exhaust
        ctx.save();
        ctx.translate(sign * 32, 118);
        roundRectPath(ctx, -18, -46, 36, 72, 16);
        const eg = ctx.createLinearGradient(-18, -46, 18, 26);
        eg.addColorStop(0, "rgba(65,68,82,0.96)");
        eg.addColorStop(0.45, "rgba(155,160,174,0.92)");
        eg.addColorStop(1, "rgba(30,32,44,0.97)");
        ctx.fillStyle = eg;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.lineWidth = 2;
        ctx.stroke();
        roundRectPath(ctx, -12, -22, 24, 36, 12);
        const coil = ctx.createLinearGradient(-12, -22, 12, 14);
        coil.addColorStop(0, "rgba(25,85,190,0.85)");
        coil.addColorStop(0.5, "rgba(60,170,255,0.65)");
        coil.addColorStop(1, "rgba(20,70,160,0.85)");
        ctx.fillStyle = coil;
        ctx.fill();
        const gx = 0;
        const gy = 26;
        const gr = 18;
        const flicker = 0.75 + 0.25 * Math.sin(timeSeconds * 15.0 + sign * 1.3) + 0.08 * Math.sin(timeSeconds * 37.0 + sign * 2.2);
        const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        glow.addColorStop(0, `rgba(170,120,255,${0.55 * flicker})`);
        glow.addColorStop(0.35, `rgba(110,170,255,${0.28 * flicker})`);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(gx, gy, gr, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(220,220,255,0.28)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 26, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    drawEngine(-1);
    drawEngine(1);

    // aft taper and center spine
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-26, 150);
    ctx.lineTo(-18, 184);
    ctx.lineTo(18, 184);
    ctx.lineTo(26, 150);
    ctx.closePath();
    const ag = ctx.createLinearGradient(0, 150, 0, 190);
    ag.addColorStop(0, "rgba(120,125,140,0.92)");
    ag.addColorStop(1, "rgba(30,32,44,0.98)");
    ctx.fillStyle = ag;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "rgba(15,70,160,0.65)";
    roundRectPath(ctx, -6, -12, 12, 150, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(210,240,255,0.20)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // animated running lights (nav + scanner)
    drawRunningLights(ctx, timeSeconds);

    ctx.restore();
}

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

                if (gameObjects[i].Type == 'Human' || gameObjects[i].Type == 'Alpha' || gameObjects[i].Type == 'Bravo') {

                    this.renderShip(gameObjects[i]);

                }

                else if (gameObjects[i].Type == 'Particle') {

                    this.renderParticle(gameObjects[i]);

                }

                else if (gameObjects[i].Type == 'Thruster') {

                    this.renderThruster(gameObjects[i]);

                }

                else if (gameObjects[i].Type == 'Missile') {

                    this.renderMissle(gameObjects[i]);

                }

                else if (gameObjects[i].Type == 'Debris') {

                    this.renderDebris(gameObjects[i]);

                }

                else if (gameObjects[i].Type == 'Sound') {

                    this.renderSound(gameObjects[i]);

                }
            }
        }

        this.map.restore();

        this.map.save();

        this.renderMiniMap(playerShipId);

        if (Client.gameMode == 'START_MODE') {

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

        } else if (Client.gameMode == 'PLAY_MODE') {

            this.renderLeaderboard();

            this.renderHullStrength();

            this.renderFuelStatus();
        
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

        this.map.restore();

    }

    renderMiniMap(playerShipId) {
    
        this.map.save();

        this.map.translate(this.availableWidth - this.availablePixels / 12 - 20, this.availablePixels / 12 + 20);

        /////////////////////////////////
        // Render Background and Bezel //
        /////////////////////////////////

        this.map.save();

        this.map.beginPath();

        this.map.arc(0, 0, this.availablePixels / 12, 0, 2 * Math.PI);

        this.map.strokeStyle = "rgba(50, 50, 50, 1.0)";

        this.map.fillStyle = "rgba(0, 0, 0, 1.0)"

        this.map.lineWidth = 5;

        this.map.fill();

        this.map.stroke();

        this.map.clip()

        //////////////////////////////
        // Render ships and boundry //
        //////////////////////////////

        this.map.scale(this.miniMapZoomLevel, this.miniMapZoomLevel);

        this.map.translate(this.focalX, this.focalY);

        this.renderBoundry();

        for (let i=0, j=gameObjects.length; i<j; i++) {
            if (gameObjects[i].Type == 'Human' || gameObjects[i].Type == 'Alpha' || gameObjects[i].Type == 'Bravo') {
                this.renderMiniShip(gameObjects[i], playerShipId);
            }
        }

        this.map.restore();

        this.map.restore();
    }

    renderMiniShip(ship, playerShipId) {
    
        this.map.save();

        this.map.translate(ship.LocationX * this.worldPixelsPerMeter, ship.LocationY * this.worldPixelsPerMeter);

        this.map.scale(ship.Size * this.pixelsPerMeter, ship.Size * this.pixelsPerMeter);

        this.map.beginPath();

        this.map.arc(0, 0, 1.0, 0, 2 * Math.PI);

        let fillStyle = "";

        if (ship.Id == playerShipId) {
            fillStyle = "rgba(0, 128, 0, 1.0)";
        } else if (ship.Type == "Human") {
            fillStyle = "rgba(255, 0, 0, 1.0)";
        } else {
            fillStyle = "rgba(128, 128, 128, 1.0)";
        }

        this.map.fillStyle = fillStyle;

        this.map.fill();

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

    renderShip(ship) {

        this.map.save();

        this.map.translate(ship.LocationX * this.pixelsPerMeter, ship.LocationY * this.pixelsPerMeter);

        this.map.rotate(ship.Facing * Math.PI / 180);

        const shipScale = ship.Size * this.worldPixelsPerMeter;

        if (ship.ShieldStatus > 0) {
            this.map.save();
            this.map.scale(shipScale, shipScale);
            this.map.beginPath();
            this.map.arc(0, 0, 1, 0, 2 * Math.PI);
            this.map.lineWidth =  0.05;
            this.map.strokeStyle = "rgba(100, 200, 255, " + ship.ShieldStatus/150 + ")";
            this.map.stroke();
            this.map.fillStyle = "rgba(100, 200, 255, " + ship.ShieldStatus/300 + ")";
            this.map.fill();
            this.map.restore();
        }

        let cockpitColor = "red";
        if (ship.HullStrength >= 66) {
            cockpitColor = "green";
        } else if (ship.HullStrength >= 33) {
            cockpitColor = "yellow";
        }

        if (ship.Type == 'Human') {
            drawHumanShip(this.map, shipScale, cockpitColor, this.renderTimeSeconds);
        } else {
            this.map.save();
            this.map.scale(shipScale, shipScale);
            this.map.strokeStyle = "rgba(50, 50, 50, 1.0)";
            this.map.lineWidth =  0.1;
            this.map.lineJoin = "round";
            this.map.fillStyle = "rgba(100, 100, 100, 1.0)";
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
            this.map.fill();
            this.map.fillStyle = cockpitColor;
            this.map.lineWidth =  0.05;
            this.map.beginPath();
            this.map.moveTo(0.0, -0.1);
            this.map.lineTo(-0.1, 0.3);
            this.map.lineTo(0.1, 0.3);
            this.map.closePath();
            this.map.stroke();
            this.map.fill();
            this.map.restore();
        }

        this.map.restore();

        this.map.save();

        let nameToDraw = "";

        if (ship.Type == 'Human') {
            if (this.playerName == "") {
                nameToDraw = "GUEST";
            } else {
                nameToDraw = this.playerName;
            }
        }

        this.map.fillStyle = "gray";

        this.map.font = "12px Arial";

        this.map.translate(ship.LocationX * this.worldPixelsPerMeter - this.map.measureText(nameToDraw).width / 2, ship.LocationY * this.worldPixelsPerMeter + ship.Size * this.worldPixelsPerMeter * 1.5);

        this.map.fillText(nameToDraw, 0, 0);

        this.map.restore();

    }

    renderParticle(particle) {

        this.map.save();

        this.map.translate(particle.LocationX * this.worldPixelsPerMeter, particle.LocationY * this.worldPixelsPerMeter);

        this.map.beginPath();

        this.map.arc(0, 0, particle.Size * 0.5 * this.worldPixelsPerMeter, 0, 2 * Math.PI);

        this.map.fillStyle = "rgba(255," + Math.floor(Math.random() * 255) + ", 0," + Math.random() + ")";

        this.map.fill();

        this.map.restore();

    }

    renderThruster(thruster) {

        this.map.save();

        this.map.translate(thruster.LocationX * this.worldPixelsPerMeter, thruster.LocationY * this.worldPixelsPerMeter);

        this.map.rotate(thruster.Facing * Math.PI / 180);

        this.map.scale(thruster.Size * this.worldPixelsPerMeter, thruster.Size * this.worldPixelsPerMeter);

        this.map.strokeStyle = "rgba(255, 0, 0, 1)";

        this.map.lineWidth = 0.1;

        this.map.lineJoin = "round";

        this.map.fillStyle = "rgba(255, 255, 0, 1)";

        this.map.beginPath();

        this.map.moveTo(-0.2, -0.5);

        this.map.lineTo(0.2, -0.5);

        this.map.lineTo(0.0, 0.5);

        this.map.closePath();

        this.map.stroke();

        this.map.fill();

        this.map.restore();

    }

    renderMissle(missile) {

        this.map.save();

        this.map.translate(missile.LocationX * this.worldPixelsPerMeter, missile.LocationY * this.worldPixelsPerMeter);

        this.map.rotate(missile.Facing * Math.PI / 180);

        this.map.scale(missile.Size * this.worldPixelsPerMeter, missile.Size * this.worldPixelsPerMeter);

        this.map.strokeStyle = "rgba(255, 255, 255, " + missile.Fuel / 60 + ")";

        this.map.lineWidth = 0.1;

        this.map.fillStyle = "rgba(0, 255, 255, " + missile.Fuel / 60 + ")";

        this.map.beginPath();

        this.map.moveTo(-0.1, -0.5);

        this.map.lineTo(0.1, -0.5);

        this.map.lineTo(0.1, 0.5);

        this.map.lineTo(-0.1, 0.5);

        this.map.closePath();

        this.map.stroke();

        this.map.fill();

        this.map.restore();

    }

    renderDebris(debris) {

        this.map.save();

        this.map.translate(debris.LocationX * this.worldPixelsPerMeter, debris.LocationY * this.worldPixelsPerMeter);

        this.map.rotate(debris.Facing * Math.PI / 180);

        this.map.scale(debris.Size * this.worldPixelsPerMeter, debris.Size * this.worldPixelsPerMeter);

        this.map.strokeStyle = "rgba(50, 50, 50, 1)";

        this.map.lineWidth = 0.1;

        this.map.lineJoin = "round";

        this.map.fillStyle = "rgba(100, 100, 100, 1)";

        this.map.beginPath();

        this.map.moveTo(-0.8, 0.0);

        this.map.lineTo(-0.4, 0.6);

        this.map.lineTo(-0.2, 0.2);

        this.map.lineTo(0.2, 0.8);

        this.map.lineTo(0.6, 0.2);

        this.map.lineTo(0.2, 0.2);

        this.map.lineTo(0.0, -0.4);

        this.map.lineTo(-0.8, 0.0);

        this.map.closePath();

        this.map.moveTo(0.4, 0.0);

        this.map.lineTo(0.8, -0.4);

        this.map.lineTo(0.6, -0.8);

        this.map.lineTo(0.4, -0.6);

        this.map.lineTo(0.2, -0.8);

        this.map.lineTo(0.2, -0.6);

        this.map.lineTo(0.4, 0.0);

        this.map.closePath();

        this.map.moveTo(-0.8, -0.2);

        this.map.lineTo(-0.4, -0.2);

        this.map.lineTo(0.0, -0.6);

        this.map.lineTo(-0.4, -0.8);

        this.map.lineTo(-0.6, -0.4);

        this.map.lineTo(-0.8, -0.6);

        this.map.closePath();
        
        this.map.stroke();
        
        this.map.fill();

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

            if (sound.SoundType == "MissileFired") {
                
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

    renderNameInputBox() {

        this.map.save();

        this.map.translate(this.availableWidth / 2 - 100, this.availableHeight / 2);

        this.map.strokeStyle = "yellow";

        this.map.strokeRect(0, 0, 200, 50);

        this.map.restore();

    }

    renderName() {

        this.map.save();

        let textToRender = "";

        if (this.playerName == "") {

            textToRender = "GUEST";

            this.map.fillStyle = "gray";

            this.map.font = "italic 20px Arial";

        } else {

            textToRender = this.playerName;

            this.map.fillStyle = "yellow";

            this.map.font = "20px Arial";

        }

        this.map.translate(this.availableWidth / 2 - this.map.measureText(textToRender).width / 2, this.availableHeight / 2 + 35);

        this.map.fillText(textToRender, 0, 0);

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

        this.map.translate(0, this.availableHeight - 125);

        this.map.fillStyle = "rgba(128, 128, 128, 0.5)";

        this.map.font = "20px Arial";

        this.map.fillText("HULL ", 0, 0);

        this.map.restore();

        this.map.save();

        this.map.translate(125, this.availableHeight - 144);

        this.renderMeter(hullStrengthDisplayValue);

        this.map.restore();

    }

    renderFuelStatus() {

        let fuelDisplayValue = Math.floor(this.playerShip.Fuel);

        this.map.save();

        this.map.translate(0, this.availableHeight - 90);

        this.map.fillStyle = "rgba(128, 128, 128, 0.5)";

        this.map.font = "20px Arial";

        this.map.fillText("FUEL ", 0, 0);

        this.map.restore();

        this.map.save();

        this.map.translate(125, this.availableHeight - 108);

        this.renderMeter(fuelDisplayValue / 1000 * 100);

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

        this.map.fillText("S or DOWN ARROW => Stop", 0, 0);

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