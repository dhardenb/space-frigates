Player = function Player(id) {
    this.Id = id;
    this.Type = "Player";
    this.Name = "";
    this.ShipId = 0;
    this.LastSeqNum = 0;
    this.Kills = 0;
    this.Deaths = 0;
}

Player.prototype.update = function() {}