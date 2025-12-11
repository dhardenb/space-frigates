/**
 * Settings menu overlay renderer.
 * Renders a modal-style settings menu on the canvas.
 */

// Store interactive element bounds for hit testing
let settingsMenuBounds = {
    fullscreenToggle: null,
    volumeSlider: null,
    closeButton: null,
};

/**
 * Returns the current settings menu interactive element bounds.
 * @returns {Object} Bounds for interactive elements
 */
export function getSettingsMenuBounds() {
    return settingsMenuBounds;
}

/**
 * Renders the settings menu overlay.
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} options - Rendering options
 * @param {number} options.availableWidth - Viewport width in CSS pixels
 * @param {number} options.availableHeight - Viewport height in CSS pixels
 * @param {Object} options.settings - Current settings values
 * @param {number} options.settings.volume - Volume slider value (0-100, default 50)
 * @param {boolean} options.settings.fullscreen - Whether fullscreen is enabled
 * @param {boolean} options.fullscreenToggleHovered - Whether the fullscreen toggle is hovered
 * @param {boolean} options.volumeSliderHovered - Whether the volume slider is hovered
 * @param {boolean} options.volumeSliderDragging - Whether the volume slider is being dragged
 * @param {boolean} options.closeButtonHovered - Whether the close button is hovered
 */
export function renderSettingsMenu(ctx, {
    availableWidth,
    availableHeight,
    settings = {},
    fullscreenToggleHovered = false,
    volumeSliderHovered = false,
    volumeSliderDragging = false,
    closeButtonHovered = false,
}) {
    const menuWidth = Math.min(400, availableWidth * 0.85);
    const menuHeight = Math.min(380, availableHeight * 0.75);
    const menuX = (availableWidth - menuWidth) / 2;
    const menuY = (availableHeight - menuHeight) / 2;

    // Reset bounds
    settingsMenuBounds = {
        fullscreenToggle: null,
        volumeSlider: null,
        closeButton: null,
    };

    // Draw semi-transparent backdrop
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, availableWidth, availableHeight);
    ctx.restore();

    // Draw menu panel
    ctx.save();
    ctx.fillStyle = 'rgba(20, 20, 35, 0.95)';
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    // Rounded rectangle for menu background
    drawRoundedRect(ctx, menuX, menuY, menuWidth, menuHeight, 10);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Draw title
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 0, 0.95)';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('GAME SETTINGS', availableWidth / 2, menuY + 25);
    ctx.restore();

    // Settings content area
    const contentY = menuY + 70;
    const contentX = menuX + 30;
    const rowHeight = 45;

    // Fullscreen toggle (interactive)
    const fullscreenBounds = renderToggleRow(ctx, {
        x: contentX,
        y: contentY,
        label: 'Full Screen',
        enabled: settings.fullscreen || false,
        menuWidth: menuWidth - 60,
        isHovered: fullscreenToggleHovered,
    });
    settingsMenuBounds.fullscreenToggle = fullscreenBounds;

    // Volume slider (interactive)
    const volumeBounds = renderSliderRow(ctx, {
        x: contentX,
        y: contentY + rowHeight,
        label: 'Master Volume',
        value: settings.volume !== undefined ? settings.volume : 50,
        min: 0,
        max: 100,
        menuWidth: menuWidth - 60,
        isHovered: volumeSliderHovered,
        isDragging: volumeSliderDragging,
    });
    settingsMenuBounds.volumeSlider = volumeBounds;

    // Placeholder for future settings
    renderSettingRow(ctx, {
        x: contentX,
        y: contentY + rowHeight * 2,
        label: 'Music',
        value: 'Coming Soon',
        menuWidth: menuWidth - 60,
        disabled: true,
    });

    renderSettingRow(ctx, {
        x: contentX,
        y: contentY + rowHeight * 3,
        label: 'Sound Effects',
        value: 'Coming Soon',
        menuWidth: menuWidth - 60,
        disabled: true,
    });

    renderSettingRow(ctx, {
        x: contentX,
        y: contentY + rowHeight * 4,
        label: 'Controls',
        value: 'Coming Soon',
        menuWidth: menuWidth - 60,
        disabled: true,
    });

    // Close button
    const closeButtonBounds = renderCloseButton(ctx, {
        centerX: availableWidth / 2,
        y: menuY + menuHeight - 55,
        isHovered: closeButtonHovered,
    });
    settingsMenuBounds.closeButton = closeButtonBounds;

    // Footer hint
    ctx.save();
    ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
    ctx.font = 'italic 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('More settings coming in future updates', availableWidth / 2, menuY + menuHeight - 15);
    ctx.restore();
}

