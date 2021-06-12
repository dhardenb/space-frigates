export class Physics {

    constructor() {}

    // Need to fix this when I fix the game loop
    static framesPerSecond = 60;

    static moveObjectAlongVector(GameObject) {
        if (GameObject.Heading == 0)
        {
            GameObject.LocationY = GameObject.LocationY - GameObject.Velocity / Physics.framesPerSecond;
        }
        else if (GameObject.Heading == 90)
        {
            GameObject.LocationX = GameObject.LocationX + GameObject.Velocity / Physics.framesPerSecond;
        }
        else if (GameObject.Heading == 180)
        {
            GameObject.LocationY = GameObject.LocationY + GameObject.Velocity / Physics.framesPerSecond;
        }
        else if (GameObject.Heading == 270)
        {
            GameObject.LocationX = GameObject.LocationX - GameObject.Velocity / Physics.framesPerSecond;
        }
        else if (GameObject.Heading < 90)
        {
            GameObject.LocationX = GameObject.LocationX + GameObject.Velocity / Physics.framesPerSecond * (Math.sin(GameObject.Heading * 0.0174532925));
            GameObject.LocationY = GameObject.LocationY - GameObject.Velocity / Physics.framesPerSecond * (Math.cos(GameObject.Heading * 0.0174532925));
        }
        else if (GameObject.Heading < 180)
        {
            GameObject.LocationX = GameObject.LocationX + GameObject.Velocity / Physics.framesPerSecond * (Math.sin((180 - GameObject.Heading) * 0.0174532925));
            GameObject.LocationY = GameObject.LocationY + GameObject.Velocity / Physics.framesPerSecond * (Math.cos((180 - GameObject.Heading) * 0.0174532925));
        }
        else if (GameObject.Heading < 270)
        {
            GameObject.LocationX = GameObject.LocationX - GameObject.Velocity / Physics.framesPerSecond * (Math.sin((GameObject.Heading - 180) * 0.0174532925));
            GameObject.LocationY = GameObject.LocationY + GameObject.Velocity / Physics.framesPerSecond * (Math.cos((GameObject.Heading - 180) * 0.0174532925));
        }
        else
        {
            GameObject.LocationX = GameObject.LocationX - GameObject.Velocity / Physics.framesPerSecond * (Math.sin((360 - GameObject.Heading) * 0.0174532925));
            GameObject.LocationY = GameObject.LocationY - GameObject.Velocity / Physics.framesPerSecond * (Math.cos((360 - GameObject.Heading) * 0.0174532925));
        }
    }

    static findNewVelocity(GameObject, NewHeading, NewVelocity) {
    
        const newXaxisComponent = Physics.getXaxisComponent(GameObject.Heading, GameObject.Velocity) + Physics.getXaxisComponent(NewHeading, NewVelocity);
        const newYaxisComponent = Physics.getYaxisComponent(GameObject.Heading, GameObject.Velocity) + Physics.getYaxisComponent(NewHeading, NewVelocity);

        if (newXaxisComponent == 0 && newYaxisComponent == 0)
        {
            GameObject.Heading = 0;
            GameObject.Velocity = 0;
        }
        else if (newXaxisComponent == 0 && newYaxisComponent < 0)
        {
            GameObject.Heading = 0;
            GameObject.Velocity = Math.abs(newYaxisComponent);
        }
        else if (newXaxisComponent > 0 && newYaxisComponent == 0)
        {
            GameObject.Heading = 90;
            GameObject.Velocity = Math.abs(newXaxisComponent);
        }
        else if (newXaxisComponent == 0 && newYaxisComponent > 0)
        {
            GameObject.Heading = 180;
            GameObject.Velocity = Math.abs(newYaxisComponent);
        }
        else if (newXaxisComponent < 0 && newYaxisComponent == 0)
        {
            GameObject.Heading = 270;
            GameObject.Velocity = Math.abs(newXaxisComponent);
        }
        else if (newXaxisComponent < 0 && newYaxisComponent < 0)
        {
            GameObject.Velocity = Math.sqrt(newXaxisComponent * newXaxisComponent + newYaxisComponent * newYaxisComponent);
            GameObject.Heading = 360 - Math.atan(newXaxisComponent / newYaxisComponent) / 0.0174532925;
        }
        else if (newXaxisComponent < 0 && newYaxisComponent > 0)
        {
            GameObject.Velocity = Math.sqrt(newXaxisComponent * newXaxisComponent + newYaxisComponent * newYaxisComponent);
            GameObject.Heading = (Math.atan(Math.abs(newXaxisComponent) / newYaxisComponent) / 0.0174532925) - 180;
        }
        else if (newXaxisComponent > 0 && newYaxisComponent < 0)
        {
            GameObject.Velocity = Math.sqrt(newXaxisComponent * newXaxisComponent + newYaxisComponent * newYaxisComponent);
            GameObject.Heading = Math.atan(newXaxisComponent / Math.abs(newYaxisComponent)) / 0.0174532925;
        }
        else if (newXaxisComponent > 0 && newYaxisComponent > 0)
        {
            GameObject.Velocity = Math.sqrt(newXaxisComponent * newXaxisComponent + newYaxisComponent * newYaxisComponent);
            GameObject.Heading = 180 - Math.atan(newXaxisComponent / newYaxisComponent) / 0.0174532925;
        }
    }

    static getXaxisComponent(Direction, Magnitude) {
    
        var XaxisComponent = 0;

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
    
        var YaxisComponent = 0;

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

    static findNewFacing(GameObject) {

        if (GameObject.RotationVelocity > 0) {

            if (GameObject.RotationDirection == 'CounterClockwise') {

                GameObject.Facing = GameObject.Facing - GameObject.RotationVelocity * 90 / Physics.framesPerSecond;
            }
            else {

                GameObject.Facing = GameObject.Facing + GameObject.RotationVelocity * 90 / Physics.framesPerSecond;
            }
        }

        if (GameObject.Facing < 0) {

            GameObject.Facing = 360 - GameObject.Facing * -1;
        }
        else if (GameObject.Facing > 359) {

            GameObject.Facing = GameObject.Facing - 360;
        }
    }

}
