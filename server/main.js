
import { Meteor } from 'meteor/meteor';

import '../imports/server/server.js';

import '../imports/engine/player.js';

import { removeByAttr } from '../imports/utilities/utilities.js';

const accountSid = Meteor.settings.private.twillioAccountSid;
const authToken = Meteor.settings.private.authToken;
const twilioClient = require('twilio')(accountSid, authToken);

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

    if (Meteor.settings.public.environment == 'prod') {

        twilioClient.messages
            .create({
                body: 'Somebody just logged into Space Frigates!',
                from: '+17014011205',
                to: '+12625011707'
            })
            .then(message => console.log(message.sid));
    }
});
