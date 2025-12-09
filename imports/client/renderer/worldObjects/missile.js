export function renderMissile(map, missile, worldPixelsPerMeter) {
    map.save();

    map.translate(missile.locationX * worldPixelsPerMeter, missile.locationY * worldPixelsPerMeter);

    map.rotate(missile.facing * Math.PI / 180);

    map.scale(missile.lengthInMeters * worldPixelsPerMeter, missile.lengthInMeters * worldPixelsPerMeter);

    const maxFuel = missile.maxFuel || 1;
    const fuelRatio = Math.max(0, Math.min(1, missile.fuel / maxFuel));

    map.lineWidth = 0.08;
    map.strokeStyle = `rgba(255, 200, 120, ${fuelRatio})`;

    map.fillStyle = `rgba(200, 200, 200, ${fuelRatio})`;
    map.beginPath();
    map.rect(-0.1, -0.4, 0.2, 0.8);
    map.fill();
    map.stroke();

    map.fillStyle = `rgba(180, 60, 60, ${fuelRatio})`;
    map.beginPath();
    map.moveTo(-0.1, -0.4);
    map.lineTo(0.1, -0.4);
    map.lineTo(0, -0.5);
    map.closePath();
    map.fill();
    map.stroke();

    map.fillStyle = `rgba(120, 120, 120, ${fuelRatio})`;
    map.beginPath();
    map.moveTo(-0.1, 0.3);
    map.lineTo(-0.2, 0.5);
    map.lineTo(-0.1, 0.5);
    map.closePath();
    map.fill();

    map.beginPath();
    map.moveTo(0.1, 0.3);
    map.lineTo(0.2, 0.5);
    map.lineTo(0.1, 0.5);
    map.closePath();
    map.fill();

    map.restore();
}
