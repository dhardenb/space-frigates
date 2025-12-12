import {Engine} from '../engine/engine.js';
import {Laser} from './laser.js';
import {Missile} from './missile.js';
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
        this.maxMissiles = 3;
        this.missilesRemaining = this.maxMissiles;
        this.missilesArmed = false;
        this.missileFireRequested = false;
        this.rotationEnergyPerSecond = Physics.framesPerSecond * 5; // matches old 5-per-frame default
        this.thrusterForceProduced = this.mass * 20 * Physics.framesPerSecond;
        this.maxShieldStrength = 100;
        this.shieldRechargeRate = 0.25;
        this.shieldDecayRate = 0.25;
        this.autoPilotEngaged = false;
        this.autoPilotFacingLocked = false;
        this.lengthInMeters = 8;
        this.widthInMeters = 4;

        // Autopilot-assisted dampening flags (persist until motion stops)
        this.rotationDampeningActive = false;
        this.lateralDampeningActive = false;

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
            this.missilesRemaining = this.maxMissiles;
            this.missilesArmed = false;
            this.missileFireRequested = false;
            this.rotationDampeningActive = false;
            this.lateralDampeningActive = false;
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
                if (candidateCommand === 'TOGGLE_MISSILES' || candidateCommand === 'FIRE_MISSILE') {
                    continue;
                }
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

    /**
     * Autopilot braking system that preserves the ship's current facing.
     *
     * Decomposes velocity into ship-relative components (forward/backward and left/right)
     * and fires the appropriate thrusters to counter each component:
     * - Forward velocity → retrograde thrusters
     * - Backward velocity → main thruster
     * - Rightward velocity → left lateral thrusters
     * - Leftward velocity → right lateral thrusters
     *
     * Rotation is dampened but the ship does not rotate to face retrograde.
     */
    updateAutoPilot() {
        if (!this.isAutoPilotActive()) {
            return;
        }

        const velocityMagnitude = Math.abs(Number(this.velocity) || 0);
        const rotationMagnitude = Math.abs(Number(this.rotationVelocity) || 0);

        // Check if we've stopped - disable autopilot
        if (velocityMagnitude <= AUTO_PILOT_VELOCITY_THRESHOLD && rotationMagnitude <= AUTO_PILOT_ROTATION_THRESHOLD) {
            this.disableAutoPilot();
            return;
        }

        // Always dampen rotation first to stabilize facing
        if (rotationMagnitude > AUTO_PILOT_ROTATION_THRESHOLD && this.rotationDirection !== 'None') {
            this.dampenRotation();
            return;
        }

        // If velocity is significant, apply braking thrusters
        if (velocityMagnitude > AUTO_PILOT_VELOCITY_THRESHOLD) {
            const {forwardSpeed, rightSpeed} = this.getShipRelativeVelocity();

            // Threshold for considering a velocity component significant enough to brake
            const componentThreshold = AUTO_PILOT_VELOCITY_THRESHOLD * 0.5;

            // Determine which thruster(s) to fire based on velocity components
            // Prioritize the larger component, but can fire both if needed
            const absForward = Math.abs(forwardSpeed);
            const absRight = Math.abs(rightSpeed);

            let thrusterFired = false;

            // Fire thruster for the dominant velocity component
            if (absForward >= absRight && absForward > componentThreshold) {
                // Forward/backward is dominant
                if (forwardSpeed > 0) {
                    // Moving forward relative to facing - fire retrograde
                    const previousForwardSpeed = forwardSpeed;
                    thrusterFired = this.applyRetrogradeThrust();
                    // Check for overshoot on forward velocity
                    if (thrusterFired) {
                        const {forwardSpeed: newForwardSpeed, rightSpeed} = this.getShipRelativeVelocity();
                        if (newForwardSpeed < 0 || Math.abs(newForwardSpeed) > Math.abs(previousForwardSpeed)) {
                            // Overshot - zero out forward component
                            this.setVelocityFromShipRelative(0, rightSpeed);
                        }
                    }
                } else {
                    // Moving backward relative to facing - fire main thruster
                    const previousVelocity = velocityMagnitude;
                    thrusterFired = this.applyForwardThrust();
                    // Check if we overshot (velocity increased or direction reversed)
                    if (thrusterFired) {
                        const newVelocityMagnitude = Math.abs(Number(this.velocity) || 0);
                        if (newVelocityMagnitude >= previousVelocity) {
                            this.velocity = 0;
                            this.heading = this.facing;
                        }
                    }
                }
            } else if (absRight > componentThreshold) {
                // Left/right is dominant
                // Note: applyLateralThrust('Left') fires thrusters on the LEFT side,
                // which pushes the ship to the RIGHT (and vice versa)
                const previousRightSpeed = rightSpeed;
                if (rightSpeed > 0) {
                    // Moving right relative to facing - fire RIGHT lateral (pushes ship left)
                    thrusterFired = this.applyLateralThrust('Right');
                } else {
                    // Moving left relative to facing - fire LEFT lateral (pushes ship right)
                    thrusterFired = this.applyLateralThrust('Left');
                }
                // Check for overshoot on lateral velocity
                if (thrusterFired) {
                    const {rightSpeed: newRightSpeed} = this.getShipRelativeVelocity();
                    // If we crossed zero (sign changed) or increased magnitude, we overshot
                    if ((previousRightSpeed > 0 && newRightSpeed < 0) ||
                        (previousRightSpeed < 0 && newRightSpeed > 0) ||
                        Math.abs(newRightSpeed) > Math.abs(previousRightSpeed)) {
                        // Zero out the lateral component by recalculating velocity
                        const {forwardSpeed} = this.getShipRelativeVelocity();
                        this.setVelocityFromShipRelative(forwardSpeed, 0);
                    }
                }
            }

            // If no thruster was fired but we still have velocity, try to stop
            if (!thrusterFired && velocityMagnitude > AUTO_PILOT_VELOCITY_THRESHOLD) {
                // Fallback: fire retrograde if we have any forward component
                if (forwardSpeed > componentThreshold) {
                    this.applyRetrogradeThrust();
                } else if (forwardSpeed < -componentThreshold) {
                    this.applyForwardThrust();
                }
            }
            return;
        }

        // Final check - if everything is below threshold, disable autopilot
        if (rotationMagnitude <= AUTO_PILOT_ROTATION_THRESHOLD && velocityMagnitude <= AUTO_PILOT_VELOCITY_THRESHOLD) {
            this.disableAutoPilot();
        }
    }

    /**
     * Decomposes the ship's velocity into ship-relative coordinates.
     *
     * Returns:
     * - forwardSpeed: positive = moving forward (toward facing), negative = moving backward
     * - rightSpeed: positive = moving right, negative = moving left
     *
     * Uses compass convention: 0° = North (up), angles increase clockwise.
     */
    getShipRelativeVelocity() {
        const facingRad = (this.facing || 0) * 0.0174532925; // deg to rad
        const velocity = this.velocity || 0;
        const heading = this.heading || 0;

        // Get world velocity components using existing Physics utilities
        const vx = Physics.getXaxisComponent(heading, velocity);
        const vy = Physics.getYaxisComponent(heading, velocity);

        // Ship's forward unit vector (compass: 0° = North = -Y in screen coords)
        // Forward: (sin(facing), -cos(facing))
        const fx = Math.sin(facingRad);
        const fy = -Math.cos(facingRad);

        // Ship's right unit vector (90° clockwise from forward)
        // Right: (cos(facing), sin(facing))
        const rx = Math.cos(facingRad);
        const ry = Math.sin(facingRad);

        // Project velocity onto ship axes (dot products)
        const forwardSpeed = vx * fx + vy * fy;
        const rightSpeed = vx * rx + vy * ry;

        return {forwardSpeed, rightSpeed};
    }

    /**
     * Sets the ship's velocity from ship-relative components.
     *
     * @param {number} forwardSpeed - Velocity along ship's facing axis (positive = forward)
     * @param {number} rightSpeed - Velocity perpendicular to facing (positive = right)
     */
    setVelocityFromShipRelative(forwardSpeed, rightSpeed) {
        const facingRad = (this.facing || 0) * 0.0174532925;

        // Ship's forward unit vector
        const fx = Math.sin(facingRad);
        const fy = -Math.cos(facingRad);

        // Ship's right unit vector
        const rx = Math.cos(facingRad);
        const ry = Math.sin(facingRad);

        // Convert to world velocity components
        const vx = forwardSpeed * fx + rightSpeed * rx;
        const vy = forwardSpeed * fy + rightSpeed * ry;

        // Convert to heading and velocity magnitude
        const result = Physics.vectorToHeadingAndVelocity(vx, vy);
        this.heading = result.heading;
        this.velocity = result.velocity;
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
                const newLaser = new Laser(Engine.getNextGameObjectId(), {sourceObject: this});
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

    updateDampenRotation() {
        // Activate rotation dampening when command received
        if (this.currentCommand === 'DAMPEN_ROTATION') {
            this.rotationDampeningActive = true;
        }

        // Cancel rotation dampening if user manually rotates (normal or autopilot mode)
        if (this.currentCommand === 1 || this.currentCommand === 3 ||
            this.currentCommand === '1' || this.currentCommand === '3' ||
            this.currentCommand === 'ROTATE_CW_AUTOPILOT' || this.currentCommand === 'ROTATE_CCW_AUTOPILOT') {
            this.rotationDampeningActive = false;
        }

        // Continue dampening until rotation stops
        if (this.rotationDampeningActive) {
            const stopped = this.dampenRotation();
            if (stopped && this.rotationVelocity <= 0) {
                this.rotationDampeningActive = false;
            }
        }
    }

    updateDampenLateral() {
        // Activate lateral dampening when command received
        if (this.currentCommand === 'DAMPEN_LATERAL') {
            this.lateralDampeningActive = true;
        }

        // Cancel lateral dampening if user manually uses lateral thrust
        if (this.currentCommand === 'LATERAL_THRUST_LEFT' || this.currentCommand === 'LATERAL_THRUST_RIGHT') {
            this.lateralDampeningActive = false;
        }

        // Continue dampening until lateral velocity stops
        if (this.lateralDampeningActive) {
            const stopped = this.dampenLateral();
            if (stopped) {
                const {rightSpeed} = this.getShipRelativeVelocity();
                const lateralThreshold = AUTO_PILOT_VELOCITY_THRESHOLD * 0.5;
                if (Math.abs(rightSpeed) <= lateralThreshold) {
                    this.lateralDampeningActive = false;
                }
            }
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

    updateAutopilotRotation() {
        // Autopilot rotation: starts at level 2 for faster constant rotation
        if (this.currentCommand === 'ROTATE_CW_AUTOPILOT') {
            this.applyRotationThrust('Clockwise', 2);
        } else if (this.currentCommand === 'ROTATE_CCW_AUTOPILOT') {
            this.applyRotationThrust('CounterClockwise', 2);
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
        this.processMissileCommands(commands);
        this.updateRector(framesPerSecond);
        this.fireLaser();
        this.fireMissileIfRequested();
        this.updateThrusters();
        this.updateRetroThrusters();
        this.updateLateralThrusters();
        this.rotateLeft();
        this.rotateRight();
        this.updateAutopilotRotation();
        this.updateDampenRotation();
        this.updateDampenLateral();
        this.updateAutoPilot();
        this.updateShields();
        this.updateVelocity();
        this.updateFacing();
        this.updateLocation();
    }

    processMissileCommands(commands) {
        let toggleRequested = false;
        let fireRequested = false;

        if (this.missilesRemaining <= 0) {
            this.missilesArmed = false;
        }

        for(let x = 0, y = commands.length; x < y; x++) {
            if (commands[x].targetId == this.id) {
                const candidateCommand = commands[x].command;
                if (candidateCommand === 'TOGGLE_MISSILES') {
                    toggleRequested = true;
                }
                if (candidateCommand === 'FIRE_MISSILE') {
                    fireRequested = true;
                }
            }
        }

        if (toggleRequested) {
            this.toggleMissileArming();
        }
        if (fireRequested) {
            this.missileFireRequested = true;
        }
    }

    toggleMissileArming() {
        if (this.missilesArmed) {
            this.missilesArmed = false;
            this.missileFireRequested = false;
            return;
        }
        if (this.missilesRemaining > 0) {
            this.missilesArmed = true;
            this.missileFireRequested = false;
        }
    }

    fireMissileIfRequested() {
        if (!this.missileFireRequested) {
            return;
        }

        this.missileFireRequested = false;

        if (!this.missilesArmed || this.missilesRemaining <= 0) {
            this.missilesArmed = false;
            return;
        }

        const newMissile = new Missile(Engine.getNextGameObjectId(), {sourceObject: this});
        gameObjects.push(newMissile);
        const newSound = new Sound();
        newSound.init("LaserFired", this);
        gameObjects.push(newSound);
        this.missilesRemaining = Math.max(0, (this.missilesRemaining || 0) - 1);
        this.missilesArmed = false;
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
        const facing = (this.facing + 180) % 360;
        const newThruster = new Thruster(Engine.getNextGameObjectId(), {sourceObject: this, facing});
        gameObjects.push(newThruster);
        const newSound = new Sound();
        newSound.init("ThrusterFired", this);
        gameObjects.push(newSound);
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
        const newSound = new Sound();
        newSound.init("RetroThrusterFired", this);
        gameObjects.push(newSound);
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
        const newSound = new Sound();
        newSound.init("LateralThrusterFired", this);
        gameObjects.push(newSound);
        return true;
    }

    applyRotationThrust(direction, initialVelocity = 1) {
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
            this.rotationVelocity = initialVelocity;
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

        const newSound = new Sound();
        newSound.init("RotationThrusterFired", this);
        gameObjects.push(newSound);
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
        const thruster = new Thruster(Engine.getNextGameObjectId(), {sourceObject: this, offset, facing, size});
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

    /**
     * Dampens the ship's lateral (perpendicular to facing) velocity component.
     * Fires lateral thrusters to counter any drift perpendicular to the ship's facing.
     * 
     * @returns {boolean} True if lateral velocity was already zero or thruster was fired
     */
    dampenLateral() {
        const {rightSpeed} = this.getShipRelativeVelocity();
        const lateralThreshold = AUTO_PILOT_VELOCITY_THRESHOLD * 0.5;

        // If lateral velocity is negligible, nothing to dampen
        if (Math.abs(rightSpeed) <= lateralThreshold) {
            return true;
        }

        const previousRightSpeed = rightSpeed;
        let thrusterFired = false;

        // Note: applyLateralThrust('Left') fires thrusters on the LEFT side,
        // which pushes the ship to the RIGHT (and vice versa)
        if (rightSpeed > 0) {
            // Moving right relative to facing - fire RIGHT lateral (pushes ship left)
            thrusterFired = this.applyLateralThrust('Right');
        } else {
            // Moving left relative to facing - fire LEFT lateral (pushes ship right)
            thrusterFired = this.applyLateralThrust('Left');
        }

        // Check for overshoot on lateral velocity
        if (thrusterFired) {
            const {rightSpeed: newRightSpeed, forwardSpeed} = this.getShipRelativeVelocity();
            // If we crossed zero (sign changed) or increased magnitude, we overshot
            if ((previousRightSpeed > 0 && newRightSpeed < 0) ||
                (previousRightSpeed < 0 && newRightSpeed > 0) ||
                Math.abs(newRightSpeed) > Math.abs(previousRightSpeed)) {
                // Zero out the lateral component
                this.setVelocityFromShipRelative(forwardSpeed, 0);
            }
        }

        return thrusterFired;
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
