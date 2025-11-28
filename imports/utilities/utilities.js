export class Utilities {

    static removeByAttr(arr, attr, value) {
        let i = arr.length;
        while(i--) {
            if( arr[i]
                && arr[i].hasOwnProperty(attr)
                && (arguments.length > 2 && arr[i][attr] === value ) ) {
                    arr.splice(i,1);
                }
            }
        return arr;
    }

    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
    }

    static packGameState(unpackedGameState) {

        //////////////////////////////////////////////////////
        // Remove objects that we don't need to keep insync //
        //////////////////////////////////////////////////////

        unpackedGameState.gameState = Utilities.removeByAttr(unpackedGameState.gameState, "Type", "Particle");

        //////////
        // ROOT //
        //////////

        let packedGameState = [];

        /////////////////////
        // Update Metadata //
        /////////////////////

        packedGameState.push([]);

        packedGameState[0].push(unpackedGameState.updateId);
        packedGameState[0].push(Date.now());

        ///////////////
        // GameState //
        ///////////////

        packedGameState.push([]);

        for (let i = 0; i < unpackedGameState.gameState.length; i++) {

            packedGameState[1].push([]);

            if (unpackedGameState.gameState[i].Type == 'Player') {
                packedGameState[1][i].push(unpackedGameState.gameState[i].Id);
                packedGameState[1][i].push(unpackedGameState.gameState[i].Type);
                packedGameState[1][i].push(unpackedGameState.gameState[i].Name);
                packedGameState[1][i].push(unpackedGameState.gameState[i].ShipId);
                packedGameState[1][i].push(unpackedGameState.gameState[i].Kills);
                packedGameState[1][i].push(unpackedGameState.gameState[i].Deaths);
            }

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
                packedGameState[1][i].push(unpackedGameState.gameState[i].HullStrength);
                packedGameState[1][i].push(unpackedGameState.gameState[i].Capacitor);
            }

            if (unpackedGameState.gameState[i].Type == 'Debris') {

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
                packedGameState[1][i].push(unpackedGameState.gameState[i].Owner);

            }

            if (unpackedGameState.gameState[i].Type == 'Sound') {

                packedGameState[1][i].push(unpackedGameState.gameState[i].Type);
                packedGameState[1][i].push(unpackedGameState.gameState[i].SoundType);
                packedGameState[1][i].push(unpackedGameState.gameState[i].LocationX);
                packedGameState[1][i].push(unpackedGameState.gameState[i].LocationY);

            }

            if (unpackedGameState.gameState[i].Type == 'Thruster') {

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

        //////////////////
        // Event Stream //
        //////////////////

        packedGameState.push([]);

        if (unpackedGameState.events && unpackedGameState.events.length) {
            for (let i = 0; i < unpackedGameState.events.length; i++) {
                const event = unpackedGameState.events[i];
                const packedEvent = [];
                packedEvent.push(event.type);

                if (event.type == 'ShipDestroyed') {
                    packedEvent.push(event.shipId);
                    packedEvent.push(event.locationX);
                    packedEvent.push(event.locationY);
                }

                packedGameState[2].push(packedEvent);
            }
        }

        return packedGameState;

    }

    static unpackGameState(packedGameState) {

        //////////
        // ROOT //
        //////////

        let unpackedGameState = {};

        /////////////////////
        // Update Metadata //
        /////////////////////

        unpackedGameState.update = [];

        unpackedGameState.update.push({});

        unpackedGameState.update.id = packedGameState[0][0];

        unpackedGameState.update.createdAt = packedGameState[0][1];

        ///////////////
        // GameState //
        ///////////////

        unpackedGameState.gameState = [];

        for (let i = 0; i < packedGameState[1].length; i++) {

            unpackedGameState.gameState.push({});

            if (packedGameState[1][i][1] == 'Player') {
                unpackedGameState.gameState[i].Id = packedGameState[1][i][0];
                unpackedGameState.gameState[i].Type = packedGameState[1][i][1];
                unpackedGameState.gameState[i].Name = packedGameState[1][i][2];
                unpackedGameState.gameState[i].ShipId = packedGameState[1][i][3];
                unpackedGameState.gameState[i].Kills = packedGameState[1][i][4];
                unpackedGameState.gameState[i].Deaths = packedGameState[1][i][5];
            }

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
                unpackedGameState.gameState[i].HullStrength = packedGameState[1][i][12];
                unpackedGameState.gameState[i].Capacitor = packedGameState[1][i][13];
            }

            if (packedGameState[1][i][1] == 'Debris') {

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
                unpackedGameState.gameState[i].Owner = packedGameState[1][i][8];

            }

            if (packedGameState[1][i][0] == 'Sound') {

                unpackedGameState.gameState[i].Type = packedGameState[1][i][0];
                unpackedGameState.gameState[i].SoundType = packedGameState[1][i][1];
                unpackedGameState.gameState[i].LocationX = packedGameState[1][i][2];
                unpackedGameState.gameState[i].LocationY = packedGameState[1][i][3];

            }

            if (packedGameState[1][i][1] == 'Thruster') {

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

        //////////////////
        // Event Stream //
        //////////////////

        unpackedGameState.events = [];

        if (packedGameState[2]) {
            for (let i = 0; i < packedGameState[2].length; i++) {
                const packedEvent = packedGameState[2][i];
                const event = {};

                event.type = packedEvent[0];

                if (event.type == 'ShipDestroyed') {
                    event.shipId = packedEvent[1];
                    event.locationX = packedEvent[2];
                    event.locationY = packedEvent[3];
                }

                unpackedGameState.events.push(event);
            }
        }

        return unpackedGameState;

    }
}
