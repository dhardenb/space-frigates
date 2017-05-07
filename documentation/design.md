# Design Notes

Below are a set of assocrted design notes that I wanted to keep. The goal is to understand why I did things the way I did and also understand what my thinking was for the future.

## "ZoomLevel"

I've been trying to figure out the best way to render the objects that you see in the game. It turns out to be a bit a litte more involved than you would think.

### Canvas Path Defintions

There are two issues with the path definitions worth discussing:

1. Coordinate System

Theoretically, the best way to define the paths themselves is probably to assume that the top left corner of the canvase is (0,0) and that the bottom right corner of the canvase is (1,1). All the points inbetween would then become relative, floating point numbers.

The reason for the coordinates going 0 to 1 is so that all paths are defined in a consistent way. Obviously, the rendered objects will normally be different sizes on the screen. This should be accomplished by scaling the objects as needed. But the original path should be unaware of this.

However, at this time I am breaking both rules.

I'm drawing all my paths in a way such that they are relative to each other. For example, a ship is ten points wide and everything else is relative to that. The thurster and laser graphics are relative to that ship size.

Also, because I wanted the objects to automaticly be centered, I always draw with the origin at the center of the object. For example, the ship ranges from -5 to 5 on both the X and Y axis.

2. Sizing considerations

Right now, I am sizing all the objects based on diving the viewble area of the screen by a constant (40 right now.) But that is not really the best way to go about it. What I should be doing is deciding what percentage of the screen I want the ship to fill. I mean, for the default. Users could zoom in and out from there.

So, what I tried to do is change the code such that the ship is defined from 0 to 1 and then scaled as neccisary to make it fill a certain percentage of the screen.

However, when I did that I started ti have problems. The main problem being that there are a bunch of things hard coded in the physics engine that make size assumptions. For example, missiles should start X number of "points" from the front of the ship. And that X is relative to the deault size of the ship, which I assumed to be ten "points."

### Conclusion

So when I tried to fix all this other things started breaking and I decided to revert the code back for the time being because I had other things do do that seem to be more immediate needs, like having a proper landing page of the game.
