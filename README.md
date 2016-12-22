# Welcome to Space Frigate!

**Play right now at: https://www.spacefrigates.com**

Space Frigates is a simple arcade game build using the Meteor JS application,
SVG, and a home grown game engine.

Right now, the entire game is executed in the user's local browser but the plan
is to evolve the game to allow real time, multiplayer action. I plan to
implement this using Meteors server methods (web socket based) to communicate
player's actions to the central server and then back out to all the players.

**The key board controls are:**

* ENTER            Start New Ship
* SPACE_BAR        Fire Missle
* UP_ARROW, W      Move Forward
* LEFT_ARROW, A    Rotate Counter Clockwise
* RIGHT_ARROW, D   Rotate Clockwise
* DOWN_ARROW, S    Stop Ship Movement
*    -             Zoom Out
*    +             Zoom In

## Current Roadmap

- Upgrade the game to send all players commands to and from server in order to
implement multiplayer action

- Run a master code of the game engine on the server side. This is neccisary to
make the game more secure and to stay in sync

- Rebuild the game engine using PaperJs. Paper uses canvas which will greatly
enhance the performance. It also has lot of built in vector support which can
replace my own custom (slow) algorithms

- Add some actual working attributes to the ships: fuel, damage, etc.. I've had
this is the game in the past and taken out over time as I played with the code.
But the intent all along was to have a more robust ship system while retaining
simple controls.

- Add in actual player accounts so that players can track how much the have
played, how many ships they have destroyed, etc...
