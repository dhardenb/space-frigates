import './missile.js';
import './ship.js';
import './particle.js';
import './thruster.js';
import './physics.js';
import { removeByAttr } from '../utilities/utilities.js';

Engine = function Engine() {

  physics = new Physics();

  mapRadius = Meteor.settings.public.mapRadius;

  explosionSize = 20;

}

Engine.prototype.getNextGameObjectId = function() {

    var nextGameObjectId = gameObjectId;

    gameObjectId++;

    return nextGameObjectId;

}

Engine.prototype.update = function () {

  // Can't pre calculate the length of the array because some of the command create new objects
  for (var i = 0; i < gameObjects.length; i++) {
    gameObjects[i].update();
  }

  commands = [];

  this.collisionDetection();
  this.boundryChecking();
  this.fuelDetection();

}

Engine.prototype.collisionDetection = function () {
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

        if (Math.sqrt((solidObjects[i].LocationX - solidObjects[k].LocationX) * (solidObjects[i].LocationX - solidObjects[k].LocationX) + (solidObjects[i].LocationY - solidObjects[k].LocationY) * (solidObjects[i].LocationY - solidObjects[k].LocationY)) < (solidObjects[i].Size / 2 + solidObjects[k].Size / 2)) {


            if ((solidObjects[k].Type == "Human" ||
                solidObjects[k].Type == "Alpha" ||
                solidObjects[k].Type == "Bravo") &&
                (solidObjects[i].Type == "Missile")) {

                solidObjects[k].ShieldStatus -= 25;

                if (solidObjects[k].ShieldStatus <= 0) {

                    this.createExplosion(solidObjects[k]);
                    deadObjects.push(solidObjects[k]);
                }

                break;

            } else {

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
  }
  this.removeDeadObjects();
}

Engine.prototype.createExplosion = function (sourceGameObject) {

    for (var i = 0; i < explosionSize; i++) {

        var newParticle = new Particle();

        newParticle.init(sourceGameObject);

        gameObjects.push(newParticle);

    }

}

Engine.prototype.fuelDetection = function () {
  for (var x = 0, y = gameObjects.length; x < y; x++) {
    if (gameObjects[x].Fuel < 0) {
      deadObjects.push(gameObjects[x]);
    }
  }
  this.removeDeadObjects();
}

Engine.prototype.findSolidObjects = function () {
  var solidObjects = [];
  for (var x = 0, y = gameObjects.length; x < y; x++) {
    if (gameObjects[x].Type != 'Particle' && gameObjects[x].Type != 'Thruster') {
      solidObjects.push(gameObjects[x])
    }
  }
  return solidObjects;
}

Engine.prototype.boundryChecking = function () {
  solidObjects = this.findSolidObjects();
  for (var x = 0, y = solidObjects.length; x < y; x++) {
    // Check to see if GameObject has flown past the border. I do this by measuring the distance
    // from the Game Object to the center of the screen and making sure the distance is smaller
    // than the radius of the screen.
    if (!(solidObjects[x].LocationX * solidObjects[x].LocationX + solidObjects[x].LocationY * solidObjects[x].LocationY < mapRadius * mapRadius)) {
      this.createExplosion(solidObjects[x]);
      deadObjects.push(solidObjects[x]);
    }
  }
  this.removeDeadObjects();
}

Engine.prototype.removeDeadObjects = function() {
  for (var x = 0, y = deadObjects.length; x < y; x++) {
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

Engine.prototype.convertObjects = function (localGameObjects, remoteGameObjects) {

    var convertedObjects = [];

    for (var x = 0, y = remoteGameObjects.length; x < y; x++) {

        if (remoteGameObjects[x].Type == 'Human' ||
            remoteGameObjects[x].Type == 'Alpha' ||
            remoteGameObjects[x].Type == 'Bravo') {

            var newShip = new Ship();

            newShip.copy(remoteGameObjects[x]);

            convertedObjects.push(newShip);

        }

        else if (remoteGameObjects[x].Type == 'Missile') {

            var newMissile = new Missile();

            newMissile.copy(remoteGameObjects[x]);

            convertedObjects.push(newMissile);

        }

  }

  localGameObjects = removeByAttr(localGameObjects, "Type", "Human");

  localGameObjects = removeByAttr(localGameObjects, "Type", "Alpha");

  localGameObjects = removeByAttr(localGameObjects, "Type", "Bravo");

  localGameObjects = removeByAttr(localGameObjects, "Type", "Missile");

  for (i = 0; i < convertedObjects.length; i++) {

      localGameObjects.push(convertedObjects[i]);

  }

  return localGameObjects;

}
