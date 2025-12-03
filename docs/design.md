# Design Notes

Below are a set of assorted design notes that I wanted to keep. The goal is to understand why I did things the way I did and also understand what my thinking was for the future.

## Renderer

### "pixelsPerMeter"

I should start by saying that there is very important variable in the application called pixelsPerMeter that helps determine the size that everything is drawn at.

I've been trying to figure out the best way to render the objects that you see in the game. It turns out to be a bit a litte more involved than you would think.

I think the primary basis for the sizing should be a circle that represents a human being. This circle should be considered to be 1 meter in diameter.

From there, I should be able to simply set the current "zoom" level in pixels per meter.

The Viper based ship chassis that I am currently using is approximitly 9 meters in length.

#### Canvas Path Defintions

There are two issues with the path definitions worth discussing:

1. Coordinate System

Theoretically, the best way to define the paths themselves is probably to assume that the top left corner of the canvase is (0,0) and that the bottom right corner of the canvas is (1,1). All the points inbetween would then become relative, floating point numbers.

The reason for the coordinates going 0 to 1 is so that all paths are defined in a consistent way. Obviously, the rendered objects will normally be different sizes on the screen. This should be accomplished by scaling the objects as needed. But the original path should be unaware of this.

However, at this time I am breaking both rules.

I'm drawing all my paths in a way such that they are relative to each other. For example, a ship is ten points wide and everything else is relative to that. The thurster and laser graphics are relative to that ship size.

Also, because I wanted the objects to automaticly be centered, I always draw with the origin at the center of the object. For example, the ship ranges from -5 to 5 on both the X and Y axis.

2. Sizing considerations

Right now, I am sizing all the objects based on diving the viewble area of the screen by a constant (40 right now.) But that is not really the best way to go about it. What I should be doing is deciding what percentage of the screen I want the ship to fill. I mean, for the default. Users could zoom in and out from there.

So, what I tried to do is change the code such that the ship is defined from 0 to 1 and then scaled as neccisary to make it fill a certain percentage of the screen.

However, when I did that I started ti have problems. The main problem being that there are a bunch of things hard coded in the physics engine that make size assumptions. For example, lasers should start X number of "points" from the front of the ship. And that X is relative to the deault size of the ship, which I assumed to be ten "points."

#### Conclusion

So when I tried to fix all this other things started breaking and I decided to revert the code back for the time being because I had other things do do that seem to be more immediate needs, like having a proper landing page of the game.

#### Update

Today I went in and revamping the rendering engine. I changed all of the paths so that they are defined on a scale of -0.5 t0 0.5 in both the X and Y planes. I did this for two reasons: 1) it means that everything is consistenly defined at a scale of 1. 2) by going from -0.5 to 0.5 instead of 0 to 1, it makes the translation code much easier to calculate. When you start drawing from the top left corner of the object you have to do additional translations to make sure it lines up with its proper position. By having the image centered with (0,0) in the center, you can just draw it at the correct location.

Of course, making this improvment broke a bunch of things. I had to fix the algorithms that determine the starting position of lasers and thrusters, I had to tweak the collision detection code, I had to change the translation and scaling for everything to scale up the object from 1 to X.

There were a few other changes but I'm happy with the result. I feel like the rendering is a bit more predictible now and all measurements of distance are now based on the same base unit, 1 Meter. The raw path instructions all draw the objects to be 1 meter by 1 meter and then they are scaled up to the correct size.

The way I was doing it sucked because every object was scaled differently and had to be transformed differently. Not very scalable!

### Viewing Layers

I think the web application is going to have to have a couple of different layers. Until now, everything has basicly been in the same layer, the game play layer.

* Map

Everything in the current game is in the "map" layer and is relative to the player's ship, meaning they pan together, rotate together and zoom in and out together.

* Background

There is also one other kind of sudo layer that I call the background and has the stars in it. They are fixed to the viewport and do not change. But that is really not correct. I need to eventually change to some kind of tiling system that can support the ability to scroll infinelty in all direections. Because the player's ship needs to fly around in space and you have to be able to see the stars moving in the background. I know, that is not really realitic because in real life they are so far away that you really wouldn't see them moving. But, it looks a like cooler if they do move. Besides, if they don't move you often can not even tell if the ship is moving.

