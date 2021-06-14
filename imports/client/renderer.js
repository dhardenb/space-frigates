import {Howl} from 'howler';
import {Star} from './star.js'

export class Renderer {
    constructor() {
        this.visualRange = 150;
        this.audioRange = 50;
        this.pixelsPerMeter = 0;
        this.miniMapZoomLevel = 0.03;
        this.availableWidth = 0;
        this.availableHeight = 0;
        this.stars = [];
        this.version = Meteor.settings.public.version;
        this.gameVolume = Meteor.settings.public.gameVolume;
        this.mapRadius = Meteor.settings.public.mapRadius
        this.setupMapCanvas();
        this._ = require('lodash');
        this.playerShip = {};
        this.focalX = 0;
        this.focalY = 0;
        this.camera = {"centerX":0, "centerY":0, "boundry": {"left":0, "right":0, "top":0, "bottom":0}};
    }

    setupMapCanvas() {
        this.map = document.getElementById("map").getContext('2d');
        this.createStars();
    }

    createStars() {
        for (var x = 0-this.mapRadius*2; x < this.mapRadius*2; x++) {
            for (var y = 0-this.mapRadius*2; y < this.mapRadius*2; y++) {
                if (Math.floor((Math.random()*1000)+1) == 1) {
                    this.stars.push(new Star(x, y, Math.random()));
                }
            }
        }
    }

    determineIfObjectShouldBeRendered(objectToInspect) {
        if (objectToInspect.LocationX > this.camera.left && objectToInspect.LocationX <  this.camera.right && objectToInspect.LocationY > this.camera.top && objectToInspect.LocationY < this.camera.bottom) {
            return true;
        } else {
            return false;
        } 
    }

    // I really need to optimize this to use pre-render. That should be WAY faster!
    renderStars() {
        for (let x=0, y=this.stars.length; x<y; x++) {
            if (this.determineIfObjectShouldBeRendered(this.stars[x])) {
                this.renderStar(this.stars[x]);
            }
        }
    }

    updateCamera() {
        this.camera.centerX = this.playerShip.LocationX;
        this.camera.centerY = this.playerShip.LocationY;
        this.camera.left = this.playerShip.LocationX - this.availableWidth / 2;
        this.camera.right = this.playerShip.LocationX + this.availableWidth / 2;
        this.camera.top = this.playerShip.LocationY - this.availableHeight / 2;
        this.camera.bottom = this.playerShip.LocationY + this.availableHeight / 2;
    }

    updateLocationOffset() {
        this.focalX = -this.playerShip.LocationX * this.pixelsPerMeter;
        this.focalY = -this.playerShip.LocationY * this.pixelsPerMeter;
    }
 
    // This is dumb, I should be able to set a pointer when the player
    // is firts assigned a ship. It won't change after that until
    // the player dies and restarts
    updatePlayerShip() {
        for (var i = 0, j = gameObjects.length; i < j; i++) {
            if (gameObjects[i].Id == playerShipId) {
                this.playerShip = gameObjects[i];
            }
        }
    }

    renderMap() {

        // This section is dumb. I should just set this once and then
        // only call it again when the screen is resized. There is a known
        // event for that, I just need to look it up
        var windowOffset = 22;
        this.availableWidth = window.innerWidth - windowOffset;
        this.availableHeight = window.innerHeight - windowOffset;
        this.availablePixels = this.availableHeight < this.availableWidth ? this.availableWidth : this.availableHeight;
        this.pixelsPerMeter = this.availablePixels / 2 / this.visualRange;
        this.map.canvas.width = this.availableWidth;
        this.map.canvas.height = this.availableHeight;

        this.updatePlayerShip();
        this.updateCamera();
        this.updateLocationOffset();

        this.map.clearRect(0, 0, this.availableWidth, this.availableHeight);
        this.map.save();
        this.map.translate(this.availableWidth / 2 + this.focalX, this.availableHeight / 2 + this.focalY);
        this.renderStars();
        this.renderBoundry();

        for (let i = 0, j = gameObjects.length; i < j; i++) {

            if (this.determineIfObjectShouldBeRendered(gameObjects[i])) {

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

                else if (gameObjects[i].Type == 'Sound') {

                    this.renderSound(gameObjects[i]);

                }
            }
        }

        this.map.restore();

        this.map.save();

        this.renderMiniMap();

        if (gameMode == 'START_MODE') {

            this.renderLeaderboard();

            this.renderTitle();

            this.renderVersion();

            this.renderTwitter();

            this.renderBlog();

            this.renderEmail();

            this.renderInstructions();

            this.renderNameInputBox();

            this.renderName();

            this.renderStartInstructions();

            this.renderEnergyInstructions();

        } else if (gameMode == 'PLAY_MODE') {

            this.renderLeaderboard();

            this.renderHullStrength();

            this.renderFuelStatus();
        
            this.renderCapacitorStatus();
        
            this.renderShieldStatus();

            this.renderDamgeIndicator();

            // this.renderRotateLeftButton();

            // this.renderRotateRightButton();

            // this.renderThrustButton();

            // this.renderBrakeButton();

            // this.renderShieldButton();

            // this.renderFireButton();

        }

        this.map.restore();

    }

