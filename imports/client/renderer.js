
Renderer = function Renderer() {

    pixelsPerMeter = 0;

    availableWidth = 0;

    availableHeight = 0;

    background = null;

    shipPath = new Path2D("M -0.1 -0.5 L 0.1 -0.5 L 0.1 -0.2 L 0.2 -0.1 L 0.2 0.1 L 0.4 0.3 L 0.4 0.4 L 0.2 0.4 L 0.2 0.5 L -0.2 0.5 L -0.2 0.4 L -0.4 0.4 L -0.4 0.3 L -0.2 0.1 L -0.2 -0.1 L -0.1 -0.2 Z");

    thrusterPath = new Path2D("M -0.2 -0.5 L 0.2 -0.5 L 0.0 0.5 Z");

    laserPath = new Path2D("M -0.1 -0.5 L 0.1 -0.5 L 0.1 0.5 L -0.1 0.5 Z");

    version = Meteor.settings.public.version;

    this.getWindowInformation();

    this.setupBackgroundCanvas();

    this.setupMapCanvas();

}

Renderer.prototype.getWindowInformation = function() {

    var windowOffset = 22;

    availableWidth = window.innerWidth - windowOffset;

    availableHeight = window.innerHeight - windowOffset;

    availablePixels = availableHeight < availableWidth ? availableHeight : availableWidth;

    pixelsPerMeter = availablePixels / 200;

}

Renderer.prototype.setupBackgroundCanvas = function() {

    background = document.getElementById("background").getContext('2d');

    background.canvas.width  = availableWidth;

    background.canvas.height = availableHeight;

    this.renderStars();

    this.renderTitle();

    this.renderVersion();

    this.renderInstructions();

}

Renderer.prototype.setupMapCanvas = function() {

    map = document.getElementById("map").getContext('2d');

    map.canvas.width = availableWidth;

    map.canvas.height = availableHeight;

    focalX = 0;

    focalY = 0;

}

Renderer.prototype.renderStars = function() {

    for (var x = 0; x < availableWidth; x++) {

        for (var y = 0; y < availableHeight; y++) {

            if (Math.floor((Math.random()*1000)+1) == 1) {

                this.renderStar(x, y, Math.random());

            }

        }

    }

}

Renderer.prototype.calculateOffset = function () {

    for (var x = 0, y = gameObjects.length; x < y; x++) {

        if (gameObjects[x].Id == playerShipId) {

            focalX = -gameObjects[x].LocationX * pixelsPerMeter;

            focalY = -gameObjects[x].LocationY * pixelsPerMeter;

        }

    }

}


Renderer.prototype.renderMap = function () {

    map.clearRect(0, 0, availableWidth, availableHeight);

    map.save();

    this.calculateOffset();

    map.translate(availableWidth / 2 + focalX, availableHeight / 2 + focalY);

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

}

Renderer.prototype.renderStar = function (x, y, alpha) {

    background.save();

    background.translate(x, y);

    background.beginPath();

    background.arc(0, 0, 1, 0, 2 * Math.PI);

    background.fillStyle = "rgba(255, 255, 255," + alpha + ")";

    background.fill();

    background.restore();

}

Renderer.prototype.renderTitle = function () {

    background.save();

    background.strokeStyle = "yellow";

    background.font = "60px Arial";

    background.translate(availableWidth / 2 - background.measureText("Space Frigates").width / 2, 50);

    background.strokeText("Space Frigates", 0, 0);

    background.restore();

}

Renderer.prototype.renderVersion = function () {

    background.save();

    background.fillStyle = "yellow";

    background.font = "20px Arial";

    background.translate(availableWidth - background.measureText("v" + version).width, availableHeight - 10);

    background.fillText("v" + version, 0, 0);

    background.restore();

}

Renderer.prototype.renderInstructions = function () {

    background.save();

    background.fillStyle = "yellow";

    background.font = "20px Arial";

    background.translate(0, availableHeight - 135);

    background.fillText("ENTER => New Ship", 0, 0);

    background.translate(0, 25);

    background.fillText("W or UP ARROW => Thrust", 0, 0);

    background.translate(0, 25);

    background.fillText("A or LEFT ARROW => Rotate Left", 0, 0);

    background.translate(0, 25);

    background.fillText("D or RIGHT ARROW => Rotate Right", 0, 0);

    background.translate(0, 25);

    background.fillText("S or DOWN ARROW => Stop", 0, 0);

    background.translate(0, 25);

    background.fillText("SPACEBAR => Fire", 0, 0);

    background.restore();

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

Renderer.prototype.renderShip = function (ship) {

    map.save();

    map.translate(ship.LocationX * pixelsPerMeter, ship.LocationY * pixelsPerMeter);

    map.rotate(ship.Facing * Math.PI / 180);

    map.scale(ship.Size * pixelsPerMeter, ship.Size * pixelsPerMeter);

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
