Engine = function Engine() {

}

Engine.prototype.update = function () {
  // Can't pre calculate the length of the array because some of the command create new objects
  for (var i = 0; i < gameObjects.length; i++) {
    gameObjects[i].update();
  }
  commands = [];
  this.collisionDetection();
}

Engine.prototype.collisionDetection = function () {
  var solidObjects = [];
  for (var x = 0, y = gameObjects.length; x < y; x++) {
    if (gameObjects[x].Type != 'Particle' && gameObjects[x].Type != 'Thruster') {
      solidObjects.push(gameObjects[x])
    }
  }

  // Run colision detection for each solidObject
  for (var i = 0, j = solidObjects.length; i < j; i++) {

    // Find this distance between this and every other object in the game and check to see if it
    // is smaller than the combined radius of the two objects.
    for (var k = 0, l = solidObjects.length; k < l; k++) {

      // Don't let objects colide with themselves!
      if (i != k) {

        if (Math.sqrt((solidObjects[i].LocationX - solidObjects[k].LocationX) * (solidObjects[i].LocationX - solidObjects[k].LocationX) + (solidObjects[i].LocationY - solidObjects[k].LocationY) * (solidObjects[i].LocationY - solidObjects[k].LocationY)) < (solidObjects[i].Size + solidObjects[k].Size)) {

          // This object has collided with something so we get to blow it up!!!
          this.createExplosion(solidObjects[k]);

          // I created this array of objects to remove because removing objects from
          // an array while you are still iterating over the same array is generaly
          // a bad thing!
          deadObjects.push(solidObjects[k]);

          // No use blowing this up twice!
          break;
        }
      }
    }
  }
  game.removeDeadObjects();
}

Engine.prototype.createExplosion = function (sourceGameObject) {
  for (var i = 0; i < explosionSize; i++) {
    var newParticle = new Particle(sourceGameObject);
    gameObjects.push(newParticle);
    var newParticleView = new ParticleView(newParticle);
    postOffice.subscribe("ParticleMoved" + newParticle.Id, newParticleView.update.bind(newParticleView));
    postOffice.subscribe('ParticleDestroyed' + newParticle.Id, newParticleView.destroy.bind(newParticleView));
  }
}
