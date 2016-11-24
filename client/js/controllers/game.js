Game = function Game() {
  this.gameOver = true;
  this.countdownTimer = 0;
}

Game.prototype.init = function() {

  document.documentElement.addEventListener("keydown", KeyPress, false);

  background = document.getElementById("background");

  while (background.firstChild) {
      background.removeChild(background.firstChild);
  }

  gameObjects = [];
  deadObjects = [];
  commands = [];
  gameSpeed = .66;
  explosionSize = 20;
  gameObjectId = 0;
  zoomLevel = 400;
  mapRadius = 500;
  physics = new Physics();
  postOffice = new PostOffice();

  availableWidth = window.innerWidth - 22;
  availableHeight = window.innerHeight - 22;

  if (availableHeight < availableWidth) {

      availablePixels = availableHeight;
  }
  else {

      availablePixels = availableWidth;
  }

  currentScale = availablePixels / zoomLevel;

  new Map();

  this.gameOver = false;
  this.countdownTimer = 40;
  playerShip = new Ship('Human');
  gameObjects.push(playerShip);
  loopInterval = setInterval("game.loop()", 40);
}

Game.prototype.loop = function() {
  if (this.countdownTimer > 0) {
    if (this.gameOver == true) {
      this.countdownTimer--;
    }
    var nextShipType = Math.floor((Math.random()*100)+1)
    if (nextShipType == 1) {
      gameObjects.push(new Ship('Alpha'));
    }
    else if (nextShipType == 2) {
      gameObjects.push(new Ship('Bravo'));
    }
    this.issueAiCommands();
    this.updateGameObjects();
    this.collisionDetection();
    this.fuelDetection();
    // boundryChecking();
    this.updateGameElements();
  }
  else {
    window.clearInterval(loopInterval);
    game.init();
  }
}

Game.prototype.removeDeadObjects = function() {
  for (var x = 0, y = deadObjects.length; x < y; x++) {
    // I had to filter out the particle objects because they do NOT
    // have an svgElement!!!
    if (deadObjects[x].Type != 'Particle' && deadObjects[x].Type != 'Thruster') {
      // Delete the SVG element out of the DOM
      deadObjects[x].svgElement.parentNode.removeChild(deadObjects[x].svgElement);
    }
    // If the dead object was the human ship, trip the game over flag
    if (deadObjects[x].Type == "Human") {
      this.gameOver = true;
    }
    var i = 0;
    for (var j = 0; j < gameObjects.length; j++) {
      if (gameObjects[j].Id == deadObjects[x].Id) {
          gameObjects.splice(i, 1);
      }
      else {
        i++;
      }
    }
  }
  deadObjects = [];
}

Game.prototype.issueAiCommands = function () {
  for (var x = 0, y = gameObjects.length; x < y; x++) {
    if (gameObjects[x].Type != 'Human') {
      if (Math.floor((Math.random()*25)+1) == 1) {
        this.think(gameObjects[x]);
      }
    }
  }
}

Game.prototype.think = function (gameObject) {
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

Game.prototype.updateGameObjects = function () {
  // Can't pre calculate the length of the array because some of the command create new objects
  for (var i = 0; i < gameObjects.length; i++) {
    gameObjects[i].update();
  }
  commands = [];
}

Game.prototype.createExplosion = function (sourceGameObject) {
  for (var i = 0; i < explosionSize; i++) {
    var newParticle = new Particle(sourceGameObject);
    gameObjects.push(newParticle);
    var newParticleView = new ParticleView(newParticle);
    postOffice.subscribe("ParticleMoved" + newParticle.Id, newParticleView.update.bind(newParticleView));
    postOffice.subscribe('ParticleDestroyed' + newParticle.Id, newParticleView.destroy.bind(newParticleView));
  }
}

Game.prototype.collisionDetection = function () {
  var solidObjects = [];
  for (var x = 0, y = gameObjects.length; x < y; x++) {

    if (gameObjects[x].Type != 'Particle' && gameObjects[x].Type != 'Thruster') {

        solidObjects.push(gameObjects[x])
    }
}

// Run colision detection for each solidObject
for (var i = 0, j = solidObjects.length; i < j; i++) {

    // Find this distance between this and every other object in the game and check to see if it
    // is smaller than the combined radius of the two objects.
    for (var k = 0, l = solidObjects.length; k < l; k++) {

        // Don't let objects colide with themselves!
        if (i != k) {

            if (Math.sqrt((solidObjects[i].LocationX - solidObjects[k].LocationX) * (solidObjects[i].LocationX - solidObjects[k].LocationX) + (solidObjects[i].LocationY - solidObjects[k].LocationY) * (solidObjects[i].LocationY - solidObjects[k].LocationY)) < (solidObjects[i].Size + solidObjects[k].Size)) {

                // This object has collided with something so we get to blow it up!!!
                this.createExplosion(solidObjects[k]);

                // I created this array of objects to remove because removing objects from
                // an array while you are still iterating over the same array is generaly
                // a bad thing!
                deadObjects.push(solidObjects[k]);

                // No use blowing this up twice!
                break;
            }
        }
    }
}

game.removeDeadObjects();
}

Game.prototype.updateGameElements = function () {
  for (var i=0, j=gameObjects.length; i<j; i++) {
    if (gameObjects[i].Type != 'Particle' && gameObjects[i].Type != 'Thruster') {
      gameObjects[i].updateView();
    }
  }
}

Game.prototype.findSolidObjects = function () {
  var solidObjects = [];
  for (var x = 0, y = gameObjects.length; x < y; x++) {
    if (gameObjects[x].Type != 'Particle' && gameObjects[x].Type != 'Thruster') {
      solidObjects.push(gameObjects[x])
    }
  }
  return solidObjects;
}

Game.prototype.boundryChecking = function () {
  solidObjects = findSolidObjects();
  for (var x = 0, y = solidObjects.length; x < y; x++) {
    // Check to see if GameObject has flown past the border. I do this by measuring the distance
    // from the Game Object to the center of the screen and making sure the distance is smaller
    // than the radius of the screen.
    if (!(solidObjects[x].LocationX * solidObjects[x].LocationX + solidObjects[x].LocationY * solidObjects[x].LocationY < mapRadius * mapRadius)) {
      Game.createExplosion(solidObjects[x]);
      deadObjects.push(solidObjects[x]);
    }
  }
  game.removeDeadObjects();
}

Game.prototype.fuelDetection = function () {
  for (var x = 0, y = gameObjects.length; x < y; x++) {
    if (gameObjects[x].Fuel < 1) {
      deadObjects.push(gameObjects[x]);
      if (gameObjects[x].Type == 'Particle') {
        postOffice.publish("ParticleDestroyed" + gameObjects[x].Id, []);
      }
      if (gameObjects[x].Type == 'Thruster') {
        postOffice.publish("ThrusterDestroyed" + gameObjects[x].Id, []);
      }
    }
  }
  game.removeDeadObjects();
}
