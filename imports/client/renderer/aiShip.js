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
