export function renderParticle(map, particle, worldPixelsPerMeter) {
    map.save();

    map.translate(particle.LocationX * worldPixelsPerMeter, particle.LocationY * worldPixelsPerMeter);

    map.beginPath();

    map.arc(0, 0, particle.Size * 0.5 * worldPixelsPerMeter, 0, 2 * Math.PI);

    map.fillStyle = `rgba(255, ${Math.floor(Math.random() * 255)}, 0, ${Math.random()})`;

    map.fill();

    map.restore();
}
