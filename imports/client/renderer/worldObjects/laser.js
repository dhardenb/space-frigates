export function renderLaser(map, laser, worldPixelsPerMeter) {
    map.save();

    map.translate(laser.LocationX * worldPixelsPerMeter, laser.LocationY * worldPixelsPerMeter);

    map.rotate(laser.Facing * Math.PI / 180);

    map.scale(laser.Size * worldPixelsPerMeter, laser.Size * worldPixelsPerMeter);

    const maxFuel = laser.MaxFuel || 1;

    map.strokeStyle = `rgba(255, 255, 255, ${laser.Fuel / maxFuel})`;

    map.lineWidth = 0.1;

    map.fillStyle = `rgba(0, 255, 255, ${laser.Fuel / maxFuel})`;

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
