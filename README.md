# Stereographic Maze

## About

*Stereographic Maze* is part math visualization, part puzzle game. You are navigating a maze on the surface of a sphere, but the maze is being visualized on the screen via [stereographic projection](https://wikipedia.org/wiki/Stereographic_projection)---a method for mapping the surface of a sphere onto a flat plane. Imagine a globe with a 2D plane bisecting it at the equator. If you draw a line at any downward angle from the north pole, it will pass through the surface of the sphere once, and through the equatorial plane once.  Project each point on the sphere along that line onto the equatorial plane and you've got a stereographic projection. The southern hemisphere is projected upward into to a circle in the center of the plane, and the northern hemisphere is projected outward to the entire remainder of the plane. The north pole itself is lost in the infinite distance.
    
In Stereographic Maze, our intrepid player (a dot) starts on the south pole (marked by "START"), and must find its way through a maze to the north pole (marked by "GOAL"). The corridors of the maze are along tropics (east/west lines) and meridians (north/south lines)​. As you appear to move through the maze, you are actually staying in place and rotating the entire sphere. The goal of reaching the north pole is equivalent to rotating the sphere so that the original north pole moves all the way to the south pole.

## To Play

[Play online](https://l-e-webb.github.io/stereographic_maze) or clone the repository and open `index.html` in any modern browser. (Also available on [itch.io](https://tangledwebgames.itch.io/stereographic-maze).)

*Controls:*​ arrow keys (the left and right arrow keys rotate the sphere along it's normal axis of rotation, moving you east or west. Up and down rotate the sphere along a perpendicular axis, moving your north or south)

​*Goal:* ​reach the north pole. Your goal is shown to you when you start the game, and will always be "up" towards the top of the screen as you navigate the maze.

​*Difficulty:* ​at lower difficulty, the maze is smaller (i.e. made up of fewer meridians and tropics), and there are more corridors, making it easier to navigate. At harder difficulties, the maze is larger (i.e. made up of more meridians and tropics), and there are fewer corridors. On "hard" mode, there are ​no loops​, so you cannot make any wrong turns.

​*Tip:* ​start by getting as far north (up) as possible. Try to find the equator (which will appear as a horizontal line when you are on it). From there, you will be able to see the north pole in the upper part of the screen, and you can try to determine the correct path through the northern hemisphere.

## License

Created by [Louis Webb](https://tangledwebgames.itch.io) licensed under a [Artistic License 2.0](https://opensource.org/licenses/Artistic-2.0).