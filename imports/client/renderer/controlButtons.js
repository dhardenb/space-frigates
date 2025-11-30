export function renderControlButtons(map, layout) {
    renderRotateLeftButton(map, layout);
    renderRotateRightButton(map, layout);
    renderThrustButton(map, layout);
    renderBrakeButton(map, layout);
    renderShieldButton(map, layout);
    renderFireButton(map, layout);
}

export function renderRotateLeftButton(map, {availablePixels, availableHeight}) {
    map.save();
    map.translate(availablePixels * 0.1, availableHeight - availablePixels * 0.2);
    renderButton(map, availablePixels);
    map.restore();
}

export function renderRotateRightButton(map, {availablePixels, availableHeight}) {
    map.save();
    map.translate(availablePixels * 0.25, availableHeight - availablePixels * 0.2);
    renderButton(map, availablePixels);
    map.restore();
}

export function renderThrustButton(map, {availablePixels, availableHeight}) {
    map.save();
    map.translate(availablePixels * 0.175, availableHeight - availablePixels * 0.3);
    renderButton(map, availablePixels);
    map.restore();
}

export function renderBrakeButton(map, {availablePixels, availableHeight}) {
    map.save();
    map.translate(availablePixels * 0.175, availableHeight - availablePixels * 0.1);
    renderButton(map, availablePixels);
    map.restore();
}

export function renderShieldButton(map, {availablePixels, availableWidth, availableHeight}) {
    map.save();
    map.translate(availableWidth - availablePixels * 0.25, availableHeight - availablePixels * 0.1);
    renderButton(map, availablePixels);
    map.restore();
}

export function renderFireButton(map, {availablePixels, availableWidth, availableHeight}) {
    map.save();
    map.translate(availableWidth - availablePixels * 0.1, availableHeight - availablePixels * 0.1);
    renderButton(map, availablePixels);
    map.restore();
}

function renderButton(map, availablePixels) {
    map.save();
    map.strokeStyle = "rgba(128, 128, 128, 0.5)";
    map.lineWidth = availablePixels * 0.005;
    map.beginPath();
    map.arc(0, 0, availablePixels * 0.05, 0, 2 * Math.PI);
    map.stroke();
    map.restore();
}
