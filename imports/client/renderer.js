
Renderer = function Renderer() {

    pixelsPerMeter = 0;

    availableWidth = 0;

    availableHeight = 0;

    stars = [];

    shipPath = new Path2D("M -0.05 -0.5 L 0.05 -0.5 L 0.1 -0.2 L 0.2 -0.1 L 0.2 0.1 L 0.4 0.3 L 0.4 0.4 L 0.2 0.4 L 0.2 0.5 L -0.2 0.5 L -0.2 0.4 L -0.4 0.4 L -0.4 0.3 L -0.2 0.1 L -0.2 -0.1 L -0.1 -0.2 Z");

    cockpitPath = new Path2D("M 0.0, -0.1 L -0.1, 0.3, L 0.1, 0.3 Z");
    
    thrusterPath = new Path2D("M -0.2 -0.5 L 0.2 -0.5 L 0.0 0.5 Z");

    laserPath = new Path2D("M -0.1 -0.5 L 0.1 -0.5 L 0.1 0.5 L -0.1 0.5 Z");

    debrisPath = new Path2D("M -0.8, 0.0 L -0.4 0.6 L -0.2 0.2 L 0.2 0.8 L 0.6 0.2 L 0.2 0.2 L 0.0 -0.4 -0.4 0.0 L -0.8 0.0 M 0.4 0.0 L 0.8 -0.4 L 0.6 -0.8 0.4 -0.6 L 0.2 -0.8 L 0.2 -0.6 L 0.4 0.0 M -0.8 -0.2 L -0.4 -0.2 L 0.0 -0.6 L -0.4 -0.8 L -0.6 -0.4 L -0.8 -0.6 Z");

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

    if (gameMode == "START_MODE") {

        // map.filter = 'blur(4px)';

    } else {

       // map.filter = 'blur(0px)';

    }

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

        else if (gameObjects[i].Type == 'Debris') {

            this.renderDebris(gameObjects[i]);

        }

    }

    map.restore();

    map.save();

    if (gameMode == 'START_MODE') {

        this.renderTitle();

        this.renderVersion();

        this.renderInstructions();

        this.renderNameInputBox();

        this.renderName();

    } else if (gameMode == 'PLAY_MODE') {

        this.renderHullStrength();

        this.renderFuelStatus();
    
        this.renderCapacitorStatus();
    
        this.renderShieldStatus();

    }

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

    if (ship.ShieldStatus > 0) {

        map.beginPath();

        map.arc(0, 0, 1, 0, 2 * Math.PI);

        map.lineWidth =  0.05;

        map.strokeStyle = "rgba(100, 200, 255, " + ship.ShieldStatus/150 + ")";

        map.stroke();

        map.fillStyle = "rgba(100, 200, 255, " + ship.ShieldStatus/300 + ")";

        map.fill();

    }

    map.strokeStyle = "rgba(50, 50, 50)";

    map.lineWidth =  0.1;

    map.lineJoin = "round";

    map.stroke(shipPath);

    map.fillStyle = "rgba(100, 100, 100)";

    map.fill(shipPath);

    //////////////////
    // Draw Cockpit //
    //////////////////

    if (ship.HullStrength >= 66) {

        map.fillStyle = "green";

    } else if (ship.HullStrength >= 33) {

        map.fillStyle = "yellow";

    } else {

        // map.strokeStyle = "rgb(250, 0, 0)";

        map.fillStyle = "red";

    }

    map.lineWidth =  0.05;

    map.stroke(cockpitPath);

    map.fill(cockpitPath);

    map.restore();

    ////////////////////////
    // Draw the ship name //
    ////////////////////////

    map.save();

    var nameToDraw = "";

    if (ship.Type != 'Human') {

        nameToDraw = "";

    } else {

        if (ship.Name == "") {

            nameToDraw = "GUEST";

        } else {

            nameToDraw = ship.Name;

        }

    }

    map.fillStyle = "gray";

    map.font = "12px Arial";

    map.translate(ship.LocationX * pixelsPerMeter - map.measureText(nameToDraw).width / 2, ship.LocationY * pixelsPerMeter + ship.Size * pixelsPerMeter * 1.5);

    map.fillText(nameToDraw, 0, 0);

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

    map.strokeStyle = "rgba(255, 255, 255, " + missile.Fuel / 60 + ")";

    map.lineWidth = 0.1;

    map.stroke(laserPath);

    map.fillStyle = "rgba(0, 255, 255, " + missile.Fuel / 60 + ")";

    map.fill(laserPath);

    map.restore();

}

