
import { Meteor } from 'meteor/meteor';

import '../imports/server/server.js';

import '../imports/engine/player.js';

import { removeByAttr } from '../imports/utilities/utilities.js';

Meteor.startup(() => {

    server = new Server();

    server.init();

});

Meteor.onConnection(function(connection) {

    var newPlayer = new Player();
    newPlayer.init(connection.id);
    gameObjects.push(newPlayer);

    connection.onClose(function() {

        var shipIdToRemove = 0;

        for (var i=0, j=gameObjects.length; i<j; i++) {
            if (gameObjects[i].Type == 'Player') {
                if (gameObjects[i].Id == connection.id) {
                    shipIdToRemove = gameObjects[i].ShipId;
                }
            }
        }

        // Remove players ship
        gameObjects = removeByAttr(gameObjects, "Id", shipIdToRemove);

        // Remove player
        gameObjects = removeByAttr(gameObjects, "Id", connection.id);
        
    });
    
});
