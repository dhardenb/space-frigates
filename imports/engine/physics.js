export class Physics {
  constructor() {}

  // Need to fix this when I fix the game loop
  static framesPerSecond = 60;

  static moveObjectAlongVector(GameObject) {
    const radians = (GameObject.Heading * Math.PI) / 180;
    const distance = GameObject.Velocity / Physics.framesPerSecond;

    GameObject.LocationX += distance * Math.sin(radians);
    GameObject.LocationY -= distance * Math.cos(radians);
  }

  static findNewVelocity(GameObject, NewHeading, NewVelocity) {
    const newXaxisComponent =
      Physics.getXaxisComponent(GameObject.Heading, GameObject.Velocity) +
      Physics.getXaxisComponent(NewHeading, NewVelocity);
    const newYaxisComponent =
      Physics.getYaxisComponent(GameObject.Heading, GameObject.Velocity) +
      Physics.getYaxisComponent(NewHeading, NewVelocity);

    GameObject.Velocity = Math.sqrt(newXaxisComponent ** 2 + newYaxisComponent ** 2);

    if (GameObject.Velocity === 0) {
      GameObject.Heading = 0;
    } else {
      GameObject.Heading = ((Math.atan2(newXaxisComponent, -newYaxisComponent) * 180) / Math.PI + 360) % 360;
    }
  }

  static getXaxisComponent(Direction, Magnitude) {
    let XaxisComponent = 0;

    if (Direction == 0) {
      XaxisComponent = 0;
    } else if (Direction == 90) {
      XaxisComponent = Magnitude;
    } else if (Direction == 180) {
      XaxisComponent = 0;
    } else if (Direction == 270) {
      XaxisComponent = -1 * Magnitude;
    } else if (Direction < 90) {
      XaxisComponent = Magnitude * Math.sin(Direction * 0.0174532925);
    } else if (Direction < 180) {
      XaxisComponent = Magnitude * Math.sin((180 - Direction) * 0.0174532925);
    } else if (Direction < 270) {
      XaxisComponent = -1 * Magnitude * Math.sin((Direction - 180) * 0.0174532925);
    } else {
      XaxisComponent = -1 * Magnitude * Math.sin((360 - Direction) * 0.0174532925);
    }

    return XaxisComponent;
  }

  static getYaxisComponent(Direction, Magnitude) {
    let YaxisComponent = 0;

    if (Direction == 0) {
      YaxisComponent = -1 * Magnitude;
    } else if (Direction == 90) {
      YaxisComponent = 0;
    } else if (Direction == 180) {
      YaxisComponent = Magnitude;
    } else if (Direction == 270) {
      YaxisComponent = 0;
    } else if (Direction < 90) {
      YaxisComponent = -1 * Magnitude * Math.cos(Direction * 0.0174532925);
    } else if (Direction < 180) {
      YaxisComponent = Magnitude * Math.cos((180 - Direction) * 0.0174532925);
    } else if (Direction < 270) {
      YaxisComponent = Magnitude * Math.cos((Direction - 180) * 0.0174532925);
    } else {
      YaxisComponent = -1 * Magnitude * Math.cos((360 - Direction) * 0.0174532925);
    }

    return YaxisComponent;
  }

  static findNewFacing(GameObject) {
    if (GameObject.RotationVelocity > 0) {
      if (GameObject.RotationDirection == "CounterClockwise") {
        GameObject.Facing = GameObject.Facing - (GameObject.RotationVelocity * 90) / Physics.framesPerSecond;
      } else {
        GameObject.Facing = GameObject.Facing + (GameObject.RotationVelocity * 90) / Physics.framesPerSecond;
      }
    }

    if (GameObject.Facing < 0) {
      GameObject.Facing = 360 - GameObject.Facing * -1;
    } else if (GameObject.Facing > 359) {
      GameObject.Facing = GameObject.Facing - 360;
    }
  }
}
