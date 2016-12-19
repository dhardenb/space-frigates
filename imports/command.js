Command = function Command(command) {
  this.command = command.command;
  this.targetId = command.targetId;
  this.timeStamp = new Date();
}
