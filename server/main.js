
import { Meteor } from 'meteor/meteor';

import '../imports/server/server.js';

import '../imports/server/player.js';

import { removeByAttr } from '../imports/utilities/utilities.js';

Meteor.startup(() => {

    server = new Server();

    server.init();

});

Meteor.onConnection(function(connection) {

    connection.onClose(function() {

        clientConnectionsGauge.dec();

        removeByAttr(players, 'id', connection.id);

    });

    clientConnectionsGauge.inc();

    players.push(new Player(connection));

});
