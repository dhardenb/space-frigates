Game = function Game() {

}

Game.prototype.init = function() {

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

  loopInterval = setInterval("game.loop()", 40);
}

Game.prototype.setupEventHandlers = function() {
  document.documentElement.addEventListener("keydown", KeyPress, false);
}

Game.prototype.loop = function() {
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
    game.init();
  }
}

Game.prototype.createAiShip = function() {
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
    if(evt.keyCode==13 && game.gameOver == true) {

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
