import './player.js';
import {Missile} from './missile.js';
import './ship.js';
import './particle.js';
import './thruster.js';
import {Physics} from './physics.js';
import {Debris} from './debris.js';
import './sound.js';
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

Engine.prototype.update = function (currentFramesPerSecond) {

  framesPerSecond = currentFramesPerSecond;

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
  
  var solidObjects = this.findSolidObjects();

  // Run colision detection for each solidObject
  for (var i = 0, j = solidObjects.length; i < j; i++) {

    // Find this distance between this and every other object in the game and check to see if it
    // is smaller than the combined radius of the two objects.
    for (var k = 0, l = solidObjects.length; k < l; k++) {

      // Don't let objects colide with themselves!
      if (i != k) {

        if (Math.sqrt((solidObjects[i].LocationX - solidObjects[k].LocationX) * (solidObjects[i].LocationX - solidObjects[k].LocationX) + (solidObjects[i].LocationY - solidObjects[k].LocationY) * (solidObjects[i].LocationY - solidObjects[k].LocationY)) < (solidObjects[i].Size / 2 + solidObjects[k].Size / 2)) {

            // ship hit by missile
            if ((solidObjects[k].Type == "Human" ||
                solidObjects[k].Type == "Alpha" ||
                solidObjects[k].Type == "Bravo") &&
                (solidObjects[i].Type == "Missile")) {

                // The amount of damage that the missle does is determined by
                // the amount of fuel remaining. So, the amount of damage
                // done by the missile is reduced the further is travels.
                // NOTE: Once a missile runs of a fuel it dissapaears
                var damage = solidObjects[i].Fuel;

                // Apply the damage to the taregt ship
                solidObjects[k].takeDamage(damage);

                // If the struck ship has less than zero hull points then
                // it explodes and is destroyed!
                if (solidObjects[k].HullStrength <= 0) {

                  this.createDebris(solidObjects[k]);
                  this.createExplosion(solidObjects[k]);
                  deadObjects.push(solidObjects[k]);
                  this.scoreDeath(solidObjects[k].Id);
                  this.scoreKill(solidObjects[i].Owner);
              }

                break;

            // Ship hit by debris
            } else if ((solidObjects[k].Type == "Human" ||
                solidObjects[k].Type == "Alpha" ||
                solidObjects[k].Type == "Bravo") &&
                (solidObjects[i].Type == "Debris")) {

                // If a ship colides with deris, it should "pick up" the energy
                // from the deris and the debris should be removed from the
                // game.
                solidObjects[k].Fuel += solidObjects[i].Fuel;
                break;

            // debris hit by ship
            } else if ((solidObjects[k].Type == "Debris") &&
                (solidObjects[k].Type == "Human" ||
                solidObjects[k].Type == "Alpha" ||
                solidObjects[i].Type == "Bravo")) {

                deadObjects.push(solidObjects[k]);
                break;

            // anything else hit by anything
            } else {

                // This object has collided with something so we get to blow it up!!!
                if (solidObjects[k].Type != "Debris") {
                    this.createExplosion(solidObjects[k]);
                    this.scoreDeath(solidObjects[k].Id);

                }

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

Engine.prototype.createDebris = function (sourceGameObject) {

    var newDebris = new Debris();

    newDebris.init(sourceGameObject);

    gameObjects.push(newDebris);
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
    if (gameObjects[x].Type != 'Particle' && gameObjects[x].Type != 'Thruster' && gameObjects[x].Type != 'Player' && gameObjects[x].Type != 'Sound') {
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
      this.scoreDeath(solidObjects[x].Id);
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

Engine.prototype.removeSoundObjects = function() {

    gameObjects = removeByAttr(gameObjects, "Type", "Sound");

}

Engine.prototype.convertObjects = function (localGameObjects, remoteGameObjects) {

    var convertedObjects = [];

    for (var x = 0, y = remoteGameObjects.length; x < y; x++) {

        if (remoteGameObjects[x].Type == 'Player') {
          var newPlayer = Object.assign(new Player, remoteGameObjects[x]);
          convertedObjects.push(newPlayer);
        }

        else if (remoteGameObjects[x].Type == 'Human' ||
                  remoteGameObjects[x].Type == 'Alpha' ||
                  remoteGameObjects[x].Type == 'Bravo') {
          var newShip = Object.assign(new Ship, remoteGameObjects[x]);
          convertedObjects.push(newShip);
        }

        else if (remoteGameObjects[x].Type == 'Missile') {
          const newMissile = Object.assign(new Missile, remoteGameObjects[x]);
          convertedObjects.push(newMissile);
        }

        else if (remoteGameObjects[x].Type == 'Debris') {
          var newDebris = Object.assign(new Debris, remoteGameObjects[x]);
          convertedObjects.push(newDebris);
        }

        else if (remoteGameObjects[x].Type == 'Sound') {
          var newSound = Object.assign(new mySound, remoteGameObjects[x]);
          convertedObjects.push(newSound);
        }

        else if (remoteGameObjects[x].Type == 'Thruster') {
          var newThruster = Object.assign(new Thruster, remoteGameObjects[x]);
          convertedObjects.push(newThruster);
        }

  }

  localGameObjects = removeByAttr(localGameObjects, "Type", "Player");
  
  localGameObjects = removeByAttr(localGameObjects, "Type", "Human");

  localGameObjects = removeByAttr(localGameObjects, "Type", "Alpha");

  localGameObjects = removeByAttr(localGameObjects, "Type", "Bravo");

  localGameObjects = removeByAttr(localGameObjects, "Type", "Missile");

  localGameObjects = removeByAttr(localGameObjects, "Type", "Debris");

  localGameObjects = removeByAttr(localGameObjects, "Type", "Sound");

  localGameObjects = removeByAttr(localGameObjects, "Type", "Thruster");

  for (i = 0; i < convertedObjects.length; i++) {

      localGameObjects.push(convertedObjects[i]);

  }

  return localGameObjects;

}

Engine.prototype.scoreKill = function (shipId) {
    for (var x = 0, y = gameObjects.length; x < y; x++) {
        if (gameObjects[x].Type == 'Player') {
            if (gameObjects[x].ShipId == shipId) {
                gameObjects[x].Kills += 1;
            }
        }
    }
}

Engine.prototype.scoreDeath = function (shipId) {
    for (var x = 0, y = gameObjects.length; x < y; x++) {
        if (gameObjects[x].Type == 'Player') {
            if (gameObjects[x].ShipId == shipId) {
                gameObjects[x].Deaths += 1;
            }
        }
    }
}


