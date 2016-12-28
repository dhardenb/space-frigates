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

        commands.push(inboundCommand);

    });

}

Server.prototype.startPhysicsLoop = function() {

    setInterval(function() {

        ai.createNewShip();

        ai.issueCommands();

        engine.update();

    }, physicsLoopDuration);

}

Server.prototype.startMessageLoop = function() {

    setInterval(function() {

        outboundState.emit('outboundState', {gameState: gameObjects});

    }, messageLoopDuration);

}
