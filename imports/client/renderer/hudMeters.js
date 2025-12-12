export function renderHullStrength(map, {availableHeight, hullStrength}) {
    const hullStrengthDisplayValue = Math.floor(hullStrength);

    map.save();
    map.translate(0, availableHeight - 90);
    map.fillStyle = "rgba(128, 128, 128, 0.5)";
    map.font = "20px Arial";
    map.fillText("HULL ", 0, 0);
    map.restore();

    map.save();
    map.translate(125, availableHeight - 108);
    renderMeter(map, hullStrengthDisplayValue);
    map.restore();
}

export function renderCapacitorStatus(map, {availableHeight, capacitor}) {
    const capacitorDisplayValue = Math.floor(capacitor);

    map.save();
    map.translate(0, availableHeight - 55);
    map.fillStyle = "rgba(128, 128, 128, 0.5)";
    map.font = "20px Arial";
    map.fillText("CAPACITOR ", 0, 0);
    map.restore();

    map.save();
    map.translate(125, availableHeight - 72);
    renderMeter(map, capacitorDisplayValue);
    map.restore();
}

export function renderShieldStatus(map, {availableHeight, shieldStatus, shieldOn}) {
    const shieldDisplayValue = Math.floor(shieldStatus);

    map.save();
    map.translate(0, availableHeight - 20);
    map.fillStyle = "rgba(128, 128, 128, 0.5)";
    map.font = "20px Arial";
    map.fillText("SHIELDS ", 0, 0);
    map.restore();

    map.save();
    map.translate(125, availableHeight - 37);

    const colorOverride = shieldOn ? undefined : "gray";

    renderMeter(map, shieldDisplayValue, colorOverride);
    map.restore();
}

export function renderMissileStatus(map, {availableHeight, missilesRemaining, missilesArmed, maxMissiles}) {
    const remaining = Math.max(0, Math.floor(missilesRemaining || 0));
    const total = Math.max(0, Math.floor(maxMissiles || 0));
    const armedText = missilesArmed && remaining > 0 ? 'ARMED' : 'SAFE';
    const armedColor = missilesArmed && remaining > 0 ? 'rgba(200, 40, 40, 0.85)' : 'rgba(128, 128, 128, 0.7)';

    map.save();
    map.translate(0, availableHeight - 125);
    map.fillStyle = 'rgba(128, 128, 128, 0.5)';
    map.font = '20px Arial';
    map.fillText(`MISSILES ${remaining}/${total}`, 0, 0);
    map.restore();

    map.save();
    map.translate(180, availableHeight - 125);
    map.fillStyle = armedColor;
    map.font = '20px Arial';
    map.fillText(armedText, 0, 0);
    map.restore();
}

export function renderInstructions(map, availableHeight) {
    map.save();
    map.fillStyle = "yellow";
    map.font = "20px Arial";
    map.translate(0, availableHeight - 185);
    map.fillText("ENTER => New Ship", 0, 0);
    map.translate(0, 25);
    map.fillText("W or UP ARROW => Thrust", 0, 0);
    map.translate(0, 25);
    map.fillText("A/D or LEFT/RIGHT => Tap: Burst / Hold: Auto-Rotate", 0, 0);
    map.translate(0, 25);
    map.fillText("Q/E => Tap: Burst / Hold: Strafe", 0, 0);
    map.translate(0, 25);
    map.fillText("S or DOWN => Tap: Retro / Hold: Auto-Brake", 0, 0);
    map.translate(0, 25);
    map.fillText("ALT => Toggle Shields", 0, 0);
    map.translate(0, 25);
    map.fillText("M => Arm / Disarm Missiles", 0, 0);
    map.translate(0, 25);
    map.fillText("SPACEBAR => Fire", 0, 0);
    map.restore();
}

function renderMeter(map, percentage, colorOverride) {
    map.save();
    let color = "";

    if (colorOverride) {
        color = colorOverride;
    } else if (percentage === -1) {
        color = "gray";
    } else if (percentage <= 33) {
        color = "red";
    } else if (percentage <= 66) {
        color = "yellow";
    } else {
        color = "green";
    }

    if (percentage <= 0) {
        renderMeterBar(map, 0, 0, false, color);
    } else {
        renderMeterBar(map, 0, 0, true, color);
    }

    if (percentage < 11) {
        renderMeterBar(map, 20, 0, false, color);
    } else {
        renderMeterBar(map, 20, 0, true, color);
    }

    if (percentage < 21) {
        renderMeterBar(map, 40, 0, false, color);
    } else {
        renderMeterBar(map, 40, 0, true, color);
    }

    if (percentage < 31) {
        renderMeterBar(map, 60, 0, false, color);
    } else {
        renderMeterBar(map, 60, 0, true, color);
    }

    if (percentage < 41) {
        renderMeterBar(map, 80, 0, false, color);
    } else {
        renderMeterBar(map, 80, 0, true, color);
    }

    if (percentage < 51) {
        renderMeterBar(map, 100, 0, false, color);
    } else {
        renderMeterBar(map, 100, 0, true, color);
    }

    if (percentage < 61) {
        renderMeterBar(map, 120, 0, false, color);
    } else {
        renderMeterBar(map, 120, 0, true, color);
    }

    if (percentage < 71) {
        renderMeterBar(map, 140, 0, false, color);
    } else {
        renderMeterBar(map, 140, 0, true, color);
    }

    if (percentage < 81) {
        renderMeterBar(map, 160, 0, false, color);
    } else {
        renderMeterBar(map, 160, 0, true, color);
    }

    if (percentage < 91) {
        renderMeterBar(map, 180, 0, false, color);
    } else {
        renderMeterBar(map, 180, 0, true, color);
    }

    map.restore();
}

function renderMeterBar(map, x, y, filled, color) {
    map.save();

    let fillColor = "";
    const strokeColor = color;

    if (filled) {
        if (color === "gray") {
            fillColor = "rgba(128, 128, 128, 0.25)";
        } else if (color === "green") {
            fillColor = "rgba(0, 128, 0, 0.25)";
        } else if (color === "yellow") {
            fillColor = "rgba(255, 255, 0, 0.25)";
        } else if (color === "red") {
            fillColor = "rgba(255, 0, 0, 0.25)";
        }
    } else {
        fillColor = "rgba(0,0,0,0.5)";
    }

    map.fillStyle = fillColor;
    map.strokeStyle = strokeColor;

    map.beginPath();
    map.rect(x, y, 10, 20);
    map.fill();
    map.stroke();
    map.restore();
}
