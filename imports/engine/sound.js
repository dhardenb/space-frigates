mySound = function mySound(soundType, sourceObject) {
    this.Type = "Sound";
    this.SoundType = soundType;
    this.LocationX = sourceObject.LocationX; 
    this.LocationY = sourceObject.LocationY;
}

mySound.prototype.update = function() {}