    renderMiniMap() {
    
        this.map.save();

        this.map.translate(this.availableWidth - this.availablePixels / 12 - 20, this.availablePixels / 12 + 20);

        /////////////////////////////////
        // Render Background and Bezel //
        /////////////////////////////////

        this.map.save();

        this.map.beginPath();

        this.map.arc(0, 0, this.availablePixels / 12, 0, 2 * Math.PI);

        this.map.strokeStyle = "rgba(50, 50, 50, 1.0)";

        this.map.fillStyle = "rgba(0, 0, 0, 1.0)"

        this.map.lineWidth = 5;

        this.map.fill();

        this.map.stroke();

        this.map.clip()

        //////////////////////////////
        // Render ships and boundry //
        //////////////////////////////

        this.map.scale(this.miniMapZoomLevel, this.miniMapZoomLevel);

        this.map.translate(this.focalX, this.focalY);

        this.renderBoundry();

        for (var i=0, j=gameObjects.length; i<j; i++) {
            if (gameObjects[i].Type == 'Human' || gameObjects[i].Type == 'Alpha' || gameObjects[i].Type == 'Bravo') {
                this.renderMiniShip(gameObjects[i]);
            }
        }

        this.map.restore();

        this.map.restore();
    }

    renderMiniShip(ship) {
    
        this.map.save();

        this.map.translate(ship.LocationX * this.pixelsPerMeter, ship.LocationY * this.pixelsPerMeter);

        this.map.scale(ship.Size * this.pixelsPerMeter, ship.Size * this.pixelsPerMeter);

        this.map.beginPath();

        this.map.arc(0, 0, 1.0, 0, 2 * Math.PI);

        let fillStyle = "";

        if (ship.Id == playerShipId) {
            fillStyle = "rgba(0, 128, 0, 1.0)";
        } else if (ship.Type == "Human") {
            fillStyle = "rgba(255, 0, 0, 1.0)";
        } else {
            fillStyle = "rgba(128, 128, 128, 1.0)";
        }

        this.map.fillStyle = fillStyle;

        this.map.fill();

        this.map.restore();

    }

    renderStar(star) {

        this.map.save();

        this.map.translate(star.LocationX * this.pixelsPerMeter, star.LocationY * this.pixelsPerMeter);

        this.map.beginPath();

        this.map.arc(0, 0, 0.25 * this.pixelsPerMeter, 0, 2 * Math.PI);

        this.map.fillStyle = "rgba(255, 255, 255," + star.alpha + ")";

        this.map.fill();

        this.map.restore();

    }

    renderBoundry() {

        this.map.save();

        this.map.beginPath();

        this.map.arc(0, 0, this.mapRadius * this.pixelsPerMeter, 0, 2 * Math.PI);

        this.map.strokeStyle = "rgba(255, 255, 0, 0.5)";

        this.map.lineWidth = 5;

        this.map.stroke();

        this.map.restore();

    }

