export function renderMiniMap(map, options) {
    const {
        availableWidth,
        availablePixels,
        miniMapZoomLevel,
        focalX,
        focalY,
        worldPixelsPerMeter,
        pixelsPerMeter,
        mapRadius,
        gameObjects,
        playerShipId,
    } = options;

    map.save();
    map.translate(availableWidth - availablePixels / 12 - 20, availablePixels / 12 + 20);

    map.save();
    map.beginPath();
    map.arc(0, 0, availablePixels / 12, 0, 2 * Math.PI);
    map.strokeStyle = "rgba(50, 50, 50, 1.0)";
    map.fillStyle = "rgba(0, 0, 0, 1.0)";
    map.lineWidth = 5;
    map.fill();
    map.stroke();
    map.clip();

    map.scale(miniMapZoomLevel, miniMapZoomLevel);
    map.translate(focalX, focalY);
    renderBoundry(map, mapRadius, worldPixelsPerMeter);
    for (let i = 0, j = gameObjects.length; i < j; i++) {
        if (gameObjects[i].Type == 'Ship') {
            renderMiniShip(map, gameObjects[i], playerShipId, worldPixelsPerMeter, pixelsPerMeter);
        }
    }

    map.restore();
    map.restore();
}

export function renderMiniShip(map, ship, playerShipId, worldPixelsPerMeter, pixelsPerMeter) {
    map.save();
    map.translate(ship.LocationX * worldPixelsPerMeter, ship.LocationY * worldPixelsPerMeter);
    map.scale(ship.Size * pixelsPerMeter, ship.Size * pixelsPerMeter);
    map.beginPath();
    map.arc(0, 0, 1.0, 0, 2 * Math.PI);
    let fillStyle = "rgba(128, 128, 128, 1.0)";
    if (ship.Id == playerShipId) {
        fillStyle = "rgba(0, 128, 0, 1.0)";
    } else if (ship.pilotType === "Human") {
        fillStyle = "rgba(255, 0, 0, 1.0)";
    }

    map.fillStyle = fillStyle;

    map.fill();

    map.restore();
}

function renderBoundry(map, mapRadius, pixelsPerMeterOverride) {
    map.save();
    map.beginPath();
    map.arc(0, 0, mapRadius * pixelsPerMeterOverride, 0, 2 * Math.PI);
    map.strokeStyle = "rgba(255, 255, 0, 0.5)";
    map.lineWidth = 5;
    map.stroke();
    map.restore();
}
