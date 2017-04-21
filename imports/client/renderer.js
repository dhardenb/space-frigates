
Renderer = function Renderer() {

    zoomLevel = 400;

    availableWidth = 0;

    availableHeight = 0;

    background = null;

    shipPath = new Path2D("M -5 5 L -2 2 L -1 2 L 0 3 L 1 2 L 2 2 L 5 5 L 5 -1 L 1 -5 L -1 -5 L -5 -1 Z");

    thrusterPath = new Path2D("M -2 0 L 2 0 L 0 6 Z");

    LazerPath = new Path2D("M 0 -3 L 0 3");

    this.getWindowInformation();

    this.setupBackgroundCanvas();

    this.setupMapCanvas();

}

Renderer.prototype.getWindowInformation = function() {

    var windowOffset = 22;

    availableWidth = window.innerWidth - windowOffset;

    availableHeight = window.innerHeight - windowOffset;

    availablePixels = availableHeight < availableWidth ? availableHeight : availableWidth;

}

Renderer.prototype.setupBackgroundCanvas = function() {

    background = document.getElementById("background").getContext('2d');

    background.canvas.width  = availableWidth;

    background.canvas.height = availableHeight;

    this.renderStars();

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

            focalX = -gameObjects[x].LocationX;

            focalY = -gameObjects[x].LocationY;

        }

    }

}


Renderer.prototype.renderMap = function () {

    map.clearRect(0, 0, availableWidth, availableHeight);

    map.save();

    map.translate(availableWidth / 2, availableHeight / 2);

    map.scale(availablePixels / zoomLevel, availablePixels / zoomLevel);

    this.calculateOffset();

    map.translate(focalX, focalY);

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

    map.save();

    map.translate(availableWidth / 2 - map.measureText("Space Frigates!").width / 2, availableHeight/2);

    map.strokeStyle = "yellow";

    map.font = "60px Arial";

    map.strokeText("Space Frigates!", 0, 0);

    map.restore();

}

Renderer.prototype.renderBoundry = function () {

    map.save();

    map.beginPath();

    map.arc(0, 0, mapRadius, 0, 2 * Math.PI);

    map.strokeStyle = "rgba(255, 255, 0, 0.5)";

    map.lineWidth = 5;

    map.stroke();

    map.restore();

}

Renderer.prototype.renderParticle = function (particle) {

    map.save();

    map.translate(particle.LocationX, particle.LocationY);

    map.beginPath();

    map.arc(0, 0, particle.Size, 0, 2 * Math.PI);

    map.strokeStyle = "rgba(255, 0, 0, 1)";

    map.lineWidth = 2;

    map.stroke();

    map.fillStyle = "rgba(255, 255, 0, 1)";

    map.fill();

    map.restore();

}

Renderer.prototype.renderThruster = function (thruster) {

    map.save();

    map.translate(thruster.LocationX, thruster.LocationY);

    map.rotate(thruster.Facing * Math.PI / 180);

    map.strokeStyle = "rgba(255, 0, 0, 1)";

    map.lineWidth = 2;

    map.lineJoin = "round";

    map.stroke(thrusterPath);

    map.fillStyle = "rgba(255, 255, 0, 1)";

    map.fill(thrusterPath);

    map.restore();

}

Renderer.prototype.renderMissle = function (missile) {

    map.save();

    map.translate(missile.LocationX, missile.LocationY);

    map.rotate(missile.Facing * Math.PI / 180);

    map.strokeStyle = "rgba(0, 255, 255, 1)";

    map.lineWidth = 2;

    map.stroke(LazerPath);

    map.restore();

}

Renderer.prototype.renderShip = function (ship) {

    map.save();

    map.translate(ship.LocationX, ship.LocationY);

    map.rotate(ship.Facing * Math.PI / 180);

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

    map.lineWidth = 2;

    map.lineJoin = "round";

    map.stroke(shipPath);

    map.fillStyle = "rgba(0, 0, 0, 1)";

    map.fill(shipPath);

    map.restore();

}