* HUD

I need to build another layer that is NOT a part of the "map" layer and is constantly fixed to the size of the current viewport. The HUD will contain things like the ships current status: energy, hull, speed, direction, mini map, etc...

## Sound Effects

* Main Thruster
* Rotational thrusters
* Laser Firing
* Laser striking
* Ship exploding
* Shield lowering (might be difficult)
* Shield raising (might be difficult)

### Proximity

Would be really nice to increase the decrese the volume of sound effects based on distance from player's ship.

### Volume Controls

Woud be really nice to provide volume and mute controls to the GUI

## Network Event Stream

### Why Events Exist

The game uses a client-server architecture where the server runs the authoritative physics simulation and periodically sends snapshots of the game state to clients. However, some important game events cannot be inferred from state snapshots alone:

1. **One-time visual effects**: When a ship is destroyed, the explosion particles need to be created even if the destroyed ship was never visible to a particular client (e.g., it was destroyed off-screen or before the client connected).

2. **State transitions that aren't in snapshots**: A destroyed ship simply disappears from the game state. Without an event, clients wouldn't know where or when the destruction occurred, making it impossible to show explosion effects at the correct location.

3. **Network throttling**: When network throttling is enabled, the server may skip sending snapshots for several physics ticks. Events are buffered and sent together, ensuring important one-time occurrences aren't lost.

### How It Works

The event system follows a simple flow:

**Server-side (event creation):**
1. During physics updates, the Engine detects significant events (e.g., ship destruction) and calls `recordShipDestroyed()`.
2. This creates an event object with type `ShipDestroyed` containing the ship's ID and location.
3. The event is recorded via the Engine's event recorder callback, which the Server provides.
4. Events accumulate in a `pendingEvents` array during each physics tick.
5. After each tick, pending events are flushed into an `eventBuffer`.
6. When a snapshot is emitted (respecting network throttling), the event buffer is included in the packed game state and sent to all clients.
7. The event buffer is then cleared for the next cycle.

**Client-side (event replay):**
1. The client receives the packed snapshot and unpacks it, extracting both the game state and the events array.
2. The game state is reconciled (objects are updated/created/removed).
3. Immediately after reconciliation, `replayEvents()` is called with the events array.
4. For each event, the client checks the event type and performs the appropriate local action (e.g., creating explosion particles at the specified location).

This ensures that visual effects like explosions happen at the correct time and location, even when the client never had the destroyed object in its local state.

### Current Event Types

**ShipDestroyed**
- **When created**: Triggered when a ship is destroyed by:
  - Laser impact (when hull reaches zero)
  - Collision damage (when hull reaches zero)
  - Fuel depletion (when fuel goes negative)
  - Boundary violation (when ship flies out of bounds)
