export class Keyboard {

    handleKeyPressEvents(evt) {
        // BACKSPACE
        if (evt.keyCode == 8) {
            if (gameMode == 'START_MODE') {
                evt.preventDefault();
                client.playerName = client.playerName.slice(0, -1);   
            }
        }
        // ENTER - Start
        else if(evt.keyCode==13) {
            evt.preventDefault();
            if (gameMode == 'START_MODE') {
                client.requestShip();
            }
        }
        // ALT key - Toggle Shields
        else if(evt.keyCode==18) {
            evt.preventDefault();
            if (gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 5, targetId: playerShipId});
            }
        }
        // SPACE_BAR - Fire
        else if(evt.keyCode == 32) {
            evt.preventDefault();
            if (gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 0, targetId: playerShipId});
            }
        }
        // LEFT_ARROW - Rotate CounterClockwise
        else if(evt.keyCode == 37) {
            evt.preventDefault();
            if (gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 1, targetId: playerShipId});
            }
        }
        // UP_ARROW - Forward Thruster
        else if(evt.keyCode==38) {
            evt.preventDefault();
            if (gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 2, targetId: playerShipId});
            }
        }
        // RIGHT_ARROW - Rotate Clockwise
        else if(evt.keyCode==39) {
            evt.preventDefault();
            if (gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 3, targetId: playerShipId});
            }
        }
        // DOWN_ARROW - Stop
        else if(evt.keyCode==40) {
            evt.preventDefault();
            if (gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 4, targetId: playerShipId});
            }
        }
        // A
        else if(evt.keyCode == 65) {
            evt.preventDefault();
            if (gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + String.fromCharCode(evt.which);
                }
            } else if (gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 1, targetId: playerShipId});
            }
        }
        // D
        else if(evt.keyCode == 68) {
            evt.preventDefault();
            if (gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + String.fromCharCode(evt.which);
                }
            } else if (gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 3, targetId: playerShipId});
            }
        }
        // S
        else if(evt.keyCode == 83) {
            evt.preventDefault();
            if (gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + String.fromCharCode(evt.which);
                }
            } else if (gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 4, targetId: playerShipId});
            }
        }
        // W
        else if(evt.keyCode == 87) {
            evt.preventDefault();
            if (gameMode == 'START_MODE') {
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + String.fromCharCode(evt.which);
                }
            } else if (gameMode == 'PLAY_MODE') {
                client.commandHandler({command: 2, targetId: playerShipId});
            }
        }
        // User typing in name
        else if (evt.keyCode >= 65 && evt.keyCode <=90) {
            if (gameMode == 'START_MODE') {
                evt.preventDefault();
                if (client.playerName.length < 8) {
                    client.playerName = client.playerName + String.fromCharCode(evt.which);
                }  
            }
        }
        // + Zoom In
        else if(evt.keyCode==187) {
            evt.preventDefault();
            if (gameMode == 'PLAY_MODE') {
                if (miniMapZoomLevel < 0.0626) {
                    miniMapZoomLevel = miniMapZoomLevel * 2
                }
            }
        }
        // - Zoom Out
        else if(evt.keyCode==189) {
            evt.preventDefault();
            if (gameMode == 'PLAY_MODE') {
                if (miniMapZoomLevel > 0.015625) {
                    miniMapZoomLevel = miniMapZoomLevel / 2
                }
            }
        }
    }
}
