import './engine/engine.js';
import './renderer.js';
import './command.js';

Client = function Client() {

}

Client.prototype.init = function() {

  this.setupEventHandlers();

  gameObjects = [];
  deadObjects = [];
  commands = [];
  gameSpeed = .66;
  explosionSize = 20;
  gameObjectId = 0;
  playerShipId = 0;
  zoomLevel = 400;
  mapRadius = 500;
  countdownTimer = 40;

  physics = new Physics();
  engine = new Engine();
  renderer = new Renderer();

  // Ask server to create a new ship for this player. If sucessfull, the
  // client should recieve back all the game settings as well as their
  // personall ID
  Meteor.call('createNewPlayerShip', (err, res) => {
    if (err) {
      alert(err);
    } else {
      playerShipId = res;
    }
  });

  localInterval = setInterval("client.localLoop()", 40);
  remoteInterval = setInterval("client.remoteLoop()", 200);
}

Client.prototype.setupEventHandlers = function() {
  document.documentElement.addEventListener("keydown", KeyPress, false);
}

Client.prototype.localLoop = function() {

  /*var gameOver = true;

  for (var x = 0, y = gameObjects.length; x < y; x++) {
    if (gameObjects[x].Id == playerShipId) {
      gameOver = false;
    }
  }

  if (gameOver) {
    window.clearInterval(localInterval);
    window.clearInterval(remoteInterval);
    client.init();
  }
  else { */
    engine.update();
    renderer.update();
  //}
}

Client.prototype.remoteLoop = function() {
  // Get current object array from server
  Meteor.call('getGameObjects', (err, remoteGameObjects) => {
    if (err) {
      alert(err);
    } else {
      gameObjects = this.convertObjects(remoteGameObjects);
    }
  });
}

Client.prototype.convertObjects = function (remoteGameObjects) {

  var convertedObjects = [];

  for (var x = 0, y = remoteGameObjects.length; x < y; x++) {
    if (remoteGameObjects[x].Type == 'Human') {
      convertedObjects.push(new Ship('Human', remoteGameObjects[x]));
    }
    else if (remoteGameObjects[x].Type == 'Alpha') {
      convertedObjects.push(new Ship('Alpha', remoteGameObjects[x]));
    }
    else if (remoteGameObjects[x].Type == 'Bravo') {
      convertedObjects.push(new Ship('Bravo', remoteGameObjects[x]));
    }
    else if (remoteGameObjects[x].Type == 'Thruster') {
      convertedObjects.push(new Thruster(null, remoteGameObjects[x]));
    }
    else if (remoteGameObjects[x].Type == 'Missile') {
      convertedObjects.push(new Missile(null, remoteGameObjects[x]));
    }
    else if (remoteGameObjects[x].Type == 'Particle') {
      convertedObjects.push(new Particle(null, remoteGameObjects[x]));
    }
  }
  return convertedObjects;
}

Client.prototype.commandHandler = function(newCommand) {
  commands.push(newCommand);
  Meteor.call('putCommands', newCommand, (err, res) => {
    if (err) {
      alert(err);
    }
  });
}

KeyPress = function KeyPress(evt) {

    // ENTER - Start
    if(evt.keyCode==13 && gameOver == true) {

        evt.preventDefault();
    }

    // SPACE_BAR - Fire
    else if(evt.keyCode == 32) {

        evt.preventDefault();
        var newCommand = new Command({command: 0, targetId: playerShipId});
        client.commandHandler(newCommand);
    }

    // LEFT_ARROW - Rotate CounterClockwise
    else if(evt.keyCode == 37 || evt.keyCode == 65) {

        evt.preventDefault();
        var newCommand = new Command({command: 1, targetId: playerShipId});
        client.commandHandler(newCommand);
    }

    // UP_ARROW - Forward Thruster
    else if(evt.keyCode==38 || evt.keyCode == 87) {

        evt.preventDefault();
        var newCommand = new Command({command: 2, targetId: playerShipId});
        client.commandHandler(newCommand);
    }

    // RIGHT_ARROW - Rotate Clockwise
    else if(evt.keyCode==39 || evt.keyCode == 68) {

        evt.preventDefault();
        var newCommand = new Command({command: 3, targetId: playerShipId});
        client.commandHandler(newCommand);
    }

    // DOWN_ARROW - Stop
    else if(evt.keyCode==40 || evt.keyCode == 83) {

        evt.preventDefault();
        var newCommand = new Command({command: 4, targetId: playerShipId});
        client.commandHandler(newCommand);
    }

    // + Zoom In
    else if(evt.keyCode==187) {

        evt.preventDefault();

        if (zoomLevel > 100) {
            zoomLevel = zoomLevel - 100;
        }

        currentScale = availablePixels / zoomLevel;

        portGroup.setAttribute('transform', 'translate('+availableWidth / 2+','+availableHeight / 2+') scale(' + currentScale + ')');
    }

    // - Zoom Out
    else if(evt.keyCode==189) {

        evt.preventDefault();

        if (zoomLevel < 1100) {
            zoomLevel = zoomLevel + 100;
        }

        currentScale = availablePixels / zoomLevel;

        portGroup.setAttribute('transform', 'translate('+availableWidth / 2+','+availableHeight / 2+') scale(' + currentScale + ')');
    }
}
