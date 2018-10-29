
Renderer = function Renderer() {

    pixelsPerMeter = 0;

    availableWidth = 0;

    availableHeight = 0;

    stars = [];

    shipPath = new Path2D("M -0.1 -0.5 L 0.1 -0.5 L 0.1 -0.2 L 0.2 -0.1 L 0.2 0.1 L 0.4 0.3 L 0.4 0.4 L 0.2 0.4 L 0.2 0.5 L -0.2 0.5 L -0.2 0.4 L -0.4 0.4 L -0.4 0.3 L -0.2 0.1 L -0.2 -0.1 L -0.1 -0.2 Z");

    thrusterPath = new Path2D("M -0.2 -0.5 L 0.2 -0.5 L 0.0 0.5 Z");

    laserPath = new Path2D("M -0.1 -0.5 L 0.1 -0.5 L 0.1 0.5 L -0.1 0.5 Z");

    version = Meteor.settings.public.version;

    this.getWindowInformation();

    this.setupMapCanvas();

}

Renderer.prototype.getWindowInformation = function() {

    var windowOffset = 22;

    availableWidth = window.innerWidth - windowOffset;

    availableHeight = window.innerHeight - windowOffset;

    availablePixels = availableHeight < availableWidth ? availableHeight : availableWidth;

    pixelsPerMeter = availablePixels / 200;

}

Renderer.prototype.setupMapCanvas = function() {

    map = document.getElementById("map").getContext('2d');

    map.canvas.width = availableWidth;

    map.canvas.height = availableHeight;

    focalX = 0;

    focalY = 0;

    this.createStars();

}

Renderer.prototype.createStars = function() {

    for (var x = 0-mapRadius*2; x < mapRadius*2; x++) {

        for (var y = 0-mapRadius*2; y < mapRadius*2; y++) {

            if (Math.floor((Math.random()*1000)+1) == 1) {

                stars.push(new Star(x, y, Math.random()));

            }

        }

    }

}

Renderer.prototype.renderMap = function () {

    map.clearRect(0, 0, availableWidth, availableHeight);

    map.save();

    this.calculateOffset();

    map.translate(availableWidth / 2 + focalX, availableHeight / 2 + focalY);

    for (let x=0, y=stars.length; x<y; x++) {

        this.renderStar(stars[x]);

    }

    this.renderBoundry();

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

    map.restore();

    map.save();

    this.renderFuelStatus();

    this.renderShieldStatus();

    this.renderTitle();

    this.renderVersion();

    this.renderInstructions();

    map.restore();

}

Renderer.prototype.calculateOffset = function () {

    for (var x = 0, y = gameObjects.length; x < y; x++) {

        if (gameObjects[x].Id == playerShipId) {

            focalX = -gameObjects[x].LocationX * pixelsPerMeter;

            focalY = -gameObjects[x].LocationY * pixelsPerMeter;

        }

    }

}

Renderer.prototype.renderStar = function (star) {

    map.save();

    map.translate(star.x * pixelsPerMeter, star.y * pixelsPerMeter);

    map.beginPath();

    map.arc(0, 0, 0.25 * pixelsPerMeter, 0, 2 * Math.PI);

    map.fillStyle = "rgba(255, 255, 255," + star.alpha + ")";

    map.fill();

    map.restore();

}

Renderer.prototype.renderBoundry = function () {

    map.save();

    map.beginPath();

    map.arc(0, 0, mapRadius * pixelsPerMeter, 0, 2 * Math.PI);

    map.strokeStyle = "rgba(255, 255, 0, 0.5)";

    map.lineWidth = 5;

    map.stroke();

    map.restore();

}

Renderer.prototype.renderShip = function (ship) {

    map.save();

    map.translate(ship.LocationX * pixelsPerMeter, ship.LocationY * pixelsPerMeter);

    map.rotate(ship.Facing * Math.PI / 180);

    map.scale(ship.Size * pixelsPerMeter, ship.Size * pixelsPerMeter);

    if (ship.Type == 'Human') {

        if (ship.Id == playerShipId) {

            map.strokeStyle = "rgba(0, 255, 0, 0.5)";

        }

        else {

            map.strokeStyle = "rgba(255, 0, 0, 0.5)";

        }

    }

    else {

        map.strokeStyle = "rgba(200, 200, 200, 0.5)";

    }

    if (ship.ShieldOn) {

        map.beginPath();

        map.arc(0, 0, 1, 0, 2 * Math.PI);

        map.lineWidth =  0.05;

        map.stroke();

        map.fillStyle = "rgba(0, 255, 0, 0.25)";

        map.fill();

    }

    if (ship.Type == 'Human') {

        if (ship.Id == playerShipId) {

            map.strokeStyle = "rgba(0, 255, 0, 1)";

        }

        else {

            map.strokeStyle = "rgba(255, 0, 0, 1)";

        }

    }

    else {

        map.strokeStyle = "rgba(200, 200, 200, 1)";

    }

    map.lineWidth =  0.1;

    map.lineJoin = "round";

    map.stroke(shipPath);

    map.fillStyle = "rgba(0, 0, 0, 1)";

    map.fill(shipPath);

    map.restore();

}

