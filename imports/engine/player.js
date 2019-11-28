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

Player.prototype.copy = function(jsonObject) {
    this.Id = jsonObject.Id;
    this.Type = jsonObject.Type;
    this.Name = jsonObject.Name;
    this.ShipId = jsonObject.ShipId;
    this.LastSeqNum = jsonObject.LastSeqNum;
    this.Kills = jsonObject.Kills;
    this.Deaths = jsonObject.Deaths;
}

Player.prototype.update = function() {}