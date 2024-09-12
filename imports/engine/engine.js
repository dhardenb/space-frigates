import { Player } from "./player.js";
import { Missile } from "./missile.js";
import { Ship } from "./ship.js";
import { Particle } from "./particle.js";
import { Thruster } from "./thruster.js";
import { Debris } from "./debris.js";
import { Sound } from "./sound.js";
import { Utilities } from "../utilities/utilities.js";

export class Engine {
  static gameObjectId = 0;

  constructor(mapRadius) {
    this.deadObjects = [];
    this.explosionSize = 20;
    this.mapRadius = mapRadius;
  }

  static getNextGameObjectId() {
    return ++Engine.gameObjectId;
  }

  update(commands, framesPerSecond) {
    // Can't pre calculate the length of the array because some of the command create new objects
    for (let i = 0; i < gameObjects.length; i++) {
      gameObjects[i].update(commands, framesPerSecond);
    }
    this.collisionDetection();
    this.boundryChecking();
    this.fuelDetection();
  }

  collisionDetection() {
    const solidObjects = this.findSolidObjects();
    // Run colision detection for each solidObject
    for (let i = 0, j = solidObjects.length; i < j; i++) {
      // Find this distance between this and every other object in the game and check to see if it
      // is smaller than the combined radius of the two objects.
      for (let k = 0, l = solidObjects.length; k < l; k++) {
        // Don't let objects colide with themselves!
        if (i != k) {
          if (
            Math.sqrt(
              (solidObjects[i].LocationX - solidObjects[k].LocationX) *
                (solidObjects[i].LocationX - solidObjects[k].LocationX) +
                (solidObjects[i].LocationY - solidObjects[k].LocationY) *
                  (solidObjects[i].LocationY - solidObjects[k].LocationY)
            ) <
            solidObjects[i].Size / 2 + solidObjects[k].Size / 2
          ) {
            // ship hit by missile
            if (
              (solidObjects[k].Type == "Human" ||
                solidObjects[k].Type == "Alpha" ||
                solidObjects[k].Type == "Bravo" ||
                solidObjects[k].Type == "Charlie" ||
                solidObjects[k].Type == "Delta") &&
              solidObjects[i].Type == "Missile"
            ) {
              // The amount of damage that the missle does is determined by
              // the amount of fuel remaining. So, the amount of damage
              // done by the missile is reduced the further is travels.
              // NOTE: Once a missile runs of a fuel it dissapaears
              const damage = solidObjects[i].Fuel;
              // Apply the damage to the taregt ship
              solidObjects[k].takeDamage(damage);
              // If the struck ship has less than zero hull points then
              // it explodes and is destroyed!
              if (solidObjects[k].HullStrength <= 0) {
                this.createDebris(solidObjects[k]);
                this.createExplosion(solidObjects[k]);
                this.deadObjects.push(solidObjects[k]);
                this.scoreDeath(solidObjects[k].Id);
                this.scoreKill(solidObjects[i].Owner);
              }
              break;
              // Ship hit by debris
            } else if (
              (solidObjects[k].Type == "Human" ||
                solidObjects[k].Type == "Alpha" ||
                solidObjects[k].Type == "Bravo" ||
                solidObjects[k].Type == "Charlie" ||
                solidObjects[k].Type == "Delta") &&
              solidObjects[i].Type == "Debris"
            ) {
              // If a ship colides with deris, it should "pick up" the energy
              // from the deris and the debris should be removed from the
              // game.
              solidObjects[k].Fuel += solidObjects[i].Fuel;
              break;
              // debris hit by ship
            } else if (
              solidObjects[k].Type == "Debris" &&
              (solidObjects[k].Type == "Human" ||
                solidObjects[k].Type == "Alpha" ||
                solidObjects[k].Type == "Bravo" ||
                solidObjects[k].Type == "Charlie" ||
                solidObjects[k].Type == "Delta")
            ) {
              this.deadObjects.push(solidObjects[k]);
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
              this.deadObjects.push(solidObjects[k]);
              // No use blowing this up twice!
              break;
            }
          }
        }
      }
    }
    this.removeDeadObjects();
  }

  createDebris(sourceGameObject) {
    const newDebris = new Debris(Engine.getNextGameObjectId());
    newDebris.init(sourceGameObject);
    gameObjects.push(newDebris);
  }

  createExplosion(sourceGameObject) {
    for (let i = 0; i < this.explosionSize; i++) {
      const newParticle = new Particle(Engine.getNextGameObjectId());
      newParticle.init(sourceGameObject);
      gameObjects.push(newParticle);
    }
  }

  fuelDetection() {
    for (let x = 0, y = gameObjects.length; x < y; x++) {
      if (gameObjects[x].Fuel < 0) {
        this.deadObjects.push(gameObjects[x]);
      }
    }
    this.removeDeadObjects();
  }

