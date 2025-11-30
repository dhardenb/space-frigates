export const AI_BASE_LENGTH = 240;
export const AI_SHELL_POINTS = [];
export const AI_HEAD_POINTS = [];
export const AI_TAIL_POINTS = [];
export const AI_SCUTES = [];
export const AI_RIM_LIGHTS = [];
export const AI_SIDE_ROWS = [
    {y: -70, x: 95, w: 70, h: 50},
    {y: -28, x: 118, w: 76, h: 56},
    {y: 18, x: 126, w: 78, h: 58},
    {y: 66, x: 104, w: 72, h: 52}
];

export function buildAiGeometry() {
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

export function ensureAiGeometry() {
    if (!AI_SHELL_POINTS.length) {
        buildAiGeometry();
    }
}
