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
  cachedCommands = [];

  lastLoop = new Date;
  currentLoop = new Date;
  framesPerSecond = 60;

  lastUpdateRunAt = new Date;

  explosionSize = 20;
  gameObjectId = 0;
  playerShipId = 0;
  zoomLevel = 400;
  mapRadius = 1000;
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

  /*
  var playerShip = new Ship('Human');
  playerShip.setStartingHumanPosition();
  gameObjects.push(playerShip);
  playerShipId = playerShip.Id;
  */

  setInterval("client.gameLoop()", 15);
  // setInterval("client.animationLoop()", 40);
  client.animationLoop();
  setInterval("client.remoteLoop()", 45);
}

Client.prototype.gameLoop = function() {

  engine.update();

}

Client.prototype.animationLoop = function() {

  window.requestAnimationFrame(client.animationLoop);

  currentLoop = new Date;

  framesPerSecond = 1000 / (currentLoop - lastLoop);

  lastLoop = currentLoop;

  renderer.update();

}

Client.prototype.remoteLoop = function() {
  // Get current object array from server
  Meteor.call('getGameObjects', (err, gameState) => {
    if (err) {
      alert(err);
    } else {
      lastUpdateRunAt = gameState.serverLastUpdatedAt;
      gameObjects = this.convertObjects(gameState.gameState);
      this.manageCachedCommands();
    }
  });
}

// This method with delete client commands that the server already knows
// about and reruns commands that the server does not know about. This is done
// to smooth the client animation by not erasing a result the client has just
// animated and then reanimating it once the server has processed it.
Client.prototype.manageCachedCommands = function () {

  var i = cachedCommands.length;

  while (i--) {

    if (cachedCommands[i].timeStamp > lastUpdateRunAt) {

      commands.push(cachedCommands[i]);

    }

    else {

      cachedCommands.splice(i, 1);

    }

  }

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
  cachedCommands.push(newCommand);

  Meteor.call('putCommands', newCommand, (err, res) => {

    if (err) {

      alert(err);

    }

  });

}

Client.prototype.setupEventHandlers = function() {
  document.documentElement.addEventListener("keydown", KeyPress, false);
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
