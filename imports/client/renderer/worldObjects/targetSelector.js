export function renderTargetSelector(map, {
    targetX,
    targetY,
    worldPixelsPerMeter,
    color = 'rgba(150, 150, 150, 0.9)',
    diameterMeters = 7,
    fillColor = null,
}) {
    if (!map || !Number.isFinite(targetX) || !Number.isFinite(targetY) || !Number.isFinite(worldPixelsPerMeter)) {
        return;
    }

    const radiusMeters = Math.max(diameterMeters / 2, 0);
    const ppm = worldPixelsPerMeter;
    const radiusPx = radiusMeters * ppm;
    const strokeWidthPx = Math.max(ppm * 0.08, 1);

    map.save();
    map.translate(targetX * ppm, targetY * ppm);
    map.lineWidth = strokeWidthPx;
    map.strokeStyle = color;

    map.beginPath();
    map.arc(0, 0, radiusPx, 0, 2 * Math.PI);
    if (fillColor) {
        map.fillStyle = fillColor;
        map.fill();
    }
    map.stroke();

    const crossArmLengthPx = radiusPx * 0.85;

    map.beginPath();
    map.moveTo(-crossArmLengthPx, 0);
    map.lineTo(crossArmLengthPx, 0);
    map.moveTo(0, -crossArmLengthPx);
    map.lineTo(0, crossArmLengthPx);
    map.stroke();

    map.restore();
}
