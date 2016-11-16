
// Contains all the objects created during game play like: ships, missles,
// particals, thrusters
gameObjects =[];

// Contains all the obejcts that have been destroyed (either via collision or
// running out of fuel) so that they can be removed from the DOM
deadObjects = [];

// Contains all the command objects that have be created either from a human
// player via periphreal input or the AI for emenemy ships
commands = [];

// Used to control and maintain the game loop
gameSpeed = 0;

// Defines the number of particles in an explosion
explosionSize = 0;

// This int gets incremented and used as the ID for each game object as it gets
// created
gameObjectId = 0;

// Used to maintain the current zoom level
zoomLevel = 0;

// Used to record the screen width
availableWidth = 0;

// Used to record the screen height
availableHeight = 0;

// Used to determine the current scaling paramter
currentScale = 0;

// Used to determine the size of the map
mapRadius = 0;

// Keep a pointer to the human ship so we can look up current location as
// needed
// playerShip;

Meteor.startup(function () {
    init();
});

init = function() {

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
    game = new Game();
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

    game.reset();
}

issueAiCommands = function() {

    for (var x = 0, y = gameObjects.length; x < y; x++) {

        if (gameObjects[x].Type != 'Human') {

            if (Math.floor((Math.random()*25)+1) == 1) {

                think(gameObjects[x]);
            }
        }
    }
}

think = function(gameObject) {

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

updateGameObjects = function() {

    // Can't pre calculate the length of the array because some of the command create new objects
    for (var i = 0; i < gameObjects.length; i++) {

        gameObjects[i].update();
    }

    commands = [];
}

createExplosion = function(sourceGameObject) {

	for (var i = 0; i < explosionSize; i++) {

	    var newParticle = new Particle(sourceGameObject);
		gameObjects.push(newParticle);
		var newParticleView = new ParticleView(newParticle);
		postOffice.subscribe("ParticleMoved" + newParticle.Id, newParticleView.update.bind(newParticleView));
        postOffice.subscribe('ParticleDestroyed' + newParticle.Id, newParticleView.destroy.bind(newParticleView));
	}
}

updateGameElements = function() {

    for (var i=0, j=gameObjects.length; i<j; i++) {

        if (gameObjects[i].Type != 'Particle' && gameObjects[i].Type != 'Thruster') {

            gameObjects[i].updateView();
        }
    }
}

findSolidObjects = function() {

    var solidObjects = [];

    for (var x = 0, y = gameObjects.length; x < y; x++) {

        if (gameObjects[x].Type != 'Particle' && gameObjects[x].Type != 'Thruster') {

            solidObjects.push(gameObjects[x])
        }
    }

    return solidObjects;
}

boundryChecking = function() {

    solidObjects = findSolidObjects();

    for (var x = 0, y = solidObjects.length; x < y; x++) {

        // Check to see if GameObject has flown past the border. I do this by measuring the distance
        // from the Game Object to the center of the screen and making sure the distance is smaller
        // than the radius of the screen.
        if (!(solidObjects[x].LocationX * solidObjects[x].LocationX + solidObjects[x].LocationY * solidObjects[x].LocationY < mapRadius * mapRadius)) {

            createExplosion(solidObjects[x]);
            deadObjects.push(solidObjects[x]);
        }
    }

    game.removeDeadObjects();
}

collisionDetection = function() {

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
                    createExplosion(solidObjects[k]);

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

fuelDetection = function() {
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
