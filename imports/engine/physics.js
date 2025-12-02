export class Physics {

    constructor() {}

    // Need to fix this when I fix the game loop
    static framesPerSecond = 60;

    static moveObjectAlongVector(GameObject) {
        if (GameObject.heading == 0)
        {
            GameObject.locationY = GameObject.locationY - GameObject.velocity / Physics.framesPerSecond;
        }
        else if (GameObject.heading == 90)
        {
            GameObject.locationX = GameObject.locationX + GameObject.velocity / Physics.framesPerSecond;
        }
        else if (GameObject.heading == 180)
        {
            GameObject.locationY = GameObject.locationY + GameObject.velocity / Physics.framesPerSecond;
        }
        else if (GameObject.heading == 270)
        {
            GameObject.locationX = GameObject.locationX - GameObject.velocity / Physics.framesPerSecond;
        }
        else if (GameObject.heading < 90)
        {
            GameObject.locationX = GameObject.locationX + GameObject.velocity / Physics.framesPerSecond * (Math.sin(GameObject.heading * 0.0174532925));
            GameObject.locationY = GameObject.locationY - GameObject.velocity / Physics.framesPerSecond * (Math.cos(GameObject.heading * 0.0174532925));
        }
        else if (GameObject.heading < 180)
        {
            GameObject.locationX = GameObject.locationX + GameObject.velocity / Physics.framesPerSecond * (Math.sin((180 - GameObject.heading) * 0.0174532925));
            GameObject.locationY = GameObject.locationY + GameObject.velocity / Physics.framesPerSecond * (Math.cos((180 - GameObject.heading) * 0.0174532925));
        }
        else if (GameObject.heading < 270)
        {
            GameObject.locationX = GameObject.locationX - GameObject.velocity / Physics.framesPerSecond * (Math.sin((GameObject.heading - 180) * 0.0174532925));
            GameObject.locationY = GameObject.locationY + GameObject.velocity / Physics.framesPerSecond * (Math.cos((GameObject.heading - 180) * 0.0174532925));
        }
        else
        {
            GameObject.locationX = GameObject.locationX - GameObject.velocity / Physics.framesPerSecond * (Math.sin((360 - GameObject.heading) * 0.0174532925));
            GameObject.locationY = GameObject.locationY - GameObject.velocity / Physics.framesPerSecond * (Math.cos((360 - GameObject.heading) * 0.0174532925));
        }
    }

    static findNewVelocity(GameObject, NewHeading, NewVelocity) {
    
        const newXaxisComponent = Physics.getXaxisComponent(GameObject.heading, GameObject.velocity) + Physics.getXaxisComponent(NewHeading, NewVelocity);
        const newYaxisComponent = Physics.getYaxisComponent(GameObject.heading, GameObject.velocity) + Physics.getYaxisComponent(NewHeading, NewVelocity);

        if (newXaxisComponent == 0 && newYaxisComponent == 0)
        {
            GameObject.heading = 0;
            GameObject.velocity = 0;
        }
        else if (newXaxisComponent == 0 && newYaxisComponent < 0)
        {
            GameObject.heading = 0;
            GameObject.velocity = Math.abs(newYaxisComponent);
        }
        else if (newXaxisComponent > 0 && newYaxisComponent == 0)
        {
            GameObject.heading = 90;
            GameObject.velocity = Math.abs(newXaxisComponent);
        }
        else if (newXaxisComponent == 0 && newYaxisComponent > 0)
        {
            GameObject.heading = 180;
            GameObject.velocity = Math.abs(newYaxisComponent);
        }
        else if (newXaxisComponent < 0 && newYaxisComponent == 0)
        {
            GameObject.heading = 270;
            GameObject.velocity = Math.abs(newXaxisComponent);
        }
        else if (newXaxisComponent < 0 && newYaxisComponent < 0)
        {
            GameObject.velocity = Math.sqrt(newXaxisComponent * newXaxisComponent + newYaxisComponent * newYaxisComponent);
            GameObject.heading = 360 - Math.atan(newXaxisComponent / newYaxisComponent) / 0.0174532925;
        }
        else if (newXaxisComponent < 0 && newYaxisComponent > 0)
        {
            GameObject.velocity = Math.sqrt(newXaxisComponent * newXaxisComponent + newYaxisComponent * newYaxisComponent);
            GameObject.heading = (Math.atan(Math.abs(newXaxisComponent) / newYaxisComponent) / 0.0174532925) - 180;
        }
        else if (newXaxisComponent > 0 && newYaxisComponent < 0)
        {
            GameObject.velocity = Math.sqrt(newXaxisComponent * newXaxisComponent + newYaxisComponent * newYaxisComponent);
            GameObject.heading = Math.atan(newXaxisComponent / Math.abs(newYaxisComponent)) / 0.0174532925;
        }
        else if (newXaxisComponent > 0 && newYaxisComponent > 0)
        {
            GameObject.velocity = Math.sqrt(newXaxisComponent * newXaxisComponent + newYaxisComponent * newYaxisComponent);
            GameObject.heading = 180 - Math.atan(newXaxisComponent / newYaxisComponent) / 0.0174532925;
        }
    }

    static getXaxisComponent(Direction, Magnitude) {
    
        let XaxisComponent = 0;

        if (Direction == 0)
        {
            XaxisComponent = 0;
        }
        else if (Direction == 90)
        {
            XaxisComponent = Magnitude;
        }
        else if (Direction == 180)
        {
            XaxisComponent = 0;
        }
        else if (Direction == 270)
        {
            XaxisComponent = -1 * Magnitude;
        }
        else if (Direction < 90)
        {
            XaxisComponent = Magnitude * (Math.sin(Direction * 0.0174532925));
        }
        else if (Direction < 180)
        {
            XaxisComponent = Magnitude * (Math.sin((180 - Direction) * 0.0174532925));
        }
        else if (Direction < 270)
        {
            XaxisComponent = -1 * Magnitude * (Math.sin((Direction - 180) * 0.0174532925));
        }
        else
        {
            XaxisComponent = -1 * Magnitude * (Math.sin((360 - Direction) * 0.0174532925));
        }

        return XaxisComponent;
    }

    static getYaxisComponent(Direction, Magnitude) {
    
        let YaxisComponent = 0;

        if (Direction == 0)
        {
            YaxisComponent = -1 * Magnitude;
        }
        else if (Direction == 90)
        {
            YaxisComponent = 0;
        }
        else if (Direction == 180)
        {
            YaxisComponent = Magnitude;
        }
        else if (Direction == 270)
        {
            YaxisComponent = 0;
        }
        else if (Direction < 90)
        {
            YaxisComponent =  -1 * Magnitude * (Math.cos(Direction * 0.0174532925));
        }
        else if (Direction < 180)
        {
            YaxisComponent =  Magnitude * (Math.cos((180 - Direction) * 0.0174532925));
        }
        else if (Direction < 270)
        {
            YaxisComponent =  Magnitude * (Math.cos((Direction - 180) * 0.0174532925));
        }
        else
        {
            YaxisComponent =  -1 * Magnitude * (Math.cos((360 - Direction) * 0.0174532925));
        }

        return YaxisComponent;
    }

    static vectorToHeadingAndVelocity(xComponent, yComponent) {

        const headingVelocity = {
            heading: 0,
            velocity: 0
        };

        if (xComponent === 0 && yComponent === 0) {
            return headingVelocity;
        }
        else if (xComponent === 0 && yComponent < 0)
        {
            headingVelocity.heading = 0;
            headingVelocity.velocity = Math.abs(yComponent);
        }
        else if (xComponent > 0 && yComponent === 0)
        {
            headingVelocity.heading = 90;
            headingVelocity.velocity = Math.abs(xComponent);
        }
        else if (xComponent === 0 && yComponent > 0)
        {
            headingVelocity.heading = 180;
            headingVelocity.velocity = Math.abs(yComponent);
        }
        else if (xComponent < 0 && yComponent === 0)
        {
            headingVelocity.heading = 270;
            headingVelocity.velocity = Math.abs(xComponent);
        }
        else if (xComponent < 0 && yComponent < 0)
        {
            headingVelocity.velocity = Math.sqrt(xComponent * xComponent + yComponent * yComponent);
            headingVelocity.heading = 360 - Math.atan(xComponent / yComponent) / 0.0174532925;
        }
        else if (xComponent < 0 && yComponent > 0)
        {
            headingVelocity.velocity = Math.sqrt(xComponent * xComponent + yComponent * yComponent);
            headingVelocity.heading = (Math.atan(Math.abs(xComponent) / yComponent) / 0.0174532925) - 180;
        }
        else if (xComponent > 0 && yComponent < 0)
        {
            headingVelocity.velocity = Math.sqrt(xComponent * xComponent + yComponent * yComponent);
            headingVelocity.heading = Math.atan(xComponent / Math.abs(yComponent)) / 0.0174532925;
        }
        else if (xComponent > 0 && yComponent > 0)
        {
            headingVelocity.velocity = Math.sqrt(xComponent * xComponent + yComponent * yComponent);
            headingVelocity.heading = 180 - Math.atan(xComponent / yComponent) / 0.0174532925;
        }

        return headingVelocity;
    }

    static findNewFacing(GameObject) {

        if (GameObject.rotationVelocity > 0) {

            if (GameObject.rotationDirection == 'CounterClockwise') {

                GameObject.facing = GameObject.facing - GameObject.rotationVelocity * 90 / Physics.framesPerSecond;
            }
            else {

                GameObject.facing = GameObject.facing + GameObject.rotationVelocity * 90 / Physics.framesPerSecond;
            }
        }

        if (GameObject.facing < 0) {

            GameObject.facing = 360 - GameObject.facing * -1;
        }
        else if (GameObject.facing > 359) {

            GameObject.facing = GameObject.facing - 360;
        }
    }

}
