import {roundRectPath} from './drawHelpers.js';
import {
    AI_BASE_LENGTH,
    AI_HEAD_POINTS,
    AI_SCUTES,
    AI_SHELL_POINTS,
    AI_TAIL_POINTS,
    ensureAiGeometry
} from './aiGeometry.js';

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

export function drawAiJaggedTurtle(ctx, pixelScale, shipType, timeSeconds = 0) {
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
