# Welcome to Space Frigates!

**Play right now at: www.SpaceFrigates.com**

Space Frigates is a multiplayer, real-time, browser based arcade game built using the MeteorJS application
framework, Canvas, and a home grown game engine.

**Keyboard Controls**

Button | Result
------ | ------
ENTER | Start New Ship
SPACE_BAR | Fire Missle
UP_ARROW OR W | Thrust Forward
LEFT_ARROW OR A | Thrust Counter Clockwise
RIGHT_ARROW OR D | Thrust Clockwise
DOWN_ARROW OR S | Stop Ship Movement
\- | Zoom Out
\+ | Zoom In

## Current Roadmap

- [COMPLETE] Upgrade the game to send all players commands to and from server in order to
implement multiplayer action

- [COMPLETE] Run a authoritative version of the game engine on the server side. This is necessary to
make the game more secure and to stay in sync

- [COMPLETE] Rebuild the rendering code to use Canvas

- Add a proper landing page. Should include basic features like allowing user to indicate
initials.

- Add some actual working attributes to the ships: fuel, damage, etc.. I've had
this is the game in the past and taken out over time as I played with the code.
But the intent all along was to have a more robust ship system while retaining
simple controls.

- Add in actual player accounts so that players can track how much the have
played, how many ships they have destroyed, etc...
