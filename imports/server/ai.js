import { Engine } from "../engine/engine.js";
import { Ship } from "../engine/ship.js";

export class Ai {
  constructor(mapRadius) {
    this.mapRadius = mapRadius;

    let brain = require("brain.js");

    this.alphaModel = new brain.NeuralNetwork();
    this.bravoModel = new brain.NeuralNetwork();
    this.charlieModel = new brain.NeuralNetwork();
    this.deltaModel = new brain.NeuralNetwork();

    this.alphaData = [];
    this.bravoData = [];
    this.charlieData = [];
    this.deltaData = [];

    // Create 10,000 lines of random training data and push the data into the data array
    for (let i = 0; i < 100; i++) {
      let input = {};
      let output = {};
      input.capacitor = Math.random();
      input.hull = Math.random();
      input.fuel = Math.random();
      input.shieldOn = Math.random();
      input.velocity = Math.random();
      input.rotatingLeft = Math.random();
      input.rotatingRight = Math.random();
      input.rotationVelocity = Math.random();
      input.facing = Math.random();
      input.heading = Math.random();
      input.shieldOn = Math.round(Math.random());
      input.shieldStrength = Math.random();
      input.locationX = Math.random();
      input.locationY = Math.random();
      input.distanceFromBorder = Math.random();
      input.distanceToNearestSolidObject = Math.random();
      input.bearingToNearestObject = Math.random();
      output.shootMissile = Math.random();
      output.toggleShields = Math.random();
      output.thrust = Math.random();
      output.brake = Math.random();
      output.rotateLeft = Math.random();
      output.rotateRight = Math.random();

      // Gradual increase in thrust as velocity decreases
      if (input.velocity < 0.5) {
        output.thrust = 1 - input.velocity / 2;
      }

      // // Brake when close to the border
      if (input.distanceFromBorder < 0.5) {
        output.brake = 1.0 - input.distanceFromBorder;
      }

      // if (input.distanceFromBorder < 0.5) {
      //   output.rotateLeft = 1.0; // - input.distanceFromBorder;
      // }

      if (input.distanceToNearestSolidObject < 0.25 && input.shieldOn == 0) {
        output.toggleShields = 1.0;
      }

      if (input.distanceToNearestSolidObject < 0.25) {
        output.shootMissile = 0.75;
      }

      // I need to decide to rotate left or right based on current facing and bearing to nearest object
      let bearingToNearestObject = input.bearingToNearestObject;
      let currentFacing = input.facing;
      let leftBearing = bearingToNearestObject - 90;
      let rightBearing = bearingToNearestObject + 90;
      let leftDifference = Math.abs(leftBearing - currentFacing);
      let rightDifference = Math.abs(rightBearing - currentFacing);
      if (leftDifference < rightDifference) {
        output.rotateLeft = 1.0;
      } else {
        output.rotateRight = 1.0;
      }

      this.alphaData.push({ input: input, output: output });
    }

    for (let i = 0; i < 100; i++) {
      let input = {};
      let output = {};
      input.capacitor = Math.random();
      input.hull = Math.random();
      input.fuel = Math.random();
      input.shieldOn = Math.random();
      input.velocity = Math.random();
      input.rotatingLeft = Math.random();
      input.rotatingRight = Math.random();
      input.rotationVelocity = Math.random();
      input.facing = Math.random();
      input.heading = Math.random();
      input.shieldOn = Math.round(Math.random());
      input.shieldStrength = Math.random();
      input.locationX = Math.random();
      input.locationY = Math.random();
      input.distanceToNearestSolidObject = Math.random();
      input.bearingToNearestObject = Math.random();
      output.shootMissile = Math.random();
      output.toggleShields = Math.random();
      output.thrust = Math.random();
      output.brake = Math.random();
      output.rotateLeft = Math.random();
      output.rotateRight = Math.random();

      // Gradual increase in thrust as velocity decreases
      if (input.velocity < 0.5) {
        output.thrust = 1 - input.velocity / 2;
      }

      this.bravoData.push({ input: input, output: output });
    }

    for (let i = 0; i < 100; i++) {
      let input = {};
      let output = {};
      input.capacitor = Math.random();
      input.hull = Math.random();
      input.fuel = Math.random();
      input.shieldOn = Math.random();
      input.velocity = Math.random();
      input.rotatingLeft = Math.random();
      input.rotatingRight = Math.random();
      input.rotationVelocity = Math.random();
      input.facing = Math.random();
      input.heading = Math.random();
      input.shieldOn = Math.round(Math.random());
      input.shieldStrength = Math.random();
      input.locationX = Math.random();
      input.locationY = Math.random();
      input.distanceToNearestSolidObject = Math.random();
      input.bearingToNearestObject = Math.random();
      output.shootMissile = Math.random();
      output.toggleShields = Math.random();
      output.thrust = Math.random();
      output.brake = Math.random();
      output.rotateLeft = Math.random();
      output.rotateRight = Math.random();

      this.charlieData.push({ input: input, output: output });
    }

    for (let i = 0; i < 100; i++) {
      let input = {};
      let output = {};
      input.capacitor = Math.random();
      input.hull = Math.random();
      input.fuel = Math.random();
      input.shieldOn = Math.random();
      input.velocity = Math.random();
      input.rotatingLeft = Math.random();
      input.rotatingRight = Math.random();
      input.rotationVelocity = Math.random();
      input.facing = Math.random();
      input.heading = Math.random();
      input.shieldOn = Math.round(Math.random());
      input.shieldStrength = Math.random();
      input.locationX = Math.random();
      input.locationY = Math.random();
      input.distanceToNearestSolidObject = Math.random();
      input.bearingToNearestObject = Math.random();
      output.shootMissile = Math.random();
      output.toggleShields = Math.random();
      output.thrust = Math.random();
      output.brake = Math.random();
      output.rotateLeft = Math.random();
      output.rotateRight = Math.random();

      this.deltaData.push({ input: input, output: output });
    }

    console.log("Training Red!");
    this.alphaModel.train(this.alphaData);
    console.log("Training Blue!");
    this.bravoModel.train(this.bravoData);
    console.log("Training Yellow!");
    this.charlieModel.train(this.charlieData);
    console.log("Training Green!");
    this.deltaModel.train(this.deltaData);
    console.log("Training Done!");
  }

