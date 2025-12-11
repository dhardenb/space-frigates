export function renderLeaderboard(map, {gameObjects, playerId}) {
    map.save();

    map.translate(10, 25);

    map.font = "20px Arial";
    map.fillStyle = "rgba(128, 128, 128, 0.5)";
    map.fillText("PILOT", 0, 0);

    map.save();
    map.translate(155, 0);
    map.fillText("K", 0, 0);
    map.translate(40, 0);
    map.fillText("D", 0, 0);
    map.restore();

    const players = [];

    for (let i = 0, j = gameObjects.length; i < j; i++) {
        const gameObject = gameObjects[i];
        // Show players who have started playing (have a ship assigned)
        if (gameObject.type === 'Player' && gameObject.shipId) {
            players.push(gameObject);
        }
    }

    players.sort((a, b) => {
        if (a.kills !== b.kills) {
            return b.kills - a.kills;
        }
        if (a.deaths !== b.deaths) {
            return a.deaths - b.deaths;
        }
        return a.id - b.id;
    });

    for (let i = 0, j = players.length; i < j; i++) {
        map.translate(0, 25);
        if (players[i].id == playerId) {
            map.fillStyle = "rgba(255, 255, 0, 0.5)";
        } else {
            map.fillStyle = "rgba(128, 128, 128, 0.5)";
        }
        const displayName = players[i].name || 'GUEST';
        map.fillText(displayName, 0, 0);
        map.save();
        map.translate(155, 0);
        map.fillText(players[i].kills, 0, 0);
        map.translate(40, 0);
        map.fillText(players[i].deaths, 0, 0);
        map.restore();
    }

    map.restore();
}
