import {Engine} from '../engine/engine.js';
import {Laser} from './laser.js';
import {Physics} from './physics.js';
import {Sound} from './sound.js';
import {Thruster} from './thruster.js';
import {SHIP_TYPES} from './shipTypes.js';

export class Ship {

    constructor(id) {
        this.Id = id;
        this.Type = 'Ship';
        this.shipTypeId = null;
        this.pilotType = 'Unknown';
        this.aiProfile = null;
        this.Size = 0;
        this.MaxHullStrength = 0;
        this.ThrusterStrength = 0;
        this.MaxThrusterStrength = 0;
        this.PlasmaCannonStrength = 0;
        this.MaxPlasmaCannonStrength = 0;
        this.MaxCapacitor = 0;
        this.Mass = 12000; // kilograms
        this.ReactorOutputPerSecond = 10;
        this.ThrusterEnergyPerSecond = Physics.framesPerSecond * 5; // preserves 5J/frame
        this.LaserEnergyCost = 10;
        this.RotationEnergyPerSecond = Physics.framesPerSecond * 5; // matches old 5-per-frame default
        this.ThrusterForceProduced = this.Mass * 20 * Physics.framesPerSecond;
        this.MaxShieldStrength = 100;
        this.ShieldRechargeRate = 0.25;
        this.ShieldDecayRate = 0.25;
    }       

    init({shipTypeId, pilotType = 'Human', aiProfile = null} = {}) {
        const definition = SHIP_TYPES[shipTypeId];
        if (!definition) {
            throw new Error(`Unknown ship type: ${shipTypeId}`);
        }

        this.Type = 'Ship';
        this.shipTypeId = definition.id;
        this.shipDisplayName = definition.displayName;
        this.pilotType = pilotType;
        this.aiProfile = aiProfile;

        this.applyShipTypeDefaults();

        this.LocationX = 0;
        this.LocationY = 0;
        this.Facing = 0;
        this.Heading = 0;
        this.Velocity = 0;
        this.RotationDirection = "None";
        this.RotationVelocity = 0;
        this.ShieldOn = 0;
        this.ShieldStatus = 0;
        this.HullStrength = this.MaxHullStrength;
        this.Capacitor = this.MaxCapacitor;
    }

    applyShipTypeDefaults() {
        if (!this.shipTypeId) {
            return;
        }
        const definition = SHIP_TYPES[this.shipTypeId];
        if (!definition) {
            return;
        }
        this.Size = definition.size;
        this.shipDisplayName = this.shipDisplayName || definition.displayName;
        this.MaxHullStrength = definition.maxHullStrength;
        this.ThrusterStrength = definition.thrusterStrength;
        this.MaxThrusterStrength = definition.maxThrusterStrength;
        this.PlasmaCannonStrength = definition.plasmaCannonStrength;
        this.MaxPlasmaCannonStrength = definition.maxPlasmaCannonStrength;
        this.MaxCapacitor = definition.maxCapacitor;
        this.MaxShieldStrength = definition.maxShieldStrength ?? this.MaxShieldStrength;
        this.ShieldRechargeRate = definition.shieldRechargeRate ?? this.ShieldRechargeRate;
        this.ShieldDecayRate = definition.shieldDecayRate ?? this.ShieldDecayRate;
        this.ReactorOutputPerSecond = definition.reactorOutputPerSecond ?? this.ReactorOutputPerSecond;
        this.LaserEnergyCost = definition.laserEnergyCost ?? this.LaserEnergyCost;
        this.ThrusterEnergyPerSecond = definition.thrusterEnergyPerSecond ?? this.ThrusterEnergyPerSecond;
        this.RotationEnergyPerSecond = definition.rotationEnergyPerSecond ?? this.RotationEnergyPerSecond;
        this.Mass = definition.mass ?? this.Mass;
        const defaultThrusterForce = this.Mass * 20 * Physics.framesPerSecond;
        this.ThrusterForceProduced = definition.thrusterForceProduced ?? defaultThrusterForce;
    }

