
import { Meteor } from 'meteor/meteor';

import '../imports/server/server.js';

import '../imports/engine/player.js';

import { removeByAttr } from '../imports/utilities/utilities.js';

Meteor.startup(() => {

    server = new Server();

    server.init();

});

Meteor.onConnection(function(connection) {

    connection.onClose(function() {

        clientConnectionsGauge.dec();

        gameObjects = removeByAttr(gameObjects, "Id", connection.id);

        // Remove the ship? Turn it into a zombie ship?

    });

    clientConnectionsGauge.inc();

    var newPlayer = new Player();
    newPlayer.init(connection.id);
    gameObjects.push(newPlayer);
});
