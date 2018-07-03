//Engine that handles animation loop and controls.
var maze;

(function() {
	var MAX_FPS = 60;
	var FRAME_DURATION = 1000 / MAX_FPS;
	var CONTROL_FREE = 0;
	var CONTROL_TROPIC = 1;
	var CONTROL_MAZE = 2;
	var VIEW_GLOBE = 0;
	var VIEW_MAZE = 1;
	var MERIDIANS = 18;
	var TROPICS = 15;
	var LINE_WIDTH = 3;
	var SCALE = 400;

	//Radians per second
	var ROTATION_SPEED = PI / 8;

	var canvas = document.getElementById("canvas");
	var renderer = new StereographicRenderer(canvas.getContext("2d"));
	var lastFrameTime = 0;
	var needsRedraw = true;
	var rotationMatrix = new Matrix3();
	var controlScheme = CONTROL_MAZE;
	var view = VIEW_MAZE;

	//var maze;

	var Key = {
		_pressed: {},

		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		R: 82,

		isDown: function(keyCode) {
			return this._pressed[keyCode];
		},

		onKeydown: function(event) {
			this._pressed[event.keyCode] = true;
			if (event.keyCode == this.R) {
				rotationMatrix = new Matrix3();
				needsRedraw = true;
				console.log("Resetting");
			}
		},

		onKeyup: function(event) {
			delete this._pressed[event.keyCode];
		}
	};

	window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
	window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

	function initialize() {
		maze = new Maze(MERIDIANS, TROPICS);
		maze.logMaze();
		rotationMatrix = new Matrix3();
		lastFrameTime = 0;
		needsRedraw = true;
		renderer.c.lineWidth = LINE_WIDTH;
		renderer.scale = SCALE;
	}

	function mainLoop(timestamp) {
		if (timestamp < lastFrameTime + FRAME_DURATION) {
			requestAnimationFrame(mainLoop);
			return;
		}

		var delta = (timestamp - lastFrameTime) / 1000;
		lastFrameTime = timestamp;
		update(delta);
		draw(delta);

		requestAnimationFrame(mainLoop);
	}

	function update(delta) {
		renderer.update();
		var rotation = ROTATION_SPEED * delta;
		var leftRight = 0;
		var upDown = 0;
		if (Key.isDown(Key.LEFT)) leftRight += 1;
		if (Key.isDown(Key.RIGHT)) leftRight -= 1;
		if (Key.isDown(Key.UP)) upDown -= 1;
		if (Key.isDown(Key.DOWN)) upDown += 1;
		if (!leftRight && !upDown) {
			return;
		}

		needsRedraw = true;
		leftRight *= rotation;
		upDown *= rotation;

		if (controlScheme == CONTROL_MAZE) {
			maze.movePlayer(-leftRight, -upDown);
			rotationMatrix = maze.getRotationMatrix();
			return;
		}

		if (upDown) {
			var rY = Matrix3.Ry(upDown);
			//Left multiply existing rotation matric by rY.
			rY.multiply(rotationMatrix);
			rotationMatrix = rY;
		}
		if (leftRight) {
			var rZ = Matrix3.Rz(leftRight);
			if (controlScheme == CONTROL_FREE) {
				rZ.multiply(rotationMatrix);
				rotationMatrix = rZ;
			} else {
				rotationMatrix.multiply(rZ);
			}
		}
	}

	function draw() {
		if (!needsRedraw) {
			return;
		}
		renderer.clear();
		if (view = VIEW_MAZE) {
			renderer.renderMaze(maze, rotationMatrix);
		} else if (view = VIEW_GLOBE) {
			renderer.renderGlobe(MERIDIANS, TROPICS);
		}
		needsRedraw = false;
	}

	//Start:
	initialize();
	requestAnimationFrame(mainLoop);
})();