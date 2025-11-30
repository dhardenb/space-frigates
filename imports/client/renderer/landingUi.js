import {renderInstructions} from './hudMeters.js';

export function renderLandingScreen(map, {
    alpha = 1,
    availableWidth,
    availableHeight,
    version,
    playerName,
    renderTimeSeconds,
    gameMode,
    renderLeaderboard,
}) {
    const clampedAlpha = Math.min(1, Math.max(0, alpha));

    map.save();
    map.globalAlpha = clampedAlpha;

    if (typeof renderLeaderboard === 'function') {
        renderLeaderboard();
    }

    renderTitle(map, availableWidth);
    renderVersion(map, availableWidth, version);
    renderTwitter(map, availableWidth);
    renderBlog(map, availableWidth);
    renderEmail(map, availableWidth);
    renderInstructions(map, availableHeight);
    renderNameInputBox(map, availableWidth, availableHeight, gameMode);
    renderName(map, availableWidth, availableHeight, playerName, renderTimeSeconds, gameMode);
    renderStartInstructions(map, availableWidth, availableHeight);
    renderEnergyInstructions(map, availableWidth, availableHeight);

    map.restore();
}

function renderTitle(map, availableWidth) {
    map.save();
    map.strokeStyle = "yellow";
    map.font = "60px Arial";
    map.translate(availableWidth / 2 - map.measureText("Space Frigates").width / 2, 50);
    map.strokeText("Space Frigates", 0, 0);
    map.restore();
}

function renderVersion(map, availableWidth, version) {
    map.save();
    map.fillStyle = "yellow";
    map.font = "20px Arial";
    map.translate(availableWidth / 2 - map.measureText("PUBLIC ALPHA - " + version).width / 2, 90);
    map.fillText("PUBLIC ALPHA - " + version, 0, 0);
    map.restore();
}

function renderTwitter(map, availableWidth) {
    map.save();
    map.fillStyle = "yellow";
    map.font = "20px Arial";
    map.translate(availableWidth / 2 - map.measureText("TWITTER: @spacefrigates").width / 2, 130);
    map.fillText("TWITTER: @spacefrigates", 0, 0);
    map.restore();
}

function renderBlog(map, availableWidth) {
    map.save();
    map.fillStyle = "yellow";
    map.font = "20px Arial";
    map.translate(availableWidth / 2 - map.measureText("BLOG: blog.spacefrigates.com").width / 2, 170);
    map.fillText("BLOG: blog.spacefrigates.com", 0, 0);
    map.restore();
}

function renderEmail(map, availableWidth) {
    map.save();
    map.fillStyle = "yellow";
    map.font = "20px Arial";
    map.translate(availableWidth / 2 - map.measureText("EMAIL: davehardenbrook@yahoo.com").width / 2, 210);
    map.fillText("EMAIL: davehardenbrook@yahoo.com", 0, 0);
    map.restore();
}

function renderNameInputBox(map, availableWidth, availableHeight, gameMode) {
    map.save();
    const metrics = getNameInputMetrics(availableWidth, availableHeight);
    const isActive = gameMode == 'START_MODE';

    map.translate(metrics.x, metrics.y);
    map.lineJoin = "round";

    const edgeColor = isActive ? "rgba(255, 255, 0, 0.9)" : "rgba(200, 200, 200, 0.35)";
    map.lineWidth = 2;
    map.strokeStyle = edgeColor;
    map.strokeRect(0, 0, metrics.width, metrics.height);

    map.strokeStyle = "rgba(255, 255, 255, 0.12)";
    map.lineWidth = 1;
    map.strokeRect(1.5, 1.5, metrics.width - 3, metrics.height - 3);

    map.restore();
}

function renderName(map, availableWidth, availableHeight, playerName, renderTimeSeconds, gameMode) {
    map.save();

    const metrics = getNameInputMetrics(availableWidth, availableHeight);
    const hasName = playerName !== "";
    const isActive = gameMode == 'START_MODE';
    const textColor = hasName ? "rgba(255, 255, 128, 0.95)" : "rgba(200, 200, 200, 0.6)";
    const fontStyle = hasName ? "20px Arial" : "italic 20px Arial";

    map.font = fontStyle;
    map.fillStyle = textColor;
    map.textAlign = "left";
    map.textBaseline = "middle";

    const baselineY = metrics.baselineY;
    const textStartX = metrics.x + metrics.paddingX;

    map.translate(textStartX, baselineY);

    if (hasName) {
        map.fillText(playerName, 0, 0);
    } else {
        map.globalAlpha = 0.65;
        map.fillText("GUEST", 0, 0);
        map.globalAlpha = 1;
    }

    const renderedText = hasName ? playerName : "";
    const textMetrics = map.measureText(renderedText);
    const caretOffset = hasName ? textMetrics.width : 0;
    const caretColor = isActive ? "rgba(255, 255, 0, 0.9)" : "rgba(200, 200, 200, 0.35)";
    const shouldShowCaret = isActive;
    const caretBlinkOn = Math.floor(renderTimeSeconds * 2) % 2 === 0;

    if (shouldShowCaret && caretBlinkOn) {
        map.beginPath();
        const caretHeight = metrics.caretHeight;
        const halfCaret = caretHeight / 2;
        map.moveTo(caretOffset + 2, -halfCaret);
        map.lineTo(caretOffset + 2, halfCaret);
        map.lineWidth = 2;
        map.strokeStyle = caretColor;
        map.stroke();
    }

    map.restore();
}

function renderStartInstructions(map, availableWidth, availableHeight) {
    map.save();
    let textToRender = "PRESS ENTER TO START";

    map.fillStyle = "yellow";
    map.font = "20px Arial";
    map.translate(availableWidth / 2 - map.measureText(textToRender).width / 2, availableHeight / 2 + 95);

    map.fillText(textToRender, 0, 0);

    map.restore();
}

function renderEnergyInstructions(map, availableWidth, availableHeight) {
    map.save();
    let textToRender = "COLLECT DEBRIS TO INCREASE ENERGY";
    map.fillStyle = "yellow";
    map.font = "20px Arial";
    map.translate(availableWidth / 2 - map.measureText(textToRender).width / 2, availableHeight / 2 + 155);
    map.fillText(textToRender, 0, 0);
    map.restore();
}

function getNameInputMetrics(availableWidth, availableHeight) {
    const horizontalMargin = 40;
    const usableWidth = Math.max(140, availableWidth - horizontalMargin);
    let width = Math.min(320, Math.max(200, availableWidth * 0.35));
    width = Math.min(width, usableWidth);
    const height = 70;
    const x = (availableWidth - width) / 2;
    const y = availableHeight / 2 - height * 0.5;
    const paddingX = 20;
    const baselineY = y + height / 2;
    const caretHeight = Math.max(16, Math.min(32, height - 16));
    return {width, height, x, y, paddingX, baselineY, caretHeight};
}
