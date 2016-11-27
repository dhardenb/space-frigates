Engine = function Engine() {

}

Engine.prototype.update = function () {
  // Can't pre calculate the length of the array because some of the command create new objects
  for (var i = 0; i < gameObjects.length; i++) {
    gameObjects[i].update();
  }
  commands = [];
  this.collisionDetection();
  // this.boundryChecking();
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
  this.removeDeadObjects();
}

Engine.prototype.createExplosion = function (sourceGameObject) {
  for (var i = 0; i < explosionSize; i++) {
    var newParticle = new Particle(sourceGameObject);
    gameObjects.push(newParticle);
  }
}

Engine.prototype.fuelDetection = function () {
  for (var x = 0, y = gameObjects.length; x < y; x++) {
    if (gameObjects[x].Fuel < 1) {
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
    // If the dead object was the human ship, trip the game over flag
    if (deadObjects[x].Type == "Human") {
      gameOver = true;
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

Missile = function Missile(sourceObject) {

  this.Id = gameObjectId;
	this.Type = "Missile";
	this.LocationX = sourceObject.LocationX;
	this.LocationY = sourceObject.LocationY;
	this.Facing = 0;
	this.Heading = sourceObject.Heading;
	this.Velocity = sourceObject.Velocity;
	this.Size = 1;
	this.RotationDirection = "None";
	this.RotationVelocity = 0;
	this.Fuel = 100;

	this.MissileLaunchOffset = 10;
	this.initialVelocity = 5;

	this.calclulateInitialPosition(sourceObject);
	physics.findNewVelocity(this, sourceObject.Facing, this.initialVelocity);

	gameObjectId++;
}

Missile.prototype.calclulateInitialPosition = function(sourceObject) {

	if (sourceObject.Facing == 0) {

		this.LocationY = this.LocationY - sourceObject.Size - this.Size - this.MissileLaunchOffset;
	}
	else if (sourceObject.Facing == 90) {

    	this.LocationX = this.LocationX + sourceObject.Size + this.Size + this.MissileLaunchOffset;
    }
    else if (sourceObject.Facing == 180) {

    	this.LocationY = this.LocationY + sourceObject.Size + this.Size + this.MissileLaunchOffset;
    }
    else if (sourceObject.Facing == 270) {

    	this.LocationX = this.LocationX - sourceObject.Size - this.Size - this.MissileLaunchOffset;
    }
    else if (sourceObject.Facing < 90) {

    	this.LocationX = this.LocationX + (sourceObject.Size + this.Size + this.MissileLaunchOffset)*(Math.sin(sourceObject.Facing * 0.0174532925));
    	this.LocationY = this.LocationY - (sourceObject.Size + this.Size + this.MissileLaunchOffset)*(Math.cos(sourceObject.Facing * 0.0174532925));
    }
    else if (sourceObject.Facing < 180) {

    	this.LocationX = this.LocationX + (sourceObject.Size + this.Size + this.MissileLaunchOffset)*(Math.sin((180 - sourceObject.Facing) * 0.0174532925));
    	this.LocationY = this.LocationY + (sourceObject.Size + this.Size + this.MissileLaunchOffset)*(Math.cos((180 - sourceObject.Facing) * 0.0174532925));
    }
    else if (sourceObject.Facing < 270) {

    	this.LocationX = this.LocationX - (sourceObject.Size + this.Size + this.MissileLaunchOffset)*(Math.sin((sourceObject.Facing - 180) * 0.0174532925));
    	this.LocationY = this.LocationY + (sourceObject.Size + this.Size + this.MissileLaunchOffset)*(Math.cos((sourceObject.Facing - 180) * 0.0174532925));
    }
    else {

    	this.LocationX = this.LocationX - (sourceObject.Size + this.Size + this.MissileLaunchOffset)*(Math.sin((360 - sourceObject.Facing) * 0.0174532925));
    	this.LocationY = this.LocationY - (sourceObject.Size + this.Size + this.MissileLaunchOffset)*(Math.cos((360 - sourceObject.Facing) * 0.0174532925));
    }
}

Missile.prototype.update = function() {
	this.Fuel--;
	physics.moveObjectAlongVector(this);
}

Particle = function Particle(sourceObject) {

	this.Id = gameObjectId;
	this.Type = "Particle";
	this.LocationX = sourceObject.LocationX;
	this.LocationY = sourceObject.LocationY;
	this.Facing = 0;
	this.Heading = Math.random() * 360;
	this.Velocity = Math.random() * 10;
	this.Size = 1;
	this.RotationDirection = "None";
	this.RotationVelocity = 0;
	this.Fuel = Math.random() * 10;

	physics.findNewVelocity(this, sourceObject.Heading, sourceObject.Velocity);

	gameObjectId++;
}

Particle.prototype.update = function() {
  this.Fuel--;
	physics.moveObjectAlongVector(this);
}

Physics = function Physics()
{
}

Physics.prototype.moveObjectAlongVector = function(GameObject)
{
    if (GameObject.Heading == 0)
    {
        GameObject.LocationY = GameObject.LocationY - GameObject.Velocity * gameSpeed;
    }
    else if (GameObject.Heading == 90)
    {
        GameObject.LocationX = GameObject.LocationX + GameObject.Velocity * gameSpeed;
    }
    else if (GameObject.Heading == 180)
    {
        GameObject.LocationY = GameObject.LocationY + GameObject.Velocity * gameSpeed;
    }
    else if (GameObject.Heading == 270)
    {
        GameObject.LocationX = GameObject.LocationX - GameObject.Velocity * gameSpeed;
    }
    else if (GameObject.Heading < 90)
    {
        GameObject.LocationX = GameObject.LocationX + GameObject.Velocity * gameSpeed * (Math.sin(GameObject.Heading * 0.0174532925));
        GameObject.LocationY = GameObject.LocationY - GameObject.Velocity * gameSpeed * (Math.cos(GameObject.Heading * 0.0174532925));
    }
    else if (GameObject.Heading < 180)
    {
        GameObject.LocationX = GameObject.LocationX + GameObject.Velocity * gameSpeed * (Math.sin((180 - GameObject.Heading) * 0.0174532925));
        GameObject.LocationY = GameObject.LocationY + GameObject.Velocity * gameSpeed * (Math.cos((180 - GameObject.Heading) * 0.0174532925));
    }
    else if (GameObject.Heading < 270)
    {
        GameObject.LocationX = GameObject.LocationX - GameObject.Velocity * gameSpeed * (Math.sin((GameObject.Heading - 180) * 0.0174532925));
        GameObject.LocationY = GameObject.LocationY + GameObject.Velocity * gameSpeed * (Math.cos((GameObject.Heading - 180) * 0.0174532925));
    }
    else
    {
        GameObject.LocationX = GameObject.LocationX - GameObject.Velocity * gameSpeed * (Math.sin((360 - GameObject.Heading) * 0.0174532925));
        GameObject.LocationY = GameObject.LocationY - GameObject.Velocity * gameSpeed * (Math.cos((360 - GameObject.Heading) * 0.0174532925));
    }
}

Physics.prototype.findNewVelocity = function(GameObject, NewHeading, NewVelocity)
{
  NewXaxisComponent = this.getXaxisComponent(GameObject.Heading, GameObject.Velocity) + this.getXaxisComponent(NewHeading, NewVelocity);
  NewYaxisComponent = this.getYaxisComponent(GameObject.Heading, GameObject.Velocity) + this.getYaxisComponent(NewHeading, NewVelocity);

  if (NewXaxisComponent == 0 && NewYaxisComponent == 0)
  {
    GameObject.Heading = 0;
    GameObject.Velocity = 0;
  }
  else if (NewXaxisComponent == 0 && NewYaxisComponent < 0)
  {
    GameObject.Heading = 0;
    GameObject.Velocity = Math.abs(NewYaxisComponent);
  }
  else if (NewXaxisComponent > 0 && NewYaxisComponent == 0)
  {
    GameObject.Heading = 90;
    GameObject.Velocity = Math.abs(NewXaxisComponent);
  }
  else if (NewXaxisComponent == 0 && NewYaxisComponent > 0)
  {
    GameObject.Heading = 180;
    GameObject.Velocity = Math.abs(NewYaxisComponent);
  }
  else if (NewXaxisComponent < 0 && NewYaxisComponent == 0)
  {
    GameObject.Heading = 270;
    GameObject.Velocity = Math.abs(NewXaxisComponent);
  }
  else if (NewXaxisComponent < 0 && NewYaxisComponent < 0)
  {
    GameObject.Velocity = Math.sqrt(NewXaxisComponent * NewXaxisComponent + NewYaxisComponent * NewYaxisComponent);
    GameObject.Heading = 360 - Math.atan(NewXaxisComponent / NewYaxisComponent) / 0.0174532925;
  }
  else if (NewXaxisComponent < 0 && NewYaxisComponent > 0)
  {
    GameObject.Velocity = Math.sqrt(NewXaxisComponent * NewXaxisComponent + NewYaxisComponent * NewYaxisComponent);
    GameObject.Heading = (Math.atan(Math.abs(NewXaxisComponent) / NewYaxisComponent) / 0.0174532925) - 180;
  }
  else if (NewXaxisComponent > 0 && NewYaxisComponent < 0)
  {
    GameObject.Velocity = Math.sqrt(NewXaxisComponent * NewXaxisComponent + NewYaxisComponent * NewYaxisComponent);
    GameObject.Heading = Math.atan(NewXaxisComponent / Math.abs(NewYaxisComponent)) / 0.0174532925;
  }
  else if (NewXaxisComponent > 0 && NewYaxisComponent > 0)
  {
    GameObject.Velocity = Math.sqrt(NewXaxisComponent * NewXaxisComponent + NewYaxisComponent * NewYaxisComponent);
    GameObject.Heading = 180 - Math.atan(NewXaxisComponent / NewYaxisComponent) / 0.0174532925;
  }
}

Physics.prototype.getXaxisComponent = function(Direction, Magnitude)
{
  var XaxisComponent = 0;

  if (Direction == 0)
  {
    XaxisComponent = 0;
  }
  else if (Direction == 90)
  {
     XaxisComponent = Magnitude;
  }
  else if (Direction == 180)
  {
    XaxisComponent = 0;
  }
  else if (Direction == 270)
  {
    XaxisComponent = -1 * Magnitude;
  }
  else if (Direction < 90)
  {
    XaxisComponent = Magnitude * (Math.sin(Direction * 0.0174532925));
  }
  else if (Direction < 180)
  {
    XaxisComponent = Magnitude * (Math.sin((180 - Direction) * 0.0174532925));
  }
  else if (Direction < 270)
  {
    XaxisComponent = -1 * Magnitude * (Math.sin((Direction - 180) * 0.0174532925));
  }
  else
  {
    XaxisComponent = -1 * Magnitude * (Math.sin((360 - Direction) * 0.0174532925));
  }

  return XaxisComponent;
}

Physics.prototype.getYaxisComponent = function(Direction, Magnitude)
{
  var YaxisComponent = 0;

  if (Direction == 0)
  {
    YaxisComponent = -1 * Magnitude;
  }
  else if (Direction == 90)
  {
    YaxisComponent = 0;
  }
  else if (Direction == 180)
  {
    YaxisComponent = Magnitude;
  }
  else if (Direction == 270)
  {
    YaxisComponent = 0;
  }
  else if (Direction < 90)
  {
    YaxisComponent =  -1 * Magnitude * (Math.cos(Direction * 0.0174532925));
  }
  else if (Direction < 180)
  {
    YaxisComponent =  Magnitude * (Math.cos((180 - Direction) * 0.0174532925));
  }
  else if (Direction < 270)
  {
    YaxisComponent =  Magnitude * (Math.cos((Direction - 180) * 0.0174532925));
  }
  else
  {
    YaxisComponent =  -1 * Magnitude * (Math.cos((360 - Direction) * 0.0174532925));
  }

  return YaxisComponent;
}

Ship = function Ship(shipType) {

  this.Id = gameObjectId;
  this.Type = shipType;
	this.LocationX = 0;
	this.LocationY = 0;
	this.Facing = 0;
	this.Heading = 0;
	this.Velocity = 0;
	this.Size = 5;
	this.RotationDirection = "None";
	this.RotationVelocity = 0;
	this.Fuel = 1; // Must be at least 1 or object gets removed during collision detection!

	if (shipType != 'Human') {

	   this.setStartingPosition();
	}

	gameObjectId++;
}

Ship.prototype.update = function() {

	for(var x = 0, y = commands.length; x < y; x++) {

	    if (commands[x].targetId == this.Id) {

	    	this.processShipCommand(commands[x].command);
	    	break;
	    }
    }

    if (this.RotationVelocity > 0) {

        if (this.RotationDirection == 'CounterClockwise') {

            this.Facing = this.Facing - this.RotationVelocity * 3 * gameSpeed;
        }
        else {

            this.Facing = this.Facing + this.RotationVelocity * 3 * gameSpeed;
        }
    }

    // This code keeps the Facing Number from 0 to 359. It will break for
    // numbers smaller than -360 and larger than 719
    if (this.Facing < 0) {

        this.Facing = 360 - this.Facing * -1;
    }
    else if (this.Facing > 359) {

        this.Facing = this.Facing - 360;
    }

    if (this.Velocity < 0) {

        this.Velocity = 0;
    }

    physics.moveObjectAlongVector(this);
}

Ship.prototype.setStartingPosition = function() {

  var angle = Math.floor(Math.random() * 360);

  var distanceFromPlayer = 20 * currentScale + Math.floor(Math.random() * 100 * currentScale + 1);

  if (angle == 0) {

    this.LocationX = playerShip.LocationX;
    this.LocationY = playerShip.LocationY + distanceFromPlayer * -1;
  }
  else if (angle == 90) {

    this.LocationX = playerShip.LocationX + distanceFromPlayer;
    this.LocationY = playerShip.LocationY;
  }
  else if (angle == 180) {

    this.LocationX = playerShip.LocationX;
    this.LocationY = playerShip.LocationY + distanceFromPlayer;
  }
  else if (angle == 270) {

    this.LocationX = playerShip.LocationX + distanceFromPlayer * -1;
    this.LocationY = playerShip.LocationY;
  }
  else if (angle < 90) {

    this.LocationX = playerShip.LocationX + distanceFromPlayer * Math.sin(angle * 0.0174532925);
    this.LocationY = playerShip.LocationY + distanceFromPlayer * Math.cos(angle * 0.0174532925) * -1;
  }
  else if (angle < 180) {

    this.LocationX = playerShip.LocationX + distanceFromPlayer * Math.sin((180 - angle) * 0.0174532925);
    this.LocationY = playerShip.LocationY + distanceFromPlayer * Math.cos((180 - angle) * 0.0174532925);
  }
  else if (angle < 270) {

    this.LocationX = playerShip.LocationX + distanceFromPlayer * Math.sin((angle - 180) * 0.0174532925) * -1;
    this.LocationY = playerShip.LocationY + distanceFromPlayer * Math.cos((angle - 180) * 0.0174532925);
  }
  else { // 360
    this.LocationX = playerShip.LocationX + distanceFromPlayer * Math.sin((360 - angle) * 0.0174532925) * -1;
    this.LocationY = playerShip.LocationY + distanceFromPlayer * Math.cos((360 - angle) * 0.0174532925) * -1;
  }

  this.Facing = Math.random()*360+1;
}

Ship.prototype.processShipCommand = function(command) {

    switch (command) {

        case 0: // Fire
            gameObjects.push(new Missile(this));
            break;
        case 3: // Rotate Right
            if (this.RotationDirection == 'None') {

                this.RotationVelocity = this.RotationVelocity + 1;
                this.RotationDirection = 'Clockwise';
            }
            else if (this.RotationDirection == 'CounterClockwise') {

                this.RotationVelocity = this.RotationVelocity - 1;

                if (this.RotationVelocity == 0) {

                    this.RotationDirection = 'None';
                }
            }
            break;
        case 1: // Rotate Left
            if (this.RotationDirection == 'None') {

                this.RotationVelocity = this.RotationVelocity + 1;
                this.RotationDirection = 'CounterClockwise';
            }
            else if (this.RotationDirection == 'Clockwise') {

                this.RotationVelocity = this.RotationVelocity - 1;

                if (this.RotationVelocity == 0) {

                    this.RotationDirection = 'None';
                }
            }
            break;
        case 2: // Accelerate
                physics.findNewVelocity(this, this.Facing, 1)
                gameObjects.push(new Thruster(this));
                break;
        case 4: // Brake
            if (this.Velocity > 0) {

                this.Velocity--;
            }
            if (this.RotationVelocity > 0) {

                this.RotationVelocity--;
                if (this.RotationVelocity == 0) {

                    this.RotationDirection = 'None';
                }
            }
            break;
    }
}

Star = function Star(xLocation, yLocation) {
	this.Type = "Star";
	this.xLocation = xLocation;
	this.yLocation = yLocation;
	this.alpha = Math.random();
}

Star.prototype.update = function() {

}

Star = function Star(xLocation, yLocation) {
	this.Type = "Star";
	this.xLocation = xLocation;
	this.yLocation = yLocation;
	this.alpha = Math.random();
}

Star.prototype.update = function() {

}

Thruster = function Thruster(sourceObject) {

	this.Id = gameObjectId;
	this.Type = "Thruster";
	this.LocationX = sourceObject.LocationX;
	this.LocationY = sourceObject.LocationY;
	this.Facing = sourceObject.Facing;
	this.Heading = sourceObject.Heading;
	this.Velocity = sourceObject.Velocity;
	this.RotationDirection = "None";
	this.RotationVelocity = 0;
	this.Size = 5;
	this.RotationDirection = "None";
	this.RotationVelocity = 0;
	this.Fuel = 5;

	this.ThrusterOffset = 2;
	this.initialVelocity = 0;

	this.calclulateInitialPosition(sourceObject);
	physics.findNewVelocity(this, sourceObject.Facing, this.initialVelocity);

	gameObjectId++;
}

Thruster.prototype.calclulateInitialPosition = function(sourceObject) {

	if (sourceObject.Facing == 0) {

		this.LocationY = this.LocationY + sourceObject.Size + this.ThrusterOffset;
	}
	else if (sourceObject.Facing == 90) {

    	this.LocationX = this.LocationX - sourceObject.Size - this.ThrusterOffset;
    }
    else if (sourceObject.Facing == 180) {

    	this.LocationY = this.LocationY - sourceObject.Size - this.ThrusterOffset;
    }
    else if (sourceObject.Facing == 270) {

    	this.LocationX = this.LocationX + sourceObject.Size + this.ThrusterOffset;
    }
    else if (sourceObject.Facing < 90) {

    	this.LocationX = this.LocationX - (sourceObject.Size + this.ThrusterOffset)*(Math.sin(sourceObject.Facing * 0.0174532925));
    	this.LocationY = this.LocationY + (sourceObject.Size + this.ThrusterOffset)*(Math.cos(sourceObject.Facing * 0.0174532925));
    }
    else if (sourceObject.Facing < 180) {

    	this.LocationX = this.LocationX - (sourceObject.Size + this.ThrusterOffset)*(Math.sin((180 - sourceObject.Facing) * 0.0174532925));
    	this.LocationY = this.LocationY - (sourceObject.Size + this.ThrusterOffset)*(Math.cos((180 - sourceObject.Facing) * 0.0174532925));
    }
    else if (sourceObject.Facing < 270) {

    	this.LocationX = this.LocationX + (sourceObject.Size + this.ThrusterOffset)*(Math.sin((sourceObject.Facing - 180) * 0.0174532925));
    	this.LocationY = this.LocationY - (sourceObject.Size + this.ThrusterOffset)*(Math.cos((sourceObject.Facing - 180) * 0.0174532925));
    }
    else {

    	this.LocationX = this.LocationX + (sourceObject.Size + this.ThrusterOffset)*(Math.sin((360 - sourceObject.Facing) * 0.0174532925));
    	this.LocationY = this.LocationY + (sourceObject.Size + this.ThrusterOffset)*(Math.cos((360 - sourceObject.Facing) * 0.0174532925));
    }
}

Thruster.prototype.update = function() {
  this.Fuel--;
	physics.moveObjectAlongVector(this);
}
