import {Particle} from './particle.js';

export class FireParticle extends Particle {

    constructor(id) {
        super(id);
        this.type = 'FireParticle';
        this.facing = 0;
        this.size = 2.0;
        this.fuelConsumptionRate = 1; // 1 per second!
    }

    init(sourceObject) {
        this.locationX = sourceObject.locationX;
        this.locationY = sourceObject.locationY;
        this.heading = Math.random() * 360;
        this.velocity = Math.random() * 100;
        this.fuel = Math.random() * 0.5;
    }
}
