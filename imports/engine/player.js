import {Utilities} from '../utilities/utilities.js';

export class Player {

    constructor() {
        this.type = "Player";
    }   

    init(connectionId) {
        this.id = Utilities.hashStringToUint32(connectionId);
        this.Name = "";
        this.ShipId = 0;
        this.Kills = 0;
        this.Deaths = 0;
    }

    update(commands, framesPerSecond) {}
}