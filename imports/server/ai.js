import {Engine} from '../engine/engine.js';
import {Ship} from '../engine/ship.js';

export class Ai {

    constructor(mapRadius, options = {}) {
        this.mapRadius = mapRadius;
        this.selectShipType = typeof options.selectShipType === 'function' ? options.selectShipType : (() => 'Turtle');
    }

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
        if (nextShipType == 1 || nextShipType == 2) {
            const aiProfile = 'bot';
            const newAiShip = new Ship(Engine.getNextGameObjectId());
            const shipTypeId = this.selectShipType();
            newAiShip.init({shipTypeId, pilotType: 'Bot', aiProfile});
            newAiShip.setStartingAiPosition(this.mapRadius);
            gameObjects.push(newAiShip);
        }
    }       

    issueCommands(commands) {
        for (let x = 0, y = gameObjects.length; x < y; x++) {
            const gameObject = gameObjects[x];
            if (gameObject.Type === 'Ship' && gameObject.pilotType === 'Bot') {
                if (Math.floor((Math.random()*25)+1) == 1) {
                    this.think(commands, gameObject);
                }
            }
        }
    }

    think(commands, gameObject) {
        let commandType = 0;
        const profile = gameObject.aiProfile || 'bot';
        if (profile == 'bot') {
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
        commands.push({command: commandType, targetId: gameObject.Id});
    }
}
