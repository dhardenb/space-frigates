export function colorWithAlpha(color, alpha) {
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

export function roundRectPath(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

export function drawFederationSymbol(ctx, x, y, r) {
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
