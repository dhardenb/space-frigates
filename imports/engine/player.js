import {Utilities} from '../utilities/utilities.js';

export class Player {

    constructor() {
        this.type = "Player";
    }   

    init(connectionId) {
        this.id = Utilities.hashStringToUint32(connectionId);
        this.name = "";
        this.shipId = 0;
        this.kills = 0;
        this.deaths = 0;
    }

    update(commands, framesPerSecond) {}
}