/**
 * Renders a close button.
 * @returns {Object} Bounds for hit testing
 */
function renderCloseButton(ctx, {centerX, y, isHovered = false}) {
    const buttonWidth = 120;
    const buttonHeight = 36;
    const buttonX = centerX - buttonWidth / 2;
    const buttonY = y;
    const borderRadius = 6;

    ctx.save();

    // Button background
    const bgColor = isHovered ? 'rgba(255, 255, 0, 0.25)' : 'rgba(80, 80, 80, 0.5)';
    const borderColor = isHovered ? 'rgba(255, 255, 0, 0.9)' : 'rgba(180, 180, 180, 0.6)';
    
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = isHovered ? 2 : 1.5;

    ctx.beginPath();
    ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, borderRadius);
    ctx.fill();
    ctx.stroke();

    // Button text
    ctx.fillStyle = isHovered ? 'rgba(255, 255, 0, 0.95)' : 'rgba(220, 220, 220, 0.9)';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CLOSE', centerX, buttonY + buttonHeight / 2);

    ctx.restore();

    return {
        x: buttonX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
    };
}

/**
 * Renders a single settings row with label and value.
 */
function renderSettingRow(ctx, {x, y, label, value, menuWidth, disabled = false}) {
    ctx.save();

    // Label
    ctx.fillStyle = disabled ? 'rgba(150, 150, 150, 0.5)' : 'rgba(255, 255, 200, 0.9)';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);

    // Value
    ctx.fillStyle = disabled ? 'rgba(120, 120, 120, 0.5)' : 'rgba(255, 255, 0, 0.85)';
    ctx.textAlign = 'right';
    ctx.fillText(value, x + menuWidth, y);

    ctx.restore();
}

/**
 * Renders a toggle switch row with label.
 * @returns {Object} Bounds for the toggle switch for hit testing
 */
function renderToggleRow(ctx, {x, y, label, enabled, menuWidth, isHovered = false}) {
    ctx.save();

    // Label
    ctx.fillStyle = 'rgba(255, 255, 200, 0.9)';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);

    ctx.restore();

    // Toggle switch dimensions
    const toggleWidth = 50;
    const toggleHeight = 24;
    const toggleX = x + menuWidth - toggleWidth;
    const toggleY = y - toggleHeight / 2;
    const toggleRadius = toggleHeight / 2;

    // Draw toggle track
    ctx.save();
    const trackColor = enabled 
        ? 'rgba(80, 180, 80, 0.9)' 
        : 'rgba(80, 80, 80, 0.7)';
    const trackBorderColor = isHovered 
        ? 'rgba(255, 255, 0, 0.8)' 
        : 'rgba(150, 150, 150, 0.5)';
    
    ctx.fillStyle = trackColor;
    ctx.strokeStyle = trackBorderColor;
    ctx.lineWidth = isHovered ? 2 : 1;
    
    ctx.beginPath();
    ctx.roundRect(toggleX, toggleY, toggleWidth, toggleHeight, toggleRadius);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Draw toggle knob
    ctx.save();
    const knobRadius = toggleHeight / 2 - 3;
    const knobX = enabled 
        ? toggleX + toggleWidth - toggleRadius 
        : toggleX + toggleRadius;
    const knobY = toggleY + toggleHeight / 2;
    
    ctx.fillStyle = enabled 
        ? 'rgba(255, 255, 255, 0.95)' 
        : 'rgba(200, 200, 200, 0.9)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = enabled ? -1 : 1;
    ctx.shadowOffsetY = 1;
    
    ctx.beginPath();
    ctx.arc(knobX, knobY, knobRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Return bounds for hit testing
    return {
        x: toggleX,
        y: toggleY,
        width: toggleWidth,
        height: toggleHeight,
    };
}

