export function renderDebris(map, debris, worldPixelsPerMeter) {
    map.save();

    map.translate(debris.locationX * worldPixelsPerMeter, debris.locationY * worldPixelsPerMeter);

    map.rotate(debris.facing * Math.PI / 180);

    map.scale(debris.size * worldPixelsPerMeter, debris.size * worldPixelsPerMeter);

    map.strokeStyle = 'rgba(50, 50, 50, 1)';

    map.lineWidth = 0.1;

    map.lineJoin = 'round';

    map.fillStyle = 'rgba(100, 100, 100, 1)';

    map.beginPath();

    map.moveTo(-0.8, 0.0);

    map.lineTo(-0.4, 0.6);

    map.lineTo(-0.2, 0.2);

    map.lineTo(0.2, 0.8);

    map.lineTo(0.6, 0.2);

    map.lineTo(0.2, 0.2);

    map.lineTo(0.0, -0.4);

    map.lineTo(-0.8, 0.0);

    map.closePath();

    map.moveTo(0.4, 0.0);

    map.lineTo(0.8, -0.4);

    map.lineTo(0.6, -0.8);

    map.lineTo(0.4, -0.6);

    map.lineTo(0.2, -0.8);

    map.lineTo(0.2, -0.6);

    map.lineTo(0.4, 0.0);

    map.closePath();

    map.moveTo(-0.8, -0.2);

    map.lineTo(-0.4, -0.2);

    map.lineTo(0.0, -0.6);

    map.lineTo(-0.4, -0.8);

    map.lineTo(-0.6, -0.4);

    map.lineTo(-0.8, -0.6);

    map.closePath();

    map.stroke();

    map.fill();

    map.restore();
}
