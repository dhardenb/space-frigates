import {Physics} from './physics.js';

export class Particle {

    constructor() {
        this.Type = "Particle";
        this.Facing = 0;
        this.Size = 2.0;
        this.fuelConsumptionRate = 1; // 1 per second!
    }

    init(sourceObject) {
        this.Id = engine.getNextGameObjectId();
        this.LocationX = sourceObject.LocationX;
        this.LocationY = sourceObject.LocationY;
        this.Heading = Math.random() * 360;
        this.Velocity = Math.random() * 100;
        this.Fuel = Math.random() * 0.5;
    }

    update() {
        this.Fuel = this.Fuel - this.fuelConsumptionRate / framesPerSecond;
        Physics.moveObjectAlongVector(this);
    }
}