import {Engine} from '../engine/engine.js';
import {Laser} from './laser.js';
import {Physics} from './physics.js';
import {Sound} from './sound.js';
import {Thruster} from './thruster.js';

const AUTO_PILOT_ANGLE_TOLERANCE_DEGREES = 3;
const AUTO_PILOT_VELOCITY_THRESHOLD = 0.5;
const AUTO_PILOT_ROTATION_THRESHOLD = 0.01;

export class Ship {

    constructor(id, {pilotType = 'Human', aiProfile = null, initializeState = true} = {}) {
        this.id = id;
        this.type = 'Ship';
        this.shipTypeId = null;
        this.shipDisplayName = null;
        this.pilotType = pilotType;
        this.aiProfile = aiProfile;
        this.maxHullStrength = 0;
        this.thrusterStrength = 0;
        this.maxThrusterStrength = 0;
        this.plasmaCannonStrength = 0;
        this.maxPlasmaCannonStrength = 0;
        this.maxCapacitor = 0;
        this.mass = 12000; // kilograms
        this.reactorOutputPerSecond = 10;
        this.thrusterEnergyPerSecond = Physics.framesPerSecond * 5; // preserves 5J/frame
        this.laserEnergyCost = 10;
        this.laserFuelCapacity = 30;
        this.laserFuelConsumptionRate = 30;
        this.rotationEnergyPerSecond = Physics.framesPerSecond * 5; // matches old 5-per-frame default
        this.thrusterForceProduced = this.mass * 20 * Physics.framesPerSecond;
        this.maxShieldStrength = 100;
        this.shieldRechargeRate = 0.25;
        this.shieldDecayRate = 0.25;
        this.autoPilotEngaged = false;
        this.autoPilotFacingLocked = false;
        this.lengthInMeters = 8;
        this.widthInMeters = 4;

        // Initialize runtime state if requested (default true, false for deserialization)
        if (initializeState) {
            this.locationX = 0;
            this.locationY = 0;
            this.facing = 0;
            this.heading = 0;
            this.velocity = 0;
            this.rotationDirection = "None";
            this.rotationVelocity = 0;
            this.shieldOn = 0;
            this.shieldStatus = 0;
            this.hullStrength = this.maxHullStrength;
            this.capacitor = this.maxCapacitor;
            this.autoPilotEngaged = false;
            this.autoPilotFacingLocked = false;
        }
    }

    determineCurrentCommand(commands) {
        this.currentCommand = null;
        const cancelAutoPilotCommands = new Set([
            1,
            2,
            3,
            '1',
            '2',
            '3',
            'RETRO_THRUST',
            'LATERAL_THRUST_LEFT',
            'LATERAL_THRUST_RIGHT'
        ]);
        let autoPilotRequested = false;
        let autoPilotCancelled = false;
        for(let x = 0, y = commands.length; x < y; x++) {
            if (commands[x].targetId == this.id) {
                const candidateCommand = commands[x].command;
                if (candidateCommand === 'BRAKE_DOWN' || candidateCommand === 4 || candidateCommand === '4') {
                    autoPilotRequested = true;
                    continue;
                }
                if (cancelAutoPilotCommands.has(candidateCommand)) {
                    this.disableAutoPilot();
                    autoPilotCancelled = true;
                }
                if (this.currentCommand === null) {
                    this.currentCommand = candidateCommand;
                }
            }
        }

        if (autoPilotRequested && !autoPilotCancelled) {
            this.enableAutoPilot();
        }
    }

    enableAutoPilot() {
        if (!this.autoPilotEngaged) {
            this.autoPilotEngaged = true;
            this.autoPilotFacingLocked = false;
        }
    }

    disableAutoPilot() {
        if (this.autoPilotEngaged) {
            this.autoPilotEngaged = false;
            this.autoPilotFacingLocked = false;
        }
    }

    isAutoPilotActive() {
        return this.autoPilotEngaged === true;
    }

