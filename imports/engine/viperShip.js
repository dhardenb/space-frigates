import {Ship} from './ship.js';
import {Physics} from './physics.js';

export class ViperShip extends Ship {

    constructor(id, {pilotType = 'Human', aiProfile = null, initializeState = true} = {}) {
        super(id, {pilotType, aiProfile, initializeState});
        
        this.shipTypeId = 'Viper';
        this.shipDisplayName = 'Viper';
        this.lengthInMeters = 8;
        this.widthInMeters = 4;
        this.maxHullStrength = 100;
        this.thrusterStrength = 100;
        this.maxThrusterStrength = 100;
        this.plasmaCannonStrength = 100;
        this.maxPlasmaCannonStrength = 100;
        this.maxCapacitor = 100;
        this.maxShieldStrength = 100;
        this.shieldRechargeRate = 0.25;
        this.shieldDecayRate = 0.25;
        this.reactorOutputPerSecond = 10;
        this.laserEnergyCost = 10;
        this.laserFuelCapacity = 30;
        this.laserFuelConsumptionRate = 30;
        this.thrusterEnergyPerSecond = 300;
        this.rotationEnergyPerSecond = 300;
        this.mass = 12000;
        this.thrusterForceProduced = 14400000;

        // Initialize runtime state if requested
        if (initializeState) {
            this.hullStrength = this.maxHullStrength;
            this.capacitor = this.maxCapacitor;
        }
    }
}

