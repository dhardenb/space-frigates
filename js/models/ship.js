// ship.js

function Ship(shipType) {

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
	
	if (shipType == 'Computer') {
	
	   this.setStartingPosition();
	}
	
	this.createView();
    this.updateView();
    
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

Ship.prototype.createView = function() {
    
    this.svgElement = document.createElementNS("http://www.w3.org/2000/svg","path");

    if (this.Type == 'Human') {
        this.svgElement.setAttributeNS(null, 'stroke', 'green');
        this.svgElement.setAttributeNS(null, 'd', 'M -1 -5 L 1 -5 L 2 -4 L 2 -3 L 1 -3 L 1 1 L 3 3 L 3 4 L 2 5 L -2 5 L -3 4 L -3 3 L -1 1 L -1 -3 L -2 -3 L -2 -4 Z');
    }
    else {
        this.svgElement.setAttributeNS(null, 'stroke', 'red');
        this.svgElement.setAttributeNS(null, 'd', 'M -5 5 L -2 2 L -1 2 L 0 3 L 1 2 L 2 2 L 5 5 L 5 -1 L 1 -5 L -1 -5 L -5 -1 Z');
    }
  
    this.svgElement.setAttributeNS(null, 'stroke-linejoin', 'round');
    this.svgElement.setAttributeNS(null, 'stroke-width', 2 / currentScale);
    this.svgElement.setAttributeNS(null, 'fill', 'black');
    this.svgElement.setAttribute('transform', 'translate('+this.LocationX+','+this.LocationY+') rotate('+this.Facing+')');

    mapGroup.appendChild(this.svgElement);
}

Ship.prototype.updateView = function() 
{  
    this.svgElement.setAttribute('transform', 'translate('+this.LocationX+','+this.LocationY+') rotate('+this.Facing+')');
  
    if (this.Type == 'Human') {
    
        var x = 0 - this.LocationX;
        var y = 0 - this.LocationY;
        var z = 0 - this.Facing;
    
        rotateGroup.setAttribute('transform', 'translate('+ 0 +','+ 0 +') rotate('+ z +')');
        translateGroup.setAttribute('transform', 'translate('+ x +','+ y +') rotate('+ 0 +')');
  }
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

                // Create a new thruster and corresponding thrusterView as well as the
                // publishing the proper events.
                //
                // NOTE: Creating these objects here does not see like a good idea.
                var newThruster = new Thruster(this);
                gameObjects.push(newThruster);
                var newThrusterView = new ThrusterView(newThruster);
                postOffice.subscribe("ThrusterMoved" + newThruster.Id, newThrusterView.update.bind(newThrusterView));
                postOffice.subscribe('ThrusterDestroyed' + newThruster.Id, newThrusterView.destroy.bind(newThrusterView));
                
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