const AI_BASE_LENGTH = 240;
const AI_SHELL_POINTS = [];
const AI_HEAD_POINTS = [];
const AI_TAIL_POINTS = [];
const AI_SCUTES = [];
const AI_RIM_LIGHTS = [];
const AI_SIDE_ROWS = [
    {y: -70, x: 95, w: 70, h: 50},
    {y: -28, x: 118, w: 76, h: 56},
    {y: 18, x: 126, w: 78, h: 58},
    {y: 66, x: 104, w: 72, h: 52}
];

function buildAiGeometry() {
    AI_SHELL_POINTS.length = 0;
    AI_HEAD_POINTS.length = 0;
    AI_TAIL_POINTS.length = 0;
    AI_SCUTES.length = 0;
    AI_RIM_LIGHTS.length = 0;

    const rnd = (seed => {
        let s = seed >>> 0;
        return () => {
            s ^= (s << 13) >>> 0;
            s ^= (s >>> 17) >>> 0;
            s ^= (s << 5) >>> 0;
            return (s >>> 0) / 4294967296;
        };
    })(0xB10BDA7A);

    const N = 72;
    const rx = 178;
    const ry = 152;
    for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        let rX = rx;
        let rY = ry;
        const harm = Math.sin(a * 3.0 + 0.6) * 10 + Math.sin(a * 7.0 - 1.2) * 6;
        const jitter = (rnd() - 0.5) * 10;
        const spikeEvery = 5;
        const isSpike = (i % spikeEvery === 0);
        const spike = isSpike ? (16 + rnd() * 22) : (2 + rnd() * 6);
        const side = Math.abs(Math.cos(a));
        const sideBoost = Math.pow(side, 2.2) * (10 + rnd() * 10);
        const topness = Math.max(0, Math.cos(a));
        const bottomness = Math.max(0, -Math.cos(a));
        const damp = 1 - 0.55 * topness - 0.25 * bottomness;
        const out = (harm + jitter) + (spike + sideBoost) * damp;
        const rawX = Math.sin(a) * (rX + out * 0.70);
        const dir = Math.sign(Math.sin(a)) || (i < N / 2 ? 1 : -1);
        const x = dir * Math.abs(rawX);
        const y = Math.cos(a) * (rY + out * 0.60);
        AI_SHELL_POINTS.push({x, y, spike: isSpike});
    }

    for (let i = 0; i < 52; i++) {
        AI_RIM_LIGHTS.push({k: i / 52, j: (rnd() - 0.5) * 0.06});
    }

    const y0 = -152;
    AI_HEAD_POINTS.push(
        {x: -30, y: y0 - 4},
        {x: -55, y: y0 - 28},
        {x: -30, y: y0 - 62},
        {x: -12, y: y0 - 78},
        {x: 0, y: y0 - 92},
        {x: 12, y: y0 - 78},
        {x: 30, y: y0 - 62},
        {x: 55, y: y0 - 28},
        {x: 30, y: y0 - 4},
        {x: 18, y: y0 - 18},
        {x: 0, y: y0 - 8},
        {x: -18, y: y0 - 18}
    );

    const by = 155;
    AI_TAIL_POINTS.push(
        {x: -22, y: by - 2},
        {x: -8, y: by + 18},
        {x: -18, y: by + 34},
        {x: -2, y: by + 52},
        {x: 0, y: by + 72},
        {x: 2, y: by + 52},
        {x: 18, y: by + 34},
        {x: 8, y: by + 18},
        {x: 22, y: by - 2}
    );

    const spineY = [-92, -56, -18, 22, 64, 106];
    for (let i = 0; i < spineY.length; i++) {
        const y = spineY[i];
        const w = 60 + (i % 2 ? 10 : 0) + (rnd() - 0.5) * 10;
        const h = 48 + (rnd() - 0.5) * 8;
        AI_SCUTES.push({
            pts: [
                {x: 0, y: y - h * 0.70},
                {x: w * 0.55, y: y - h * 0.20},
                {x: w * 0.18, y: y + h * 0.62},
                {x: 0, y: y + h * 0.78},
                {x: -w * 0.18, y: y + h * 0.62},
                {x: -w * 0.55, y: y - h * 0.20}
            ],
            idx: i,
            stripe: i
        });
    }
    for (let i = 0; i < AI_SIDE_ROWS.length; i++) {
        const r = AI_SIDE_ROWS[i];
        for (const s of [-1, 1]) {
            const x0 = s * r.x;
            const y0r = r.y;
            const w = r.w + (rnd() - 0.5) * 10;
            const h = r.h + (rnd() - 0.5) * 8;
            const stripeIndex = spineY.length + i;
            AI_SCUTES.push({
                pts: [
                    {x: x0, y: y0r - h * 0.72},
                    {x: x0 + s * w * 0.62, y: y0r - h * 0.12},
                    {x: x0 + s * w * 0.26, y: y0r + h * 0.70},
                    {x: x0, y: y0r + h * 0.88},
                    {x: x0 - s * w * 0.22, y: y0r + h * 0.62},
                    {x: x0 - s * w * 0.40, y: y0r + h * 0.15}
                ],
                idx: 100 + i * 2 + (s > 0 ? 1 : 0),
                side: s,
                stripe: stripeIndex
            });
            const mirroredPts = [
                {x: -x0, y: y0r - h * 0.72},
                {x: -x0 + -s * w * 0.62, y: y0r - h * 0.12},
                {x: -x0 + -s * w * 0.26, y: y0r + h * 0.70},
                {x: -x0, y: y0r + h * 0.88},
                {x: -x0 + s * w * 0.22, y: y0r + h * 0.62},
                {x: -x0 + s * w * 0.40, y: y0r + h * 0.15}
            ];
            AI_SCUTES.push({
                pts: mirroredPts,
                idx: 100 + i * 2 + (s > 0 ? 0 : 1),
                side: -s,
                stripe: stripeIndex
            });
        }
    }
}