Renderer.prototype.renderParticle = function (particle) {

    map.save();

    map.translate(particle.LocationX * pixelsPerMeter, particle.LocationY * pixelsPerMeter);

    map.beginPath();

    map.arc(0, 0, particle.Size * 0.5 * pixelsPerMeter, 0, 2 * Math.PI);

    map.strokeStyle = "rgba(255, 0, 0, 1)";

    map.lineWidth = 1.0;

    map.stroke();

    map.fillStyle = "rgba(255, 255, 0, 1)";

    map.fill();

    map.restore();

}

Renderer.prototype.renderThruster = function (thruster) {

    map.save();

    map.translate(thruster.LocationX * pixelsPerMeter, thruster.LocationY * pixelsPerMeter);

    map.rotate(thruster.Facing * Math.PI / 180);

    map.scale(thruster.Size * pixelsPerMeter, thruster.Size * pixelsPerMeter);

    map.strokeStyle = "rgba(255, 0, 0, 1)";

    map.lineWidth = 0.1;

    map.lineJoin = "round";

    map.stroke(thrusterPath);

    map.fillStyle = "rgba(255, 255, 0, 1)";

    map.fill(thrusterPath);

    map.restore();

}

Renderer.prototype.renderMissle = function (missile) {

    map.save();

    map.translate(missile.LocationX * pixelsPerMeter, missile.LocationY * pixelsPerMeter);

    map.rotate(missile.Facing * Math.PI / 180);

    map.scale(missile.Size * pixelsPerMeter, missile.Size * pixelsPerMeter);

    map.strokeStyle = "rgba(255, 255, 255, 1)";

    map.lineWidth = 0.1;

    map.stroke(laserPath);

    map.fillStyle = "rgba(0, 255, 255, 1)";

    map.fill(laserPath);

    map.restore();

}

Renderer.prototype.renderTitle = function () {

    map.save();

    map.strokeStyle = "yellow";

    map.font = "60px Arial";

    map.translate(availableWidth / 2 - map.measureText("Space Frigates").width / 2, 50);

    map.strokeText("Space Frigates", 0, 0);

    map.restore();

}

Renderer.prototype.renderVersion = function () {

    map.save();

    map.fillStyle = "yellow";

    map.font = "20px Arial";

    map.translate(availableWidth - map.measureText("v" + version).width, availableHeight - 10);

    map.fillText("v" + version, 0, 0);

    map.restore();

}

Renderer.prototype.renderFuelStatus = function () {

    var ship = {};

    for (var i=0, j=gameObjects.length; i<j; i++) {

        if (gameObjects[i].Id == playerShipId) {

            ship = gameObjects[i];

        }

    }

    map.save();

    var fuelDisplayValue = Math.floor(ship.Fuel);

    if (fuelDisplayValue > 66) {

        map.fillStyle = "green";

    } else if (fuelDisplayValue > 33) {

        map.fillStyle = "yellow";

    } else {

        map.fillStyle = "red";

    }

    map.font = "20px Arial";

    map.translate(0, availableHeight - 200);

    map.fillText("FUEL: " + fuelDisplayValue, 0, 0);

    map.restore();

}

Renderer.prototype.renderShieldStatus = function () {

    var ship = {};
    var shieldDisplayValue;

    for (var i=0, j=gameObjects.length; i<j; i++) {

        if (gameObjects[i].Id == playerShipId) {

            ship = gameObjects[i];

        }

    }

    map.save();

    if (ship.ShieldOn == 1 || ship.ShieldStatus > 0) {

        shieldDisplayValue = Math.floor(ship.ShieldStatus);

        if (shieldDisplayValue > 66) {

            map.fillStyle = "green";

        } else if (shieldDisplayValue > 33) {

            map.fillStyle = "yellow";

        } else {

            map.fillStyle = "red";

        }

    } else {

        map.fillStyle = "gray";
        shieldDisplayValue = "OFF";

    }

    map.font = "20px Arial";

    map.translate(0, availableHeight - 180);

    map.fillText("SHIELDS: " + shieldDisplayValue, 0, 0);

    map.restore();

}

Renderer.prototype.renderInstructions = function () {

    map.save();

    map.fillStyle = "yellow";

    map.font = "20px Arial";

    map.translate(0, availableHeight - 135);

    map.fillText("ENTER => New Ship", 0, 0);

    map.translate(0, 25);

    map.fillText("W or UP ARROW => Thrust", 0, 0);

    map.translate(0, 25);

    map.fillText("A or LEFT ARROW => Rotate Left", 0, 0);

    map.translate(0, 25);

    map.fillText("D or RIGHT ARROW => Rotate Right", 0, 0);

    map.translate(0, 25);

    map.fillText("S or DOWN ARROW => Stop", 0, 0);

    map.translate(0, 25);

    map.fillText("SPACEBAR => Fire", 0, 0);

    map.restore();

}

Star = function Star(x, y, alpha) {

  this.x = x;
  this.y = y;
  this.alpha = alpha;

}
