import {Physics} from './physics.js';

export class Particle {

    constructor(id) {
        this.id = id;
    }

    update(commands, framesPerSecond) {
        this.fuel = this.fuel - this.fuelConsumptionRate / framesPerSecond;
        Physics.moveObjectAlongVector(this);
    }
}
