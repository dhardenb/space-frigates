function GameObject(Id, Type, LocationX, LocationY, Facing, Heading, Velocity, ShieldStatus, Size, RotationDirection, RotationVelocity, Fuel, Capacitor)
{
  this.Id = Id;
  this.Type = Type;
  this.LocationX = LocationX;
  this.LocationY = LocationY;
  this.Facing = Facing;
  this.Heading = Heading;
  this.Velocity = Velocity;
  this.ShieldStatus = ShieldStatus;
  this.Size = Size;
  this.RotationDirection = RotationDirection;
  this.RotationVelocity = RotationVelocity;
  this.Fuel = Fuel;
  this.Capacitor = Capacitor;
  this.svgElement;
}

function PlayerObject(id, ship)
{
  this.id = id;
  this.ship = ship;
}

function CommandObject(player, command, target, tick)
{
  this.player = player;
  this.command = command;
  this.target = target;
  this.tick = tick;
}