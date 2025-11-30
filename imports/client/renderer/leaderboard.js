import orderBy from 'lodash/orderBy';

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

    let players = [];

    for (let i = 0, j = gameObjects.length; i < j; i++) {
        if (gameObjects[i].Type == 'Player') {
            if (gameObjects[i].Name != "") {
                players.push(gameObjects[i]);
            }
        }
    }

    players = orderBy(players, 'Kills', 'desc');

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
