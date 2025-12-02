export function renderLaser(map, laser, worldPixelsPerMeter) {
    map.save();

    map.translate(laser.locationX * worldPixelsPerMeter, laser.locationY * worldPixelsPerMeter);

    map.rotate(laser.facing * Math.PI / 180);

    map.scale(laser.size * worldPixelsPerMeter, laser.size * worldPixelsPerMeter);

    const maxFuel = laser.maxFuel || 1;

    map.strokeStyle = `rgba(255, 255, 255, ${laser.fuel / maxFuel})`;

    map.lineWidth = 0.1;

    map.fillStyle = `rgba(0, 255, 255, ${laser.fuel / maxFuel})`;

    map.beginPath();

    map.moveTo(-0.1, -0.5);

    map.lineTo(0.1, -0.5);

    map.lineTo(0.1, 0.5);

    map.lineTo(-0.1, 0.5);

    map.closePath();

    map.stroke();

    map.fill();

    map.restore();
}
