export function renderDamgeIndicator(map, {availableWidth, availableHeight, pixelsPerMeter, playerShip}) {
    const totalLengthOfObject = 32;

    //////////
    // Hull //
    //////////

    map.save();

    map.translate(availableWidth * .9, availableHeight * .9);

    map.scale(totalLengthOfObject * pixelsPerMeter, totalLengthOfObject * pixelsPerMeter);

    if (playerShip.HullStrength / playerShip.MaxHullStrength <= .33) {
        map.strokeStyle = "rgba(255, 0, 0, 1.0)";
        map.fillStyle = "rgba(100, 0, 0, 1.0)";
    }
    else if (playerShip.HullStrength / playerShip.MaxHullStrength <= .66) {
        map.strokeStyle = "rgba(255, 255, 0, 1.0)";
        map.fillStyle = "rgba(100, 100, 0, 1.0)";
    }
    else {
        map.strokeStyle = "rgba(0, 255, 0, 1.0)";
        map.fillStyle = "rgba(0, 100, 0, 1.0)";
    }

    map.lineWidth =  0.01;

    map.lineJoin = "round";

    map.beginPath();

    map.moveTo(-0.05, -0.5);

    map.lineTo(0.05, -0.5);

    map.lineTo(0.1, -0.2);

    map.lineTo(0.2, -0.1);

    map.lineTo(0.2, 0.1);

    map.lineTo(0.4, 0.3);

    map.lineTo(0.4, 0.4);

    map.lineTo(0.2, 0.4);

    map.lineTo(0.2, 0.5);

    map.lineTo(-0.2, 0.5);

    map.lineTo(-0.2, 0.4);

    map.lineTo(-0.4, 0.4);

    map.lineTo(-0.4, 0.3);

    map.lineTo(-0.2, 0.1);

    map.lineTo(-0.2, -0.1);

    map.lineTo(-0.1, -0.2);

    map.closePath();

    map.stroke();

    // map.fill();

    map.restore();

    ///////////////////
    // Plasma Cannon //
    ///////////////////

    map.save();

    map.translate(availableWidth * .9, availableHeight * .9);

    map.scale(totalLengthOfObject * pixelsPerMeter, totalLengthOfObject * pixelsPerMeter);

    if (playerShip.PlasmaCannonStrength / playerShip.MaxPlasmaCannonStrength <= .33) {
        map.strokeStyle = "rgba(255, 0, 0, 1.0)";
        map.fillStyle = "rgba(100, 0, 0, 1.0)";
    }
    else if (playerShip.PlasmaCannonStrength / playerShip.MaxPlasmaCannonStrength <= .66) {
        map.strokeStyle = "rgba(255, 255, 0, 1.0)";
        map.fillStyle = "rgba(100, 100, 0, 1.0)";
    }
    else {
        map.strokeStyle = "rgba(0, 255, 0, 1.0)";
        map.fillStyle = "rgba(0, 100, 0, 1.0)";
    }

    map.lineWidth =  0.01;

    map.lineJoin = "round";

    map.beginPath();

    map.moveTo(-0.025, -0.48);

    map.lineTo(0.025, -0.48);

    map.lineTo(0.065, -0.22);

    map.lineTo(-0.065, -0.22);

    map.closePath();

    map.stroke();

    // map.fill();

    map.restore();

    map.restore();

    /////////////
    // Cockpit //
    /////////////

    map.save();

    map.translate(availableWidth * .9, availableHeight * .9);

    map.scale(totalLengthOfObject * pixelsPerMeter, totalLengthOfObject * pixelsPerMeter);

    map.strokeStyle = "rgba(0, 255, 0, 1.0)";

    map.fillStyle = "rgba(0, 100, 0, 1.0)";

    map.lineWidth =  0.01;

    map.lineJoin = "round";

    map.beginPath();

    map.moveTo(-0.05, -0.08);

    map.lineTo(0.05, -0.08);

    map.lineTo(0.08, -0.02);

    map.lineTo(0.08, 0.18);

    map.lineTo(-0.08, 0.18);

    map.lineTo(-0.08, -0.02);

    map.closePath();

    map.stroke();

    // map.fill();

    map.restore();

    map.restore();

    ///////////////////
    // Main Thruster //
    ///////////////////

    map.save();

    map.translate(availableWidth * .9, availableHeight * .9);

    map.scale(totalLengthOfObject * pixelsPerMeter, totalLengthOfObject * pixelsPerMeter);

    if (playerShip.ThrusterStrength / playerShip.MaxThrusterStrength <= .33) {
        map.strokeStyle = "rgba(255, 0, 0, 1.0)";
        map.fillStyle = "rgba(100, 0, 0, 1.0)";
    }
    else if (playerShip.ThrusterStrength / playerShip.MaxThrusterStrength <= .66) {
        map.strokeStyle = "rgba(255, 255, 0, 1.0)";
        map.fillStyle = "rgba(100, 100, 0, 1.0)";
    }
    else {
        map.strokeStyle = "rgba(0, 255, 0, 1.0)";
        map.fillStyle = "rgba(0, 100, 0, 1.0)";
    }

    map.lineWidth =  0.01;

    map.lineJoin = "round";

    map.beginPath();

    map.moveTo(-0.08, 0.32);

    map.lineTo(0.08, 0.32);

    map.lineTo(0.08, 0.45);

    map.lineTo(0.05, 0.48);

    map.lineTo(-0.05, 0.48);

    map.lineTo(-0.08, 0.45);

    map.closePath();

    map.stroke();

    // map.fill();

    map.restore();

    map.restore();

    /////////////////////
    // Right Capacitor //
    /////////////////////

    map.save();

    map.translate(availableWidth * .9, availableHeight * .9);

    map.scale(totalLengthOfObject * pixelsPerMeter, totalLengthOfObject * pixelsPerMeter);

    map.strokeStyle = "rgba(0, 255, 0, 1.0)";

    map.fillStyle = "rgba(0, 100, 0, 1.0)";

    map.lineWidth =  0.01;

    map.lineJoin = "round";

    map.beginPath();

    map.moveTo(0.22, 0.16);

    map.lineTo(0.38, 0.32);

    map.lineTo(0.38, 0.38);

    map.lineTo(0.22, 0.38);

    map.closePath();

    map.stroke();

    map.restore();

    map.restore();

    /////////////////////
    // Left Capacitor ///
    /////////////////////

    map.save();

    map.translate(availableWidth * .9, availableHeight * .9);

    map.scale(totalLengthOfObject * pixelsPerMeter, totalLengthOfObject * pixelsPerMeter);

    map.strokeStyle = "rgba(0, 255, 0, 1.0)";

    map.fillStyle = "rgba(0, 100, 0, 1.0)";

    map.lineWidth =  0.01;

    map.lineJoin = "round";

    map.beginPath();

    map.moveTo(-0.22, 0.16);

    map.lineTo(-0.38, 0.32);

    map.lineTo(-0.38, 0.38);

    map.lineTo(-0.22, 0.38);

    map.closePath();

    map.stroke();

    map.restore();

    map.restore();

    ////////////////////
    // Ship Computer ///
    ////////////////////

    map.save();

    map.translate(availableWidth * .9, availableHeight * .9);

    map.scale(totalLengthOfObject * pixelsPerMeter, totalLengthOfObject * pixelsPerMeter);

    map.strokeStyle = "rgba(0, 255, 0, 1.0)";

    map.fillStyle = "rgba(0, 100, 0, 1.0)";

    map.lineWidth =  0.01;

    map.lineJoin = "round";

    map.beginPath();

    map.moveTo(-0.06, -0.02);

    map.lineTo(-0.04, -0.06);

    map.lineTo(0.04, -0.06);

    map.lineTo(0.06, -0.02);

    map.closePath();

    map.stroke();

    map.restore();

    map.restore();

    //////////////////////////
    // Life Support System ///
    //////////////////////////

    map.save();

    map.translate(availableWidth * .9, availableHeight * .9);

    map.scale(totalLengthOfObject * pixelsPerMeter, totalLengthOfObject * pixelsPerMeter);

    map.strokeStyle = "rgba(0, 255, 0, 1.0)";

    map.fillStyle = "rgba(0, 100, 0, 1.0)";

    map.lineWidth =  0.01;

    map.lineJoin = "round";

    map.beginPath();

    map.moveTo(-0.06, 0.12);

    map.lineTo(0.06, 0.12);

    map.lineTo(0.06, 0.16);

    map.lineTo(-0.06, 0.16);

    map.closePath();

    map.stroke();

    map.restore();

    map.restore();

    ////////////
    // Pilot ///
    ////////////

    map.save();

    map.translate(availableWidth * .9, availableHeight * .9);

    map.scale(totalLengthOfObject * pixelsPerMeter, totalLengthOfObject * pixelsPerMeter);

    map.strokeStyle = "rgba(0, 255, 0, 1.0)";

    map.fillStyle = "rgba(0, 100, 0, 1.0)";

    map.lineWidth =  0.01;

    map.beginPath();

    map.arc(0, 0.05, 0.05, 0, 2 * Math.PI);

    map.stroke();

    map.restore();

    map.restore();

    /////////////
    // Reactor //
    /////////////

    map.save();

    map.translate(availableWidth * .9, availableHeight * .9);

    map.scale(totalLengthOfObject * pixelsPerMeter, totalLengthOfObject * pixelsPerMeter);

    map.strokeStyle = "rgba(0, 255, 0, 1.0)";

    map.fillStyle = "rgba(0, 100, 0, 1.0)";

    map.lineWidth =  0.01;

    map.beginPath();

    map.moveTo(-0.05, 0.22);

    map.lineTo(0.05, 0.22);

    map.bezierCurveTo(0.1, 0.22, 0.1, 0.28, 0.05, 0.28);

    map.lineTo(-0.05, 0.28);

    map.bezierCurveTo(-0.1, 0.28, -0.1, 0.22, -0.05, 0.22);

    map.stroke();

    map.restore();

    //////////////////////
    // Shield Generator //
    //////////////////////

    map.save();

    map.translate(availableWidth * .9, availableHeight * .9);

    map.scale(totalLengthOfObject * pixelsPerMeter, totalLengthOfObject * pixelsPerMeter);

    map.strokeStyle = "rgba(0, 255, 0, 1.0)";

    map.fillStyle = "rgba(0, 100, 0, 1.0)";

    map.lineWidth =  0.01;

    map.beginPath();

    map.arc(0, -0.15, 0.04, 0, 2 * Math.PI);

    map.stroke();

    map.restore();
}