  findSolidObjects() {
    const solidObjects = [];
    for (let x = 0, y = gameObjects.length; x < y; x++) {
      if (
        gameObjects[x].Type != "Particle" &&
        gameObjects[x].Type != "Thruster" &&
        gameObjects[x].Type != "Player" &&
        gameObjects[x].Type != "Sound"
      ) {
        solidObjects.push(gameObjects[x]);
      }
    }
    return solidObjects;
  }

  boundryChecking() {
    const solidObjects = this.findSolidObjects();
    for (let x = 0, y = solidObjects.length; x < y; x++) {
      // Check to see if GameObject has flown past the border. I do this by measuring the distance
      // from the Game Object to the center of the screen and making sure the distance is smaller
      // than the radius of the screen.
      if (
        !(
          solidObjects[x].LocationX * solidObjects[x].LocationX +
            solidObjects[x].LocationY * solidObjects[x].LocationY <
          this.mapRadius * this.mapRadius
        )
      ) {
        this.createExplosion(solidObjects[x]);
        this.scoreDeath(solidObjects[x].Id);
        this.deadObjects.push(solidObjects[x]);
      }
    }
    this.removeDeadObjects();
  }

  removeDeadObjects() {
    for (let x = 0, y = this.deadObjects.length; x < y; x++) {
      let i = 0;
      for (let j = 0; j < gameObjects.length; j++) {
        if (gameObjects[j].Id == this.deadObjects[x].Id) {
          gameObjects.splice(i, 1);
        } else {
          i++;
        }
      }
    }
    this.deadObjects = [];
  }

  removeSoundObjects() {
    gameObjects = Utilities.removeByAttr(gameObjects, "Type", "Sound");
  }

  convertObjects(localGameObjects, remoteGameObjects) {
    // Should change this from a global to class property
    let convertedObjects = [];
    for (let x = 0, y = remoteGameObjects.length; x < y; x++) {
      if (remoteGameObjects[x].Type == "Player") {
        const newPlayer = Object.assign(new Player(), remoteGameObjects[x]);
        convertedObjects.push(newPlayer);
      } else if (
        remoteGameObjects[x].Type == "Human" ||
        remoteGameObjects[x].Type == "Alpha" ||
        remoteGameObjects[x].Type == "Bravo" ||
        remoteGameObjects[x].Type == "Charlie" ||
        remoteGameObjects[x].Type == "Delta"
      ) {
        const newShip = Object.assign(new Ship(), remoteGameObjects[x]);
        convertedObjects.push(newShip);
      } else if (remoteGameObjects[x].Type == "Missile") {
        const newMissile = Object.assign(new Missile(), remoteGameObjects[x]);
        convertedObjects.push(newMissile);
      } else if (remoteGameObjects[x].Type == "Debris") {
        const newDebris = Object.assign(new Debris(), remoteGameObjects[x]);
        convertedObjects.push(newDebris);
      } else if (remoteGameObjects[x].Type == "Sound") {
        const newSound = Object.assign(new Sound(), remoteGameObjects[x]);
        convertedObjects.push(newSound);
      } else if (remoteGameObjects[x].Type == "Thruster") {
        const newThruster = Object.assign(new Thruster(), remoteGameObjects[x]);
        convertedObjects.push(newThruster);
      }
    }
    localGameObjects = Utilities.removeByAttr(localGameObjects, "Type", "Player");
    localGameObjects = Utilities.removeByAttr(localGameObjects, "Type", "Human");
    localGameObjects = Utilities.removeByAttr(localGameObjects, "Type", "Alpha");
    localGameObjects = Utilities.removeByAttr(localGameObjects, "Type", "Bravo");
    localGameObjects = Utilities.removeByAttr(localGameObjects, "Type", "Charlie");
    localGameObjects = Utilities.removeByAttr(localGameObjects, "Type", "Delta");
    localGameObjects = Utilities.removeByAttr(localGameObjects, "Type", "Missile");
    localGameObjects = Utilities.removeByAttr(localGameObjects, "Type", "Debris");
    localGameObjects = Utilities.removeByAttr(localGameObjects, "Type", "Sound");
    localGameObjects = Utilities.removeByAttr(localGameObjects, "Type", "Thruster");
    for (let i = 0; i < convertedObjects.length; i++) {
      localGameObjects.push(convertedObjects[i]);
    }
    return localGameObjects;
  }

  scoreKill(shipId) {
    for (let x = 0, y = gameObjects.length; x < y; x++) {
      if (gameObjects[x].Type == "Player") {
        if (gameObjects[x].ShipId == shipId) {
          gameObjects[x].Kills += 1;
        }
      }
    }
  }

  scoreDeath(shipId) {
    for (let x = 0, y = gameObjects.length; x < y; x++) {
      if (gameObjects[x].Type == "Player") {
        if (gameObjects[x].ShipId == shipId) {
          gameObjects[x].Deaths += 1;
        }
      }
    }
  }
}
