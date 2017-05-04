# Design Notes

Below are a set of assocrted design notes that I wanted to keep. The goal is to understand why I did things the way I did and also understand what my thinking was for the future.

## ZoomLevel

I've been trying to figure out the best way to render the objects that you see in the game. It turns out to be a bit a litte more involved than you would think.

### Canvas Path Defintions

There are two issues with the path definitions worth discussing:

1. Coordinate System

Theoretically, the best way to define the paths themselves is probably to assume that the top left corner of the canvase is (0,0) and that the bottom right corner of the canvase is (1,1). All the points inbetween would then become relative, floating point numbers.

The reason for the coordinates going 0 to 1 is so that everything is so that all paths are defined in a consistent way. Obviously, the rendered objects will normally be different sizes on the screen. This should be accomplished by scaling the objects as needed. But the original path should be unaware of this.

However, at this time I am breaking both rules.

I'm drawing all my paths in a way such that they are relative to each other. For example, a ship is ten points wide and everything else is relative to that. The thruster and laser graphics are relative to that ship size.

Also,

2. Sizing considerations
