import {Ship} from '../engine/ship.js';

export class Ai {

    createNewShip() {
        let players = [];
        for (let i=0, j=gameObjects.length; i<j; i++) {
            if (gameObjects[i].Type == 'Player') {
                players.push(gameObjects[i]);
            }
        }
        let numberOfPlayers = players.length;
        let nextShipType = 0;
        if (numberOfPlayers == 0) {
            nextShipType = 0;
        } else if (numberOfPlayers == 1) {
            nextShipType = Math.floor((Math.random()*400)+1);
        } else if (numberOfPlayers == 2) {
            nextShipType = Math.floor((Math.random()*1600)+1);
        } else if (numberOfPlayers == 3) {
            nextShipType = Math.floor((Math.random()*3200)+1);
        } else {
            nextShipType = Math.floor((Math.random()*6400)+1);
        }
        let newAiShip;
        if (nextShipType == 1) {
            newAiShip = new Ship();
            newAiShip.init('Alpha');
            newAiShip.setStartingAiPosition();
            gameObjects.push(newAiShip);
        }
        else if (nextShipType == 2) {
            newAiShip = new Ship();
            newAiShip.init('Bravo');
            newAiShip.setStartingAiPosition();
            gameObjects.push(newAiShip);
        }
    }       

    issueCommands(commands) {
        for (let x = 0, y = gameObjects.length; x < y; x++) {
            if (gameObjects[x].Type != 'Human') {
                if (Math.floor((Math.random()*25)+1) == 1) {
                    this.think(commands, gameObjects[x]);
                }
            }
        }
    }

    think(commands, gameObject) {
        let commandType = 0;
        if (gameObject.Type == 'Alpha') {
            switch (Math.floor(Math.random()*11+1)) {
                case 1:
                    commandType = 2;
                    break;
                case 3:
                case 4:
                case 11:
                case 10:
                    commandType = 0;
                    break;
                case 6:
                case 7:
                    commandType = 1;
                    break;
                case 8:
                case 9:
                    commandType = 3;
                    break;
                case 2:
                case 5:
                    commandType = 4;
                    break;
            }
        }
        else if (gameObject.Type == 'Bravo') {
            switch (Math.floor(Math.random()*11+1)) {
                case 1:
                    commandType = 2;
                    break;
                case 3:
                case 4:
                case 11:
                    commandType = 0;
                    break;
                case 6:
                case 7:
                    commandType = 1;
                    break;
                case 8:
                case 9:
                    commandType = 3;
                    break;
                case 2:
                case 5:
                case 10:
                    commandType = 4;
                    break;
            }
        }
        commands.push({command: commandType, targetId: gameObject.Id});
    }
}
