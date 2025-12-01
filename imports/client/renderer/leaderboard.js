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
        if (gameObject.Type === 'Player' && gameObject.Name !== "") {
            players.push(gameObject);
        }
    }

    players.sort((a, b) => {
        if (a.Kills !== b.Kills) {
            return b.Kills - a.Kills;
        }
        if (a.Deaths !== b.Deaths) {
            return a.Deaths - b.Deaths;
        }
        return a.Id - b.Id;
    });

    for (let i = 0, j = players.length; i < j; i++) {
        map.translate(0, 25);
        if (players[i].Id == playerId) {
            map.fillStyle = "rgba(255, 255, 0, 0.5)";
        } else {
            map.fillStyle = "rgba(128, 128, 128, 0.5)";
        }
        map.fillText(players[i].Name, 0, 0);
        map.save();
        map.translate(155, 0);
        map.fillText(players[i].Kills, 0, 0);
        map.translate(40, 0);
        map.fillText(players[i].Deaths, 0, 0);
        map.restore();
    }

    map.restore();
}
