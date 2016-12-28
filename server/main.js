import { Meteor } from 'meteor/meteor';
import '../imports/server.js';
import '../imports/player.js';

Meteor.startup(() => {

    server = new Server();

    server.init();

});

Meteor.methods({

    createNewPlayerShip: function() {

        var playerShip = new Ship('Human');

        playerShip.setStartingHumanPosition();

        gameObjects.push(playerShip);

        return playerShip.Id;

    },

    // Since the ping call coming from the client is asynchorounous, we
    // have to take in and return on the start time because the client
    // may have already moved on to the next ping.
    testLatency: function(startPing, averageLatency) {

        // console.log('startPing: ' + startPing + ' averageLatency: ' + averageLatency);

        for (var x = 0, y = players.length; x < y; x++) {

            if (players[x].id == this.connection.id) {

                //
                // Update player object with average latency from client
                //

                players[x].latency = Math.ceil(averageLatency);

                //
                // Find the average clockOffset for THIS client
                //

                var averageClockOffset = 0;

                var clockOffsetTotal = 0;

                var clockOffset = new Date().getTime() - startPing;

                players[x].clockOffsetSamples.push(clockOffset);

                if (players[x].clockOffsetSamples.length >= 30) {

                    players[x].clockOffsetSamples.splice(0, 1);

                }

                for (var a = 0, b = players[x].clockOffsetSamples.length; a < b; a++) {

                    clockOffsetTotal += players[x].clockOffsetSamples[a];

                }

                averageClockOffset = clockOffsetTotal / players[x].clockOffsetSamples.length;

                players[x].offset = averageClockOffset;

                return {startPing: startPing, buffer: buffer, offset: averageClockOffset};

            }

        }

    }

});

/*Meteor.onConnection(function(connection){

    players.push(new Player(connection));

});*/
