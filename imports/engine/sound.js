export class Sound {

    constructor() {
        this.type = "Sound";
    }

    init = function(soundType, sourceObject) {
        this.soundType = soundType;
        this.locationX = sourceObject.locationX;
        this.locationY = sourceObject.locationY;
    }

    update(commnads, framesPerSecond) {}
}