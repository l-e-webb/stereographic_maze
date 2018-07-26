//Renders image of circular geometry through stereographic projection.
//Requires Geometry.js

function StereographicRenderer(context) {
	this.c = context;
	this.setSkin("light");
	this.update();
	this.needsRedraw = true;
	this.timer = 0;
}
StereographicRenderer.prototype = Object.create(StereographicRenderer);
StereographicRenderer.prototype.constructor = StereographicRenderer;

StereographicRenderer.CENTER_DISTANCE_CAP = 10000;
StereographicRenderer.POINT_RADIUS = 4;
StereographicRenderer.GOAL_RADIUS_MIN = 0.075;
StereographicRenderer.GOAL_RADIUS_DIFF = 0.02;
StereographicRenderer.GOAL_RADIUS_PERIOD = 3;

StereographicRenderer.prototype.update = function(delta) {
	this.timer += delta;
	this.timer = this.timer % 1000;
	if (this.c.canvas.width != document.body.clientWidth ||
	 this.c.canvas.height != document.body.clientHeight) {
		this.c.canvas.width = document.body.clientWidth;
		this.c.canvas.height = document.body.clientHeight;
		this.xoffset = this.c.canvas.width / 2;
		this.yoffset = this.c.canvas.height / 2;
		scale = (this.c.canvas.width / 2.0);
		this.setSkin(this.skin.name);
	}
	this.needsRedraw = true;
};

StereographicRenderer.prototype.setSkin = function(skin) {
	switch (skin) {
		case "light":
			this.skin = StereographicRenderer.lightSkin;
			break;
		case "dark":
			this.skin = StereographicRenderer.darkSkin;
			break;
		case "cyber":
			this.skin = StereographicRenderer.cyberSkin;
			break;
	}
	this.c.strokeStyle = this.skin.lineColor;
	this.c.fillStyle = this.skin.lineColor;
	this.updateLineWidth();
}; 

StereographicRenderer.prototype.clear = function() {
	this.c.clearRect(0, 0, this.c.canvas.width, this.c.canvas.height);
};

StereographicRenderer.prototype.updateLineWidth = function() {
	this.c.lineWidth = Math.clamp(this.c.canvas.width / 960.0, 1, 1.5) * this.skin.lineWidth;
}

StereographicRenderer.prototype.circle = function(center, radius) {
	var diameterEndpoint1 = new SphereVector();
	var diameterEndpoint2 = new SphereVector();
	//console.log("Center (sphere): " + this.sv1.toString() + ", radius: " + radius);
	diameterEndpoint1.set(center);
	diameterEndpoint2.set(center)
	diameterEndpoint1.move(0, radius);
	diameterEndpoint2.move(0, -radius);
	//console.log("Diametric points (sphere): " + this.sv1.toString() + " and " + this.sv2.toString());

	var planarEndpoint1 = diameterEndpoint1.project();
	var planarEndpoint2 = diameterEndpoint2.project();
	//console.log("Diametric points (plane): " + v1.toString() + " and " + v2.toString());
	var center = new Vector2(
		(planarEndpoint1.x + planarEndpoint2.x) / 2,
		(planarEndpoint1.y + planarEndpoint2.y) / 2
	);
	//console.log("Center (plane): " + this.v1.toString());
	this.planarCircle(center.x, center.y, center.distance(planarEndpoint1));
};

