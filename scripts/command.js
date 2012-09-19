// command.js

function Command(command)
{
	this.PlayerId = command.playerId;
	this.command = command.command;
	this.targetId = command.targetId;
	this.tick = command.tick;
}