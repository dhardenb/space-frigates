mySound = function mySound() {
    this.Type = "Sound";
}

mySound.prototype.init = function(soundType, sourceObject) {

    this.SoundType = soundType;

    this.LocationX = sourceObject.LocationX;
    
    this.LocationY = sourceObject.LocationY;

}

mySound.prototype.update = function() {}