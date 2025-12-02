export function renderParticle(map, particle, worldPixelsPerMeter) {
    map.save();

    map.translate(particle.locationX * worldPixelsPerMeter, particle.locationY * worldPixelsPerMeter);

    map.beginPath();

    map.arc(0, 0, particle.size * 0.5 * worldPixelsPerMeter, 0, 2 * Math.PI);

    map.fillStyle = `rgba(255, ${Math.floor(Math.random() * 255)}, 0, ${Math.random()})`;

    map.fill();

    map.restore();
}
