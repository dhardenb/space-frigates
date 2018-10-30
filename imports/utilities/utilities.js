function removeByAttr(arr, attr, value) {

    var i = arr.length;

    while(i--) {

        if( arr[i]

            && arr[i].hasOwnProperty(attr)

            && (arguments.length > 2 && arr[i][attr] === value ) ) {

                arr.splice(i,1);

            }

        }

    return arr;

}

function packGameState(unpackedGameState) {

    //////////////////////////////////////////////////////
    // Remove objects that we don't need to keep insync //
    //////////////////////////////////////////////////////

    unpackedGameState.gameState = removeByAttr(unpackedGameState.gameState, "Type", "Particle");

    unpackedGameState.gameState = removeByAttr(unpackedGameState.gameState, "Type", "Thruster");

    //////////
    // ROOT //
    //////////

    var packedGameState = [];

    /////////////
    // Players //
    /////////////

    packedGameState.push([]);

    for (i = 0; i < unpackedGameState.players.length; i++) {

        packedGameState[0].push([]);

        packedGameState[0][i].push(unpackedGameState.players[i].id);

        packedGameState[0][i].push(unpackedGameState.players[i].lastSeqNum);

    }

    ///////////////
    // GameState //
    ///////////////

    packedGameState.push([]);

    for (i = 0; i < unpackedGameState.gameState.length; i++) {

        packedGameState[1].push([]);

        if (unpackedGameState.gameState[i].Type == 'Human' ||
            unpackedGameState.gameState[i].Type == 'Alpha' ||
            unpackedGameState.gameState[i].Type == 'Bravo') {

            packedGameState[1][i].push(unpackedGameState.gameState[i].Id);
            packedGameState[1][i].push(unpackedGameState.gameState[i].Type);
            packedGameState[1][i].push(unpackedGameState.gameState[i].Fuel);
            packedGameState[1][i].push(unpackedGameState.gameState[i].LocationX);
            packedGameState[1][i].push(unpackedGameState.gameState[i].LocationY);
            packedGameState[1][i].push(unpackedGameState.gameState[i].Facing);
            packedGameState[1][i].push(unpackedGameState.gameState[i].Heading);
            packedGameState[1][i].push(unpackedGameState.gameState[i].Velocity);
            packedGameState[1][i].push(unpackedGameState.gameState[i].RotationDirection);
            packedGameState[1][i].push(unpackedGameState.gameState[i].RotationVelocity);
            packedGameState[1][i].push(unpackedGameState.gameState[i].ShieldOn);
            packedGameState[1][i].push(unpackedGameState.gameState[i].ShieldStatus);

        }

        if (unpackedGameState.gameState[i].Type == 'Missile') {

            packedGameState[1][i].push(unpackedGameState.gameState[i].Id);
            packedGameState[1][i].push(unpackedGameState.gameState[i].Type);
            packedGameState[1][i].push(unpackedGameState.gameState[i].Fuel);
            packedGameState[1][i].push(unpackedGameState.gameState[i].LocationX);
            packedGameState[1][i].push(unpackedGameState.gameState[i].LocationY);
            packedGameState[1][i].push(unpackedGameState.gameState[i].Facing);
            packedGameState[1][i].push(unpackedGameState.gameState[i].Heading);
            packedGameState[1][i].push(unpackedGameState.gameState[i].Velocity);

        }

    }

    return packedGameState;

}

function unpackGameState(packedGameState) {

    //////////
    // ROOT //
    //////////

    var unpackedGameState = {};

    /////////////
    // Players //
    /////////////

    unpackedGameState.players = [];

    for (i = 0; i < packedGameState[0].length; i++) {

        unpackedGameState.players.push({});

        unpackedGameState.players[i].id = packedGameState[0][i][0];

        unpackedGameState.players[i].lastSeqNum = packedGameState[0][i][1];

    }

    ///////////////
    // GameState //
    ///////////////

    unpackedGameState.gameState = [];

    for (i = 0; i < packedGameState[1].length; i++) {

        unpackedGameState.gameState.push({});

        if (packedGameState[1][i][1] == 'Human' ||
            packedGameState[1][i][1] ==  'Alpha' ||
            packedGameState[1][i][1] ==  'Bravo') {

            unpackedGameState.gameState[i].Id = packedGameState[1][i][0];
            unpackedGameState.gameState[i].Type = packedGameState[1][i][1];
            unpackedGameState.gameState[i].Fuel = packedGameState[1][i][2];
            unpackedGameState.gameState[i].LocationX = packedGameState[1][i][3];
            unpackedGameState.gameState[i].LocationY = packedGameState[1][i][4];
            unpackedGameState.gameState[i].Facing = packedGameState[1][i][5];
            unpackedGameState.gameState[i].Heading = packedGameState[1][i][6];
            unpackedGameState.gameState[i].Velocity = packedGameState[1][i][7];
            unpackedGameState.gameState[i].RotationDirection = packedGameState[1][i][8];
            unpackedGameState.gameState[i].RotationVelocity = packedGameState[1][i][9];
            unpackedGameState.gameState[i].ShieldOn = packedGameState[1][i][10];
            unpackedGameState.gameState[i].ShieldStatus = packedGameState[1][i][11];

        }

        if (packedGameState[1][i][1] == 'Missile') {

            unpackedGameState.gameState[i].Id = packedGameState[1][i][0];
            unpackedGameState.gameState[i].Type = packedGameState[1][i][1];
            unpackedGameState.gameState[i].Fuel = packedGameState[1][i][2];
            unpackedGameState.gameState[i].LocationX = packedGameState[1][i][3];
            unpackedGameState.gameState[i].LocationY = packedGameState[1][i][4];
            unpackedGameState.gameState[i].Facing = packedGameState[1][i][5];
            unpackedGameState.gameState[i].Heading = packedGameState[1][i][6];
            unpackedGameState.gameState[i].Velocity = packedGameState[1][i][7];

        }

    }

    return unpackedGameState;

}

export { removeByAttr, packGameState, unpackGameState };
