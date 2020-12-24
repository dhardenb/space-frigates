export class Sound {

    constructor() {
        this.Type = "Sound";
    }

    init = function(soundType, sourceObject) {
        this.SoundType = soundType;
        this.LocationX = sourceObject.LocationX;
        this.LocationY = sourceObject.LocationY;
    }

    update = function() {}
}