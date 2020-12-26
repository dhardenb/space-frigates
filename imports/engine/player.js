export class Player {

    constructor() {
        this.Type = "Player";
    }   

    init(id) {
        this.Id = id;
        this.Name = "";
        this.ShipId = 0;
        this.LastSeqNum = 0;
        this.Kills = 0;
        this.Deaths = 0;
    }

    update = function(framesPerSecond) {}
}