function ensureAiGeometry() {
    if (!AI_SHELL_POINTS.length) {
        buildAiGeometry();
    }
}

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

function drawFederationSymbol(ctx, x, y, r) {
    ctx.save();
    ctx.lineWidth = Math.max(1, r * 0.14);
    ctx.strokeStyle = "rgba(180,220,255,0.85)";
    ctx.fillStyle = "rgba(18,35,60,0.7)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(220,245,255,0.9)";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - r * 0.42, y);
    ctx.lineTo(x + r * 0.42, y);
    ctx.moveTo(x, y - r * 0.42);
    ctx.lineTo(x, y + r * 0.42);
    ctx.stroke();
    ctx.restore();
}

function drawHumanShip(ctx, pixelScale) {
    const scaleFactor = pixelScale / HUMAN_SHIP_BASE_LENGTH;
    ctx.save();
    ctx.scale(scaleFactor, scaleFactor);
    const accentColor = "#1a67c9";

    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.ellipse(0, 20, 80, 170, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    roundRectPath(ctx, -26, -160, 52, 310, 18);
    ctx.fillStyle = "#3b4251";
    ctx.fill();
    ctx.strokeStyle = "rgba(10,12,16,0.65)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-22, -160);
    ctx.lineTo(0, -192);
    ctx.lineTo(22, -160);
    ctx.quadraticCurveTo(0, -148, -22, -160);
    ctx.closePath();
    ctx.fillStyle = "#2a303d";
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.stroke();
    ctx.restore();

    ctx.save();
    roundRectPath(ctx, -16, -128, 32, 58, 14);
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = accentColor;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(210,230,255,0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    function drawWing(sign) {
        ctx.save();
        ctx.translate(sign * 52, -5);
        ctx.beginPath();
        ctx.moveTo(0, -42);
        ctx.lineTo(sign * 70, -22);
        ctx.lineTo(sign * 70, 50);
        ctx.lineTo(0, 62);
        ctx.quadraticCurveTo(-8, 10, 0, -42);
        ctx.closePath();
        ctx.fillStyle = "#2c313c";
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
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = accentColor;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "rgba(200,230,255,0.18)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }
    drawWing(-1);
    drawWing(1);

    ctx.save();
    roundRectPath(ctx, -44, -30, 88, 80, 28);
    ctx.fillStyle = "#2f353f";
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    function drawEngine(sign) {
        ctx.save();
        ctx.translate(sign * 32, 118);
        roundRectPath(ctx, -18, -46, 36, 72, 16);
        ctx.fillStyle = "#2a2f39";
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.lineWidth = 2;
        ctx.stroke();
        roundRectPath(ctx, -12, -22, 24, 36, 12);
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = accentColor;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
    }
    drawEngine(-1);
    drawEngine(1);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-26, 150);
    ctx.lineTo(-18, 184);
    ctx.lineTo(18, 184);
    ctx.lineTo(26, 150);
    ctx.closePath();
    ctx.fillStyle = "#4e555f";
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = accentColor;
    roundRectPath(ctx, -6, -12, 12, 150, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(210,240,255,0.20)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
}

function drawAiJaggedTurtle(ctx, pixelScale, shipType, timeSeconds = 0) {
    ensureAiGeometry();
    const scaleFactor = pixelScale / AI_BASE_LENGTH;
    ctx.save();
    ctx.scale(scaleFactor, scaleFactor);

    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.ellipse(0, 90, 220, 140, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    for (const side of [-1, 1]) {
        for (const front of [-1, 1]) {
            drawAiLeg(ctx, side, front);
        }
    }

    drawAiTail(ctx);
    drawAiShell(ctx);
    drawAiHead(ctx);
    drawAiScutes(ctx);

    ctx.restore();
}

function drawAiLeg(ctx, side, front) {
    const s = side;
    const f = front;
    const baseX = s * 170;
    const baseY = f < 0 ? -48 : 88;
    const rot = s * (f < 0 ? 0.55 : 0.35);

    ctx.save();
    ctx.translate(baseX, baseY);
    ctx.rotate(rot);

    const pts = [
        {x: 0, y: -22},
        {x: s * 28, y: -40},
        {x: s * 62, y: -22},
        {x: s * 78, y: 6},
        {x: s * 72, y: 22},
        {x: s * 82, y: 42},
        {x: s * 62, y: 56},
        {x: s * 40, y: 50},
        {x: s * 18, y: 62},
        {x: 0, y: 42},
        {x: -s * 10, y: 22},
        {x: -s * 8, y: -2}
    ];
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = "#1f2f24";
    ctx.strokeStyle = "rgba(0,0,0,0.66)";
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function drawAiTail(ctx) {
    ctx.save();
    ctx.translate(0, 155);
    ctx.rotate(0);
    ctx.beginPath();
    ctx.moveTo(AI_TAIL_POINTS[0].x, AI_TAIL_POINTS[0].y - 155);
    for (let i = 1; i < AI_TAIL_POINTS.length; i++) {
        ctx.lineTo(AI_TAIL_POINTS[i].x, AI_TAIL_POINTS[i].y - 155);
    }
    ctx.closePath();
    ctx.fillStyle = "#1f2f24";
    ctx.strokeStyle = "rgba(0,0,0,0.66)";
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function drawAiShell(ctx) {
    ctx.beginPath();
    ctx.moveTo(AI_SHELL_POINTS[0].x, AI_SHELL_POINTS[0].y);
    for (let i = 1; i < AI_SHELL_POINTS.length; i++) {
        ctx.lineTo(AI_SHELL_POINTS[i].x, AI_SHELL_POINTS[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = "#1a3b2b";
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.72)";
    ctx.lineWidth = 4;
    ctx.stroke();
}

function drawAiHead(ctx) {
    ctx.beginPath();
    ctx.moveTo(AI_HEAD_POINTS[0].x, AI_HEAD_POINTS[0].y);
    for (let i = 1; i < AI_HEAD_POINTS.length; i++) {
        ctx.lineTo(AI_HEAD_POINTS[i].x, AI_HEAD_POINTS[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = "#1f2f24";
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.70)";
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawAiScutes(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = "rgba(0,0,0,0.62)";
    ctx.lineWidth = 2;
    for (let idx = 0; idx < AI_SCUTES.length; idx++) {
        const scute = AI_SCUTES[idx];
        const pts = scute.pts;
        const stripe = scute.stripe || 0;
        ctx.fillStyle = stripe % 2 === 0 ? "#293c2d" : "#1e2f23";
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
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

                    this.renderShip(gameObjects[i]);

                }

                else if (gameObjects[i].Type == 'Particle') {

                    this.renderParticle(gameObjects[i]);

                }

                else if (gameObjects[i].Type == 'Thruster') {

                    this.renderThruster(gameObjects[i]);

                }

                else if (gameObjects[i].Type == 'Laser') {

                    this.renderLaser(gameObjects[i]);

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
            if (gameObjects[i].Type == 'Ship') {
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

        let fillStyle = "rgba(128, 128, 128, 1.0)";

        if (ship.Id == playerShipId) {
            fillStyle = "rgba(0, 128, 0, 1.0)";
        } else if (ship.pilotType === "Human") {
            fillStyle = "rgba(255, 0, 0, 1.0)";
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

        if (ship.shipTypeId === 'Viper') {
            drawHumanShip(this.map, shipScale);
        } else if (ship.shipTypeId === 'Turtle') {
            drawAiJaggedTurtle(this.map, shipScale, ship.aiProfile, this.renderTimeSeconds);
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

        if (ship.Id === (this.playerShip && this.playerShip.Id) && ship.pilotType === 'Human') {
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

    renderLaser(laser) {

        this.map.save();

        this.map.translate(laser.LocationX * this.worldPixelsPerMeter, laser.LocationY * this.worldPixelsPerMeter);

        this.map.rotate(laser.Facing * Math.PI / 180);

        this.map.scale(laser.Size * this.worldPixelsPerMeter, laser.Size * this.worldPixelsPerMeter);

        this.map.strokeStyle = "rgba(255, 255, 255, " + laser.Fuel / 60 + ")";

        this.map.lineWidth = 0.1;

        this.map.fillStyle = "rgba(0, 255, 255, " + laser.Fuel / 60 + ")";

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