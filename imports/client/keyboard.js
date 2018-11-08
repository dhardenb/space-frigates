
Keyboard = function Keyboard() {

}

Keyboard.prototype.handleKeyPressEvents = function(evt) {

    // ENTER - Start
    if(evt.keyCode==13) {

        evt.preventDefault();

        client.requestShip();

    }

    // SPACE_BAR - Fire
    else if(evt.keyCode == 32) {

        evt.preventDefault();

        client.commandHandler({seqNum: seqNum, command: 0, targetId: playerShipId});

    }

    // LEFT_ARROW - Rotate CounterClockwise
    else if(evt.keyCode == 37 || evt.keyCode == 65) {

        evt.preventDefault();

        client.commandHandler({seqNum: seqNum, command: 1, targetId: playerShipId});
    }

    // UP_ARROW - Forward Thruster
    else if(evt.keyCode==38 || evt.keyCode == 87) {

        evt.preventDefault();

        client.commandHandler({seqNum: seqNum, command: 2, targetId: playerShipId});
    }

    // RIGHT_ARROW - Rotate Clockwise
    else if(evt.keyCode==39 || evt.keyCode == 68) {

        evt.preventDefault();

        client.commandHandler({seqNum: seqNum, command: 3, targetId: playerShipId});
    }

    // DOWN_ARROW - Stop
    else if(evt.keyCode==40 || evt.keyCode == 83) {

        evt.preventDefault();

        client.commandHandler({seqNum: seqNum, command: 4, targetId: playerShipId});
    }

    // ALT key - Toggle Shields
    else if(evt.keyCode==18) {

        evt.preventDefault();

        client.commandHandler({seqNum: seqNum, command: 5, targetId: playerShipId});
    }

    // + Zoom In
    else if(evt.keyCode==187) {

        evt.preventDefault();

        if (pixelsPerMeter < 20) {

            pixelsPerMeter++;

        }

    }

    // - Zoom Out
    else if(evt.keyCode==189) {

        evt.preventDefault();

        if (pixelsPerMeter > 1) {

            pixelsPerMeter--;

        }

    }

}
