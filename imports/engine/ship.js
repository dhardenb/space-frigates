import {Engine} from '../engine/engine.js';
import {Missile} from './missile.js';
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
        this.ThrusterEnergyCost = 5;
        this.MissileEnergyCost = 10;
        this.ThrusterForceProduced = this.Mass * 20 * Physics.framesPerSecond;
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
        this.ReactorOutputPerSecond = definition.reactorOutputPerSecond ?? this.ReactorOutputPerSecond;
        this.ThrusterEnergyCost = definition.thrusterEnergyCost ?? this.ThrusterEnergyCost;
        this.MissileEnergyCost = definition.missileEnergyCost ?? this.MissileEnergyCost;
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

    fireMissile() {
        if (this.currentCommand == 0) {
            let activateMissile;
            if (this.Capacitor >= this.MissileEnergyCost) {
                this.Capacitor -= this.MissileEnergyCost; // BAD! Should be with respect to time!!!
                activateMissile = true;
            } else if (this.ShieldStatus >= 20) {
                this.ShieldStatus -= 20; // BAD! Should be with respect to time!!!
                activateMissile = true;
            } else {
                activateMissile = false;
            }
            if (activateMissile) {
                const newMissile = new Missile(Engine.getNextGameObjectId());
                newMissile.init(this);
                gameObjects.push(newMissile);
                const newSound = new Sound();
                newSound.init("MissileFired", this);
                gameObjects.push(newSound);
            }
        }
    }

    updateThrusters() {
        if (this.currentCommand == 2) {
            let activateThruster;
            if (this.Capacitor >= this.ThrusterEnergyCost) {
                this.Capacitor -= this.ThrusterEnergyCost; // BAD! Should be with respect to time!!!
                activateThruster = true;
            } else if (this.ShieldStatus >= 10) {
                this.ShieldStatus -= 10; // BAD! Should be with respect to time!!!
                activateThruster = true;
            } else {
                activateThruster = false;
            }
            if (activateThruster) {
                const mass = this.Mass || 1;
                const thrustForce = this.ThrusterForceProduced || 0;
                const acceleration = thrustForce / mass;
                const velocityBoost = acceleration / Physics.framesPerSecond;
                Physics.findNewVelocity(this, this.Facing, velocityBoost);
                const newThruster = new Thruster(Engine.getNextGameObjectId());
                newThruster.init(this);
                gameObjects.push(newThruster);
            }
        }
    }

    rotateLeft() {
        if (this.currentCommand == 3) {
            let activateRotateLeft;
            if (this.Capacitor >= 5) {
                this.Capacitor -= 5; // BAD! Should be with respect to time!!!
                activateRotateLeft = true;
            } else if (this.ShieldStatus >= 10) {
                this.ShieldStatus -= 10; // BAD! Should be with respect to time!!!
                activateRotateLeft = true;
            } else {
                activateRotateLeft = false;
            }
            if (activateRotateLeft) {
                if (this.RotationDirection == 'None') {
                    this.RotationDirection = 'Clockwise';
                    this.RotationVelocity = this.RotationVelocity + 1; // BAD! Should be with respect to time!!!
                }
                else if (this.RotationDirection == 'Clockwise') {
                    if (this.RotationVelocity < 3) {
                        this.RotationVelocity = this.RotationVelocity + 1; // BAD! Should be with respect to time!!!
                    }
                }
                else if (this.RotationDirection == 'CounterClockwise') {
                    this.RotationVelocity = this.RotationVelocity - 1; // BAD! Should be with respect to time!!!
                    if (this.RotationVelocity == 0) {
                        this.RotationDirection = 'None';
                    }
                }
            }
        }
    }

    rotateRight() {
        if (this.currentCommand == 1) {
            let activateRotateRight;
            if (this.Capacitor >= 5) {
                this.Capacitor -= 5; // BAD! Should be with respect to time!!!
                activateRotateRight = true;
            } else if (this.ShieldStatus >= 10) {
                this.ShieldStatus -= 10; // BAD! Should be with respect to time!!!
                activateRotateRight = true;
            } else {
                activateRotateRight = false;
            }
            if (activateRotateRight) {
                if (this.RotationDirection == 'None') {
                    this.RotationDirection = 'CounterClockwise';
                    this.RotationVelocity = this.RotationVelocity + 1; // BAD! Should be with respect to time!!!
                }
                else if (this.RotationDirection == 'CounterClockwise') {
                    if (this.RotationVelocity < 3) {
                        this.RotationVelocity = this.RotationVelocity + 1; // BAD! Should be with respect to time!!!
                    }
                }
                else if (this.RotationDirection == 'Clockwise') {
                    this.RotationVelocity = this.RotationVelocity - 1; // BAD! Should be with respect to time!!!
                    if (this.RotationVelocity == 0) {
                        this.RotationDirection = 'None';
                    }
                }
            }
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
        if (this.ShieldOn == 1) {
            if (this.ShieldStatus <= 99.75 && this.Capacitor >= 0.25) {
                this.ShieldStatus = this.ShieldStatus + 0.25; // BAD! Should be with respect to time!!!
                this.Capacitor = this.Capacitor - 0.25; // BAD! Should be with respect to time!!!
            } else if (this.ShieldStatus == 100 && this.Capacitor >= 0.125) {
                this.Capacitor = this.Capacitor - 0.125; // BAD! Should be with respect to time!!!
            } else if (this.ShieldStatus >= 0.25 && this.Capacitor < 0.25) {
                this.ShieldStatus -= 0.25; // BAD! Should be with respect to time!!!
            }
        }
        if (this.ShieldOn == 0) {
            if (this.ShieldStatus >= 0.25) {
                this.ShieldStatus = this.ShieldStatus - 0.25; // BAD! Should be with respect to time!!!
                // As the shields disapate, energy is returned to the capacitor
                // at half the rate.
                if (this.Capacitor <= 99.88) {
                    this.Capacitor += 0.12; // BAD! Should be with respect to time!!!
                }
            } else {
                this.ShieldStatus = 0;
            }
        }
        if (this.ShieldStatus > 100) {
            this.ShieldStatus = 100;
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
        this.fireMissile();
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

    checkForComponentDamage() {
        if (this.HullStrength / this.MaxHullStrength <= .33) {
            // Something is taking damage!!!
        }
        else if (this.HullStrength / this.MaxHullStrength <= .66) {
            // Something might take damage!!!
        }
    }
}