StereographicRenderer.prototype.arc = function(center, radius, point1, point2, midpoint) {
	var diameterEndpoint1 = new SphereVector();
	var diameterEndpoint2 = new SphereVector()
	diameterEndpoint1.set(center);
	diameterEndpoint1.move(0, radius);
	diameterEndpoint2.set(center);
	diameterEndpoint2.move(0, -radius);
	var planarDEndpoint1 = diameterEndpoint1.project();
	var planarDEndpoint2 = diameterEndpoint2.project();
	var planarCenter = planarDEndpoint1.add(planarDEndpoint2).multiply(0.5);

	var arcEndpoint1 = point1.project();
	var arcEndpoint2 = point2.project();
	var arcMidpoint = midpoint.project();
	var radius = planarCenter.distance(arcEndpoint1);

	//Check to see if the three points are roughly colinear.
	var startToMidpointAngle = arcEndpoint1.angleTo(arcMidpoint);
	var midToEndAngle = arcMidpoint.angleTo(arcEndpoint2);
	var endpoint1Angle = arcEndpoint1.toAngles();
	var endpoint2Angle = arcEndpoint2.toAngles();
	if (Math.abs(startToMidpointAngle) < 0.02 && Math.abs(midToEndAngle) < 0.02) {
		//&& Math.abs(endpoint1Angle - endpoint2Angle) < PI / 2) {
		//If the three points are roughly colinear, and within a quadrant, draw
		//straight lines.
		this.planarLine(arcEndpoint1.x, arcEndpoint1.y, arcMidpoint.x, arcMidpoint.y);
		this.planarLine(arcMidpoint.x, arcMidpoint.y, arcEndpoint2.x, arcEndpoint2.y);
		return;
	}

	//Convert to local coordinates at planar center.
	arcEndpoint1.subtract(planarCenter);
	arcEndpoint2.subtract(planarCenter);
	arcMidpoint.subtract(planarCenter);
	var startAngle = arcEndpoint1.toAngles();
	var endAngle = arcEndpoint2.toAngles();
	var midpointAngle = arcMidpoint.toAngles();
	var swap;
	//Check to see which arc between the two points contains the midpoint.
	if (startAngle > endAngle) {
		if (midpointAngle > startAngle || midpointAngle < endAngle) {
			//Do nothing.
		} else {
			swap = startAngle;
			startAngle = endAngle;
			endAngle = swap;
		}
	} else {
		if (midpointAngle > endAngle || midpointAngle < startAngle) {
			swap = startAngle;
			startAngle = endAngle;
			endAngle = swap;
		} else {
			//Do nothing
		}
	}
	this.planarArc(planarCenter.x, planarCenter.y, radius, startAngle, endAngle);
};

StereographicRenderer.prototype.point = function(point) {
	var planarPoint = point.project();
	this.planarPoint(planarPoint.x, planarPoint.y);
};

StereographicRenderer.prototype.planarCircle = function(cx, cy, radius, filled) {
	this.skin.planarArc(this.c, this.scale * cx + this.xoffset, this.scale * cy + this.yoffset, this.scale * radius, 0, TAU, filled);
};

StereographicRenderer.prototype.planarArc = function(cx, cy, radius, angle1, angle2) {
	this.skin.planarArc(this.c, this.scale * cx + this.xoffset, this.scale * cy + this.yoffset, this.scale * radius, angle1, angle2, false);
};

StereographicRenderer.prototype.planarLine = function(x1, y1, x2, y2) {
	this.skin.planarLine(this.c, x1 * this.scale + this.xoffset, y1 * this.scale + this.yoffset, x2 * this.scale + this.xoffset, y2 * this.scale + this.yoffset);
};

StereographicRenderer.prototype.planarPoint = function(x1, y1) {
	this.planarCircle(x1, y1, StereographicRenderer.POINT_RADIUS / this.scale, true);
};

StereographicRenderer.prototype.renderGlobe = function(meridians, tropics, rotationMatrix) {
	var center = new SphereVector();
	for (var i = 1; i < tropics; i++) {
		center.set(0, PI);
		center.rotate(rotationMatrix);
		this.circle(center, i * PI / tropics);
	}
	for (var i = 0; i < meridians; i++) {
		center.set(i * PI / meridians, PI / 2);
		center.rotate(rotationMatrix);
		this.circle(center, PI / 2);
	}
};

