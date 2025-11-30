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
    let shieldDisplayValue = Math.floor(shieldStatus);

    map.save();
    map.translate(0, availableHeight - 20);
    map.fillStyle = "rgba(128, 128, 128, 0.5)";
    map.font = "20px Arial";
    map.fillText("SHIELDS ", 0, 0);
    map.restore();

    map.save();
    map.translate(125, availableHeight - 37);

    if (shieldOn === 0 && shieldDisplayValue === 0) {
        shieldDisplayValue = -1;
    }

    renderMeter(map, shieldDisplayValue);
    map.restore();
}

export function renderInstructions(map, availableHeight) {
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
    map.fillText("S or DOWN ARROW => Auto Brake", 0, 0);
    map.translate(0, 25);
    map.fillText("ALT => Toggle Shields", 0, 0);
    map.translate(0, 25);
    map.fillText("SPACEBAR => Fire", 0, 0);
    map.restore();
}

function renderMeter(map, percentage) {
    map.save();
    let color = "";

    if (percentage === -1) {
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
