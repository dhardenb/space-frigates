export class Explosion {

    constructor() {
        this.type = "Explosion";
    }

    init(sourceObject, options = {}) {
        const source = sourceObject || {};
        this.locationX = source.locationX;
        this.locationY = source.locationY;
        this.size = options.size || source.size || source.lengthInMeters || null;
        this.explosionType = options.explosionType || 'Standard';
        this.fuel = options.fuel;
        this.maxFuel = options.maxFuel;
    }

    update(commands, framesPerSecond) {}
}
