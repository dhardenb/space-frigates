Renderer = function Renderer() {
  this.clearBackground();

  availableWidth = window.innerWidth - 22;
  availableHeight = window.innerHeight - 22;

  if (availableHeight < availableWidth) {

      availablePixels = availableHeight;
  }
  else {

      availablePixels = availableWidth;
  }

  currentScale = availablePixels / zoomLevel;

  this.create();
}

Renderer.prototype.create = function() {

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

  this.createStars();

}

Renderer.prototype.clearBackground = function() {
  background = document.getElementById("background");
  while (background.firstChild) {
      background.removeChild(background.firstChild);
  }
}

Renderer.prototype.clearMap = function() {
  map = document.getElementById("mapGroup");
  while (map.firstChild) {
      map.removeChild(map.firstChild);
  }
}

Renderer.prototype.update = function () {

  // Clear the map
  this.clearMap();

  // rendor the SVG element for each game object
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
  particleElement.setAttributeNS(null, 'r', particle.Size / currentScale);
  particleElement.setAttributeNS(null, 'fill', 'red');
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
	missleElement.setAttributeNS(null, 'fill', 'yellow');
	mapGroup.appendChild(missleElement);
}

Renderer.prototype.renderShip = function (ship) {
  var shipElement = document.createElementNS("http://www.w3.org/2000/svg","path");

  if (ship.Type == 'Human') {
      shipElement.setAttributeNS(null, 'stroke', 'green');
      shipElement.setAttributeNS(null, 'd', 'M -1 -5 L 1 -5 L 2 -4 L 2 -3 L 1 -3 L 1 1 L 3 3 L 3 4 L 2 5 L -2 5 L -3 4 L -3 3 L -1 1 L -1 -3 L -2 -3 L -2 -4 Z');

      var x = 0 - ship.LocationX;
      var y = 0 - ship.LocationY;
      var z = 0 - ship.Facing;

      translateGroup.setAttribute('transform', 'translate('+ x +','+ y +') rotate('+ 0 +')');
  }
  else if (ship.Type == 'Alpha') {
      shipElement.setAttributeNS(null, 'stroke', 'red');
      shipElement.setAttributeNS(null, 'd', 'M -5 5 L -2 2 L -1 2 L 0 3 L 1 2 L 2 2 L 5 5 L 5 -1 L 1 -5 L -1 -5 L -5 -1 Z');
  }
  else if (ship.Type == 'Bravo') {
      shipElement.setAttributeNS(null, 'stroke', 'grey');
      shipElement.setAttributeNS(null, 'd', 'M -5 5 L -2 2 L -1 2 L 0 3 L 1 2 L 2 2 L 5 5 L 5 -1 L 1 -5 L -1 -5 L -5 -1 Z');
  }

  shipElement.setAttributeNS(null, 'stroke-linejoin', 'round');
  shipElement.setAttributeNS(null, 'stroke-width', 2 / currentScale);
  shipElement.setAttributeNS(null, 'fill', 'black');
  shipElement.setAttribute('transform', 'translate('+ship.LocationX+','+ship.LocationY+') rotate('+ship.Facing+')');

  mapGroup.appendChild(shipElement);
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
