//Engine that handles animation loop and controls.
var maze;

(function() {
	var MAX_FPS = 60;
	var FRAME_DURATION = 1000 / MAX_FPS;
	var CONTROL_FREE = 0;
	var CONTROL_TROPIC = 1;
	var CONTROL_MAZE = 2;
	var CONTROL_FREE_AUTO = 3;
	var CONTROL_TROPIC_AUTO = 4;
	var CONTROL_MAZE_INTRO = 5;
	var VIEW_GLOBE = 0;
	var VIEW_MAZE = 1;
	var MERIDIANS = 12;
	var TROPICS = 15;
	var SCALE = 400;
	var AUTO_CONTROL_CHANGE_TIME = 10;
	var INTRO_VIEW_EXIT_TIME = 1.3;
	//Radians per second
	var ROTATION_SPEED = PI / 6;
	var INTRO_ACCEL = PI / 3;
	var INTRO_MAX_ANGULAR_SPEED = PI;

	var lastFrameTime = 0;
	var rotationMatrix = new Matrix3();
	var controlScheme;
	var view;
	var autoControlTimer;
	var autoLeftRight;
	var autoUpDown;
	var introPhi;
	var introRotSpeed;
	var paused = false;
	var inGame = false;

	var renderer;

	var Key = {
		_pressed: {},

		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		ESC: 27,
		SPACE: 32,

		isDown: function(keyCode) {
			return this._pressed[keyCode];
		},

		onKeydown: function(event) {
			this._pressed[event.keyCode] = true;
			if (inGame) {
				if (event.keyCode == this.ESC 
					|| event.keyCode == this.SPACE) {
					paused ? unpause() : pause();
				}
				if (event.keyCode == this.UP ||
					event.keyCode == this.DOWN ||
					event.keyCode == this.LEFT ||
					event.keyCode == this.RIGHT) {
					event.preventDefault();
				}
			}
		},

		onKeyup: function(event) {
			delete this._pressed[event.keyCode];
		}
	};

	window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
	window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

	function menuScreen() {
		view = VIEW_GLOBE;
		controlScheme = CONTROL_FREE_AUTO;
		lastFrameTime = 0;
		autoControlTimer = 0;
		rotationMatrix = new Matrix3();
		autoLeftRight = 0;
		autoUpDown = 1;
		renderer.updateCanvas();
		UiController.hideAll();
		UiController.showMenu();
		paused = false;
		inGame = false;
	}

	function initializeMaze() {
		maze = new Maze(UiController.getDifficultySelection());
		rotationMatrix = new Matrix3();
		lastFrameTime = 0;
		renderer.updateCanvas();
		controlScheme = CONTROL_MAZE_INTRO;
		view = VIEW_MAZE;
		autoControlTimer = 0;
		introPhi = 0.01;
		introRotSpeed = 0;
		UiController.hideAll();
		paused = false;
		inGame = true;
	}

	function win() {
		paused = true;
		UiController.showWinBox();
	}

	function pause() {
		UiController.hideAll();
		UiController.showPauseMenu();
		paused = true;
	}

	function unpause() {
		UiController.hideAll();
		paused = false;
	}

	function initializeUiFunctions() {
		UiController.playButton.onclick = initializeMaze;
		UiController.playAgainButton.onclick = initializeMaze;
		UiController.winBoxReturnToMenuButton.onclick = menuScreen;
		UiController.pauseMenuReturnToMenuButton.onclick = menuScreen;
		UiController.continueButton.onclick = unpause;
	}

	function mainLoop(timestamp) {
		if (timestamp < lastFrameTime + FRAME_DURATION) {
			requestAnimationFrame(mainLoop);
			return;
		}

		var delta = Math.min((timestamp - lastFrameTime) / 1000, 2 * FRAME_DURATION / 1000);
		lastFrameTime = timestamp;

		if (!paused) {
			update(delta);
			draw(delta);
		}

		requestAnimationFrame(mainLoop);
	}

	function update(delta) {
		renderer.update(delta);

		if (introControlled()) {
			if (autoControlTimer < INTRO_VIEW_EXIT_TIME) {
				autoControlTimer += delta;
			} else {
				introRotSpeed = Math.min(
					introRotSpeed + INTRO_ACCEL * delta,
					INTRO_MAX_ANGULAR_SPEED
					);
				introPhi += introRotSpeed * delta;
				if (introPhi > PI) {
					controlScheme = CONTROL_MAZE;
					introPhi = PI;
				}
			}
			rotationMatrix = Matrix3.Ry(PI - introPhi);
			renderer.needsRedraw = true;
			return;
		}

		var rotation = ROTATION_SPEED * delta;
		var leftRight = 0;
		var upDown = 0;
		if (playerControlled()) {
			if (Key.isDown(Key.LEFT)) leftRight -= 1;
			if (Key.isDown(Key.RIGHT)) leftRight += 1;
			if (Key.isDown(Key.UP)) upDown += 1;
			if (Key.isDown(Key.DOWN)) upDown -= 1;
		} else if (autoControlled()) {
			autoControlTimer += delta;
			if (autoControlTimer > AUTO_CONTROL_CHANGE_TIME) {
				autoControlTimer = 0;
				updateAutoDirections();
			}
			leftRight = autoLeftRight;
			upDown = autoUpDown;
		}
		if (!leftRight && !upDown) {
			return;
		}

		renderer.needsRedraw = true;
		leftRight *= rotation;
		upDown *= rotation;

		if (controlScheme == CONTROL_MAZE) {
			maze.movePlayer(-leftRight, -upDown);
			rotationMatrix = maze.getRotationMatrix();
			if (inGame && maze.isWin()) {
				win();
			}
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
			if (controlScheme == CONTROL_FREE || controlScheme == CONTROL_FREE_AUTO) {
				rZ.multiply(rotationMatrix);
				rotationMatrix = rZ;
			} else {
				rotationMatrix.multiply(rZ);
			}
		}
	}

	function draw() {
		if (!renderer.needsRedraw) {
			return;
		}
		renderer.clear();
		if (view == VIEW_MAZE) {
			renderer.renderMaze(maze, rotationMatrix);
		} else if (view == VIEW_GLOBE) {
			renderer.renderGlobe(MERIDIANS, TROPICS, rotationMatrix);
		}
		renderer.needsRedraw = false;
	}

	function playerControlled() {
		return controlScheme == CONTROL_MAZE;
	}

	function autoControlled() {
		return controlScheme == CONTROL_FREE_AUTO || controlScheme == CONTROL_TROPIC_AUTO;
	}

	function introControlled() {
		return controlScheme == CONTROL_MAZE_INTRO;
	}

	function updateAutoDirections() {
		var autoDirection = Math.floor(Math.random() * 8);
		switch (autoDirection) {
			case 0:
				autoUpDown = 1;
				autoLeftRight = 0;
				break;
			case 1:
				autoUpDown = 1;
				autoLeftRight = 1;
				break;
			case 2:
				autoUpDown = 0;
				autoLeftRight = 1;
				break;
			case 3:
				autoUpDown = -1;
				autoLeftRight = 1;
				break;
			case 4:
				autoUpDown = -1;
				autoLeftRight = 0;
				break;
			case 5:
				autoUpDown = -1;
				autoLeftRight = -1;
				break;
			case 6:
				autoUpDown = 0;
				autoLeftRight = -1;
				break;
			case 7:
				autoUpDown = 1;
				autoLeftRight = -1;
				break;
		}
	}

	//Start:
	renderer = new StereographicRenderer(document.getElementById("canvas").getContext("2d"));
	UiController.renderer = renderer;
	UiController.init();
	initializeUiFunctions();
	menuScreen();
	UiController.updateSkin();
	requestAnimationFrame(mainLoop);
})();