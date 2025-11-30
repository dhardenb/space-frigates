export function renderThruster(map, thruster, worldPixelsPerMeter) {
    map.save();

    map.translate(thruster.LocationX * worldPixelsPerMeter, thruster.LocationY * worldPixelsPerMeter);

    map.rotate(thruster.Facing * Math.PI / 180);

    map.scale(thruster.Size * worldPixelsPerMeter, thruster.Size * worldPixelsPerMeter);

    map.strokeStyle = 'rgba(255, 0, 0, 1)';

    map.lineWidth = 0.1;

    map.lineJoin = 'round';

    map.fillStyle = 'rgba(255, 255, 0, 1)';

    map.beginPath();

    map.moveTo(-0.2, -0.5);

    map.lineTo(0.2, -0.5);

    map.lineTo(0.0, 0.5);

    map.closePath();

    map.stroke();

    map.fill();

    map.restore();
}