/**
 * Renders a slider row with label and percentage display.
 * @returns {Object} Bounds for the slider track for hit testing
 */
function renderSliderRow(ctx, {x, y, label, value, min = 0, max = 100, menuWidth, isHovered = false, isDragging = false}) {
    const sliderWidth = 140;
    const sliderHeight = 8;
    const sliderX = x + menuWidth - sliderWidth;
    const sliderY = y - sliderHeight / 2;
    const knobRadius = 10;

    // Clamp value
    const clampedValue = Math.max(min, Math.min(max, value));
    const percentage = (clampedValue - min) / (max - min);
    const displayPercent = Math.round(clampedValue) + '%';

    ctx.save();

    // Label
    ctx.fillStyle = 'rgba(255, 255, 200, 0.9)';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);

    // Percentage display (between label and slider)
    ctx.fillStyle = 'rgba(255, 255, 0, 0.85)';
    ctx.textAlign = 'right';
    ctx.fillText(displayPercent, sliderX - 15, y);

    ctx.restore();

    // Draw slider track background
    ctx.save();
    const trackBorderColor = (isHovered || isDragging)
        ? 'rgba(255, 255, 0, 0.8)'
        : 'rgba(150, 150, 150, 0.5)';
    
    ctx.fillStyle = 'rgba(60, 60, 60, 0.8)';
    ctx.strokeStyle = trackBorderColor;
    ctx.lineWidth = (isHovered || isDragging) ? 2 : 1;
    
    ctx.beginPath();
    ctx.roundRect(sliderX, sliderY, sliderWidth, sliderHeight, sliderHeight / 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Draw filled portion of track
    ctx.save();
    const fillWidth = sliderWidth * percentage;
    if (fillWidth > 0) {
        ctx.fillStyle = 'rgba(100, 180, 100, 0.9)';
        ctx.beginPath();
        ctx.roundRect(sliderX, sliderY, Math.max(sliderHeight, fillWidth), sliderHeight, sliderHeight / 2);
        ctx.fill();
    }
    ctx.restore();

    // Draw knob
    ctx.save();
    const knobX = sliderX + sliderWidth * percentage;
    const knobY = y;
    
    // Knob shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;
    
    // Knob fill
    const knobColor = isDragging
        ? 'rgba(255, 255, 0, 0.95)'
        : (isHovered ? 'rgba(255, 255, 200, 0.95)' : 'rgba(220, 220, 220, 0.95)');
    ctx.fillStyle = knobColor;
    ctx.beginPath();
    ctx.arc(knobX, knobY, knobRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Knob border
    ctx.shadowBlur = 0;
    ctx.strokeStyle = (isHovered || isDragging) ? 'rgba(255, 255, 0, 0.9)' : 'rgba(180, 180, 180, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Return bounds for hit testing (include knob area)
    return {
        x: sliderX - knobRadius,
        y: y - knobRadius,
        width: sliderWidth + knobRadius * 2,
        height: knobRadius * 2,
        // Also include track info for calculating value from position
        trackX: sliderX,
        trackWidth: sliderWidth,
    };
}

/**
 * Calculates slider value from an X coordinate.
 * @param {number} px - X coordinate
 * @param {Object} bounds - Slider bounds from renderSliderRow
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Calculated value
 */
export function getSliderValueFromPosition(px, bounds, min = 0, max = 100) {
    if (!bounds || !bounds.trackX || !bounds.trackWidth) return min;
    const trackX = bounds.trackX;
    const trackWidth = bounds.trackWidth;
    const relativeX = px - trackX;
    const percentage = Math.max(0, Math.min(1, relativeX / trackWidth));
    return min + percentage * (max - min);
}

/**
 * Renders the settings gear button in the bottom right corner.
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} options - Rendering options
 * @param {number} options.availableWidth - Viewport width
 * @param {number} options.availableHeight - Viewport height
 * @param {boolean} [options.isHovered] - Whether the button is being hovered
 * @param {boolean} [options.isActive] - Whether settings menu is open
 * @returns {Object} Button bounds for hit testing: {x, y, width, height}
 */
export function renderSettingsButton(ctx, {availableWidth, availableHeight, isHovered = false, isActive = false}) {
    const buttonSize = 36;
    const margin = 16;
    const x = availableWidth - buttonSize - margin;
    const y = availableHeight - buttonSize - margin;
    const centerX = x + buttonSize / 2;
    const centerY = y + buttonSize / 2;

    ctx.save();

    // Button background
    const bgAlpha = isActive ? 0.4 : (isHovered ? 0.25 : 0.15);
    ctx.fillStyle = `rgba(128, 128, 128, ${bgAlpha})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, buttonSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Button border
    const borderAlpha = isActive ? 0.8 : (isHovered ? 0.6 : 0.4);
    ctx.strokeStyle = `rgba(180, 180, 180, ${borderAlpha})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw gear icon
    const gearColor = isActive ? 'rgba(255, 255, 0, 0.95)' : `rgba(180, 180, 180, ${isHovered ? 0.9 : 0.7})`;
    drawGearIcon(ctx, centerX, centerY, buttonSize * 0.35, gearColor);

    ctx.restore();

    return {x, y, width: buttonSize, height: buttonSize};
}

/**
 * Draws a gear/cog icon.
 */
function drawGearIcon(ctx, cx, cy, radius, color) {
    const teethCount = 8;
    const innerRadius = radius * 0.55;
    const outerRadius = radius;
    const toothDepth = radius * 0.25;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    ctx.beginPath();

    for (let i = 0; i < teethCount; i++) {
        const angle = (i / teethCount) * Math.PI * 2;
        const nextAngle = ((i + 0.5) / teethCount) * Math.PI * 2;
        const toothAngle = ((i + 0.25) / teethCount) * Math.PI * 2;
        const toothEndAngle = ((i + 0.75) / teethCount) * Math.PI * 2;

        // Tooth outer edge
        const x1 = Math.cos(angle) * (outerRadius - toothDepth);
        const y1 = Math.sin(angle) * (outerRadius - toothDepth);
        const x2 = Math.cos(toothAngle) * outerRadius;
        const y2 = Math.sin(toothAngle) * outerRadius;
        const x3 = Math.cos(nextAngle) * outerRadius;
        const y3 = Math.sin(nextAngle) * outerRadius;
        const x4 = Math.cos(toothEndAngle) * (outerRadius - toothDepth);
        const y4 = Math.sin(toothEndAngle) * (outerRadius - toothDepth);

        if (i === 0) {
            ctx.moveTo(x1, y1);
        }
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
    }

    ctx.closePath();
    ctx.fill();

    // Inner circle (hole in gear)
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(20, 20, 35, 0.95)';
    ctx.fill();

    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
}

/**
 * Helper to draw a rounded rectangle path.
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

/**
 * Checks if a point is within the settings button bounds.
 * @param {number} px - Point X coordinate
 * @param {number} py - Point Y coordinate  
 * @param {Object} bounds - Button bounds from renderSettingsButton
 * @returns {boolean} True if point is within button
 */
export function isPointInSettingsButton(px, py, bounds) {
    if (!bounds) return false;
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const radius = bounds.width / 2;
    const dx = px - centerX;
    const dy = py - centerY;
    return (dx * dx + dy * dy) <= (radius * radius);
}

/**
 * Checks if a point is within a rectangular bounds.
 * @param {number} px - Point X coordinate
 * @param {number} py - Point Y coordinate
 * @param {Object} bounds - Rectangle bounds {x, y, width, height}
 * @returns {boolean} True if point is within bounds
 */
export function isPointInBounds(px, py, bounds) {
    if (!bounds) return false;
    return px >= bounds.x 
        && px <= bounds.x + bounds.width 
        && py >= bounds.y 
        && py <= bounds.y + bounds.height;
}
