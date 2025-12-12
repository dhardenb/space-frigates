import {Client} from './client.js';

// =============================================================================
// Tap-vs-Hold Detection System
// =============================================================================
// All maneuvering keys use tap-vs-hold behavior:
// - Tap (quick press): fires a single burst
// - Hold (200ms+): engages autopilot behavior (continuous with auto-dampening)
// =============================================================================

const HOLD_THRESHOLD_MS = 200; // Time in ms before hold behavior activates

// State for each key group
const keyState = {
    brake: { timer: null, holdEngaged: false },
    rotateCCW: { timer: null, holdEngaged: false },
    rotateCW: { timer: null, holdEngaged: false },
    lateralLeft: { timer: null, holdEngaged: false },
    lateralRight: { timer: null, holdEngaged: false }
};

/**
 * Generic tap-vs-hold key down handler.
 * @param {string} stateKey - Key in keyState object
 * @param {string|number} tapCommand - Command to fire immediately on tap
 * @param {string|number} holdCommand - Command to fire when hold threshold reached
 */
function handleTapHoldKeyDown(stateKey, tapCommand, holdCommand) {
    const state = keyState[stateKey];
    
    // Clear any existing timer
    if (state.timer !== null) {
        clearTimeout(state.timer);
        state.timer = null;
    }
    
    // Fire tap command immediately
    client.commandHandler({command: tapCommand});
    state.holdEngaged = false;
    
    // Set timer to engage hold behavior
    state.timer = setTimeout(() => {
        state.timer = null;
        state.holdEngaged = true;
        client.commandHandler({command: holdCommand});
    }, HOLD_THRESHOLD_MS);
}

/**
 * Generic tap-vs-hold key up handler.
 * @param {string} stateKey - Key in keyState object
 * @param {string|number|null} releaseCommand - Command to fire on release if hold was engaged (null to skip)
 */
function handleTapHoldKeyUp(stateKey, releaseCommand) {
    const state = keyState[stateKey];
    
    // Clear pending timer if tap was short
    if (state.timer !== null) {
        clearTimeout(state.timer);
        state.timer = null;
    }
    
    // If hold behavior was engaged, send release command
    if (state.holdEngaged && releaseCommand !== null) {
        client.commandHandler({command: releaseCommand});
        state.holdEngaged = false;
    }
}

// Convenience wrappers for each key group
function handleBrakeKeyDown() {
    handleTapHoldKeyDown('brake', 'RETRO_THRUST', 'BRAKE_DOWN');
}

function handleBrakeKeyUp() {
    handleTapHoldKeyUp('brake', 'STOP_BRAKE');
}

function handleRotateCCWKeyDown() {
    // Tap: single rotation burst, Hold: autopilot rotation mode
    handleTapHoldKeyDown('rotateCCW', 1, 'ROTATE_CCW_AUTOPILOT');
}

function handleRotateCCWKeyUp() {
    // On release after hold, trigger rotation dampening
    handleTapHoldKeyUp('rotateCCW', 'DAMPEN_ROTATION');
}

function handleRotateCWKeyDown() {
    // Tap: single rotation burst, Hold: autopilot rotation mode
    handleTapHoldKeyDown('rotateCW', 3, 'ROTATE_CW_AUTOPILOT');
}

function handleRotateCWKeyUp() {
    // On release after hold, trigger rotation dampening
    handleTapHoldKeyUp('rotateCW', 'DAMPEN_ROTATION');
}

function handleLateralLeftKeyDown() {
    // Tap: single lateral burst, Hold: continuous lateral thrust
    handleTapHoldKeyDown('lateralLeft', 'LATERAL_THRUST_LEFT', 'LATERAL_HOLD_LEFT');
}

function handleLateralLeftKeyUp() {
    // On release after hold, trigger lateral dampening
    handleTapHoldKeyUp('lateralLeft', 'DAMPEN_LATERAL');
}

function handleLateralRightKeyDown() {
    // Tap: single lateral burst, Hold: continuous lateral thrust
    handleTapHoldKeyDown('lateralRight', 'LATERAL_THRUST_RIGHT', 'LATERAL_HOLD_RIGHT');
}

function handleLateralRightKeyUp() {
    // On release after hold, trigger lateral dampening
    handleTapHoldKeyUp('lateralRight', 'DAMPEN_LATERAL');
}

export class Keyboard {

    constructor() {
        document.documentElement.addEventListener("keydown", this.handleKeyPressEvents, false);
        document.documentElement.addEventListener("keyup", this.handleKeyReleaseEvents, false);
    }

    handleKeyReleaseEvents(evt) {
        if (Client.gameMode !== 'PLAY_MODE') {
            return;
        }

        // Brake keys: S, ArrowDown
        if (evt.key === 'ArrowDown' || evt.key === 's' || evt.key === 'S') {
            handleBrakeKeyUp();
        }
        // Rotation CCW keys: ArrowLeft, A
        else if (evt.key === 'ArrowLeft' || evt.key === 'a' || evt.key === 'A') {
            handleRotateCCWKeyUp();
        }
        // Rotation CW keys: ArrowRight, D
        else if (evt.key === 'ArrowRight' || evt.key === 'd' || evt.key === 'D') {
            handleRotateCWKeyUp();
        }
        // Lateral left key: Q
        else if (evt.key === 'q' || evt.key === 'Q') {
            handleLateralLeftKeyUp();
        }
        // Lateral right key: E
        else if (evt.key === 'e' || evt.key === 'E') {
            handleLateralRightKeyUp();
        }
    }

