import { Meteor } from 'meteor/meteor';
import '../imports/server.js';

Meteor.startup(() => {

    server = new Server();

    server.init();

});

Meteor.methods({

    createNewPlayerShip: function () {

        var playerShip = new Ship('Human');

        playerShip.setStartingHumanPosition();

        gameObjects.push(playerShip);

        return playerShip.Id;

    }

});