StereographicRenderer.prototype.renderMaze = function(maze, rotationMatrix) {
	var center = new SphereVector();
	var point1 = new SphereVector();
	var point2 = new SphereVector();
	var point3 = new SphereVector();
	var radius;
	for (var i = 0; i < maze.edges.length; i++) {
		var edge = maze.edges[i];
		if (!edge.present) continue;
		point1.set(edge.node1.position);
		point2.set(edge.node2.position);
		point3.set(edge.midpoint);
		if (edge.type == Edge.MERIDIAN) {
			center.set(edge.node1.position.theta, PI / 2);
			center.move(PI / 2, 0);
			radius = PI / 2;
		} else if (edge.type == Edge.TROPIC) {
			center.set(0, PI);
			radius = PI - edge.node1.position.phi;
		} else {
			continue;
		}
		center.rotate(rotationMatrix);
		point1.rotate(rotationMatrix);
		point2.rotate(rotationMatrix);
		point3.rotate(rotationMatrix)
		this.arc(center, radius, point1, point2, point3);
	}
	center.set(maze.playerPosition);
	center.rotate(rotationMatrix);
	this.point(center);
	center.set(0, 0);
	center.rotate(rotationMatrix);
	this.point(center);
	var goalCircleTime = (this.timer % this.GOAL_RADIUS_PERIOD) / this.GOAL_RADIUS_PERIOD;
	goalCircleTime *= TAU;
	var goalRadius = this.GOAL_RADIUS_MIN + Math.sin(goalCircleTime) * this.GOAL_RADIUS_DIFF;
	this.circle(center, goalRadius);
};

StereographicRenderer.lightSkin = {};
StereographicRenderer.lightSkin.name = "light";
StereographicRenderer.lightSkin.lineWidth = 3;
StereographicRenderer.lightSkin.backgroundColor = "#FFF";
StereographicRenderer.lightSkin.lineColor = "#000";
StereographicRenderer.lightSkin.planarArc = function(c, cx, cy, radius, angle1, angle2, filled) {
	c.beginPath();
	c.arc(cx, cy, radius, angle1, angle2);
	c.stroke();
	if (filled) c.fill();
};

StereographicRenderer.lightSkin.planarLine = function(c, x1, y1, x2, y2) {
	c.beginPath();
	c.moveTo(x1, y1);
	c.lineTo(x2, y2);
	c.stroke();
};

StereographicRenderer.darkSkin = {};
StereographicRenderer.darkSkin.name = "dark";
StereographicRenderer.darkSkin.lineWidth = 3;
StereographicRenderer.darkSkin.backgroundColor = "#000";
StereographicRenderer.darkSkin.lineColor = "#FFF";
StereographicRenderer.darkSkin.planarArc = function(c, cx, cy, radius, angle1, angle2, filled) {
	c.beginPath();
	c.arc(cx, cy, radius, angle1, angle2);
	c.stroke();
	if (filled) c.fill();
};

StereographicRenderer.darkSkin.planarLine = function(c, x1, y1, x2, y2) {
	c.beginPath();
	c.moveTo(x1, y1);
	c.lineTo(x2, y2);
	c.stroke();
};

StereographicRenderer.cyberSkin = {};
StereographicRenderer.cyberSkin.name = "cyber";
StereographicRenderer.cyberSkin.lineWidth = 3;
StereographicRenderer.cyberSkin.backgroundColor = "#000";
StereographicRenderer.cyberSkin.lineColor = "#0FF";
StereographicRenderer.cyberSkin.planarArc = function(c, cx, cy, radius, angle1, angle2, filled) {
	c.beginPath();
	c.arc(cx, cy, radius, angle1, angle2);
	c.stroke();
	if (filled) c.fill();
};

StereographicRenderer.cyberSkin.planarLine = function(c, x1, y1, x2, y2) {
	c.beginPath();
	c.moveTo(x1, y1);
	c.lineTo(x2, y2);
	c.stroke();
};