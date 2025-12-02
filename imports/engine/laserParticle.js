import {Particle} from './particle.js';
import {Physics} from './physics.js';

export class LaserParticle extends Particle {

    constructor(id) {
        super(id);
        this.type = 'LaserParticle';
        this.size = 1.5;
        this.sparkLength = 0.75;
        this.fuelConsumptionRate = 1.2;
    }

    init(sourceObject) {
        const directionDeg = Math.random() * 360;
        const speed = 60 + Math.random() * 100;
        const lifetimeSeconds = 0.15 + Math.random() * 0.65;

        this.locationX = sourceObject.locationX + (Math.random() - 0.5) * 0.2;
        this.locationY = sourceObject.locationY + (Math.random() - 0.5) * 0.2;
        this.heading = directionDeg;
        this.velocity = speed;
        this.fuel = lifetimeSeconds;
        this.sparkLength = 0.5 + Math.random();
        this.fuelConsumptionRate = 1 + Math.random() * 0.8;
    }

    update(commands, framesPerSecond) {
        this.fuel = this.fuel - this.fuelConsumptionRate / framesPerSecond;
        Physics.moveObjectAlongVector(this);
    }
}
