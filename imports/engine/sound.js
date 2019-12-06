mySound = function mySound() {
    this.Type = "Sound";
}

mySound.prototype.init = function(soundType, sourceObject) {

    this.SoundType = soundType;

    this.LocationX = sourceObject.LocationX;
    
    this.LocationY = sourceObject.LocationY;

}

mySound.prototype.copy = function(jsonObject) {

    this.SoundType = jsonObject.SoundType;
    
    this.LocationX = jsonObject.LocationX;
    
    this.LocationY = jsonObject.LocationY;

}

mySound.prototype.update = function() {}