    handleKeyPressEvents(evt) {
        // ESCAPE - Open Settings Menu (close is done via button)
        if (evt.key === 'Escape') {
            if (typeof client !== 'undefined' && client.openSettings && !client.isSettingsOpen()) {
                evt.preventDefault();
                client.openSettings();
            }
            return;
        }
        // BACKSPACE
        if (evt.key === 'Backspace') {
            if (Client.gameMode == 'START_MODE') {
                evt.preventDefault();
                client.playerName = client.playerName.slice(0, -1);   
            }
        }
        // ENTER - Start
        else if (evt.key === 'Enter') {
            evt.preventDefault();
            if (Client.gameMode == 'START_MODE') {
                client.requestShip();
            }
        }
        // ALT key - Toggle Shields
        else if (evt.key === 'Alt') {
            evt.preventDefault();
            if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 5});
            }
        }
        // M key - Toggle missiles
        else if (evt.key === 'm' || evt.key === 'M') {
            evt.preventDefault();
            if (Client.gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + evt.key.toUpperCase();
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                if (evt.repeat) {
                    return;
                }
                client.commandHandler({command: 'TOGGLE_MISSILES'});
            }
        }
        // SPACE_BAR - Fire
        else if (evt.key === ' ') {
            evt.preventDefault();
            if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 0});
            }
        }
        // LEFT_ARROW - Tap for rotation burst, hold for autopilot rotation
        else if (evt.key === 'ArrowLeft') {
            evt.preventDefault();
            if (Client.gameMode == 'PLAY_MODE') {
                if (!evt.repeat) {
                    handleRotateCCWKeyDown();
                }
            }
        }
        // UP_ARROW - Forward Thruster
        else if (evt.key === 'ArrowUp') {
            evt.preventDefault();
            if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 2});
            }
        }
        // RIGHT_ARROW - Tap for rotation burst, hold for autopilot rotation
        else if (evt.key === 'ArrowRight') {
            evt.preventDefault();
            if (Client.gameMode == 'PLAY_MODE') {
                if (!evt.repeat) {
                    handleRotateCWKeyDown();
                }
            }
        }
        // DOWN_ARROW - Tap for retrograde thrust, hold for autopilot braking
        else if (evt.key === 'ArrowDown') {
            if (Client.gameMode == 'PLAY_MODE') {
                evt.preventDefault();
                if (!evt.repeat) {
                    handleBrakeKeyDown();
                }
            }
        }
        // A - Tap for rotation burst, hold for autopilot rotation
        else if (evt.key === 'a' || evt.key === 'A') {
            evt.preventDefault();
            if (Client.gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + evt.key.toUpperCase();
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                if (!evt.repeat) {
                    handleRotateCCWKeyDown();
                }
            }
        }
        // D - Tap for rotation burst, hold for autopilot rotation
        else if (evt.key === 'd' || evt.key === 'D') {
            evt.preventDefault();
            if (Client.gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + evt.key.toUpperCase();
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                if (!evt.repeat) {
                    handleRotateCWKeyDown();
                }
            }
        }
        // S - Tap for retrograde thrust, hold for autopilot braking
        else if (evt.key === 's' || evt.key === 'S') {
            evt.preventDefault();
            if (Client.gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + evt.key.toUpperCase();
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                if (!evt.repeat) {
                    handleBrakeKeyDown();
                }
            }
        }
        // Q - Tap for lateral burst, hold for continuous lateral thrust
        else if (evt.key === 'q' || evt.key === 'Q') {
            if (Client.gameMode == 'START_MODE') {
                evt.preventDefault();
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + evt.key.toUpperCase();
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                evt.preventDefault();
                if (!evt.repeat) {
                    handleLateralLeftKeyDown();
                }
            }
        }
        // E - Tap for lateral burst, hold for continuous lateral thrust
        else if (evt.key === 'e' || evt.key === 'E') {
            if (Client.gameMode == 'START_MODE') {
                evt.preventDefault();
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + evt.key.toUpperCase();
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                evt.preventDefault();
                if (!evt.repeat) {
                    handleLateralRightKeyDown();
                }
            }
        }
        // Z - Available for rebinding (previously autopilot toggle)
        else if (evt.key === 'z' || evt.key === 'Z') {
            evt.preventDefault();
            if (Client.gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + evt.key.toUpperCase();
                }
            }
            // Z key is available for future use in PLAY_MODE
        }
        // W - Forward Thruster
        else if (evt.key === 'w' || evt.key === 'W') {
            evt.preventDefault();
            if (Client.gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + evt.key.toUpperCase();
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 2});
            }
        }
        // User typing in name (any other letter A-Z)
        else if (evt.key.length === 1 && evt.key.match(/[a-zA-Z]/)) {
            if (Client.gameMode == 'START_MODE') {
                evt.preventDefault();
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + evt.key.toUpperCase();
                }  
            }
        }
        // + Zoom In (= key, with or without shift)
        else if (evt.key === '+' || evt.key === '=') {
            evt.preventDefault();
            if (Client.gameMode == 'PLAY_MODE') {
                if (miniMapZoomLevel < 0.0626) {
                    miniMapZoomLevel = miniMapZoomLevel * 2
                }
            }
        }
        // - Zoom Out
        else if (evt.key === '-') {
            evt.preventDefault();
            if (Client.gameMode == 'PLAY_MODE') {
                if (miniMapZoomLevel > 0.015625) {
                    miniMapZoomLevel = miniMapZoomLevel / 2
                }
            }
        }
    }

}
