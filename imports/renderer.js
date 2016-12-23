
Renderer = function Renderer() {

    zoomLevel = 400;

    mapRadius = 500;

    availableWidth = 0;

    availableHeight = 0;

    currentScale = 0;

    background = null;

    this.determineGuiDimensions();

    this.clearBackground();

    this.createGui();

}

Renderer.prototype.determineGuiDimensions = function() {

    var windowOffset = 22;

    availableWidth = window.innerWidth - windowOffset;

    availableHeight = window.innerHeight - windowOffset;

    if (availableHeight < availableWidth) {

        availablePixels = availableHeight;

    }

    else {

        availablePixels = availableWidth;
    }

    currentScale = availablePixels / zoomLevel;

}

Renderer.prototype.clearBackground = function() {

    background = document.getElementById("background");

    while (background.firstChild) {

        background.removeChild(background.firstChild);

    }

}

Renderer.prototype.createGui = function() {

    background = document.getElementById("background");

    background.setAttributeNS(null, "height", availableHeight);

    background.setAttributeNS(null, "width", availableWidth);

	portGroup = document.createElementNS("http://www.w3.org/2000/svg","g");

    portGroup.setAttribute('id', 'portGroup');

    portGroup.setAttribute('transform', 'translate('+availableWidth / 2+','+availableHeight / 2+') scale(' + currentScale + ')');

    background.appendChild(portGroup);

	rotateGroup = document.createElementNS("http://www.w3.org/2000/svg","g");

    rotateGroup.setAttribute('id', 'rotateGroup');

    portGroup.appendChild(rotateGroup);

	translateGroup = document.createElementNS("http://www.w3.org/2000/svg","g");

    translateGroup.setAttribute('id', 'translateGroup');

    rotateGroup.appendChild(translateGroup);

    starGroup = document.createElementNS("http://www.w3.org/2000/svg","g");

    starGroup.setAttribute('id', 'starGroup');

    translateGroup.appendChild(starGroup);

	mapGroup = document.createElementNS("http://www.w3.org/2000/svg","g");

    mapGroup.setAttribute('id', 'mapGroup');

    translateGroup.appendChild(mapGroup);

    mapBoundry = document.createElementNS("http://www.w3.org/2000/svg","circle");

    mapBoundry.setAttributeNS(null, "cx", 0);

    mapBoundry.setAttributeNS(null, "cy", 0);

    mapBoundry.setAttributeNS(null, "r", mapRadius);

    mapBoundry.setAttributeNS(null, "stroke", "yellow");

    mapBoundry.setAttributeNS(null, "stroke-width", "5px");

    mapBoundry.setAttributeNS(null, "stroke-opacity", 0.5);

    mapBoundry.setAttributeNS(null, "fill", "yellow");

    mapBoundry.setAttributeNS(null, "fill-opacity", 0.0);

    starGroup.appendChild(mapBoundry);

    this.createStars();

}

Renderer.prototype.createStars = function() {

    for (var x = mapRadius*-1; x < mapRadius; x++) {

        for (var y = mapRadius*-1; y < mapRadius; y++) {

            if (Math.floor((Math.random()*1000)+1) == 1) {

                // Make sure the star is within the radius of the map size
                if (x * x + y * y < mapRadius * mapRadius) {

                    this.renderStar(new Star(x, y));

                }

            }

        }

    }

}

Renderer.prototype.update = function () {

    this.clearMap();

    for (var i=0, j=gameObjects.length; i<j; i++) {

        if (gameObjects[i].Type == 'Human' || gameObjects[i].Type == 'Alpha' || gameObjects[i].Type == 'Bravo') {

            this.renderShip(gameObjects[i]);

        }

        else if (gameObjects[i].Type == 'Particle') {

            this.renderParticle(gameObjects[i]);

        }

        else if (gameObjects[i].Type == 'Thruster') {

            this.renderThruster(gameObjects[i]);

        }

        else if (gameObjects[i].Type == 'Missile') {

            this.renderMissle(gameObjects[i]);

        }

    }

}

Renderer.prototype.clearMap = function() {

    var map = document.getElementById("mapGroup");

    while (map.firstChild) {

        map.removeChild(map.firstChild);

    }

}

