import './engine/engine.js';
import './ai.js';
import './player.js';

Server = function Server() {

    engine = new Engine();

    ai = new Ai();

    gameObjects = [];

    deadObjects = [];

    commands = [];

    gameObjectId = 0;

    physicsLoopDuration = 15;

    messageLoopDuration = 45;

    // frame = 0;

    // commandBuffer = [];

    // executionOffset = 0;

    // players = [];

    // buffer = 60;

}

Server.prototype.init = function() {

    server.setupStreamerPermissions();

    server.setupStreamerListeners();

    server.startPhysicsLoop();

    server.startMessageLoop();

}

Server.prototype.setupStreamerPermissions = function() {

    inboundCommands.allowRead('all');

    inboundCommands.allowWrite('all');

    outboundState.allowRead('all');

    outboundState.allowWrite('all');

}

Server.prototype.setupStreamerListeners = function() {

    inboundCommands.on('inboundCommands', function(inboundCommand) {

        /*var execFrame = 0;

        for (var x = 0, y = players.length; x < y; x++) {

            if (this.connection.id == players[x].id) {

                execFrame = frame + Math.ceil((buffer - players[x].latency) / physicsLoopDuration);

            }

        }

        commandBuffer.push({command: inboundCommand, execFrame: execFrame});

        */

        commands.push(inboundCommand);

    });

}

Server.prototype.startPhysicsLoop = function() {

    setInterval(function() {

        ai.createNewShip();

        ai.issueCommands();

        // server.cycleCommandBuffer();

        engine.update();

        // frame++;

    }, physicsLoopDuration);

}

Server.prototype.cycleCommandBuffer = function() {

    for (var x = 0, y = commandBuffer.length-1; x < y; y--) {

        if (commandBuffer[y].execFrame == frame) {

            commands.push(commandBuffer[y].command);

            commandBuffer.splice(y, 1);

        }

        else if (commandBuffer[y].execFrame < frame) {

            commandBuffer.splice(y, 1);

        }

    }

}

Server.prototype.startMessageLoop = function() {

    setInterval(function() {

        outboundState.emit('outboundState', {gameState: gameObjects});

    }, messageLoopDuration);

}
