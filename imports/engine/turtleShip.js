import {Ship} from './ship.js';
import {SHIP_TYPES} from './shipTypes.js';
import {Physics} from './physics.js';

export class TurtleShip extends Ship {

    constructor(id, {pilotType = 'Human', aiProfile = null, initializeState = true} = {}) {
        super(id, {pilotType, aiProfile, initializeState});
        
        const definition = SHIP_TYPES.Turtle;
        this.shipTypeId = definition.id;
        this.shipDisplayName = definition.displayName;
        this.size = definition.size;
        this.maxHullStrength = definition.maxHullStrength;
        this.thrusterStrength = definition.thrusterStrength;
        this.maxThrusterStrength = definition.maxThrusterStrength;
        this.plasmaCannonStrength = definition.plasmaCannonStrength;
        this.maxPlasmaCannonStrength = definition.maxPlasmaCannonStrength;
        this.maxCapacitor = definition.maxCapacitor;
        this.maxShieldStrength = definition.maxShieldStrength ?? this.maxShieldStrength;
        this.shieldRechargeRate = definition.shieldRechargeRate ?? this.shieldRechargeRate;
        this.shieldDecayRate = definition.shieldDecayRate ?? this.shieldDecayRate;
        this.reactorOutputPerSecond = definition.reactorOutputPerSecond ?? this.reactorOutputPerSecond;
        this.laserEnergyCost = definition.laserEnergyCost ?? this.laserEnergyCost;
        this.laserFuelCapacity = definition.laserFuelCapacity ?? this.laserFuelCapacity;
        this.laserFuelConsumptionRate = definition.laserFuelConsumptionRate ?? this.laserFuelConsumptionRate;
        this.thrusterEnergyPerSecond = definition.thrusterEnergyPerSecond ?? this.thrusterEnergyPerSecond;
        this.rotationEnergyPerSecond = definition.rotationEnergyPerSecond ?? this.rotationEnergyPerSecond;
        this.mass = definition.mass ?? this.mass;
        const defaultThrusterForce = this.mass * 20 * Physics.framesPerSecond;
        this.thrusterForceProduced = definition.thrusterForceProduced ?? defaultThrusterForce;

        // Initialize runtime state if requested
        if (initializeState) {
            this.hullStrength = this.maxHullStrength;
            this.capacitor = this.maxCapacitor;
        }
    }
}

