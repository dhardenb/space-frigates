import {drawTurtleShip} from '../turtleShip.js';
import {drawViperShip} from '../viperShip.js';

export function renderShip(map, ship, {
    pixelsPerMeter,
    worldPixelsPerMeter,
    renderTimeSeconds,
    playerShip,
    playerName,
    shipNamesById
}) {
    map.save();

    map.translate(ship.locationX * pixelsPerMeter, ship.locationY * pixelsPerMeter);
    map.rotate(ship.facing * Math.PI / 180);

    const shipScale = ship.lengthInMeters * worldPixelsPerMeter;

    if (ship.shieldStatus > 0) {
        map.save();
        map.scale(shipScale, shipScale);
        map.beginPath();
        map.arc(0, 0, 1, 0, 2 * Math.PI);
        map.lineWidth = 0.05;
        map.strokeStyle = `rgba(100, 200, 255, ${ship.shieldStatus / 150})`;
        map.stroke();
        map.fillStyle = `rgba(100, 200, 255, ${ship.shieldStatus / 300})`;
        map.fill();
        map.restore();
    }

    let cockpitColor = 'red';
    if (ship.hullStrength >= 66) {
        cockpitColor = 'green';
    } else if (ship.hullStrength >= 33) {
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

    const isPlayersShip = ship.id === (playerShip && playerShip.id);
    const isHumanPilot = ship.pilotType === 'Human';

    let nameToDraw = '';

    if (isHumanPilot) {
        if (isPlayersShip) {
            const candidateName = playerName || shipNamesById?.get(ship.id) || ship.Name;
            nameToDraw = candidateName && candidateName !== '' ? candidateName : 'GUEST';
        } else {
            const candidateName = shipNamesById?.get(ship.id) || ship.Name;
            nameToDraw = candidateName && candidateName !== '' ? candidateName : 'GUEST';
        }
    } else if (ship.pilotType === 'Bot') {
        const candidateName = shipNamesById?.get(ship.id) || ship.Name || ship.aiProfile;
        nameToDraw = candidateName && candidateName !== '' ? candidateName : '';
    }

    map.fillStyle = 'gray';
    map.font = '12px Arial';
    map.translate(
        ship.locationX * worldPixelsPerMeter - map.measureText(nameToDraw).width / 2,
        ship.locationY * worldPixelsPerMeter + ship.lengthInMeters * worldPixelsPerMeter * 1.5
    );

    map.fillText(nameToDraw, 0, 0);

    map.restore();
}
