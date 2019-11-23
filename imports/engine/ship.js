Ship = function Ship() {
    this.Size = 8.0;
}

Ship.prototype.init = function(shipType) {
    this.Id = engine.getNextGameObjectId();
    this.Type = shipType;
    this.Fuel = 1000;
  	this.LocationX = 0;
  	this.LocationY = 0;
  	this.Facing = 0;
  	this.Heading = 0;
  	this.Velocity = 0;
  	this.RotationDirection = "None";
  	this.RotationVelocity = 0;
    this.ShieldOn = 0;
    this.ShieldStatus = 0;
    this.HullStrength = 100;
    this.Capacitor = 100;
    this.Name = "";
    this.Score = 0;
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
    this.HullStrength = jsonObject.HullStrength;
    this.Capacitor = jsonObject.Capacitor;
    this.Name = jsonObject.Name;
    this.Score = jsonObject.Score;
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
    // Power Plant
    ///////////////////////////////////////////////////////
    if (this.Fuel >= 0.25) {
        if (this.Capacitor < 100) {
            this.Capacitor += 0.25; // BAD! Should be with respect to time!!!
            this.Fuel -= 0.25; // BAD! Should be with respect to time!!!
        }
    }

    ///////////////////////////////////////////////////////
    // Update Brakes
    ///////////////////////////////////////////////////////
    if (currentCommand == 4) {

        var activateBrakes;

        if (this.Capacitor >= 5) {
            this.Capacitor -= 5; // BAD! Should be with respect to time!!!
            activateBrakes = true;
        } else if (this.ShieldStatus >= 10) {
            this.ShieldStatus -= 10; // BAD! Should be with respect to time!!!
            activateBrakes = true;
        } else {
            activateBrakes = false;
        }

        if (activateBrakes) {

            if (this.Velocity > 0) {

                this.Velocity = this.Velocity - 20; // BAD! Should be with respect to time!!!
            }
            if (this.RotationVelocity > 0) {

                this.RotationVelocity--; // BAD! Should be with respect to time!!!
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

        if (this.Capacitor >= 10) {
            this.Capacitor -= 10; // BAD! Should be with respect to time!!!
            activateMissile = true;
        } else if (this.ShieldStatus >= 20) {
            this.ShieldStatus -= 20; // BAD! Should be with respect to time!!!
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

        if (this.Capacitor >= 5) {
            this.Capacitor -=5; // BAD! Should be with respect to time!!!
            activateThruster = true;
        } else if (this.ShieldStatus >= 10) {
            this.ShieldStatus -= 10; // BAD! Should be with respect to time!!!
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

        if (this.Capacitor >= 5) {
            this.Capacitor -= 5; // BAD! Should be with respect to time!!!
            activateRotateLeft = true;
        } else if (this.ShieldStatus >= 10) {
            this.ShieldStatus -= 10; // BAD! Should be with respect to time!!!
            activateRotateLeft = true;
        } else {
            activateRotateLeft = false;
        }

        if (activateRotateLeft) {
            if (this.RotationDirection == 'None') {
                this.RotationDirection = 'Clockwise';
                this.RotationVelocity = this.RotationVelocity + 1; // BAD! Should be with respect to time!!!
            }
            else if (this.RotationDirection == 'Clockwise') {
                if (this.RotationVelocity < 3) {
                    this.RotationVelocity = this.RotationVelocity + 1; // BAD! Should be with respect to time!!!
                }
            }
            else if (this.RotationDirection == 'CounterClockwise') {
                this.RotationVelocity = this.RotationVelocity - 1; // BAD! Should be with respect to time!!!
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

        if (this.Capacitor >= 5) {
            this.Capacitor -= 5; // BAD! Should be with respect to time!!!
            activateRotateRight = true;
        } else if (this.ShieldStatus >= 10) {
            this.ShieldStatus -= 10; // BAD! Should be with respect to time!!!
            activateRotateRight = true;
        } else {
            activateRotateRight = false;
        }

        if (activateRotateRight) {
            if (this.RotationDirection == 'None') {
                this.RotationDirection = 'CounterClockwise';
                this.RotationVelocity = this.RotationVelocity + 1; // BAD! Should be with respect to time!!!
            }
            else if (this.RotationDirection == 'CounterClockwise') {
                if (this.RotationVelocity < 3) {
                    this.RotationVelocity = this.RotationVelocity + 1; // BAD! Should be with respect to time!!!
                }
            }
            else if (this.RotationDirection == 'Clockwise') {
                this.RotationVelocity = this.RotationVelocity - 1; // BAD! Should be with respect to time!!!
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

        if (this.ShieldStatus <= 99.75 && this.Capacitor >= 0.25) {

            this.ShieldStatus = this.ShieldStatus + 0.25; // BAD! Should be with respect to time!!!
            this.Capacitor = this.Capacitor - 0.25; // BAD! Should be with respect to time!!!

        } else if (this.ShieldStatus == 100 && this.Capacitor >= 0.125) {

            this.Capacitor = this.Capacitor - 0.125; // BAD! Should be with respect to time!!!

        } else if (this.ShieldStatus >= 0.25 && this.Capacitor < 0.25) {

            this.ShieldStatus -= 0.25; // BAD! Should be with respect to time!!!

        }

    }

    if (this.ShieldOn == 0) {

        if (this.ShieldStatus >= 0.25) {

            this.ShieldStatus = this.ShieldStatus - 0.25; // BAD! Should be with respect to time!!!

            // As the shields disapate, energy is returned to the capacitor
            // at half the rate.
            if (this.Capacitor <= 99.88) {
                this.Capacitor += 0.12; // BAD! Should be with respect to time!!!
            }

        } else {

            this.ShieldStatus = 0;

        }

    }

    if (this.ShieldStatus > 100) {

        this.ShieldStatus = 100;

    } else if (this.ShieldStatus < 0)  {

        this.ShieldStatus = 0
    }

    ///////////////////////////////////////////////////////
    // Update Velocity
    ///////////////////////////////////////////////////////
    if (this.Velocity < 0) {
        this.Velocity = 0;
    }

    ///////////////////////////////////////////////////////
    // Fuel Tank
    ///////////////////////////////////////////////////////
    if (this.Fuel > 1000) {
        this.Fuel = 1000;
    }

    ///////////////////////////////////////////////////////
    // Update Facing
    ///////////////////////////////////////////////////////
    physics.findNewFacing(this);

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
