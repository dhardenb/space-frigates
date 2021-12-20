import {Meteor} from 'meteor/meteor';
import {Player} from '../imports/engine/player.js';
import '../imports/server/server.js';
import {Utilities} from '../imports/utilities/utilities.js';

Meteor.startup(() => {
    server = new Server();
    server.init();
});

Meteor.onConnection(function(connection) {

    let newPlayer = new Player();
    newPlayer.init(connection.id);
    gameObjects.push(newPlayer);

    connection.onClose(function() {

        let shipIdToRemove = 0;

        for (let i=0, j=gameObjects.length; i<j; i++) {
            if (gameObjects[i].Type == 'Player') {
                if (gameObjects[i].Id == connection.id) {
                    shipIdToRemove = gameObjects[i].ShipId;
                }
            }
        }

        // Remove players ship
        gameObjects = Utilities.removeByAttr(gameObjects, "Id", shipIdToRemove);

        // Remove player
        gameObjects = Utilities.removeByAttr(gameObjects, "Id", connection.id);
        
    });
    
});