    renderShip(ship) {

        this.map.save();

        this.map.translate(ship.LocationX * this.pixelsPerMeter, ship.LocationY * this.pixelsPerMeter);

        this.map.rotate(ship.Facing * Math.PI / 180);

        this.map.scale(ship.Size * this.pixelsPerMeter, ship.Size * this.pixelsPerMeter);

        if (ship.ShieldStatus > 0) {

            this.map.beginPath();

            this.map.arc(0, 0, 1, 0, 2 * Math.PI);

            this.map.lineWidth =  0.05;

            this.map.strokeStyle = "rgba(100, 200, 255, " + ship.ShieldStatus/150 + ")";

            this.map.stroke();

            this.map.fillStyle = "rgba(100, 200, 255, " + ship.ShieldStatus/300 + ")";

            this.map.fill();

        }

        this.map.strokeStyle = "rgba(50, 50, 50, 1.0)";

        this.map.lineWidth =  0.1;

        this.map.lineJoin = "round";

        this.map.fillStyle = "rgba(100, 100, 100, 1.0)";

        this.map.beginPath();

        this.map.moveTo(-0.05, -0.5);

        this.map.lineTo(0.05, -0.5);

        this.map.lineTo(0.1, -0.2);

        this.map.lineTo(0.2, -0.1);

        this.map.lineTo(0.2, 0.1);

        this.map.lineTo(0.4, 0.3);

        this.map.lineTo(0.4, 0.4);

        this.map.lineTo(0.2, 0.4);

        this.map.lineTo(0.2, 0.5);

        this.map.lineTo(-0.2, 0.5);

        this.map.lineTo(-0.2, 0.4);

        this.map.lineTo(-0.4, 0.4);

        this.map.lineTo(-0.4, 0.3);

        this.map.lineTo(-0.2, 0.1);

        this.map.lineTo(-0.2, -0.1);

        this.map.lineTo(-0.1, -0.2);

        this.map.closePath();

        this.map.stroke();

        this.map.fill();

        //////////////////
        // Draw Cockpit //
        //////////////////

        if (ship.HullStrength >= 66) {

            this.map.fillStyle = "green";

        } else if (ship.HullStrength >= 33) {

            this.map.fillStyle = "yellow";

        } else {

            // map.strokeStyle = "rgb(250, 0, 0)";

            this.map.fillStyle = "red";

        }

        this.map.lineWidth =  0.05;

        this.map.beginPath();

        this.map.moveTo(0.0, -0.1);

        this.map.lineTo(-0.1, 0.3);

        this.map.lineTo(0.1, 0.3);

        this.map.closePath();

        this.map.stroke();

        this.map.fill();

        this.map.restore();

        ////////////////////////
        // Draw the ship name //
        ////////////////////////

        this.map.save();

        var nameToDraw = "";
        var playerName = "";

        for (var i=0, j=gameObjects.length; i<j; i++) {
            if (gameObjects[i].Type == 'Player') {
                if (gameObjects[i].ShipId == ship.Id) {
                    playerName = gameObjects[i].Name;
                    break;
                }
            }
        }

        if (ship.Type != 'Human') {

            nameToDraw = "";

        } else {

            if (playerName == "") {

                nameToDraw = "GUEST";

            } else {

                nameToDraw = playerName;

            }

        }

        this.map.fillStyle = "gray";

        this.map.font = "12px Arial";

        this.map.translate(ship.LocationX * this.pixelsPerMeter - this.map.measureText(nameToDraw).width / 2, ship.LocationY * this.pixelsPerMeter + ship.Size * this.pixelsPerMeter * 1.5);

        this.map.fillText(nameToDraw, 0, 0);

        this.map.restore();

    }

    renderParticle(particle) {

        this.map.save();

        this.map.translate(particle.LocationX * this.pixelsPerMeter, particle.LocationY * this.pixelsPerMeter);

        this.map.beginPath();

        this.map.arc(0, 0, particle.Size * 0.5 * this.pixelsPerMeter, 0, 2 * Math.PI);

        this.map.strokeStyle = "rgba(255, 0, 0, 1)";

        this.map.lineWidth = 1.0;

        this.map.stroke();

        this.map.fillStyle = "rgba(255, 255, 0, 1)";

        this.map.fill();

        this.map.restore();

    }

