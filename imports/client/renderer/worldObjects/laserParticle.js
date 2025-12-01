export function renderLaserParticle(map, particle, worldPixelsPerMeter) {
    map.save();

    map.translate(particle.LocationX * worldPixelsPerMeter, particle.LocationY * worldPixelsPerMeter);
    map.rotate(particle.Heading * Math.PI / 180);

    const alpha = Math.random() * 0.5 + 0.25;
    const red = 150 + Math.floor(Math.random() * 70);
    const green = 180 + Math.floor(Math.random() * 50);
    const blue = 220 + Math.floor(Math.random() * 35);

    map.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    map.lineWidth = Math.max(1, particle.Size * worldPixelsPerMeter * 0.6);

    const sparkLengthPixels = (particle.sparkLength || particle.Size) * worldPixelsPerMeter * 1.5;

    map.beginPath();
    map.moveTo(0, 0);
    map.lineTo(sparkLengthPixels, 0);
    map.stroke();

    map.restore();
}
