# Welcome to Space Frigates!

**Play right now at: www.SpaceFrigates.com**

Space Frigates is a multiplayer, real-time, browser based arcade game built using the MeteorJS application
framework, Canvas, and a home grown game engine.

**Keyboard Controls**

Button | Result
------ | ------
ENTER | Start New Ship
SPACE_BAR | Fire Laser
ALT | Toggle Shields
UP_ARROW OR W | Thrust Forward
LEFT_ARROW OR A | Thrust Counter Clockwise
RIGHT_ARROW OR D | Thrust Clockwise
DOWN_ARROW OR S | Stop Ship (Auto Brake or Retro Thrust depending on mode)
Z | Toggle Auto-Pilot Mode

## Debug & Networking Tools

- Set `Meteor.settings.private.messageOutputRate` (milliseconds) to control how often the server ships packed snapshots. If the value is missing or invalid the server falls back to the physics tick interval derived from `frameRate`.
- While running outside production you can press `F2` or use the on-screen **Debug** button to reveal the debug overlay. The overlay shows the local FPS, latest server update id, and provides on/off controls for runtime snapshot throttling. Runtime tweaks are in-memory and revert on server restart.
- Game-state snapshots now stream over a binary `Uint8Array` payload. Each entity is stored with a fixed-size layout (float32/int32) and decoded client-side, reducing per-tick bandwidth by roughly 2–4× compared with the previous JSON array serialization.
