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
        this.LocationX = sourceObject.LocationX;
        this.LocationY = sourceObject.LocationY;
        this.Heading = Math.random() * 360;
        this.Velocity = 150 + Math.random() * 150;
        this.Fuel = 0.2 + Math.random() * 0.3;
        this.sparkLength = 0.5 + Math.random();
    }

    update(commands, framesPerSecond) {
        this.Fuel = this.Fuel - this.fuelConsumptionRate / framesPerSecond;
        Physics.moveObjectAlongVector(this);
    }
}
