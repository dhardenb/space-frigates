Player = function Player() {
    this.Type = "Player";
}

Player.prototype.init = function(id) {
    this.Id = id;
    this.Name = "";
    this.ShipId = 0;
    this.LastSeqNum = 0;
    this.Kills = 0;
    this.Deaths = 0;
}

Player.prototype.update = function() {}