    determineCurrentCommand(commands) {
        this.currentCommand = null;
        for(let x = 0, y = commands.length; x < y; x++) {
            if (commands[x].targetId == this.Id) {
                this.currentCommand = commands[x].command;
                break;
            }
        }
    }

    updateRector(framesPerSecond) {
        ///////////////////////////////////////////////////////////////////////////
        // Reactor
        //
        // The Reactor is responsible for converting mass into energy, but for
        // now we assume infinite fuel so it simply tops off the capacitor at a
        // fixed joules-per-second rate.
        ///////////////////////////////////////////////////////////////////////////
        const reactorOutputPerSecond = this.ReactorOutputPerSecond || 10;
        const capacitorCapacity = this.MaxCapacitor || 100;
        if (this.Capacitor < capacitorCapacity) {
            const regenAmount = reactorOutputPerSecond / framesPerSecond;
            this.Capacitor = Math.min(capacitorCapacity, this.Capacitor + regenAmount);
        }
    }

    updateBrakes() {
        if (this.currentCommand == 4) {
            let activateBrakes;
            if (this.Capacitor >= 5) {
                this.Capacitor -= 5; // BAD! Should be with respect to time!!!
                activateBrakes = true;
            } else if (this.ShieldStatus >= 10) {
                this.ShieldStatus -= 10; // BAD! Should be with respect to time!!!
                activateBrakes = true;
            } else {
                activateBrakes = false;
            }
            if (activateBrakes) {
                if (this.Velocity > 0) {
                    this.Velocity = this.Velocity - 20; // BAD! Should be with respect to time!!!
                }
                if (this.RotationVelocity > 0) {
                    this.RotationVelocity--; // BAD! Should be with respect to time!!!
                    if (this.RotationVelocity == 0) {
                        this.RotationDirection = 'None';
                    }
                }
            }
        }
    }

    fireLaser() {
        if (this.currentCommand == 0) {
            let activateLaser;
            if (this.Capacitor >= this.LaserEnergyCost) {
                this.Capacitor -= this.LaserEnergyCost; // BAD! Should be with respect to time!!!
                activateLaser = true;
            } else if (this.ShieldStatus >= 20) {
                this.ShieldStatus -= 20; // BAD! Should be with respect to time!!!
                activateLaser = true;
            } else {
                activateLaser = false;
            }
            if (activateLaser) {
                const newLaser = new Laser(Engine.getNextGameObjectId());
                newLaser.init(this);
                gameObjects.push(newLaser);
                const newSound = new Sound();
                newSound.init("LaserFired", this);
                gameObjects.push(newSound);
            }
        }
    }

    updateThrusters() {
        if (this.currentCommand == 2) {
            this.applyForwardThrust();
        }
    }

    rotateLeft() {
        if (this.currentCommand == 3) {
            this.applyRotationThrust('Clockwise');
        }
    }

    rotateRight() {
        if (this.currentCommand == 1) {
            this.applyRotationThrust('CounterClockwise');
        }
    }

    updateShields() {
        if (this.currentCommand == 5) {
            if (this.ShieldOn == 0) {
                this.ShieldOn = 1; 
            } else {
                this.ShieldOn = 0;
            }
        }
        const rechargeRate = this.ShieldRechargeRate;
        const decayRate = this.ShieldDecayRate;
        const maxShield = this.MaxShieldStrength;
        if (this.ShieldOn == 1) {
            if (this.ShieldStatus < maxShield && this.Capacitor >= rechargeRate) {
                this.ShieldStatus = this.ShieldStatus + rechargeRate; // BAD! Should be with respect to time!!!
                this.Capacitor = this.Capacitor - rechargeRate; // BAD! Should be with respect to time!!!
            } else if (this.ShieldStatus >= maxShield && this.Capacitor >= rechargeRate / 2) {
                this.Capacitor = this.Capacitor - rechargeRate / 2; // BAD! Should be with respect to time!!!
            } else if (this.ShieldStatus >= rechargeRate && this.Capacitor < rechargeRate) {
                this.ShieldStatus -= rechargeRate; // BAD! Should be with respect to time!!!
            }
        }
        if (this.ShieldOn == 0) {
            if (this.ShieldStatus >= decayRate) {
                this.ShieldStatus = this.ShieldStatus - decayRate; // BAD! Should be with respect to time!!!
                if (this.Capacitor <= this.MaxCapacitor - decayRate / 2) {
                    this.Capacitor += decayRate / 2; // BAD! Should be with respect to time!!!
                }
            } else {
                this.ShieldStatus = 0;
            }
        }
        if (this.ShieldStatus > maxShield) {
            this.ShieldStatus = maxShield;
        } else if (this.ShieldStatus < 0)  {
            this.ShieldStatus = 0
        }
    }

