//Renders image of circular geometry through stereographic projection.
//Requires Geometry.js

function StereographicRenderer(context) {
	this.c = context;
	this.scale = 100;
	this.v1 = new Vector2();
	this.v2 = new Vector2();
	this.sv1 = new SphereVector();
	this.sv2 = new SphereVector();
	this.update();
}
StereographicRenderer.prototype = Object.create(StereographicRenderer);
StereographicRenderer.prototype.constructor = StereographicRenderer;

StereographicRenderer.prototype.update = function() {
	this.xoffset = this.c.canvas.width / 2;
	this.yoffset = this.c.canvas.height / 2;
};

StereographicRenderer.prototype.clear = function() {
	this.c.clearRect(0, 0, this.c.canvas.width, this.c.canvas.height);
};

StereographicRenderer.prototype.circle = function(center, radius) {
	this.sv1.set(center.theta, center.phi);
	//console.log("Center (sphere): " + this.sv1.toString() + ", radius: " + radius);
	this.sv1.move(0, radius);
	this.sv2.set(center.theta, center.phi);
	this.sv2.move(0, -radius);
	//console.log("Diametric points (sphere): " + this.sv1.toString() + " and " + this.sv2.toString());

	var v1 = this.sv1.project();
	var v2 = this.sv2.project();
	//console.log("Diametric points (plane): " + v1.toString() + " and " + v2.toString());
	this.v1.set((v1.x + v2.x) / 2, (v1.y + v2.y) / 2);
	//console.log("Center (plane): " + this.v1.toString());
	this.planarCircle(this.v1.x, this.v1.y, this.v1.distance(v1));
};

StereographicRenderer.prototype.planarArc = function(cx, cy, x1, y1, x2, y2) {
	this.v1.set(x1 - cx, y1 - cy);
	this.v2.set(x2 - cx, y2 - cy);
	var angle1 = this.v1.toAngles();
	var angle2 = this.v2.toAngles();
	var radius = this.v1.length();

	this.c.beginPath();
	this.c.arc(this.scale * cx + this.xoffset, this.scale * cy + this.yoffset, this.scale * radius, angle1, angle2);
	this.c.stroke();
};

StereographicRenderer.prototype.planarCircle = function(cx, cy, radius) {
	this.c.beginPath();
	this.c.arc(this.scale * cx + this.xoffset, this.scale * cy + this.yoffset, this.scale * radius, 0, TAU);
	this.c.stroke();
	//console.log("Circle at: (" + (this.scale * cx + this.xoffset) + ", " + (this.scale * cy + this.yoffset) + ") of radius " + this.scale * radius);
};