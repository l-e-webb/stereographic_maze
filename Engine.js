//Engine that handles animation loop and controls.
(function() {
	var MAX_FPS = 60;
	var FRAME_DURATION = 1000 / MAX_FPS;

	//Radians per second
	var ROTATION_SPEED = PI / 4;

	var canvas = document.getElementById("canvas");
	var renderer = new StereographicRenderer(canvas.getContext("2d"));
	var lastFrameTime = 0;
	var needsRedraw = true;
	var rotationMatrix = new Matrix3();

	var Key = {
		_pressed: {},

		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,

		isDown: function(keyCode) {
			return this._pressed[keyCode];
		},

		onKeydown: function(event) {
			this._pressed[event.keyCode] = true;
		},

		onKeyup: function(event) {
			delete this._pressed[event.keyCode];
		}
	};

	window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
	window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

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
		var zRot = 0;
		var yRot = 0;
		var rotation = ROTATION_SPEED * delta;
		if (Key.isDown(Key.LEFT) && !Key.isDown(Key.RIGHT)) {
			zRot = rotation;
		}
		if (Key.isDown(Key.RIGHT) && !Key.isDown(Key.LEFT)) {
			zRot = -rotation;
		}
		if (Key.isDown(Key.UP) && !Key.isDown(Key.DOWN)) {
			yRot = rotation;
		}
		if (Key.isDown(Key.DOWN) && !Key.isDown(Key.UP)) {
			yRot = -rotation;
		}
		if (yRot) {
			var rY = Matrix3.Ry(yRot);
			//Left multiply existing rotation matric by rX.
			rY.multiply(rotationMatrix);
			rotationMatrix = rY;
			needsRedraw = true;
		}
		if (zRot) {
			var rZ = Matrix3.Rz(zRot);
			rZ.multiply(rotationMatrix);
			rotationMatrix = rZ;
			needsRedraw = true;
		}
	}

	function draw() {
		if (!needsRedraw) {
			return;
		}

		renderer.clear();

		var center = new SphereVector();
		for (var i = 1; i < 8; i++) {
			center.set(0, PI);
			center.rotate(rotationMatrix);
			renderer.circle(center, i * PI / 8);
		}
		for (var i = 0; i < 8; i++) {
			center.set(i * PI / 8, PI / 2);
			center.rotate(rotationMatrix);
			renderer.circle(center, PI / 2);
		}
		needsRedraw = false;
	}

	//Start:
	requestAnimationFrame(mainLoop);
})();