  createAiShips() {
    const shipTypes = ["Alpha", "Bravo", "Charlie", "Delta"];

    shipTypes.forEach((type) => {
      for (let i = 0; i < 100; i++) {
        let newAiShip = new Ship(Engine.getNextGameObjectId());
        newAiShip.init(type);
        newAiShip.setStartingAiPosition(this.mapRadius);
        gameObjects.push(newAiShip);
      }
    });
  }

  createNewShip() {
    let players = [];
    for (let i = 0, j = gameObjects.length; i < j; i++) {
      if (gameObjects[i].Type == "Player") {
        players.push(gameObjects[i]);
      }
    }
    let numberOfPlayers = players.length;
    let nextShipType = 0;
    if (numberOfPlayers == 0) {
      nextShipType = 0;
    } else if (numberOfPlayers == 1) {
      nextShipType = Math.floor(Math.random() * 400 + 1);
    } else if (numberOfPlayers == 2) {
      nextShipType = Math.floor(Math.random() * 1600 + 1);
    } else if (numberOfPlayers == 3) {
      nextShipType = Math.floor(Math.random() * 3200 + 1);
    } else {
      nextShipType = Math.floor(Math.random() * 6400 + 1);
    }
    let newAiShip;
    if (nextShipType == 1) {
      newAiShip = new Ship(Engine.getNextGameObjectId());
      newAiShip.init("Alpha");
      newAiShip.setStartingAiPosition(this.mapRadius);
      gameObjects.push(newAiShip);
    } else if (nextShipType == 2) {
      newAiShip = new Ship(Engine.getNextGameObjectId());
      newAiShip.init("Bravo");
      newAiShip.setStartingAiPosition(this.mapRadius);
      gameObjects.push(newAiShip);
    } else if (nextShipType == 3) {
      newAiShip = new Ship(Engine.getNextGameObjectId());
      newAiShip.init("Charlie");
      newAiShip.setStartingAiPosition(this.mapRadius);
      gameObjects.push(newAiShip);
    } else if (nextShipType == 4) {
      newAiShip = new Ship(Engine.getNextGameObjectId());
      newAiShip.init("Delta");
      newAiShip.setStartingAiPosition(this.mapRadius);
      gameObjects.push(newAiShip);
    }
  }

  issueCommands(commands) {
    for (let x = 0, y = gameObjects.length; x < y; x++) {
      if (gameObjects[x].Type != "Human") {
        if (Math.floor(Math.random() * 25 + 1) == 1) {
          this.think(commands, gameObjects[x]);
        }
      }
    }
  }

  calculateDistanceFromBorder(gameObject) {
    return 750 - Math.sqrt(gameObject.LocationX * gameObject.LocationX + gameObject.LocationY * gameObject.LocationY);
  }

