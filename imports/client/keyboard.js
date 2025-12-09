import {Client} from './client.js';

export class Keyboard {

    constructor() {
        document.documentElement.addEventListener("keydown", this.handleKeyPressEvents, false);
    }

    handleKeyPressEvents(evt) {
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
        // LEFT_ARROW - Rotate CounterClockwise
        else if (evt.key === 'ArrowLeft') {
            evt.preventDefault();
            if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 1});
            }
        }
        // UP_ARROW - Forward Thruster
        else if (evt.key === 'ArrowUp') {
            evt.preventDefault();
            if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 2});
            }
        }
        // RIGHT_ARROW - Rotate Clockwise
        else if (evt.key === 'ArrowRight') {
            evt.preventDefault();
            if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 3});
            }
        }
        // DOWN_ARROW - Stop
        else if (evt.key === 'ArrowDown') {
            if (Client.gameMode == 'PLAY_MODE') {
                evt.preventDefault();
                client.commandHandler({command: 'RETRO_THRUST'});
            }
        }
        // A - Rotate CounterClockwise
        else if (evt.key === 'a' || evt.key === 'A') {
            evt.preventDefault();
            if (Client.gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + evt.key.toUpperCase();
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 1});
            }
        }
        // D - Rotate Clockwise
        else if (evt.key === 'd' || evt.key === 'D') {
            evt.preventDefault();
            if (Client.gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + evt.key.toUpperCase();
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 3});
            }
        }
        // S - Retro Thrust
        else if (evt.key === 's' || evt.key === 'S') {
            evt.preventDefault();
            if (Client.gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + evt.key.toUpperCase();
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 'RETRO_THRUST'});
            }
        }
        // Q - Lateral thrust (left-side thrusters)
        else if (evt.key === 'q' || evt.key === 'Q') {
            if (Client.gameMode == 'START_MODE') {
                evt.preventDefault();
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + evt.key.toUpperCase();
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                evt.preventDefault();
                client.commandHandler({command: 'LATERAL_THRUST_LEFT'});
            }
        }
        // E - Lateral thrust (right-side thrusters)
        else if (evt.key === 'e' || evt.key === 'E') {
            if (Client.gameMode == 'START_MODE') {
                evt.preventDefault();
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + evt.key.toUpperCase();
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                evt.preventDefault();
                client.commandHandler({command: 'LATERAL_THRUST_RIGHT'});
            }
        }
        // Z - Autopilot Brake
        else if (evt.key === 'z' || evt.key === 'Z') {
            evt.preventDefault();
            if (Client.gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + evt.key.toUpperCase();
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                if (evt.repeat) {
                    return;
                }
                client.commandHandler({command: 'BRAKE_DOWN'});
            }
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
