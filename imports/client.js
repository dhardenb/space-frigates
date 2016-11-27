import './engine.js';
import './renderer.js'

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
  zoomLevel = 400;
  mapRadius = 500;
  gameOver = false;
  countdownTimer = 40;

  physics = new Physics();
  engine = new Engine();
  renderer = new Renderer();
  ai = new Ai();

  playerShip = new Ship('Human');
  gameObjects.push(playerShip);

  loopInterval = setInterval("client.loop()", 40);
}

Client.prototype.setupEventHandlers = function() {
  document.documentElement.addEventListener("keydown", KeyPress, false);
}

Client.prototype.loop = function() {
  if (countdownTimer > 0) {
    if (gameOver == true) {
      countdownTimer--;
    }
    this.createAiShip();
    ai.issueCommands();
    engine.update();
    renderer.update();
  }
  else {
    window.clearInterval(loopInterval);
    client.init();
  }
}

Client.prototype.createAiShip = function() {
  var nextShipType = Math.floor((Math.random()*100)+1)
  if (nextShipType == 1) {
    gameObjects.push(new Ship('Alpha'));
  }
  else if (nextShipType == 2) {
    gameObjects.push(new Ship('Bravo'));
  }
}

KeyPress = function KeyPress(evt) {

    // ENTER - Start
    if(evt.keyCode==13 && gameOver == true) {

        evt.preventDefault();
    }

    // SPACE_BAR - Fire
    else if(evt.keyCode == 32) {

        evt.preventDefault();
        var newCommand = new Command({command: 0, targetId: 0});
        commands.push(newCommand);
    }

    // LEFT_ARROW - Rotate CounterClockwise
    else if(evt.keyCode == 37 || evt.keyCode == 65) {

        evt.preventDefault();
        var newCommand = new Command({command: 1, targetId: 0});
        commands.push(newCommand);
    }

    // UP_ARROW - Forward Thruster
    else if(evt.keyCode==38 || evt.keyCode == 87) {

        evt.preventDefault();
        var newCommand = new Command({command: 2, targetId: 0});
        commands.push(newCommand);
    }

    // RIGHT_ARROW - Rotate Clockwise
    else if(evt.keyCode==39 || evt.keyCode == 68) {

        evt.preventDefault();
        var newCommand = new Command({command: 3, targetId: 0});
        commands.push(newCommand);
    }

    // DOWN_ARROW - Stop
    else if(evt.keyCode==40 || evt.keyCode == 83) {

        evt.preventDefault();
        var newCommand = new Command({command: 4, targetId: 0});
        commands.push(newCommand);
    }

    /*// + Zoom In
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
    }*/
}

Ai = function Ai() {

}

Ai.prototype.issueCommands = function () {
  for (var x = 0, y = gameObjects.length; x < y; x++) {
    if (gameObjects[x].Type != 'Human') {
      if (Math.floor((Math.random()*25)+1) == 1) {
        this.think(gameObjects[x]);
      }
    }
  }
}

Ai.prototype.think = function (gameObject) {
  var commandType = 0;

  if (gameObject.Type == 'Alpha') {

      switch (Math.floor(Math.random()*11+1)) {
      case 1:
          commandType = 2;
          break;
      case 3:
      case 4:
      case 11:
      case 10:
          commandType = 0;
          break;
      case 6:
      case 7:
          commandType = 1;
          break;
      case 8:
      case 9:
          commandType = 3;
          break;
      case 2:
      case 5:
          commandType = 4;
          break;
      }
  }
  else if (gameObject.Type == 'Bravo') {
      switch (Math.floor(Math.random()*11+1)) {
      case 1:
          commandType = 2;
          break;
      case 3:
      case 4:
      case 11:
          commandType = 0;
          break;
      case 6:
      case 7:
          commandType = 1;
          break;
      case 8:
      case 9:
          commandType = 3;
          break;
      case 2:
      case 5:
      case 10:
          commandType = 4;
          break;
      }
  }

  commands.push(new Command({command: commandType, targetId: gameObject.Id}));
}

Command = function Command(command) {
  this.command = command.command;
  this.targetId = command.targetId;
}
