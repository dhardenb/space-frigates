import {Particle} from './particle.js';
import {Physics} from './physics.js';

export class LaserParticle extends Particle {

    constructor(id) {
        super(id);
        this.Type = 'LaserParticle';
        this.Size = 1.5;
        this.sparkLength = 0.75;
        this.fuelConsumptionRate = 1.2;
    }

    init(sourceObject) {
        const directionDeg = Math.random() * 360;
        const speed = 60 + Math.random() * 100;
        const lifetimeSeconds = 0.15 + Math.random() * 0.65;

        this.LocationX = sourceObject.LocationX + (Math.random() - 0.5) * 0.2;
        this.LocationY = sourceObject.LocationY + (Math.random() - 0.5) * 0.2;
        this.Heading = directionDeg;
        this.Velocity = speed;
        this.Fuel = lifetimeSeconds;
        this.sparkLength = 0.5 + Math.random();
        this.fuelConsumptionRate = 1 + Math.random() * 0.8;
    }

    update(commands, framesPerSecond) {
        this.Fuel = this.Fuel - this.fuelConsumptionRate / framesPerSecond;
        Physics.moveObjectAlongVector(this);
    }
}
