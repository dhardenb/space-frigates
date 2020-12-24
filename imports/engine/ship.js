import {Missile} from './missile.js';
import {Physics} from './physics.js';

Ship = function Ship() {
    this.Size = 8.0;
    this.MaxHullStrength = 100;
    this.ThrusterStrength = 100;
    this.MaxThrusterStrength = 100;
    this.PlasmaCannonStrength = 100;
    this.MaxPlasmaCannonStrength = 100;
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
}

Ship.prototype.determineCurrentCommand = function() {

    ///////////////////////////////////////////////////////
    // Determine Current Command
    ///////////////////////////////////////////////////////
    this.currentCommand = null;

	for(var x = 0, y = commands.length; x < y; x++) {

	    if (commands[x].targetId == this.Id) {

	    	this.currentCommand = commands[x].command;

	    	break;
	    }
    }
}

Ship.prototype.updateRector = function() {

    ///////////////////////////////////////////////////////////////////////////
    // Reactor
    //
    // The Reactor is responsible for converting fuel into energy.
    //
    // The primary attribute is how many kilos of fuel the plant
    // can convert to joules per second.
    //
    // Secondary attributes will be: cost, weight, and effeiceny.
    //
    // The tradition conversion rate has been 15 kilos of fuel per second
    // The traditional fuel potential as been 1 joule of energy per 1 kilo
    //    of fuel
    // The traditional effeciancy has been 100%
    // The traditional capacity of the capacitor has been 100 joules
    // The tradition amount of fuel carried by a Viper class ship is 1000 kilos
    // The tradition cost is N/A
    // The tradition weight is N/A
    //
    // Future potential features:
    //     -) reactor effecincy reduced with damage
    //     -) the ability to set run rate (right now it is always 100%)
    //     -) ability to put reactor into overdrive, which gives risk of 
    //     -) the ability to track use for maintenance purposes
    //     -) the amount of "noise" the unit gives off, making the ship 
    //        easier or harder to track
    ///////////////////////////////////////////////////////////////////////////

    // Kilograms of fuel the reactor consumes per second
    var reactorConversionRate = 15;

    // Perctage of kilos of fuel turned into joules of energy
    var reactorConversionEffeciancy = 1.0;

    // How many joules of energy each kilo of fuel creates
    var fuelPotential = 1.0;

    // Amount of jouels of energy the capacitor can hold    
    var capacitorCapacity = 100;

    if (this.Fuel >= reactorConversionRate / framesPerSecond) {
        if (this.Capacitor <= capacitorCapacity - reactorConversionRate * fuelPotential * reactorConversionEffeciancy / framesPerSecond) {
            this.Fuel -= reactorConversionRate / framesPerSecond;
            this.Capacitor += reactorConversionRate * fuelPotential * reactorConversionEffeciancy / framesPerSecond;
        }
    }
}

Ship.prototype.updateSolarPanels = function() {
    
    ///////////////////////////////////////////////////////////////////////////
    // Solar Panels 
    //
    // In addition to the ship's reactor, energy is also produced by the
    //      ships solor panels. Although the joules of energy generated in this 
    //      way is much smaller than the reactor, it serves as a backup system
    //      in case the ship runs out of fuel or the reactor is damaged.
    //
    ///////////////////////////////////////////////////////////////////////////

    // Joules generated per second
    var solarConversionRate = 3;

    // Percentage of maximum conversion rate possible
    var solarConversionEffeciancy = 1;

    // Amount of jouels of energy the capacitor can hold  
    var capacitorCapacity = 100;

    if (this.Capacitor <= capacitorCapacity - solarConversionRate * solarConversionEffeciancy / framesPerSecond) {
        this.Capacitor += solarConversionRate * solarConversionEffeciancy / framesPerSecond;
    }
}

Ship.prototype.updateBrakes = function() {
    
    ///////////////////////////////////////////////////////
    // Update Brakes
    ///////////////////////////////////////////////////////
    if (this.currentCommand == 4) {

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
}

Ship.prototype.fireMissile = function() {

    ///////////////////////////////////////////////////////
    // Fire Missile
    ///////////////////////////////////////////////////////
    if (this.currentCommand == 0) {

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
            const newMissile = new Missile();
            newMissile.init(this);
            gameObjects.push(newMissile);
            
            var newSound = new mySound();
            newSound.init("MissileFired", this);
            gameObjects.push(newSound);
        }
    }
}

Ship.prototype.updateThrusters = function() {

    ///////////////////////////////////////////////////////
    // Main Thrusters
    ///////////////////////////////////////////////////////
    if (this.currentCommand == 2) {

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
            Physics.findNewVelocity(this, this.Facing, 20);
            var newThruster = new Thruster();
            newThruster.init(this);
            gameObjects.push(newThruster);
        }
    }
}

Ship.prototype.rotateLeft = function() {

    ///////////////////////////////////////////////////////
    // Rotate Left
    ///////////////////////////////////////////////////////
    if (this.currentCommand == 3) {

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
}

Ship.prototype.rotateRight = function() {

    ///////////////////////////////////////////////////////
    // Rotate Right
    ///////////////////////////////////////////////////////
    if (this.currentCommand == 1) {

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
}

Ship.prototype.updateShields = function() {

    ///////////////////////////////////////////////////////
    // Shields
    ///////////////////////////////////////////////////////
    if (this.currentCommand == 5) {
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
}

Ship.prototype.updateVelocity = function() {

    ///////////////////////////////////////////////////////
    // Update Velocity
    ///////////////////////////////////////////////////////
    if (this.Velocity < 0) {
        this.Velocity = 0;
    }
}

Ship.prototype.updateFuelTank = function() {

    ///////////////////////////////////////////////////////
    // Fuel Tank
    ///////////////////////////////////////////////////////
    if (this.Fuel > 1000) {
        this.Fuel = 1000;
    }
}

Ship.prototype.updateFacing = function() {

    ///////////////////////////////////////////////////////
    // Update Facing
    ///////////////////////////////////////////////////////
    Physics.findNewFacing(this);
}

Ship.prototype.updateLocation = function() {

    ///////////////////////////////////////////////////////
    // Update Location
    ///////////////////////////////////////////////////////
    Physics.moveObjectAlongVector(this);
}

Ship.prototype.update = function() {

    this.determineCurrentCommand();
    this.updateRector();
    this.updateSolarPanels();
    this.updateBrakes();
    this.fireMissile();
    this.updateThrusters();
    this.rotateLeft();
    this.rotateRight();
    this.updateShields();
    this.updateVelocity();
    this.updateFuelTank();
    this.updateFacing();
    this.updateLocation();    
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

Ship.prototype.takeDamage = function (damage) {

    if (this.ShieldStatus < damage) {
        this.ShieldStatus = 0;
        this.HullStrength -= damage - this.ShieldStatus;
        this.checkForComponentDamage();
    } else {
        this.ShieldStatus -= damage;
    }

}

Ship.prototype.checkForComponentDamage = function () {

    if (this.HullStrength / this.MaxHullStrength <= .33) {
        // Something is taking damage!!!
    }
    else if (this.HullStrength / this.MaxHullStrength <= .66) {
        // Something might take damage!!!
    }

}
