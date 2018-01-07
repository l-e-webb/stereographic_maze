//Test code

var canvas = document.getElementById("canvas");
var renderer = new StereographicRenderer(canvas.getContext("2d"));

canvas.onresize = function() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	renderer.update();
	draw();
	console.log("Resize");
};

function draw() {
	for (var i = 1; i < 6; i++) {
		renderer.circle(0, Math.PI, i * Math.PI / 6);
	}
	for (var i = 0; i < 4; i++) {
		renderer.circle(i * Math.PI / 4, Math.PI / 2, Math.PI / 2);
	}
}

renderer.update();
draw();