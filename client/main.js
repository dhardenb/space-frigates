import '../imports/client.js';

Meteor.startup(function () {

    client = new Client();

    client.init();

});