    updateAutoPilot() {
        if (!this.isAutoPilotActive()) {
            return;
        }

        const facing = Ship.normalizeAngle(Number.isFinite(this.facing) ? this.facing : 0);
        const heading = Ship.normalizeAngle(Number.isFinite(this.heading) ? this.heading : 0);
        const targetFacing = Ship.normalizeAngle(heading + 180);
        const angleDelta = Ship.normalizeSignedAngle(targetFacing - facing);
        const absAngleDelta = Math.abs(angleDelta);
        const velocityMagnitude = Math.abs(Number(this.velocity) || 0);
        const rotationMagnitude = Math.abs(Number(this.rotationVelocity) || 0);
        const rotationSpeedLevel = Math.abs(Number(this.rotationVelocity) || 0);

        if (velocityMagnitude <= AUTO_PILOT_VELOCITY_THRESHOLD && rotationMagnitude <= AUTO_PILOT_ROTATION_THRESHOLD) {
            this.disableAutoPilot();
            return;
        }

        if (rotationSpeedLevel > 1) {
            this.dampenRotation();
            return;
        }

        if (velocityMagnitude > AUTO_PILOT_VELOCITY_THRESHOLD && !this.autoPilotFacingLocked && absAngleDelta > AUTO_PILOT_ANGLE_TOLERANCE_DEGREES) {
            const desiredDirection = angleDelta > 0 ? 'CounterClockwise' : 'Clockwise';
            const rotationDirection = this.rotationDirection || 'None';
            const rotationVelocity = Number(this.rotationVelocity) || 0;
            const needsKickstart = rotationDirection === 'None' || rotationVelocity <= AUTO_PILOT_ROTATION_THRESHOLD;
            const rotatingSameWay = rotationDirection === desiredDirection;
            if (needsKickstart || rotatingSameWay) {
                this.applyRotationThrust(desiredDirection);
            }
            return;
        }

        if (!this.autoPilotFacingLocked && rotationMagnitude > AUTO_PILOT_ROTATION_THRESHOLD && this.rotationDirection !== 'None') {
            this.dampenRotation();
            return;
        }

        if (this.autoPilotFacingLocked && rotationMagnitude > AUTO_PILOT_ROTATION_THRESHOLD && this.rotationDirection !== 'None') {
            this.dampenRotation();
            return;
        }

        if (velocityMagnitude > AUTO_PILOT_VELOCITY_THRESHOLD) {
            const previousVelocity = velocityMagnitude;
            const fired = this.applyForwardThrust();
            if (fired) {
                if (!this.autoPilotFacingLocked) {
                    this.autoPilotFacingLocked = true;
                }
                const newVelocityMagnitude = Math.abs(Number(this.velocity) || 0);
                if (newVelocityMagnitude >= previousVelocity) {
                    this.velocity = 0;
                    this.heading = this.facing;
                }
            }
            return;
        }

        if (rotationMagnitude <= AUTO_PILOT_ROTATION_THRESHOLD && velocityMagnitude <= AUTO_PILOT_VELOCITY_THRESHOLD) {
            this.disableAutoPilot();
        }
    }

    static normalizeAngle(angle) {
        if (!Number.isFinite(angle)) {
            return 0;
        }
        let normalized = angle % 360;
        if (normalized < 0) {
            normalized += 360;
        }
        return normalized;
    }

    static normalizeSignedAngle(angle) {
        if (!Number.isFinite(angle)) {
            return 0;
        }
        let normalized = angle % 360;
        if (normalized > 180) {
            normalized -= 360;
        } else if (normalized < -180) {
            normalized += 360;
        }
        return normalized;
    }