  think(commands, gameObject) {
    // let commandType = 0;

    if (
      gameObject.Type == "Alpha" ||
      gameObject.Type == "Bravo" ||
      gameObject.Type == "Charlie" ||
      gameObject.Type == "Delta"
    ) {
      let myCapacitor = gameObject.Capacitor / 100;
      let myHull = gameObject.HullStrength / 100;
      let myFuel = gameObject.Fuel / 1000;
      let myShieldOn = gameObject.ShieldOn;
      let myVelocity = gameObject.Velocity / 100; //this may need to be tweaked
      let myRotatingLeft = gameObject.RotationDirection == "Clockwise" ? 0 : 1;
      let myRotatingRight = gameObject.RotationDirection == "CounterClockwise" ? 0 : 1;
      let myRotationVelocity = gameObject.RotationVelocity / 10; // This may need to be tweaked
      let myFacing = gameObject.Facing / 360;
      let myHeading = gameObject.Heading / 360;
      let myShieldStrength = gameObject.ShieldStatus / 100;
      let myLocationX = (gameObject.LocationX + 750) / 1500;
      let myLocationY = (gameObject.LocationY + 750) / 1500;
      let myDistanceFromBorder = this.calculateDistanceFromBorder(gameObject) / 750;
      let myDistanceToNearestSolidObject = calculateDistanceToNearestSolidObject(gameObject) / 1500;
      let myBearingToNearestObject = calculateBearingToNearestObject(gameObject) / 360;
      let answer = 0;

      if (gameObject.Type == "Alpha") {
        answer = this.alphaModel.run({
          capacitor: myCapacitor,
          hull: myHull,
          fuel: myFuel,
          shieldOn: myShieldOn,
          velocity: myVelocity,
          rotatingLeft: myRotatingLeft,
          rotatingRight: myRotatingRight,
          rotationVelocity: myRotationVelocity,
          facing: myFacing,
          heading: myHeading,
          shieldStrength: myShieldStrength,
          locationX: myLocationX,
          locationY: myLocationY,
          distanceFromBorder: myDistanceFromBorder,
          distanceToNearestSolidObject: myDistanceToNearestSolidObject,
          bearingToNearestObject: myBearingToNearestObject,
        });
      } else if (gameObject.Type == "Bravo") {
        answer = this.bravoModel.run({
          capacitor: myCapacitor,
          hull: myHull,
          fuel: myFuel,
          shieldOn: myShieldOn,
          velocity: myVelocity,
          rotatingLeft: myRotatingLeft,
          rotatingRight: myRotatingRight,
          rotationVelocity: myRotationVelocity,
          facing: myFacing,
          heading: myHeading,
          shieldStrength: myShieldStrength,
          locationX: myLocationX,
          locationY: myLocationY,
          distanceFromBorder: myDistanceFromBorder,
          distanceToNearestSolidObject: myDistanceToNearestSolidObject,
          bearingToNearestObject: myBearingToNearestObject,
        });
      } else if (gameObject.Type == "Charlie") {
        answer = this.charlieModel.run({
          capacitor: myCapacitor,
          hull: myHull,
          fuel: myFuel,
          shieldOn: myShieldOn,
          velocity: myVelocity,
          rotatingLeft: myRotatingLeft,
          rotatingRight: myRotatingRight,
          rotationVelocity: myRotationVelocity,
          facing: myFacing,
          heading: myHeading,
          shieldStrength: myShieldStrength,
          locationX: myLocationX,
          locationY: myLocationY,
          distanceFromBorder: myDistanceFromBorder,
          distanceToNearestSolidObject: myDistanceToNearestSolidObject,
          bearingToNearestObject: myBearingToNearestObject,
        });
      } else if (gameObject.Type == "Delta") {
        answer = this.deltaModel.run({
          capacitor: myCapacitor,
          hull: myHull,
          fuel: myFuel,
          shieldOn: myShieldOn,
          velocity: myVelocity,
          rotatingLeft: myRotatingLeft,
          rotatingRight: myRotatingRight,
          rotationVelocity: myRotationVelocity,
          facing: myFacing,
          heading: myHeading,
          shieldStrength: myShieldStrength,
          locationX: myLocationX,
          locationY: myLocationY,
          distanceFromBorder: myDistanceFromBorder,
          distanceToNearestSolidObject: myDistanceToNearestSolidObject,
          bearingToNearestObject: myBearingToNearestObject,
        });
      }

      for (let key in answer) {
        if (answer[key] >= 0.5) {
          switch (key) {
            case "shootMissile":
              commands.push({ command: 0, targetId: gameObject.Id });
              break;
            case "toggleShields":
              commands.push({ command: 5, targetId: gameObject.Id });
              break;
            case "thrust":
              commands.push({ command: 2, targetId: gameObject.Id });
              break;
            case "brake":
              commands.push({ command: 4, targetId: gameObject.Id });
              break;
            case "rotateLeft":
              commands.push({ command: 1, targetId: gameObject.Id });
              break;
            case "rotateRight":
              commands.push({ command: 3, targetId: gameObject.Id });
              break;
          }
        }
      }
    }

    //   // Find the name of the highest value in the answer object that is equal to or greater than 0.5
    //   let highestValue = 0;
    //   let highestValueName = "";
    //   for (let key in answer) {
    //     if (answer[key] >= 0.5 && answer[key] > highestValue) {
    //       highestValue = answer[key];
    //       highestValueName = key;
    //     }
    //   }

    //   switch (highestValueName) {
    //     case "shootMissile":
    //       commands.push({ command: 0, targetId: gameObject.Id });
    //       break;
    //     case "toggleShields":
    //       commands.push({ command: 5, targetId: gameObject.Id });
    //       break;
    //     case "thrust":
    //       commands.push({ command: 2, targetId: gameObject.Id });
    //       break;
    //     case "brake":
    //       commands.push({ command: 4, targetId: gameObject.Id });
    //       break;
    //     case "rotateLeft":
    //       commands.push({ command: 1, targetId: gameObject.Id });
    //       break;
    //     case "rotateRight":
    //       commands.push({ command: 3, targetId: gameObject.Id });
    //       break;
    //   }
    // }

    // Function to calculate the distance to the nearest solid object
    function calculateDistanceToNearestSolidObject(gameObject) {
      let nearestDistance = 1500; // This is the initial value, not always returned
      for (let i = 0, j = gameObjects.length; i < j; i++) {
        // The function doesn't always return 1500. It's just the initial value.
        // The issue is that there might not be any objects with Type "Solid".
        // We should check for other relevant object types as well.
        if (
          gameObjects[i].Type == "Human" ||
          gameObjects[i].Type == "Alpha" ||
          gameObjects[i].Type == "Bravo" ||
          gameObjects[i].Type == "Charlie" ||
          gameObjects[i].Type == "Delta" ||
          gameObjects[i].Type == "Missile" ||
          gameObjects[i].Type == "Debris"
        ) {
          let distance = Math.sqrt(
            (gameObject.LocationX - gameObjects[i].LocationX) ** 2 +
              (gameObject.LocationY - gameObjects[i].LocationY) ** 2
          );
          if (distance < nearestDistance && distance > 0) {
            // Avoid comparing with self
            nearestDistance = distance;
          }
        }
      }
      return nearestDistance;
    }

    // Function to calculate the bearing to the nearest object
    function calculateBearingToNearestObject(gameObject) {
      let nearestDistance = 1500;
      let nearestObject = null;
      for (let i = 0, j = gameObjects.length; i < j; i++) {
        if (
          gameObjects[i].Type == "Human" ||
          gameObjects[i].Type == "Alpha" ||
          gameObjects[i].Type == "Bravo" ||
          gameObjects[i].Type == "Charlie" ||
          gameObjects[i].Type == "Delta" ||
          gameObjects[i].Type == "Debris"
        ) {
          let distance = Math.sqrt(
            (gameObject.LocationX - gameObjects[i].LocationX) ** 2 +
              (gameObject.LocationY - gameObjects[i].LocationY) ** 2
          );
          if (distance < nearestDistance && distance > 0) {
            nearestDistance = distance;
            nearestObject = gameObjects[i];
          }
        }
      }
      // find bearing to nearest object
      let bearing = Math.atan2(
        nearestObject.LocationY - gameObject.LocationY,
        nearestObject.LocationX - gameObject.LocationX
      );
      bearing = (bearing * 180) / Math.PI;
      bearing = (bearing + 360) % 360;
      return bearing;
    }

    // if (gameObject.Type == "Alpha") {
    //   switch (Math.floor(Math.random() * 11 + 1)) {
    //     case 1:
    //       commandType = 2;
    //       break;
    //     case 3:
    //     case 4:
    //     case 11:
    //     case 10:
    //       commandType = 0;
    //       break;
    //     case 6:
    //     case 7:
    //       commandType = 1;
    //       break;
    //     case 8:
    //     case 9:
    //       commandType = 3;
    //       break;
    //     case 2:
    //     case 5:
    //       commandType = 4;
    //       break;
    //   }
    // } else if (gameObject.Type == "Bravo") {
    //   switch (Math.floor(Math.random() * 11 + 1)) {
    //     case 1:
    //       commandType = 2;
    //       break;
    //     case 3:
    //     case 4:
    //     case 11:
    //       commandType = 0;
    //       break;
    //     case 6:
    //     case 7:
    //       commandType = 1;
    //       break;
    //     case 8:
    //     case 9:
    //       commandType = 3;
    //       break;
    //     case 2:
    //     case 5:
    //     case 10:
    //       commandType = 4;
    //       break;
    //   }
    // }
    //commands.push({ command: commandType, targetId: gameObject.Id });
  }
}
