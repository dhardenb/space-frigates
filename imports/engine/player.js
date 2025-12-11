import {Utilities} from '../utilities/utilities.js';

export class Player {

    constructor() {
        this.type = "Player";
    }   

    init(connectionId) {
        this.id = Utilities.hashStringToUint32(connectionId);
        this.name = "";
        this.shipId = 0;
        this.kills = 0;
        this.deaths = 0;
        this.lastActivityAt = Date.now();
    }

    /**
     * Update the last activity timestamp to the current time.
     */
    updateActivity() {
        this.lastActivityAt = Date.now();
    }

    /**
     * Check if the player has been inactive for longer than the given timeout.
     * @param {number} timeoutMs - Inactivity timeout in milliseconds
     * @returns {boolean} True if the player is inactive
     */
    isInactive(timeoutMs) {
        return (Date.now() - this.lastActivityAt) > timeoutMs;
    }

    update(commands, framesPerSecond) {}
}