    updateRector(framesPerSecond) {
        ///////////////////////////////////////////////////////////////////////////
        // Reactor
        //
        // The Reactor is responsible for converting mass into energy, but for
        // now we assume infinite fuel so it simply tops off the capacitor at a
        // fixed joules-per-second rate.
        ///////////////////////////////////////////////////////////////////////////
        const reactorOutputPerSecond = this.reactorOutputPerSecond || 10;
        const capacitorCapacity = this.maxCapacitor || 100;
        if (this.capacitor < capacitorCapacity) {
            const regenAmount = reactorOutputPerSecond / framesPerSecond;
            this.capacitor = Math.min(capacitorCapacity, this.capacitor + regenAmount);
        }
    }

    fireLaser() {
        if (this.currentCommand == 0) {
            let activateLaser;
            if (this.capacitor >= this.laserEnergyCost) {
                this.capacitor -= this.laserEnergyCost; // BAD! Should be with respect to time!!!
                activateLaser = true;
            } else if (this.shieldStatus >= 20) {
                this.shieldStatus -= 20; // BAD! Should be with respect to time!!!
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

    updateRetroThrusters() {
        if (this.currentCommand === 'RETRO_THRUST') {
            this.applyRetrogradeThrust();
        }
    }

    updateLateralThrusters() {
        if (this.currentCommand === 'LATERAL_THRUST_LEFT') {
            this.applyLateralThrust('Left');
        } else if (this.currentCommand === 'LATERAL_THRUST_RIGHT') {
            this.applyLateralThrust('Right');
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
            if (this.shieldOn == 0) {
                this.shieldOn = 1; 
            } else {
                this.shieldOn = 0;
            }
        }
        const rechargeRate = this.shieldRechargeRate;
        const decayRate = this.shieldDecayRate;
        const maxShield = this.maxShieldStrength;
        if (this.shieldOn == 1) {
            if (this.shieldStatus < maxShield && this.capacitor >= rechargeRate) {
                this.shieldStatus = this.shieldStatus + rechargeRate; // BAD! Should be with respect to time!!!
                this.capacitor = this.capacitor - rechargeRate; // BAD! Should be with respect to time!!!
            } else if (this.shieldStatus >= maxShield && this.capacitor >= rechargeRate / 2) {
                this.capacitor = this.capacitor - rechargeRate / 2; // BAD! Should be with respect to time!!!
            } else if (this.shieldStatus >= rechargeRate && this.capacitor < rechargeRate) {
                this.shieldStatus -= rechargeRate; // BAD! Should be with respect to time!!!
            }
        }
        if (this.shieldOn == 0) {
            if (this.shieldStatus >= decayRate) {
                this.shieldStatus = this.shieldStatus - decayRate; // BAD! Should be with respect to time!!!
                if (this.capacitor <= this.maxCapacitor - decayRate / 2) {
                    this.capacitor += decayRate / 2; // BAD! Should be with respect to time!!!
                }
            } else {
                this.shieldStatus = 0;
            }
        }
        if (this.shieldStatus > maxShield) {
            this.shieldStatus = maxShield;
        } else if (this.shieldStatus < 0)  {
            this.shieldStatus = 0
        }
    }

    updateVelocity() {
        if (this.velocity < 0) {
            this.velocity = 0;
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
        this.fireLaser();
        this.updateThrusters();
        this.updateRetroThrusters();
        this.updateLateralThrusters();
        this.rotateLeft();
        this.rotateRight();
        this.updateAutoPilot();
        this.updateShields();
        this.updateVelocity();
        this.updateFacing();
        this.updateLocation(); 
    }

    setStartingHumanPosition(mapRadius) {
        const angle = Math.floor(Math.random() * 360);
        const distanceFromCenter = mapRadius / 2;
        if (angle == 0) {
            this.locationX = 0;
            this.locationY = distanceFromCenter * -1;
        }
        else if (angle == 90) {
            this.locationX = distanceFromCenter;
            this.locationY = 0;
        }
        else if (angle == 180) {
            this.locationX = 0;
            this.locationY = distanceFromCenter;
        }
        else if (angle == 270) {
            this.locationX = distanceFromCenter * -1;
            this.locationY = 0;
        }
        else if (angle < 90) {
            this.locationX = distanceFromCenter * Math.sin(angle * 0.0174532925);
            this.locationY = distanceFromCenter * Math.cos(angle * 0.0174532925) * -1;
        }
        else if (angle < 180) {
            this.locationX = distanceFromCenter * Math.sin((180 - angle) * 0.0174532925);
            this.locationY = distanceFromCenter * Math.cos((180 - angle) * 0.0174532925);
        }
        else if (angle < 270) {
            this.locationX = distanceFromCenter * Math.sin((angle - 180) * 0.0174532925) * -1;
            this.locationY = distanceFromCenter * Math.cos((angle - 180) * 0.0174532925);
        }
        else { // 360
            this.locationX = distanceFromCenter * Math.sin((360 - angle) * 0.0174532925) * -1;
            this.locationY = distanceFromCenter * Math.cos((360 - angle) * 0.0174532925) * -1;
        }
        // NOTE: I want to change this so that the starting facing of the ship is
        // oppostie the angle of it's starting postion relative to the center of the
        // map
        this.facing = Math.random()*360+1;
    }

    // I'll have to modify this to take in the players starting position...
    setStartingAiPosition(mapRadius) {
        const angle = Math.floor(Math.random() * 360);
        const distanceFromCenter = Math.floor(Math.random() * mapRadius);
        if (angle == 0) {
            this.locationX = 0;
            this.locationY = distanceFromCenter * -1;
        }
        else if (angle == 90) {
            this.locationX = distanceFromCenter;
            this.locationY = 0;
        }
        else if (angle == 180) {
            this.locationX = 0;
            this.locationY = distanceFromCenter;
        }
        else if (angle == 270) {
            this.locationX = distanceFromCenter * -1;
            this.locationY = 0;
        }
        else if (angle < 90) {
            this.locationX = distanceFromCenter * Math.sin(angle * 0.0174532925);
            this.locationY = distanceFromCenter * Math.cos(angle * 0.0174532925) * -1;
        }
        else if (angle < 180) {
            this.locationX = distanceFromCenter * Math.sin((180 - angle) * 0.0174532925);
            this.locationY = distanceFromCenter * Math.cos((180 - angle) * 0.0174532925);
        }
        else if (angle < 270) {
            this.locationX = distanceFromCenter * Math.sin((angle - 180) * 0.0174532925) * -1;
            this.locationY = distanceFromCenter * Math.cos((angle - 180) * 0.0174532925);
        }
        else { // 360
            this.locationX = distanceFromCenter * Math.sin((360 - angle) * 0.0174532925) * -1;
            this.locationY = distanceFromCenter * Math.cos((360 - angle) * 0.0174532925) * -1;
        }
        // NOTE: I want to change this so that the starting facing of the ship is
        // oppostie the angle of it's starting postion relative to the center of the
        // map
        this.facing = Math.random()*360+1;
    }

    takeDamage(damage) {
        if (damage <= 0) {
            return;
        }

        const shieldAbsorbed = Math.min(this.shieldStatus, damage);
        this.shieldStatus -= shieldAbsorbed;

        const remainingDamage = damage - shieldAbsorbed;
        if (remainingDamage <= 0) {
            return;
        }

        const hullDamage = Math.min(remainingDamage, this.hullStrength);
        if (hullDamage <= 0) {
            return;
        }

        this.hullStrength -= hullDamage;
        this.checkForComponentDamage();
    }

    applyForwardThrust() {
        const energyPerFrame = this.thrusterEnergyPerSecond / Physics.framesPerSecond;
        let activateThruster = false;
        if (this.capacitor >= energyPerFrame) {
            this.capacitor -= energyPerFrame; // BAD! Should be with respect to time!!!
            activateThruster = true;
        } else if (this.shieldStatus >= 10) {
            this.shieldStatus -= 10; // BAD! Should be with respect to time!!!
            activateThruster = true;
        }

        if (!activateThruster) {
            return false;
        }

        const mass = this.mass || 1;
        const thrustForce = this.thrusterForceProduced || 0;
        const acceleration = thrustForce / mass;
        const velocityBoost = acceleration / Physics.framesPerSecond;
        Physics.findNewVelocity(this, this.facing, velocityBoost);
        const newThruster = new Thruster(Engine.getNextGameObjectId());
        const facing = (this.facing + 180) % 360;
        newThruster.init(this, {facing});
        gameObjects.push(newThruster);
        return true;
    }

    applyRetrogradeThrust() {
        const energyPerFrame = this.thrusterEnergyPerSecond / 2 / Physics.framesPerSecond;
        let activateThruster = false;
        if (this.capacitor >= energyPerFrame) {
            this.capacitor -= energyPerFrame; // BAD! Should be with respect to time!!!
            activateThruster = true;
        } else if (this.shieldStatus >= 10) {
            this.shieldStatus -= 10; // BAD! Should be with respect to time!!!
            activateThruster = true;
        }

        if (!activateThruster) {
            return false;
        }

        const mass = this.mass || 1;
        const thrustForce = (this.thrusterForceProduced || 0) / 2;
        const acceleration = thrustForce / mass;
        const velocityBoost = acceleration / Physics.framesPerSecond;
        const retroFacing = (this.facing + 180) % 360;
        Physics.findNewVelocity(this, retroFacing, velocityBoost);
        this.spawnRetrogradeThrusters();
        return true;
    }

    applyLateralThrust(direction) {
        const energyPerFrame = this.thrusterEnergyPerSecond / 2 / Physics.framesPerSecond;
        let activateThruster = false;
        if (this.capacitor >= energyPerFrame) {
            this.capacitor -= energyPerFrame; // BAD! Should be with respect to time!!!
            activateThruster = true;
        } else if (this.shieldStatus >= 10) {
            this.shieldStatus -= 10; // BAD! Should be with respect to time!!!
            activateThruster = true;
        }

        if (!activateThruster) {
            return false;
        }

        const mass = this.mass || 1;
        const thrustForce = (this.thrusterForceProduced || 0) / 2;
        const acceleration = thrustForce / mass;
        const velocityBoost = acceleration / Physics.framesPerSecond;
        const angleOffset = direction === 'Left' ? 90 : -90;
        const lateralFacing = Ship.normalizeAngle(this.facing + angleOffset);
        Physics.findNewVelocity(this, lateralFacing, velocityBoost);
        this.spawnLateralThrusters(direction, lateralFacing);
        return true;
    }

    applyRotationThrust(direction) {
        const energyPerFrame = this.rotationEnergyPerSecond / Physics.framesPerSecond;
        let activate = false;
        if (this.capacitor >= energyPerFrame) {
            this.capacitor -= energyPerFrame; // BAD! Should be with respect to time!!!
            activate = true;
        } else if (this.shieldStatus >= 10) {
            this.shieldStatus -= 10; // BAD! Should be with respect to time!!!
            activate = true;
        }

        if (!activate) {
            return false;
        }
        if (this.rotationDirection == 'None') {
            this.rotationDirection = direction;
            this.rotationVelocity = 1;
        } else if (this.rotationDirection == direction) {
            if (this.rotationVelocity < 3) {
                this.rotationVelocity = this.rotationVelocity + 1; // BAD! Should be with respect to time!!!
            }
        } else {
            this.rotationVelocity = this.rotationVelocity - 1; // BAD! Should be with respect to time!!!
            if (this.rotationVelocity <= 0) {
                this.rotationVelocity = 0;
                this.rotationDirection = 'None';
            }
        }

        if (direction === 'Clockwise') {
            this.spawnRotationThrusters(true);
        } else if (direction === 'CounterClockwise') {
            this.spawnRotationThrusters(false);
        }

        return true;
    }

    calculateOffsetFromShip(forwardOffset, rightOffset) {
        const facingRadians = this.facing * 0.0174532925;
        const forwardX = Math.sin(facingRadians);
        const forwardY = -Math.cos(facingRadians);
        const rightX = Math.cos(facingRadians);
        const rightY = Math.sin(facingRadians);

        return {
            x: forwardX * forwardOffset + rightX * rightOffset,
            y: forwardY * forwardOffset + rightY * rightOffset,
        };
    }

    spawnThrusterAt(offset, facing, size) {
        const thruster = new Thruster(Engine.getNextGameObjectId(), size);
        thruster.init(this, {offset, facing, size});
        gameObjects.push(thruster);
    }

    spawnRotationThrusters(clockwise = true) {
        const forwardOffset = this.lengthInMeters * 0.5;
        const sideOffset = this.lengthInMeters * 0.35;
        const thrusterSize = Thruster.DEFAULT_SIZE / 3;

        const positions = clockwise ? [
            {offset: this.calculateOffsetFromShip(forwardOffset, -sideOffset), facing: (this.facing - 90 + 360) % 360},
            {offset: this.calculateOffsetFromShip(-forwardOffset, sideOffset), facing: (this.facing + 90) % 360},
        ] : [
            {offset: this.calculateOffsetFromShip(forwardOffset, sideOffset), facing: (this.facing + 90) % 360},
            {offset: this.calculateOffsetFromShip(-forwardOffset, -sideOffset), facing: (this.facing - 90 + 360) % 360},
        ];

        positions.forEach(({offset, facing}) => this.spawnThrusterAt(offset, facing, thrusterSize));
    }

    spawnRetrogradeThrusters() {
        const sideOffset = this.lengthInMeters * 0.3;
        const thrusterSize = Thruster.DEFAULT_SIZE / 3;
        const forwardOffset = this.lengthInMeters * 0.15 + thrusterSize * 0.75;

        const retroThrusterFacing = this.facing;
        const positions = [
            {offset: this.calculateOffsetFromShip(forwardOffset, -sideOffset), facing: retroThrusterFacing},
            {offset: this.calculateOffsetFromShip(forwardOffset, sideOffset), facing: retroThrusterFacing},
        ];

        positions.forEach(({offset, facing}) => this.spawnThrusterAt(offset, facing, thrusterSize));
    }

    spawnLateralThrusters(direction, thrustFacing) {
        const sideOffsetMagnitude = this.lengthInMeters * 0.35;
        const sideOffset = direction === 'Left' ? -sideOffsetMagnitude : sideOffsetMagnitude;
        const thrusterSize = Thruster.DEFAULT_SIZE / 3;
        const forwardOffset = this.lengthInMeters * 0.2 + thrusterSize * 0.5;
        const thrusterFacing = Ship.normalizeAngle(thrustFacing + 180);

        const positions = [
            {offset: this.calculateOffsetFromShip(forwardOffset, sideOffset), facing: thrusterFacing},
            {offset: this.calculateOffsetFromShip(-forwardOffset, sideOffset), facing: thrusterFacing},
        ];

        positions.forEach(({offset, facing}) => this.spawnThrusterAt(offset, facing, thrusterSize));
    }

    dampenRotation() {
        if (this.rotationVelocity <= 0 || this.rotationDirection == 'None') {
            this.rotationVelocity = 0;
            this.rotationDirection = 'None';
            return true;
        }
        const opposing = this.rotationDirection == 'Clockwise' ? 'CounterClockwise' : 'Clockwise';
        return this.applyRotationThrust(opposing);
    }

    checkForComponentDamage() {
        if (this.hullStrength / this.maxHullStrength <= .33) {
            // Something is taking damage!!!
        }
        else if (this.hullStrength / this.maxHullStrength <= .66) {
            // Something might take damage!!!
        }
    }
}