    updateVelocity() {
        if (this.Velocity < 0) {
            this.Velocity = 0;
        }
    }

    updateFacing() {
        Physics.findNewFacing(this);
    }

    updateLocation() {
        Physics.moveObjectAlongVector(this);
    }

    update(commands, framesPerSecond) {
        this.determineCurrentCommand(commands);
        this.updateRector(framesPerSecond);
        this.updateBrakes();
        this.fireLaser();
        this.updateThrusters();
        this.rotateLeft();
        this.rotateRight();
        this.updateShields();
        this.updateVelocity();
        this.updateFacing();
        this.updateLocation(); 
    }

    setStartingHumanPosition(mapRadius) {
        const angle = Math.floor(Math.random() * 360);
        const distanceFromCenter = mapRadius / 2;
        if (angle == 0) {
            this.LocationX = 0;
            this.LocationY = distanceFromCenter * -1;
        }
        else if (angle == 90) {
            this.LocationX = distanceFromCenter;
            this.LocationY = 0;
        }
        else if (angle == 180) {
            this.LocationX = 0;
            this.LocationY = distanceFromCenter;
        }
        else if (angle == 270) {
            this.LocationX = distanceFromCenter * -1;
            this.LocationY = 0;
        }
        else if (angle < 90) {
            this.LocationX = distanceFromCenter * Math.sin(angle * 0.0174532925);
            this.LocationY = distanceFromCenter * Math.cos(angle * 0.0174532925) * -1;
        }
        else if (angle < 180) {
            this.LocationX = distanceFromCenter * Math.sin((180 - angle) * 0.0174532925);
            this.LocationY = distanceFromCenter * Math.cos((180 - angle) * 0.0174532925);
        }
        else if (angle < 270) {
            this.LocationX = distanceFromCenter * Math.sin((angle - 180) * 0.0174532925) * -1;
            this.LocationY = distanceFromCenter * Math.cos((angle - 180) * 0.0174532925);
        }
        else { // 360
            this.LocationX = distanceFromCenter * Math.sin((360 - angle) * 0.0174532925) * -1;
            this.LocationY = distanceFromCenter * Math.cos((360 - angle) * 0.0174532925) * -1;
        }
        // NOTE: I want to change this so that the starting facing of the ship is
        // oppostie the angle of it's starting postion relative to the center of the
        // map
        this.Facing = Math.random()*360+1;
    }

