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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
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

    /////////////////////
    // Update Metadata //
    /////////////////////

    packedGameState.push([]);

    packedGameState[0].push(updateId);

    packedGameState[0].push(Date.now());

    /////////////
    // Players //
    /////////////

    packedGameState.push([]);

    for (i = 0; i < unpackedGameState.players.length; i++) {

        packedGameState[1].push([]);

        packedGameState[1][i].push(unpackedGameState.players[i].id);

        packedGameState[1][i].push(unpackedGameState.players[i].lastSeqNum);

    }

    ///////////////
    // GameState //
    ///////////////

    packedGameState.push([]);

    for (i = 0; i < unpackedGameState.gameState.length; i++) {

        packedGameState[2].push([]);

        if (unpackedGameState.gameState[i].Type == 'Human' ||
            unpackedGameState.gameState[i].Type == 'Alpha' ||
            unpackedGameState.gameState[i].Type == 'Bravo') {

            packedGameState[2][i].push(unpackedGameState.gameState[i].Id);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Type);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Fuel);
            packedGameState[2][i].push(unpackedGameState.gameState[i].LocationX);
            packedGameState[2][i].push(unpackedGameState.gameState[i].LocationY);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Facing);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Heading);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Velocity);
            packedGameState[2][i].push(unpackedGameState.gameState[i].RotationDirection);
            packedGameState[2][i].push(unpackedGameState.gameState[i].RotationVelocity);
            packedGameState[2][i].push(unpackedGameState.gameState[i].ShieldOn);
            packedGameState[2][i].push(unpackedGameState.gameState[i].ShieldStatus);
            packedGameState[2][i].push(unpackedGameState.gameState[i].HullStrength);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Capacitor);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Name);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Kills);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Deaths);

        }

        if (unpackedGameState.gameState[i].Type == 'Debris') {

            packedGameState[2][i].push(unpackedGameState.gameState[i].Id);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Type);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Fuel);
            packedGameState[2][i].push(unpackedGameState.gameState[i].LocationX);
            packedGameState[2][i].push(unpackedGameState.gameState[i].LocationY);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Facing);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Heading);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Velocity);
            packedGameState[2][i].push(unpackedGameState.gameState[i].RotationDirection);
            packedGameState[2][i].push(unpackedGameState.gameState[i].RotationVelocity);

        }

        if (unpackedGameState.gameState[i].Type == 'Missile') {

            packedGameState[2][i].push(unpackedGameState.gameState[i].Id);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Type);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Fuel);
            packedGameState[2][i].push(unpackedGameState.gameState[i].LocationX);
            packedGameState[2][i].push(unpackedGameState.gameState[i].LocationY);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Facing);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Heading);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Velocity);
            packedGameState[2][i].push(unpackedGameState.gameState[i].Owner);

        }

    }

    return packedGameState;

}

function unpackGameState(packedGameState) {

    //////////
    // ROOT //
    //////////

    var unpackedGameState = {};

    /////////////////////
    // Update Metadata //
    /////////////////////

    unpackedGameState.update = [];

    unpackedGameState.update.push({});

    unpackedGameState.update.id = packedGameState[0][0];

    unpackedGameState.update.createdAt = packedGameState[0][1];

    /////////////
    // Players //
    /////////////

    unpackedGameState.players = [];

    for (i = 0; i < packedGameState[1].length; i++) {

        unpackedGameState.players.push({});

        unpackedGameState.players[i].id = packedGameState[1][i][0];

        unpackedGameState.players[i].lastSeqNum = packedGameState[1][i][1];

    }

    ///////////////
    // GameState //
    ///////////////

    unpackedGameState.gameState = [];

    for (i = 0; i < packedGameState[2].length; i++) {

        unpackedGameState.gameState.push({});

        if (packedGameState[2][i][1] == 'Human' ||
            packedGameState[2][i][1] ==  'Alpha' ||
            packedGameState[2][i][1] ==  'Bravo') {

            unpackedGameState.gameState[i].Id = packedGameState[2][i][0];
            unpackedGameState.gameState[i].Type = packedGameState[2][i][1];
            unpackedGameState.gameState[i].Fuel = packedGameState[2][i][2];
            unpackedGameState.gameState[i].LocationX = packedGameState[2][i][3];
            unpackedGameState.gameState[i].LocationY = packedGameState[2][i][4];
            unpackedGameState.gameState[i].Facing = packedGameState[2][i][5];
            unpackedGameState.gameState[i].Heading = packedGameState[2][i][6];
            unpackedGameState.gameState[i].Velocity = packedGameState[2][i][7];
            unpackedGameState.gameState[i].RotationDirection = packedGameState[2][i][8];
            unpackedGameState.gameState[i].RotationVelocity = packedGameState[2][i][9];
            unpackedGameState.gameState[i].ShieldOn = packedGameState[2][i][10];
            unpackedGameState.gameState[i].ShieldStatus = packedGameState[2][i][11];
            unpackedGameState.gameState[i].HullStrength = packedGameState[2][i][12];
            unpackedGameState.gameState[i].Capacitor = packedGameState[2][i][13];
            unpackedGameState.gameState[i].Name = packedGameState[2][i][14];
            unpackedGameState.gameState[i].Kills = packedGameState[2][i][15];
            unpackedGameState.gameState[i].Deaths = packedGameState[2][i][16];

        }

        if (packedGameState[2][i][1] == 'Debris') {

            unpackedGameState.gameState[i].Id = packedGameState[2][i][0];
            unpackedGameState.gameState[i].Type = packedGameState[2][i][1];
            unpackedGameState.gameState[i].Fuel = packedGameState[2][i][2];
            unpackedGameState.gameState[i].LocationX = packedGameState[2][i][3];
            unpackedGameState.gameState[i].LocationY = packedGameState[2][i][4];
            unpackedGameState.gameState[i].Facing = packedGameState[2][i][5];
            unpackedGameState.gameState[i].Heading = packedGameState[2][i][6];
            unpackedGameState.gameState[i].Velocity = packedGameState[2][i][7];
            unpackedGameState.gameState[i].RotationDirection = packedGameState[2][i][8];
            unpackedGameState.gameState[i].RotationVelocity = packedGameState[2][i][9];

        }

        if (packedGameState[2][i][1] == 'Missile') {

            unpackedGameState.gameState[i].Id = packedGameState[2][i][0];
            unpackedGameState.gameState[i].Type = packedGameState[2][i][1];
            unpackedGameState.gameState[i].Fuel = packedGameState[2][i][2];
            unpackedGameState.gameState[i].LocationX = packedGameState[2][i][3];
            unpackedGameState.gameState[i].LocationY = packedGameState[2][i][4];
            unpackedGameState.gameState[i].Facing = packedGameState[2][i][5];
            unpackedGameState.gameState[i].Heading = packedGameState[2][i][6];
            unpackedGameState.gameState[i].Velocity = packedGameState[2][i][7];
            unpackedGameState.gameState[i].Owner = packedGameState[2][i][8];

        }

    }

    return unpackedGameState;

}

export { removeByAttr, getRandomInt, packGameState, unpackGameState };
