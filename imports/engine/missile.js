import {Laser} from './laser.js';

export class Missile extends Laser {

        constructor(id, options = {}) {
                super(id, options);
                this.type = 'Missile';
                this.lengthInMeters = (this.lengthInMeters || 3) * 2;
                this.widthInMeters = 1;
        }
}