Renderer.prototype.renderDebris = function (debris) {

    map.save();

    map.translate(debris.LocationX * pixelsPerMeter, debris.LocationY * pixelsPerMeter);

    map.rotate(debris.Facing * Math.PI / 180);

    map.scale(debris.Size * pixelsPerMeter, debris.Size * pixelsPerMeter);

    map.strokeStyle = "rgba(50, 50, 50, 1)";

    map.lineWidth = 0.1;

    map.lineJoin = "round";

    map.stroke(debrisPath);

    map.fillStyle = "rgba(100, 100, 100, 1)";

    map.fill(debrisPath);

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

Renderer.prototype.renderNameInputBox = function () {

    map.save();

    map.translate(availableWidth / 2 - 100, availableHeight / 2);

    map.strokeStyle = "yellow";

    map.strokeRect(0, 0, 200, 50);

    map.restore();

}

Renderer.prototype.renderName = function () {

    map.save();

    var textToRender = "";

    if (playerName == "") {

        textToRender = "Enter Name";

        map.fillStyle = "gray";

        map.font = "italic 20px Arial";

    } else {

        textToRender = playerName;

        map.fillStyle = "yellow";

        map.font = "20px Arial";

    }

    map.translate(availableWidth / 2 - map.measureText(textToRender).width / 2, availableHeight / 2 + 35);

    map.fillText(textToRender, 0, 0);

    map.restore();

}

Renderer.prototype.renderHullStrength = function () {

    var ship = {};
    var hullStrengthDisplayValue;

    for (var i=0, j=gameObjects.length; i<j; i++) {

        if (gameObjects[i].Id == playerShipId) {

            ship = gameObjects[i];

        }

    }

    hullStrengthDisplayValue = Math.floor(ship.HullStrength);

    map.save();

    if (hullStrengthDisplayValue > 66) {

        map.fillStyle = "green";

    } else if (hullStrengthDisplayValue > 33) {

        map.fillStyle = "yellow";

    } else {

        map.fillStyle = "red";

    }

    map.font = "20px Arial";

    map.translate(0, availableHeight - 325);

    map.fillText("HULL: " + hullStrengthDisplayValue, 0, 0);

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

    map.translate(0, availableHeight - 300);

    map.fillText("FUEL: " + fuelDisplayValue, 0, 0);

    map.restore();

}

Renderer.prototype.renderCapacitorStatus = function () {

    var ship = {};

    for (var i=0, j=gameObjects.length; i<j; i++) {

        if (gameObjects[i].Id == playerShipId) {

            ship = gameObjects[i];

        }

    }

    map.save();

    var capacitorDisplayValue = Math.floor(ship.Capacitor);

    if (capacitorDisplayValue > 66) {

        map.fillStyle = "green";

    } else if (capacitorDisplayValue > 33) {

        map.fillStyle = "yellow";

    } else {

        map.fillStyle = "red";

    }

    map.font = "20px Arial";

    map.translate(0, availableHeight - 275);

    map.fillText("CAPACITOR: " + capacitorDisplayValue, 0, 0);

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

    shieldDisplayValue = Math.floor(ship.ShieldStatus);

    map.save();

    if (ship.ShieldOn == 0 && ship.ShieldStatus == 0) {

        map.fillStyle = "gray";
        shieldDisplayValue = "OFF";

    } else {

        if (shieldDisplayValue > 66) {

            map.fillStyle = "green";

        } else if (shieldDisplayValue > 33) {

            map.fillStyle = "yellow";

        } else {

            map.fillStyle = "red";

        }

    }

    map.font = "20px Arial";

    map.translate(0, availableHeight - 250);

    map.fillText("SHIELDS: " + shieldDisplayValue, 0, 0);

    map.restore();

}

Renderer.prototype.renderInstructions = function () {

    map.save();

    map.fillStyle = "yellow";

    map.font = "20px Arial";

    map.translate(0, availableHeight - 160);

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

    map.fillText("ALT => Toggle Shields", 0, 0);

    map.translate(0, 25);

    map.fillText("SPACEBAR => Fire", 0, 0);

    map.restore();

}

Star = function Star(x, y, alpha) {

  this.x = x;
  this.y = y;
  this.alpha = alpha;

}
