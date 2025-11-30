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
