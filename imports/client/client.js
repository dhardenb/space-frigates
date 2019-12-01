import '../engine/engine.js';
import './keyboard.js';
import './renderer.js';
import { unpackGameState } from '../utilities/utilities.js';

Client = function Client() {
    localMode = false;
    engine = new Engine();
    lastUpdateId = 0;
    keyboard = new Keyboard();
    renderer = new Renderer();
    gameObjects = [];
    deadObjects = [];
    commands = [];
    sentCommands = [];
    gameObjectId = 0;
    playerShipId = -1;
    seqNum = 0;
    mapRadius = Meteor.settings.public.mapRadius;
    playerId = 0;
    numberOfUpdates = 0;
    totalSizeOfUpdates = 0;
    smallestUpdate = 0;
    largestUpdate = 0;
    gameMode = 'START_MODE';
    playerName = "";
    lastTimeStamp = null;
    lastUpdateCreatedAt = null;
}

Client.prototype.init = function() {
    client.setupEventHandlers();
    client.setupStreamListeners();
    client.animationLoop();
    client.getPlayerId();
}

Client.prototype.setupEventHandlers = function() {
    document.documentElement.addEventListener("keydown", keyboard.handleKeyPressEvents, false);
}

Client.prototype.setupStreamListeners = function() {
    // There are lots of opportunites to add metrics here.
    // 1) How many time a second is this event being fired
    // 2) What is the latency between the time the event is sent from the 
    //    server and the time that it is recieved by the client
    // 3) What is the size of the update
    // 4) How many local commands have to be reissued
    outputStream.on('output', function(serverUpdate) {
        serverUpdate = unpackGameState(serverUpdate);

        // var downloadTime = Date.now() - serverUpdate.update.createdAt;
        
        //if (downloadTime <  50) {

            if (!localMode) {
                gameObjects = engine.convertObjects(gameObjects, serverUpdate.gameState);
            }  

            ////////////////////
            // update logging //
            ////////////////////

            
            // var processDelta = Date.now() - lastTimeStamp;
            // var updateSize = JSON.stringify(serverUpdate).length;
            // console.log(serverUpdate.update.id + " " + downloadTime + " " + processDelta + " " + updateSize);

            // var processDelta = Date.now() - lastTimeStamp;
            // if (processDelta > 500) {
            //    console.log(processDelta);
            //}

            // console.log(serverUpdate.update.createdAt - lastUpdateCreatedAt + " " + downloadTime);

            // lastUpdateCreatedAt = serverUpdate.update.createdAt;
            // lastTimeStamp = Date.now();

            // updateSize = JSON.stringify(serverUpdate).length;
            // numberOfUpdates++;
            // totalSizeOfUpdates = totalSizeOfUpdates + updateSize;
            // if (updateSize < smallestUpdate || smallestUpdate == 0) {
            //     smallestUpdate = updateSize;
            // }
            // if (updateSize > largestUpdate) {
            //    largestUpdate = updateSize;
            // }
            // console.log("Avergae Update Size: " + Math.round(totalSizeOfUpdates / numberOfUpdates) + " Smallest Update Size: " + smallestUpdate + " Largest Update Size: " + largestUpdate);

            // var updateDelta = serverUpdate.updateId - lastUpdateId;

            //if (updateDelta == 1) {
                // This is ideal state!
            //} else if (updateDelta == 0) { 
                // This means we got the sme update twice!
            //   console.log("DUPLICATE: lastUpdateId: " + lastUpdateId + " serverUpdate.updateId: " + serverUpdate.updateId);
            //} else if (updateDelta < 0) {
                // This means we got an old update!
            //    console.log("OLD UPDATE: lastUpdateId: " + lastUpdateId + " serverUpdate.updateId: " + serverUpdate.updateId);
            //} else if (updateDelta > 1) {
                // This means we missed an update!
            //    console.log("MISSED UPDATE: lastUpdateId: " + lastUpdateId + " serverUpdate.updateId: " + serverUpdate.updateId);
            //} 

            /////////////////////////////////////////////////////////////////
            // This next session is intended to reissue commands locally
            // that have not been processed on the server yet. This has
            // to be done because when the update is sent down the local
            // game state in overwritten. So any commands that were issued
            // locally are lost. I'm really not 1005 sure if this works as
            // intended.
            /////////////////////////////////////////////////////////////////

            // var lastCommandServerProcessed;

            // for (x = 0; x < serverUpdate.players.length; x++) {
            //     if (serverUpdate.players[x].id == client.playerId) {
            //        lastCommandServerProcessed = serverUpdate.players[x].lastSeqNum;
            //    }
            // }

            // for (x = 0; x < sentCommands.length; x++) {
            //    if (sentCommands[x].seqNum > lastCommandServerProcessed) {
            //        commands.push(sentCommands[x]);
            //    } else {
            //        // Purge the command since the server has already run it!
            //    }
            // }

            // Check to see if player's ship is destroyed. If it is, switch the game to 'END_MODE'
            var playerIsAlive = false;        

            for (x = 0; x < gameObjects.length; x++) {
                if (gameObjects[x].Id == playerShipId) {
                    playerIsAlive = true;
                }
            }

            if (playerIsAlive) {
                gameMode = 'PLAY_MODE';
            } else {
                gameMode = 'START_MODE';
            }
            lastUpdateId = serverUpdate.updateId;

        //}
    });
}

Client.prototype.animationLoop = function() {
    engine.update(60); // This needs to be updated to match current fps!!!
    renderer.renderMap();
    window.requestAnimationFrame(client.animationLoop);
}

Client.prototype.getPlayerId = function() {
    Meteor.call('getPlayerId', (err, res) => {
        if (err) {
            alert(err);
        } else {
            playerId = res;
        }
    });
}

Client.prototype.requestShip = function() {
    if (playerName == "") {
        playerName = "GUEST";
    }

    if (!localMode) {
        Meteor.call('createNewPlayerShip', (err, res) => {
            if (err) {
                alert(err);
            } else {
                gameMode = 'PLAY_MODE';
                playerShipId = res;
            }
        });
        Meteor.call('updatePlayerName', playerName, (err, res) => {
            if (err) {
                alert(err);
            }
        });
    } else {
        var playerShip = new Ship();
        playerShip.init('Human');
        playerShip.Name = playerName;
        playerShip.setStartingHumanPosition();
        gameObjects.push(playerShip);
        playerShipId = playerShip.Id;
    }
}

// NOTE: I should really insert the sequence number here at not
// in the KeyBoard Event handleKeyPressEvents
Client.prototype.commandHandler = function(input) {
    commands.push(input);
    sentCommands.push(input);
    inputStream.emit('input', input);
    seqNum++;
}