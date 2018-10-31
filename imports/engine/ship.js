Ship = function Ship() {

    this.Size = 8.0;

}

Ship.prototype.init = function(shipType) {

    this.Id = engine.getNextGameObjectId();
    this.Type = shipType;
    this.Fuel = 100;
  	this.LocationX = 0;
  	this.LocationY = 0;
  	this.Facing = 0;
  	this.Heading = 0;
  	this.Velocity = 0;
  	this.RotationDirection = "None";
  	this.RotationVelocity = 0;
    this.ShieldOn = 0;
    this.ShieldStatus = 0;

}

Ship.prototype.copy = function(jsonObject) {

    this.Id = jsonObject.Id;
    this.Type = jsonObject.Type;
    this.Fuel = jsonObject.Fuel;
  	this.LocationX = jsonObject.LocationX;
  	this.LocationY = jsonObject.LocationY;
  	this.Facing = jsonObject.Facing;
  	this.Heading = jsonObject.Heading;
  	this.Velocity = jsonObject.Velocity;
  	this.RotationDirection = jsonObject.RotationDirection;
  	this.RotationVelocity = jsonObject.RotationVelocity;
    this.ShieldOn = jsonObject.ShieldOn;
    this.ShieldStatus = jsonObject.ShieldStatus;

}

Ship.prototype.update = function() {

    ///////////////////////////////////////////////////////
    // Determine Current Command
    ///////////////////////////////////////////////////////
    var currentCommand = null;

	for(var x = 0, y = commands.length; x < y; x++) {

	    if (commands[x].targetId == this.Id) {

	    	currentCommand = commands[x].command;

	    	break;
	    }
    }

    ///////////////////////////////////////////////////////
    // Fuel
    ///////////////////////////////////////////////////////
    if (this.Fuel < 100) {
        this.Fuel = this.Fuel + 0.25;
    }

    ///////////////////////////////////////////////////////
    // Update Brakes
    ///////////////////////////////////////////////////////
    if (currentCommand == 4) {

        var activateBrakes;

        if (this.Fuel >= 5) {
            this.Fuel -= 5;
            activateBrakes = true;
        } else if (this.ShieldStatus >= 5) {
            this.ShieldStatus -= 5;
            activateBrakes = true;
        } else {
            activateBrakes = false;
        }

        if (activateBrakes) {

            if (this.Velocity > 0) {

                this.Velocity = this.Velocity - 20;
            }
            if (this.RotationVelocity > 0) {

                this.RotationVelocity--;
                if (this.RotationVelocity == 0) {

                    this.RotationDirection = 'None';
                }
            }
        }
    }

    ///////////////////////////////////////////////////////
    // Fire Missile
    ///////////////////////////////////////////////////////
    if (currentCommand == 0) {

        var activateMissile;

        if (this.Fuel >= 10) {
            this.Fuel -= 10;
            activateMissile = true;
        } else if (this.ShieldStatus >= 10) {
            this.ShieldStatus -= 10;
            activateMissile = true;
        } else {
            activateMissile = false;
        }

        if (activateMissile) {
            var newMissile = new Missile();
            newMissile.init(this);
            gameObjects.push(newMissile);
        }
    }

    ///////////////////////////////////////////////////////
    // Main Thrusters
    ///////////////////////////////////////////////////////
    if (currentCommand == 2) {

        var activateThruster;

        if (this.Fuel >= 5) {
            this.Fuel -=5;
            activateThruster = true;
        } else if (this.ShieldStatus >= 5) {
            this.ShieldStatus -= 5;
            activateThruster = true;
        } else {
            activateThruster = false;
        }

        if (activateThruster) {
            if (this.Velocity < 100) {
                physics.findNewVelocity(this, this.Facing, 20);
                var newThruster = new Thruster();
                newThruster.init(this);
                gameObjects.push(newThruster);
            }
        }
    }

    ///////////////////////////////////////////////////////
    // Rotate Left
    ///////////////////////////////////////////////////////
    if (currentCommand == 3) {

        var activateRotateLeft;

        if (this.Fuel >= 5) {
            this.Fuel -= 5;
            activateRotateLeft = true;
        } else if (this.ShieldStatus >= 5) {
            this.ShieldStatus -= 5;
            activateRotateLeft = true;
        } else {
            activateRotateLeft = false;
        }

        if (activateRotateLeft) {
            if (this.RotationDirection == 'None') {
                this.RotationDirection = 'Clockwise';
                this.RotationVelocity = this.RotationVelocity + 1;
            }
            else if (this.RotationDirection == 'Clockwise') {
                if (this.RotationVelocity < 3) {
                    this.RotationVelocity = this.RotationVelocity + 1;
                }
            }
            else if (this.RotationDirection == 'CounterClockwise') {
                this.RotationVelocity = this.RotationVelocity - 1;
                if (this.RotationVelocity == 0) {
                    this.RotationDirection = 'None';
                }
            }
        }

    }
    ///////////////////////////////////////////////////////
    // Rotate Right
    ///////////////////////////////////////////////////////
    if (currentCommand == 1) {

        var activateRotateRight;

        if (this.Fuel >= 5) {
            this.Fuel -= 5;
            activateRotateRight = true;
        } else if (this.ShieldStatus >= 5) {
            this.ShieldStatus -= 5;
            activateRotateRight = true;
        } else {
            activateRotateRight = false;
        }

        if (activateRotateRight) {
            if (this.RotationDirection == 'None') {
                this.RotationDirection = 'CounterClockwise';
                this.RotationVelocity = this.RotationVelocity + 1;
            }
            else if (this.RotationDirection == 'CounterClockwise') {
                if (this.RotationVelocity < 3) {
                    this.RotationVelocity = this.RotationVelocity + 1;
                }
            }
            else if (this.RotationDirection == 'Clockwise') {
                this.RotationVelocity = this.RotationVelocity - 1;
                if (this.RotationVelocity == 0) {
                    this.RotationDirection = 'None';
                }
            }
        }
    }

    ///////////////////////////////////////////////////////
    // Shields
    ///////////////////////////////////////////////////////
    if (currentCommand == 5) {
        if (this.ShieldOn == 0) {
            this.ShieldOn = 1;
        } else {
            this.ShieldOn = 0;
        }
    }

    if (this.ShieldOn == 1) {

        if (this.ShieldStatus <= 99.75 && this.Fuel >= 0.25) {

            this.ShieldStatus = this.ShieldStatus + 0.25;
            this.Fuel = this.Fuel - 0.25;

        } else if (this.ShieldStatus == 100 && this.Fuel >= 0.125) {

            this.Fuel = this.Fuel - 0.125;

        }

    }

    if (this.ShieldOn == 0) {

        if (this.ShieldStatus >= 0.25) {

            this.ShieldStatus = this.ShieldStatus - 0.25;

        } else {

            this.ShieldStatus = 0;

        }

    }

    ///////////////////////////////////////////////////////
    // Update Facing
    ///////////////////////////////////////////////////////
    if (this.RotationVelocity > 0) {

        if (this.RotationDirection == 'CounterClockwise') {

            this.Facing = this.Facing - this.RotationVelocity * 90 / framesPerSecond;
        }
        else {

            this.Facing = this.Facing + this.RotationVelocity * 90 / framesPerSecond;
        }
    }

    if (this.Facing < 0) {

        this.Facing = 360 - this.Facing * -1;
    }
    else if (this.Facing > 359) {

        this.Facing = this.Facing - 360;
    }

    ///////////////////////////////////////////////////////
    // Update Velocity
    ///////////////////////////////////////////////////////
    if (this.Velocity < 0) {
        this.Velocity = 0;
    }

    ///////////////////////////////////////////////////////
    // Update Location
    ///////////////////////////////////////////////////////
    physics.moveObjectAlongVector(this);
}