- **Event data**:
  - `type`: `'ShipDestroyed'`
  - `shipId`: uint32 (the destroyed ship's ID)
  - `locationX`: float32 (X coordinate where destruction occurred)
  - `locationY`: float32 (Y coordinate where destruction occurred)
- **Client action**: Creates an explosion particle effect at the specified location using `engine.createExplosion()`.

### Adding New Event Types

To add a new event type:

1. **Define the event code** in `imports/utilities/utilities.js`:
   - Add the event name and code to `EVENT_CODES` (e.g., `NewEventType: 2`)

2. **Implement serialization** in `Utilities.writeEvent()`:
   - Add a case for the new event code
   - Write the event's data fields to the binary buffer

3. **Implement deserialization** in `Utilities.readEvent()`:
   - Add a case for the new event code
   - Read the event's data fields from the binary buffer

4. **Create the event** in the Engine:
   - Call `this.recordEvent({ type: 'NewEventType', ...data })` at the appropriate point in the physics simulation

5. **Handle the event** on the client:
   - Add a case in `Client.replayEvents()` to handle the new event type and perform the appropriate local action

### Network Throttling

- `Meteor.settings.private.messageOutputRate` is interpreted as the desired outbound snapshot interval in milliseconds. When omitted or invalid the system falls back to the physics tick interval (`1000 / frameRate`), effectively disabling throttling.
- The physics loop never slows down; instead the server buffers authoritative events and only emits packed snapshots when the throttling interval has elapsed. Each physics tick still increments `updateId`, so clients may skip ids when throttling is active.
- Outside of production you can toggle the new debug overlay (F2 or the **Debug** button) to enable/disable throttling at runtime or edit the interval without restarting the server. Runtime overrides are ephemeral and revert to the configured default when the server restarts.

### Binary Snapshot Format

- Snapshots now travel as a binary `Uint8Array` with the following header: magic number `0x53464753` (“SFGS”), uint16 schema version, uint32 `updateId`, float64 `createdAt`, uint32 object count, uint32 event count.
- Each entity is emitted with a one-byte type code (`Player`, `Human`, `Bot`, `Debris`, `Laser`, `Sound`, `Thruster`) followed by a fixed layout of primitive fields. Positions, headings, velocities, etc. are encoded as float32 values; identifiers use uint32. Player-only strings (name) and sound effect identifiers are stored as length-prefixed UTF-8 blobs (max 255 bytes).
- Events are appended after the entity list. Right now only `ShipDestroyed` exists, encoded as `[type, shipId (uint32), locationX (float32), locationY (float32)]`.
- The client receives the raw `Uint8Array`, validates the magic/version, then reconstructs plain JS objects so the rest of the engine continues to operate on the same structures as before the binary migration.

## Bot Sensor Scans

- Bot-controlled ships periodically sweep their surroundings for any observable entity within a range scaled to their size (`size / 2 * sensorRangeScale`, default 40x radius) to better match the on-screen distances where ships appear. Each contact stores positional data (distance, bearing, heading), motion (velocity), size, and ship status (hull, capacitor, shield). When the pilot’s record is known, the scan also captures the number of confirmed kills for that ship so future AI behaviors can consider an opponent’s track record.
- Scans currently run once per second per bot by default. Attack mode tightens this to 200ms to keep target bearings fresh while maneuvering, and both cadences are configurable so the rhythm can be tuned without code changes.

## Bot Modes

- Bots pick a mode every time they think based on their latest scan and current status. Detecting any human ship moves the bot into **attack** mode, where it aligns with the closest target and fires as soon as it is facing them. If no humans are detected and the capacitor is below roughly two-thirds full, the bot enters **recharge**, braking to a stop and shutting shields off to conserve energy. Once the capacitor passes that two-thirds mark with no humans around, the bot **patrols**, rotating periodically and nudging forward while there is enough capacitor to avoid dipping back under that threshold.

## Collision Handling

- Collisions between solid entities are resolved as lightly inelastic impacts to prevent “bumper car” ricochets. A restitution of `0.2` is applied to the relative velocity along the collision normal before converting the resulting vectors back into heading/velocity pairs.
- Hull damage is derived from impact energy: reduced mass is multiplied by the square of the normal-relative speed, halved, then scaled down by a constant (currently `10000` to temper lethality) to keep damage reasonable. Each participant receives damage proportional to the other object’s mass (heavier objects punish lighter ones more).
- Impact points spawn explosions sized to the larger collider. Any ship destroyed by the collision still spawns its own explosion, debris, and scoring updates as usual.
- Mass values now influence both physics and damage. Ships rely on their defined masses, debris inherits 10% of its source ship’s mass (with a minimum of 1), and lasers carry zero mass so they bypass momentum exchange while still dealing fuel-based damage through the existing laser logic.
- Debris now also carries hull integrity equal to 10% of the source ship’s maximum hull (minimum 1) so collisions and lasers can chip away at debris just like ships. Destroyed debris creates an explosion but no further debris fragments.
- Debris participates in the same collision pipeline as ships rather than being silently removed on contact, so impacts with debris exchange momentum, trigger the shared impact explosion, and can damage hull-bearing participants.

