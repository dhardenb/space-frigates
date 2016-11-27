import { Meteor } from 'meteor/meteor';
import '../imports/server.js';

Meteor.startup(() => {
  server = new Server();
  server.init();
});