    // I'll have to modify this to take in the players starting position...
    setStartingAiPosition(mapRadius) {
        const angle = Math.floor(Math.random() * 360);
        const distanceFromCenter = Math.floor(Math.random() * mapRadius);
        if (angle == 0) {
            this.LocationX = 0;
            this.LocationY = distanceFromCenter * -1;
        }
        else if (angle == 90) {
            this.LocationX = distanceFromCenter;
            this.LocationY = 0;
        }
        else if (angle == 180) {
            this.LocationX = 0;
            this.LocationY = distanceFromCenter;
        }
        else if (angle == 270) {
            this.LocationX = distanceFromCenter * -1;
            this.LocationY = 0;
        }
        else if (angle < 90) {
            this.LocationX = distanceFromCenter * Math.sin(angle * 0.0174532925);
            this.LocationY = distanceFromCenter * Math.cos(angle * 0.0174532925) * -1;
        }
        else if (angle < 180) {
            this.LocationX = distanceFromCenter * Math.sin((180 - angle) * 0.0174532925);
            this.LocationY = distanceFromCenter * Math.cos((180 - angle) * 0.0174532925);
        }
        else if (angle < 270) {
            this.LocationX = distanceFromCenter * Math.sin((angle - 180) * 0.0174532925) * -1;
            this.LocationY = distanceFromCenter * Math.cos((angle - 180) * 0.0174532925);
        }
        else { // 360
            this.LocationX = distanceFromCenter * Math.sin((360 - angle) * 0.0174532925) * -1;
            this.LocationY = distanceFromCenter * Math.cos((360 - angle) * 0.0174532925) * -1;
        }
        // NOTE: I want to change this so that the starting facing of the ship is
        // oppostie the angle of it's starting postion relative to the center of the
        // map
        this.Facing = Math.random()*360+1;
    }

    takeDamage(damage) {
        if (this.ShieldStatus < damage) {
            this.ShieldStatus = 0;
            this.HullStrength -= damage - this.ShieldStatus;
            this.checkForComponentDamage();
        } else {
            this.ShieldStatus -= damage;
        }
    }

    applyForwardThrust() {
        const energyPerFrame = this.ThrusterEnergyPerSecond / Physics.framesPerSecond;
        let activateThruster = false;
        if (this.Capacitor >= energyPerFrame) {
            this.Capacitor -= energyPerFrame; // BAD! Should be with respect to time!!!
            activateThruster = true;
        } else if (this.ShieldStatus >= 10) {
            this.ShieldStatus -= 10; // BAD! Should be with respect to time!!!
            activateThruster = true;
        }

        if (!activateThruster) {
            return false;
        }

        const mass = this.Mass || 1;
        const thrustForce = this.ThrusterForceProduced || 0;
        const acceleration = thrustForce / mass;
        const velocityBoost = acceleration / Physics.framesPerSecond;
        Physics.findNewVelocity(this, this.Facing, velocityBoost);
        const newThruster = new Thruster(Engine.getNextGameObjectId());
        newThruster.init(this);
        gameObjects.push(newThruster);
        return true;
    }

    applyRotationThrust(direction) {
        const energyPerFrame = this.RotationEnergyPerSecond / Physics.framesPerSecond;
        let activate = false;
        if (this.Capacitor >= energyPerFrame) {
            this.Capacitor -= energyPerFrame; // BAD! Should be with respect to time!!!
            activate = true;
        } else if (this.ShieldStatus >= 10) {
            this.ShieldStatus -= 10; // BAD! Should be with respect to time!!!
            activate = true;
        }

        if (!activate) {
            return false;
        }

        if (this.RotationDirection == 'None') {
            this.RotationDirection = direction;
            this.RotationVelocity = 1;
            return true;
        }

        if (this.RotationDirection == direction) {
            if (this.RotationVelocity < 3) {
                this.RotationVelocity = this.RotationVelocity + 1; // BAD! Should be with respect to time!!!
            }
            return true;
        }

        this.RotationVelocity = this.RotationVelocity - 1; // BAD! Should be with respect to time!!!
        if (this.RotationVelocity <= 0) {
            this.RotationVelocity = 0;
            this.RotationDirection = 'None';
        }
        return true;
    }

    dampenRotation() {
        if (this.RotationVelocity <= 0 || this.RotationDirection == 'None') {
            this.RotationVelocity = 0;
            this.RotationDirection = 'None';
            return true;
        }
        const opposing = this.RotationDirection == 'Clockwise' ? 'CounterClockwise' : 'Clockwise';
        return this.applyRotationThrust(opposing);
    }

    checkForComponentDamage() {
        if (this.HullStrength / this.MaxHullStrength <= .33) {
            // Something is taking damage!!!
        }
        else if (this.HullStrength / this.MaxHullStrength <= .66) {
            // Something might take damage!!!
        }
    }
}