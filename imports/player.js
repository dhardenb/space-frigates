Player = function Player(connection) {

    this.id = connection.id;

    this.latency = 30;

    this.clockOffsetSamples = [];

    this.clockOffset = 0;

}
