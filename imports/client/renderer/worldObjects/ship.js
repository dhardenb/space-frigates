import {drawTurtleShip} from '../turtleShip.js';
import {drawViperShip} from '../viperShip.js';

export function renderShip(map, ship, {
    pixelsPerMeter,
    worldPixelsPerMeter,
    renderTimeSeconds,
    playerShip,
    playerName
}) {
    map.save();

    map.translate(ship.LocationX * pixelsPerMeter, ship.LocationY * pixelsPerMeter);
    map.rotate(ship.Facing * Math.PI / 180);

    const shipScale = ship.Size * worldPixelsPerMeter;

    if (ship.ShieldStatus > 0) {
        map.save();
        map.scale(shipScale, shipScale);
        map.beginPath();
        map.arc(0, 0, 1, 0, 2 * Math.PI);
        map.lineWidth = 0.05;
        map.strokeStyle = `rgba(100, 200, 255, ${ship.ShieldStatus / 150})`;
        map.stroke();
        map.fillStyle = `rgba(100, 200, 255, ${ship.ShieldStatus / 300})`;
        map.fill();
        map.restore();
    }

    let cockpitColor = 'red';
    if (ship.HullStrength >= 66) {
        cockpitColor = 'green';
    } else if (ship.HullStrength >= 33) {
        cockpitColor = 'yellow';
    }

    if (ship.shipTypeId === 'Viper') {
        drawViperShip(map, shipScale);
    } else if (ship.shipTypeId === 'Turtle') {
        drawTurtleShip(map, shipScale, ship.aiProfile, renderTimeSeconds);
    } else {
        map.save();
        map.scale(shipScale, shipScale);
        map.strokeStyle = 'rgba(50, 50, 50, 1.0)';
        map.lineWidth = 0.1;
        map.lineJoin = 'round';
        map.fillStyle = 'rgba(100, 100, 100, 1.0)';
        map.beginPath();
        map.moveTo(-0.05, -0.5);
        map.lineTo(0.05, -0.5);
        map.lineTo(0.1, -0.2);
        map.lineTo(0.2, -0.1);
        map.lineTo(0.2, 0.1);
        map.lineTo(0.4, 0.3);
        map.lineTo(0.4, 0.4);
        map.lineTo(0.2, 0.4);
        map.lineTo(0.2, 0.5);
        map.lineTo(-0.2, 0.5);
        map.lineTo(-0.2, 0.4);
        map.lineTo(-0.4, 0.4);
        map.lineTo(-0.4, 0.3);
        map.lineTo(-0.2, 0.1);
        map.lineTo(-0.2, -0.1);
        map.lineTo(-0.1, -0.2);
        map.closePath();
        map.stroke();
        map.fill();
        map.fillStyle = cockpitColor;
        map.lineWidth = 0.05;
        map.beginPath();
        map.moveTo(0.0, -0.1);
        map.lineTo(-0.1, 0.3);
        map.lineTo(0.1, 0.3);
        map.closePath();
        map.stroke();
        map.fill();
        map.restore();
    }

    map.restore();

    map.save();

    const isPlayersShip = ship.Id === (playerShip && playerShip.Id);
    const isHumanPilot = ship.pilotType === 'Human';

    let nameToDraw = '';

    if (isHumanPilot) {
        if (isPlayersShip) {
            nameToDraw = playerName === '' ? 'GUEST' : playerName;
        } else {
            nameToDraw = ship.Name && ship.Name !== '' ? ship.Name : 'GUEST';
        }
    }

    map.fillStyle = 'gray';
    map.font = '12px Arial';
    map.translate(
        ship.LocationX * worldPixelsPerMeter - map.measureText(nameToDraw).width / 2,
        ship.LocationY * worldPixelsPerMeter + ship.Size * worldPixelsPerMeter * 1.5
    );

    map.fillText(nameToDraw, 0, 0);

    map.restore();
}
