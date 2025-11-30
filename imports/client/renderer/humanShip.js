import {roundRectPath} from './drawHelpers.js';

export const HUMAN_SHIP_BASE_LENGTH = 208;

export function drawHumanShip(ctx, pixelScale) {
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
