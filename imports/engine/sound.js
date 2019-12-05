mySound = function mySound() {
    this.Type = "Sound";
}

mySound.prototype.init = function(soundType, sourceObject) {

    this.Id = engine.getNextGameObjectId;
    this.SoundType = soundType;
    this.Fuel = 0.064;
    //this.LocationX = sourceObject.LocationX;
    //this.LocationY = sourceObject.LocationY;

}

mySound.prototype.copy = function(jsonObject) {

    this.Id = jsonObject.Id;
    this.SoundType = jsonObject.SoundType;
    this.Fuel = jsonObject.Fuel;
    //this.LocationX = jsonObject.LocationX;
    //this.LocationY = jsonObject.LocationY;

}

mySound.prototype.update = function() {

    this.Fuel = this.Fuel - 1 / 60; // This is a total hack!

}