    renderThruster(thruster) {

        this.map.save();

        this.map.translate(thruster.LocationX * this.pixelsPerMeter, thruster.LocationY * this.pixelsPerMeter);

        this.map.rotate(thruster.Facing * Math.PI / 180);

        this.map.scale(thruster.Size * this.pixelsPerMeter, thruster.Size * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(255, 0, 0, 1)";

        this.map.lineWidth = 0.1;

        this.map.lineJoin = "round";

        this.map.fillStyle = "rgba(255, 255, 0, 1)";

        this.map.beginPath();

        this.map.moveTo(-0.2, -0.5);

        this.map.lineTo(0.2, -0.5);

        this.map.lineTo(0.0, 0.5);

        this.map.closePath();

        this.map.stroke();

        this.map.fill();

        this.map.restore();

    }

    renderMissle(missile) {

        this.map.save();

        this.map.translate(missile.LocationX * this.pixelsPerMeter, missile.LocationY * this.pixelsPerMeter);

        this.map.rotate(missile.Facing * Math.PI / 180);

        this.map.scale(missile.Size * this.pixelsPerMeter, missile.Size * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(255, 255, 255, " + missile.Fuel / 60 + ")";

        this.map.lineWidth = 0.1;

        this.map.fillStyle = "rgba(0, 255, 255, " + missile.Fuel / 60 + ")";

        this.map.beginPath();

        this.map.moveTo(-0.1, -0.5);

        this.map.lineTo(0.1, -0.5);

        this.map.lineTo(0.1, 0.5);

        this.map.lineTo(-0.1, 0.5);

        this.map.closePath();

        this.map.stroke();

        this.map.fill();

        this.map.restore();

    }

    renderDebris(debris) {

        this.map.save();

        this.map.translate(debris.LocationX * this.pixelsPerMeter, debris.LocationY * this.pixelsPerMeter);

        this.map.rotate(debris.Facing * Math.PI / 180);

        this.map.scale(debris.Size * this.pixelsPerMeter, debris.Size * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(50, 50, 50, 1)";

        this.map.lineWidth = 0.1;

        this.map.lineJoin = "round";

        this.map.fillStyle = "rgba(100, 100, 100, 1)";

        this.map.beginPath();

        this.map.moveTo(-0.8, 0.0);

        this.map.lineTo(-0.4, 0.6);

        this.map.lineTo(-0.2, 0.2);

        this.map.lineTo(0.2, 0.8);

        this.map.lineTo(0.6, 0.2);

        this.map.lineTo(0.2, 0.2);

        this.map.lineTo(0.0, -0.4);

        this.map.lineTo(-0.8, 0.0);

        this.map.closePath();

        this.map.moveTo(0.4, 0.0);

        this.map.lineTo(0.8, -0.4);

        this.map.lineTo(0.6, -0.8);

        this.map.lineTo(0.4, -0.6);

        this.map.lineTo(0.2, -0.8);

        this.map.lineTo(0.2, -0.6);

        this.map.lineTo(0.4, 0.0);

        this.map.closePath();

        this.map.moveTo(-0.8, -0.2);

        this.map.lineTo(-0.4, -0.2);

        this.map.lineTo(0.0, -0.6);

        this.map.lineTo(-0.4, -0.8);

        this.map.lineTo(-0.6, -0.4);

        this.map.lineTo(-0.8, -0.6);

        this.map.closePath();
        
        this.map.stroke();
        
        this.map.fill();

        this.map.restore();

    }

    renderSound(sound) {

        if (gameMode == 'PLAY_MODE') {

            var distanceFromPlayersShip = 0;

            var soundVolume = 1.0;

            if (this.playerShip != null) {
                
                distanceFromPlayersShip = Math.sqrt((this.playerShip.LocationX - sound.LocationX) * (this.playerShip.LocationX - sound.LocationX) + (this.playerShip.LocationY - sound.LocationY) * (this.playerShip.LocationY - sound.LocationY)) / this.pixelsPerMeter;

            }

            soundVolume = (this.audioRange - distanceFromPlayersShip) / this.audioRange * this.gameVolume;

            if (soundVolume < 0) {

                soundVolume = 0;

            }

            let srcFile = '';

            if (sound.SoundType == "MissileFired") {
                
                soundVolume = soundVolume * 1.0;
                
                srcFile = '/lazer.mp3';

            }

            var howl = new Howl({
                    
                src: [srcFile],

                volume: soundVolume
            
            });
            
            howl.play();

        }

    }

    renderTitle() {

        this.map.save();

        this.map.strokeStyle = "yellow";

        this.map.font = "60px Arial";

        this.map.translate(this.availableWidth / 2 - this.map.measureText("Space Frigates").width / 2, 50);

        this.map.strokeText("Space Frigates", 0, 0);

        this.map.restore();

    }

    renderVersion() {

        this.map.save();

        this.map.fillStyle = "yellow";

        this.map.font = "20px Arial";

        this.map.translate(this.availableWidth / 2 - this.map.measureText("PUBLIC ALPHA - " + this.version).width / 2, 90);

        this.map.fillText("PUBLIC ALPHA - " + this.version, 0, 0);

        this.map.restore();

    }

    renderTwitter() {

        this.map.save();

        this.map.fillStyle = "yellow";

        this.map.font = "20px Arial";

        this.map.translate(this.availableWidth / 2 - this.map.measureText("TWITTER: @spacefrigates").width / 2, 130);

        this.map.fillText("TWITTER: @spacefrigates", 0, 0);

        this.map.restore();

    }

    renderBlog() {

        this.map.save();

        this.map.fillStyle = "yellow";

        this.map.font = "20px Arial";

        this.map.translate(this.availableWidth / 2 - this.map.measureText("BLOG: blog.spacefrigates.com").width / 2, 170);

        this.map.fillText("BLOG: blog.spacefrigates.com", 0, 0);

        this.map.restore();

    }

    renderEmail() {

        this.map.save();

        this.map.fillStyle = "yellow";

        this.map.font = "20px Arial";

        this.map.translate(this.availableWidth / 2 - this.map.measureText("EMAIL: davehardenbrook@yahoo.com").width / 2, 210);

        this.map.fillText("EMAIL: davehardenbrook@yahoo.com", 0, 0);

        this.map.restore();

    }

    renderLeaderboard() {

        this.map.save();

        this.map.translate(10, 25);

        this.map.font = "20px Arial";

        this.map.fillStyle = "rgba(128, 128, 128, 0.5)";

        this.map.fillText("PILOT", 0, 0);

        this.map.save();

        this.map.translate(155, 0);

        this.map.fillText("K", 0, 0);

        this.map.translate(40, 0);

        this.map.fillText("D", 0, 0);

        this.map.restore();

        var players = [];

        for (var i=0, j=gameObjects.length; i<j; i++) {

            if (gameObjects[i].Type == 'Player') {

                if (gameObjects[i].Name != "") {

                    players.push(gameObjects[i]);

                }

            }

        }

        players = this._.orderBy(players, 'Kills', 'desc');

        for (var i=0, j=players.length; i<j; i++) {

            this.map.translate(0, 25);

            if (players[i].Id == playerId) {

                this.map.fillStyle = "rgba(255, 255, 0, 0.5)";

            } else {

                this.map.fillStyle = "rgba(128, 128, 128, 0.5)";

            }

            this.map.fillText(players[i].Name, 0, 0);

            this.map.save();

            this.map.translate(155, 0);

            this.map.fillText(players[i].Kills, 0, 0);

            this.map.translate(40, 0);

            this.map.fillText(players[i].Deaths, 0, 0);

            this.map.restore();

        }

        this.map.restore();

    }

    renderNameInputBox() {

        this.map.save();

        this.map.translate(this.availableWidth / 2 - 100, this.availableHeight / 2);

        this.map.strokeStyle = "yellow";

        this.map.strokeRect(0, 0, 200, 50);

        this.map.restore();

    }

    renderName() {

        this.map.save();

        let textToRender = "";

        if (playerName == "") {

            textToRender = "GUEST";

            this.map.fillStyle = "gray";

            this.map.font = "italic 20px Arial";

        } else {

            textToRender = playerName;

            this.map.fillStyle = "yellow";

            this.map.font = "20px Arial";

        }

        this.map.translate(this.availableWidth / 2 - this.map.measureText(textToRender).width / 2, this.availableHeight / 2 + 35);

        this.map.fillText(textToRender, 0, 0);

        this.map.restore();

    }

    renderStartInstructions() {

        this.map.save();

        let textToRender = "PRESS ENTER TO START";

        this.map.fillStyle = "yellow";

        this.map.font = "20px Arial";

        this.map.translate(this.availableWidth / 2 - this.map.measureText(textToRender).width / 2, this.availableHeight / 2 + 95);

        this.map.fillText(textToRender, 0, 0);

        this.map.restore();

    }

    renderEnergyInstructions() {

        this.map.save();

        let textToRender = "COLLECT DEBRIS TO INCREASE ENERGY";

        this.map.fillStyle = "yellow";

        this.map.font = "20px Arial";

        this.map.translate(this.availableWidth / 2 - this.map.measureText(textToRender).width / 2, this.availableHeight / 2 + 155);

        this.map.fillText(textToRender, 0, 0);

        this.map.restore();

    }

    renderHullStrength() {

        let ship = {};
        let hullStrengthDisplayValue;

        hullStrengthDisplayValue = Math.floor(this.playerShip.HullStrength);

        this.map.save();

        this.map.translate(0, this.availableHeight - 125);

        this.map.fillStyle = "rgba(128, 128, 128, 0.5)";

        this.map.font = "20px Arial";

        this.map.fillText("HULL ", 0, 0);

        this.map.restore();

        this.map.save();

        this.map.translate(125, this.availableHeight - 144);

        this.renderMeter(hullStrengthDisplayValue);

        this.map.restore();

    }

    renderFuelStatus() {

        let fuelDisplayValue = Math.floor(this.playerShip.Fuel);

        this.map.save();

        this.map.translate(0, this.availableHeight - 90);

        this.map.fillStyle = "rgba(128, 128, 128, 0.5)";

        this.map.font = "20px Arial";

        this.map.fillText("FUEL ", 0, 0);

        this.map.restore();

        this.map.save();

        this.map.translate(125, this.availableHeight - 108);

        this.renderMeter(fuelDisplayValue / 1000 * 100);

        this.map.restore();

    }

    renderCapacitorStatus() {

        let capacitorDisplayValue = Math.floor(this.playerShip.Capacitor);

        this.map.save();

        this.map.translate(0, this.availableHeight - 55);

        this.map.fillStyle = "rgba(128, 128, 128, 0.5)";

        this.map.font = "20px Arial";

        this.map.fillText("CAPACITOR ", 0, 0);

        this.map.restore();

        this.map.save();

        this.map.translate(125, this.availableHeight - 72);

        this.renderMeter(capacitorDisplayValue);

        this.map.restore();

    }

    renderShieldStatus() {

        let shieldDisplayValue;

        shieldDisplayValue = Math.floor(this.playerShip.ShieldStatus);

        this.map.save();

        this.map.translate(0, this.availableHeight - 20);

        this.map.fillStyle = "rgba(128, 128, 128, 0.5)";

        this.map.font = "20px Arial";

        this.map.fillText("SHIELDS ", 0, 0);

        this.map.restore();

        this.map.save();

        this.map.translate(125, this.availableHeight - 37);

        if (this.playerShip.ShieldOn == 0 && shieldDisplayValue == 0) {

            shieldDisplayValue = -1;

        }

        this.renderMeter(shieldDisplayValue);

        this.map.restore();

    }

    renderInstructions() {

        this.map.save();

        this.map.fillStyle = "yellow";

        this.map.font = "20px Arial";

        this.map.translate(0, this.availableHeight - 160);

        this.map.fillText("ENTER => New Ship", 0, 0);

        this.map.translate(0, 25);

        this.map.fillText("W or UP ARROW => Thrust", 0, 0);

        this.map.translate(0, 25);

        this.map.fillText("A or LEFT ARROW => Rotate Left", 0, 0);

        this.map.translate(0, 25);

        this.map.fillText("D or RIGHT ARROW => Rotate Right", 0, 0);

        this.map.translate(0, 25);

        this.map.fillText("S or DOWN ARROW => Stop", 0, 0);

        this.map.translate(0, 25);

        this.map.fillText("ALT => Toggle Shields", 0, 0);

        this.map.translate(0, 25);

        this.map.fillText("SPACEBAR => Fire", 0, 0);

        this.map.restore();

    }

    renderMeter(percentage) {
    
        this.map.save();

        let color = "";

        if (percentage == -1) {
            color = "gray";
        } else if (percentage <= 33) {
            color = "red";
        } else if (percentage <= 66) {
            color = "yellow";
        } else {
            color = "green";
        }
        
        if (percentage <= 0) {
            this.renderMeterBar(0, 0, false, color);
        } else {
            this.renderMeterBar(0, 0, true, color);
        }

        if (percentage < 11) {
            this.renderMeterBar(20, 0, false, color);
        } else {
            this.renderMeterBar(20, 0, true, color);
        }

        if (percentage < 21) {
            this.renderMeterBar(40, 0, false, color);
        } else {
            this.renderMeterBar(40, 0, true, color);
        }

        if (percentage < 31) {
            this.renderMeterBar(60, 0, false, color);
        } else {
            this.renderMeterBar(60, 0, true, color);
        }

        if (percentage < 41) {
            this.renderMeterBar(80, 0, false, color);
        } else {
            this.renderMeterBar(80, 0, true, color);
        }

        if (percentage < 51) {
            this.renderMeterBar(100, 0, false, color);
        } else {
            this.renderMeterBar(100, 0, true, color);
        }

        if (percentage < 61) {
            this.renderMeterBar(120, 0, false, color);
        } else {
            this.renderMeterBar(120, 0, true, color);
        }

        if (percentage < 71) {
            this.renderMeterBar(140, 0, false, color);
        } else {
            this.renderMeterBar(140, 0, true, color);
        }

        if (percentage < 81) {
            this.renderMeterBar(160, 0, false, color);
        } else {
            this.renderMeterBar(160, 0, true, color);
        }

        if (percentage < 91) {
            this.renderMeterBar(180, 0, false, color);
        } else {
            this.renderMeterBar(180, 0, true, color);
        }

        this.map.restore();
    }

    renderMeterBar(x, y, filled, color) {
    
        this.map.save();

        let fillColor = "";
        let strokeColor = color;
        
        if (filled) {
            if (color == "gray") {
                fillColor = "rgba(128, 128, 128, 0.25)";
            } else if (color == "green") {
                fillColor = "rgba(0, 128, 0, 0.25)";
            } else if (color == "yellow") {
                fillColor = "rgba(255, 255, 0, 0.25)";
            } else if (color == "red") {
                fillColor = "rgba(255, 0, 0, 0.25)";
            }
        } else {
            fillColor = "rgba(0,0,0,0.5)";
        }

        this.map.fillStyle = fillColor;

        this.map.strokeStyle = strokeColor;
        
        this.map.beginPath();
        
        this.map.rect(x, y, 10, 20);
        
        this.map.fill();

        this.map.stroke();

        this.map.restore();
    }

    renderRotateLeftButton() {

        this.map.save();

        this.map.translate(0 + this.availablePixels * 0.1, this.availableHeight - this.availablePixels * 0.2);

        this.renderButton();

        this.map.restore();

    }

    renderRotateRightButton() {

        this.map.save();

        this.map.translate(0 + this.availablePixels * 0.25, this.availableHeight - this.availablePixels * 0.2);

        this.renderButton();

        this.map.restore();

    }

    renderThrustButton() {

        this.map.save();

        this.map.translate(0 + this.availablePixels * 0.175, this.availableHeight - this.availablePixels * 0.3);

        this.renderButton();

        this.map.restore();

    }

    renderBrakeButton() {

        this.map.save();

        this.map.translate(0 + this.availablePixels * 0.175, this.availableHeight - this.availablePixels * 0.1);

        this.renderButton();

        this.map.restore();

    }

    renderShieldButton() {

        this.map.save();

        this.map.translate(this.availableWidth - this.availablePixels * 0.25, this.availableHeight - this.availablePixels * 0.1);

        this.renderButton();

        this.map.restore();

    }

    renderFireButton() {

        this.map.save();

        this.map.translate(this.availableWidth - this.availablePixels * 0.1, this.availableHeight - this.availablePixels * 0.1);

        this.renderButton();

        this.map.restore();
    }

    renderButton() {

        this.map.save();

        this.map.strokeStyle = "rgba(128, 128, 128, 0.5)";

        this.map.lineWidth = availablePixels * 0.005;
        
        this.map.beginPath();
        
        this.map.arc(0, 0, this.availablePixels * 0.05, 0, 2 * Math.PI);

        this.map.stroke();

        this.map.restore();

    }

    renderDamgeIndicator() {

        const totalLengthOfObject = 32;

        //////////
        // Hull //
        //////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        if (this.playerShip.HullStrength / this.playerShip.MaxHullStrength <= .33) {
            this.map.strokeStyle = "rgba(255, 0, 0, 1.0)";
            this.map.fillStyle = "rgba(100, 0, 0, 1.0)";
        }
        else if (this.playerShip.HullStrength / this.playerShip.MaxHullStrength <= .66) {
            this.map.strokeStyle = "rgba(255, 255, 0, 1.0)";
            this.map.fillStyle = "rgba(100, 100, 0, 1.0)";
        }
        else {
            this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";
            this.map.fillStyle = "rgba(0, 100, 0, 1.0)";
        }
        
        this.map.lineWidth =  0.01;

        this.map.lineJoin = "round";

        this.map.beginPath();

        this.map.moveTo(-0.05, -0.5);

        this.map.lineTo(0.05, -0.5);

        this.map.lineTo(0.1, -0.2);

        this.map.lineTo(0.2, -0.1);

        this.map.lineTo(0.2, 0.1);

        this.map.lineTo(0.4, 0.3);

        this.map.lineTo(0.4, 0.4);

        this.map.lineTo(0.2, 0.4);

        this.map.lineTo(0.2, 0.5);

        this.map.lineTo(-0.2, 0.5);

        this.map.lineTo(-0.2, 0.4);

        this.map.lineTo(-0.4, 0.4);

        this.map.lineTo(-0.4, 0.3);

        this.map.lineTo(-0.2, 0.1);

        this.map.lineTo(-0.2, -0.1);

        this.map.lineTo(-0.1, -0.2);

        this.map.closePath();

        this.map.stroke();

        // map.fill();

        this.map.restore();

        ///////////////////
        // Plasma Cannon //
        ///////////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        if (this.playerShip.PlasmaCannonStrength / this.playerShip.MaxPlasmaCannonStrength <= .33) {
            this.map.strokeStyle = "rgba(255, 0, 0, 1.0)";
            this.map.fillStyle = "rgba(100, 0, 0, 1.0)";
        }
        else if (this.playerShip.PlasmaCannonStrength / this.playerShip.MaxPlasmaCannonStrength <= .66) {
            this.map.strokeStyle = "rgba(255, 255, 0, 1.0)";
            this.map.fillStyle = "rgba(100, 100, 0, 1.0)";
        }
        else {
            this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";
            this.map.fillStyle = "rgba(0, 100, 0, 1.0)";
        }

        this.map.lineWidth =  0.01;

        this.map.lineJoin = "round";

        this.map.beginPath();

        this.map.moveTo(-0.025, -0.48);

        this.map.lineTo(0.025, -0.48);

        this.map.lineTo(0.065, -0.22);

        this.map.lineTo(-0.065, -0.22);

        this.map.closePath();

        this.map.stroke();

        // map.fill();

        this.map.restore();

        this.map.restore();

        /////////////
        // Cockpit //
        /////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";

        this.map.fillStyle = "rgba(0, 100, 0, 1.0)";

        this.map.lineWidth =  0.01;

        this.map.lineJoin = "round";

        this.map.beginPath();

        this.map.moveTo(-0.05, -0.08);

        this.map.lineTo(0.05, -0.08);

        this.map.lineTo(0.08, -0.02);

        this.map.lineTo(0.08, 0.18);

        this.map.lineTo(-0.08, 0.18);

        this.map.lineTo(-0.08, -0.02);

        this.map.closePath();

        this.map.stroke();

        // map.fill();

        this.map.restore();

        this.map.restore();

        ///////////////////
        // Main Thruster //
        ///////////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        if (this.playerShip.ThrusterStrength / this.playerShip.MaxThrusterStrength <= .33) {
            this.map.strokeStyle = "rgba(255, 0, 0, 1.0)";
            this.map.fillStyle = "rgba(100, 0, 0, 1.0)";
        }
        else if (this.playerShip.ThrusterStrength / this.playerShip.MaxThrusterStrength <= .66) {
            this.map.strokeStyle = "rgba(255, 255, 0, 1.0)";
            this.map.fillStyle = "rgba(100, 100, 0, 1.0)";
        }
        else {
            this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";
            this.map.fillStyle = "rgba(0, 100, 0, 1.0)";
        }

        this.map.lineWidth =  0.01;

        this.map.lineJoin = "round";

        this.map.beginPath();

        this.map.moveTo(-0.08, 0.32);

        this.map.lineTo(0.08, 0.32);

        this.map.lineTo(0.08, 0.45);

        this.map.lineTo(0.05, 0.48);

        this.map.lineTo(-0.05, 0.48);

        this.map.lineTo(-0.08, 0.45);

        this.map.closePath();

        this.map.stroke();

        // map.fill();

        this.map.restore();

        this.map.restore();

        /////////////////////
        // Right Capacitor //
        /////////////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";

        this.map.fillStyle = "rgba(0, 100, 0, 1.0)";

        this.map.lineWidth =  0.01;

        this.map.lineJoin = "round";

        this.map.beginPath();

        this.map.moveTo(0.22, 0.16);

        this.map.lineTo(0.38, 0.32);

        this.map.lineTo(0.38, 0.38);

        this.map.lineTo(0.22, 0.38);

        this.map.closePath();

        this.map.stroke();

        this.map.restore();

        this.map.restore();

        /////////////////////
        // Left Capacitor ///
        /////////////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";

        this.map.fillStyle = "rgba(0, 100, 0, 1.0)";

        this.map.lineWidth =  0.01;

        this.map.lineJoin = "round";

        this.map.beginPath();

        this. map.moveTo(-0.22, 0.16);

        this.map.lineTo(-0.38, 0.32);

        this.map.lineTo(-0.38, 0.38);

        this.map.lineTo(-0.22, 0.38);

        this.map.closePath();

        this.map.stroke();

        this.map.restore();

        this.map.restore();

        ////////////////////
        // Ship Computer ///
        ////////////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";

        this.map.fillStyle = "rgba(0, 100, 0, 1.0)";

        this.map.lineWidth =  0.01;

        this.map.lineJoin = "round";

        this.map.beginPath();

        this.map.moveTo(-0.06, -0.02);

        this.map.lineTo(-0.04, -0.06);

        this.map.lineTo(0.04, -0.06);

        this.map.lineTo(0.06, -0.02);

        this.map.closePath();

        this.map.stroke();

        this.map.restore();

        this.map.restore();

        //////////////////////////
        // Life Support System ///
        //////////////////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";

        this.map.fillStyle = "rgba(0, 100, 0, 1.0)";

        this.map.lineWidth =  0.01;

        this.map.lineJoin = "round";

        this.map.beginPath();

        this.map.moveTo(-0.06, 0.12);

        this.map.lineTo(0.06, 0.12);

        this.map.lineTo(0.06, 0.16);

        this.map.lineTo(-0.06, 0.16);

        this.map.closePath();

        this.map.stroke();

        this.map.restore();

        this.map.restore();

        ////////////
        // Pilot ///
        ////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";

        this.map.fillStyle = "rgba(0, 100, 0, 1.0)";

        this.map.lineWidth =  0.01;

        this.map.beginPath();

        this.map.arc(0, 0.05, 0.05, 0, 2 * Math.PI);

        this.map.stroke();

        this.map.restore();

        this.map.restore();

        /////////////
        // Reactor //
        /////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";

        this.map.fillStyle = "rgba(0, 100, 0, 1.0)";

        this.map.lineWidth =  0.01;

        this.map.beginPath();

        this.map.moveTo(-0.05, 0.22);

        this.map.lineTo(0.05, 0.22);

        this.map.bezierCurveTo(0.1, 0.22, 0.1, 0.28, 0.05, 0.28);

        this.map.lineTo(-0.05, 0.28);

        this.map.bezierCurveTo(-0.1, 0.28, -0.1, 0.22, -0.05, 0.22);

        this.map.stroke();

        this.map.restore();

        //////////////////////
        // Shield Generator //
        //////////////////////

        this.map.save();

        this.map.translate(this.availableWidth * .9, this.availableHeight * .9);

        this.map.scale(totalLengthOfObject * this.pixelsPerMeter, totalLengthOfObject * this.pixelsPerMeter);

        this.map.strokeStyle = "rgba(0, 255, 0, 1.0)";

        this.map.fillStyle = "rgba(0, 100, 0, 1.0)";

        this.map.lineWidth =  0.01;

        this.map.beginPath();

        this.map.arc(0, -0.15, 0.04, 0, 2 * Math.PI);

        this.map.stroke();

        this.map.restore();

    }
}