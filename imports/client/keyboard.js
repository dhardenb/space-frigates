import {Client} from './client.js';

export class Keyboard {

    constructor() {
        document.documentElement.addEventListener("keydown", this.handleKeyPressEvents, false);
    }

    handleKeyPressEvents(evt) {
        // BACKSPACE
        if (evt.keyCode == 8) {
            if (Client.gameMode == 'START_MODE') {
                evt.preventDefault();
                client.playerName = client.playerName.slice(0, -1);   
            }
        }
        // ENTER - Start
        else if(evt.keyCode==13) {
            evt.preventDefault();
            if (Client.gameMode == 'START_MODE') {
                client.requestShip();
            }
        }
        // ALT key - Toggle Shields
        else if(evt.keyCode==18) {
            evt.preventDefault();
            if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 5});
            }
        }
        // SPACE_BAR - Fire
        else if(evt.keyCode == 32) {
            evt.preventDefault();
            if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 0});
            }
        }
        // LEFT_ARROW - Rotate CounterClockwise
        else if(evt.keyCode == 37) {
            evt.preventDefault();
            if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 1});
            }
        }
        // UP_ARROW - Forward Thruster
        else if(evt.keyCode==38) {
            evt.preventDefault();
            if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 2});
            }
        }
        // RIGHT_ARROW - Rotate Clockwise
        else if(evt.keyCode==39) {
            evt.preventDefault();
            if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 3});
            }
        }
        // DOWN_ARROW - Stop
        else if(evt.keyCode==40) {
            if (Client.gameMode == 'PLAY_MODE') {
                evt.preventDefault();
                client.commandHandler({command: 'RETRO_THRUST'});
            }
        }
        // A - Rotate CounterClockwise
        else if(evt.keyCode == 65) {
            evt.preventDefault();
            if (Client.gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + String.fromCharCode(evt.which);
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 1});
            }
        }
        // D
        else if(evt.keyCode == 68) {
            evt.preventDefault();
            if (Client.gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + String.fromCharCode(evt.which);
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 3});
            }
        }
        // S
        else if(evt.keyCode == 83) {
            evt.preventDefault();
            if (Client.gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + String.fromCharCode(evt.which);
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 'RETRO_THRUST'});
            }
        }
        // Q - Lateral thrust (left-side thrusters)
        else if(evt.keyCode == 81) {
            if (Client.gameMode == 'START_MODE') {
                evt.preventDefault();
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + String.fromCharCode(evt.which);
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                evt.preventDefault();
                client.commandHandler({command: 'LATERAL_THRUST_LEFT'});
            }
        }
        // E - Lateral thrust (right-side thrusters)
        else if(evt.keyCode == 69) {
            if (Client.gameMode == 'START_MODE') {
                evt.preventDefault();
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + String.fromCharCode(evt.which);
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                evt.preventDefault();
                client.commandHandler({command: 'LATERAL_THRUST_RIGHT'});
            }
        }
        // Z - Autopilot Brake
        else if(evt.keyCode == 90) {
            evt.preventDefault();
            if (Client.gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + String.fromCharCode(evt.which);
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                if (evt.repeat) {
                    return;
                }
                client.commandHandler({command: 'BRAKE_DOWN'});
            }
        }
        // W
        else if(evt.keyCode == 87) {
            evt.preventDefault();
            if (Client.gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + String.fromCharCode(evt.which);
                }
            } else if (Client.gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 2});
            }
        }
        // User typing in name
        else if (evt.keyCode >= 65 && evt.keyCode <=90) {
            if (Client.gameMode == 'START_MODE') {
                evt.preventDefault();
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + String.fromCharCode(evt.which);
                }  
            }
        }
        // + Zoom In
        else if(evt.keyCode==187) {
            evt.preventDefault();
            if (Client.gameMode == 'PLAY_MODE') {
                if (miniMapZoomLevel < 0.0626) {
                    miniMapZoomLevel = miniMapZoomLevel * 2
                }
            }
        }
        // - Zoom Out
        else if(evt.keyCode==189) {
            evt.preventDefault();
            if (Client.gameMode == 'PLAY_MODE') {
                if (miniMapZoomLevel > 0.015625) {
                    miniMapZoomLevel = miniMapZoomLevel / 2
                }
            }
        }
    }

}