Ship.prototype.setStartingHumanPosition = function() {

  var angle = Math.floor(Math.random() * 360);

  var distanceFromCenter = mapRadius / 2;

  if (angle == 0) {

    this.LocationX = 0;
    this.LocationY = distanceFromCenter * -1;
  }
  else if (angle == 90) {

    this.LocationX = distanceFromCenter;
    this.LocationY = 0;
  }
  else if (angle == 180) {

    this.LocationX = 0;
    this.LocationY = distanceFromCenter;
  }
  else if (angle == 270) {

    this.LocationX = distanceFromCenter * -1;
    this.LocationY = 0;
  }
  else if (angle < 90) {

    this.LocationX = distanceFromCenter * Math.sin(angle * 0.0174532925);
    this.LocationY = distanceFromCenter * Math.cos(angle * 0.0174532925) * -1;
  }
  else if (angle < 180) {

    this.LocationX = distanceFromCenter * Math.sin((180 - angle) * 0.0174532925);
    this.LocationY = distanceFromCenter * Math.cos((180 - angle) * 0.0174532925);
  }
  else if (angle < 270) {

    this.LocationX = distanceFromCenter * Math.sin((angle - 180) * 0.0174532925) * -1;
    this.LocationY = distanceFromCenter * Math.cos((angle - 180) * 0.0174532925);
  }
  else { // 360
    this.LocationX = distanceFromCenter * Math.sin((360 - angle) * 0.0174532925) * -1;
    this.LocationY = distanceFromCenter * Math.cos((360 - angle) * 0.0174532925) * -1;
  }

  // NOTE: I want to change this so that the starting facing of the ship is
  // oppostie the angle of it's starting postion relative to the center of the
  // map
  this.Facing = Math.random()*360+1;
}


// I'll have to modify this to take in the players starting position...
Ship.prototype.setStartingAiPosition = function() {

  var angle = Math.floor(Math.random() * 360);

  var distanceFromCenter = Math.floor(Math.random() * mapRadius);

  if (angle == 0) {

    this.LocationX = 0;
    this.LocationY = distanceFromCenter * -1;
  }
  else if (angle == 90) {

    this.LocationX = distanceFromCenter;
    this.LocationY = 0;
  }
  else if (angle == 180) {

    this.LocationX = 0;
    this.LocationY = distanceFromCenter;
  }
  else if (angle == 270) {

    this.LocationX = distanceFromCenter * -1;
    this.LocationY = 0;
  }
  else if (angle < 90) {

    this.LocationX = distanceFromCenter * Math.sin(angle * 0.0174532925);
    this.LocationY = distanceFromCenter * Math.cos(angle * 0.0174532925) * -1;
  }
  else if (angle < 180) {

    this.LocationX = distanceFromCenter * Math.sin((180 - angle) * 0.0174532925);
    this.LocationY = distanceFromCenter * Math.cos((180 - angle) * 0.0174532925);
  }
  else if (angle < 270) {

    this.LocationX = distanceFromCenter * Math.sin((angle - 180) * 0.0174532925) * -1;
    this.LocationY = distanceFromCenter * Math.cos((angle - 180) * 0.0174532925);
  }
  else { // 360
    this.LocationX = distanceFromCenter * Math.sin((360 - angle) * 0.0174532925) * -1;
    this.LocationY = distanceFromCenter * Math.cos((360 - angle) * 0.0174532925) * -1;
  }

  // NOTE: I want to change this so that the starting facing of the ship is
  // oppostie the angle of it's starting postion relative to the center of the
  // map
  this.Facing = Math.random()*360+1;
}