Renderer.prototype.renderStar = function (star) {
  var starElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  starElement.setAttributeNS(null, "cx", star.xLocation);
  starElement.setAttributeNS(null, "cy", star.yLocation);
  starElement.setAttributeNS(null, "r", "0.5");
  starElement.setAttributeNS(null, "fill", "white");
  starElement.setAttributeNS(null, "fill-opacity", star.alpha);
  starGroup.appendChild(starElement);
}

Renderer.prototype.renderParticle = function (particle) {
  var particleElement = document.createElementNS("http://www.w3.org/2000/svg","circle");
  particleElement.setAttributeNS(null, 'cx', particle.LocationX);
  particleElement.setAttributeNS(null, 'cy', particle.LocationY);
  particleElement.setAttributeNS(null, 'r', particle.Size);
  particleElement.setAttributeNS(null, 'stroke', 'red');
  particleElement.setAttributeNS(null, 'stroke-width', 2 / currentScale);
  particleElement.setAttributeNS(null, 'fill', 'yellow');
  mapGroup.appendChild(particleElement);
}

Renderer.prototype.renderThruster = function (thruster) {
  var thrusterElement = document.createElementNS("http://www.w3.org/2000/svg","path");
	thrusterElement.setAttributeNS(null, 'stroke', 'red');
	thrusterElement.setAttributeNS(null, 'd', 'M-2 0 L2 0 L0 6 Z');
	thrusterElement.setAttributeNS(null, 'stroke-linejoin', 'round');
  thrusterElement.setAttributeNS(null, 'stroke-width', 2 / currentScale);
  thrusterElement.setAttributeNS(null, 'fill', 'yellow');
  thrusterElement.setAttribute('transform', 'translate('+thruster.LocationX+','+thruster.LocationY+') rotate('+thruster.Facing+')');
	mapGroup.appendChild(thrusterElement);
}

Renderer.prototype.renderMissle = function (missile) {
  var missleElement = document.createElementNS("http://www.w3.org/2000/svg","circle");
	missleElement.setAttributeNS(null, 'cx', missile.LocationX);
	missleElement.setAttributeNS(null, 'cy', missile.LocationY);
	missleElement.setAttributeNS(null, 'r', missile.Size);
  missleElement.setAttributeNS(null, 'stroke', 'red');
  missleElement.setAttributeNS(null, 'stroke-width', 1 / currentScale);
	missleElement.setAttributeNS(null, 'fill', 'yellow');
	mapGroup.appendChild(missleElement);
}

Renderer.prototype.renderShip = function (ship) {
  var shipElement = document.createElementNS("http://www.w3.org/2000/svg","path");
  shipElement.setAttributeNS(null, 'fill', 'black');

  if (ship.Type == 'Human') {

    if (ship.Id == playerShipId) {
        shipElement.setAttributeNS(null, 'stroke', 'green');

        // Update the view to center the the player's ship!
        var x = 0 - ship.LocationX;
        var y = 0 - ship.LocationY;
        var z = 0 - ship.Facing;
        translateGroup.setAttribute('transform', 'translate('+ x +','+ y +') rotate('+ 0 +')');
    }
    else {
      shipElement.setAttributeNS(null, 'stroke', 'red');
    }

      shipElement.setAttributeNS(null, 'd', 'M -5 5 L -2 2 L -1 2 L 0 3 L 1 2 L 2 2 L 5 5 L 5 -1 L 1 -5 L -1 -5 L -5 -1 Z');
  }
  else if (ship.Type == 'Alpha') {
      shipElement.setAttributeNS(null, 'stroke', 'grey');
      shipElement.setAttributeNS(null, 'd', 'M -5 5 L -2 2 L -1 2 L 0 3 L 1 2 L 2 2 L 5 5 L 5 -1 L 1 -5 L -1 -5 L -5 -1 Z');
  }
  else if (ship.Type == 'Bravo') {
      shipElement.setAttributeNS(null, 'stroke', 'grey');
      shipElement.setAttributeNS(null, 'd', 'M -5 5 L -2 2 L -1 2 L 0 3 L 1 2 L 2 2 L 5 5 L 5 -1 L 1 -5 L -1 -5 L -5 -1 Z');
  }

  shipElement.setAttributeNS(null, 'stroke-linejoin', 'round');
  shipElement.setAttributeNS(null, 'stroke-width', 2 / currentScale);
  shipElement.setAttribute('transform', 'translate('+ship.LocationX+','+ship.LocationY+') rotate('+ship.Facing+')');

  mapGroup.appendChild(shipElement);
}
