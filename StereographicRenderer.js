//Renders image of circular geometry through stereographic projection.
//Requires Geometry.js

function StereographicRenderer(context) {
	this.c = context;
	this.setSkin("cyber");
	this.update();
	this.needsRedraw = true;
	this.timer = 0;
}
StereographicRenderer.prototype = Object.create(StereographicRenderer);
StereographicRenderer.prototype.constructor = StereographicRenderer;

StereographicRenderer.CENTER_DISTANCE_CAP = 10000;
StereographicRenderer.POINT_RADIUS = 2;
StereographicRenderer.POINT_RADIUS_LARGE = 4;
StereographicRenderer.GOAL_RADIUS_MIN = 0.075;
StereographicRenderer.GOAL_RADIUS_DIFF = 0.02;
StereographicRenderer.GOAL_RADIUS_PERIOD = 3;

StereographicRenderer.prototype.update = function(delta) {
	if (this.c.canvas.width != document.body.clientWidth ||
	 this.c.canvas.height != document.body.clientHeight) {
		this.c.canvas.width = document.body.clientWidth;
		this.c.canvas.height = document.body.clientHeight;
		this.xoffset = this.c.canvas.width / 2;
		this.yoffset = this.c.canvas.height / 2;
		scale = (this.c.canvas.width / 2.0);
	}
	if (delta) {
		this.timer += delta;
		this.timer = this.timer % 1000;
		this.skin.update(delta, this);
	}
	this.c.strokeStyle = this.skin.lineColor;
	this.c.fillStyle = this.skin.lineColor;
	this.updateLineWidth();
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

StereographicRenderer.prototype.pointLarge = function(point) {
	var planarPoint = point.project();
	this.planarPointLarge(planarPoint.x, planarPoint.y);
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

StereographicRenderer.prototype.planarPointLarge = function(x1, y1) {
	this.planarCircle(x1, y1, StereographicRenderer.POINT_RADIUS_LARGE / this.scale, true);
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
	if (this.skin.renderGlobe) {
		var strokeStyle = this.c.strokeStyle;
		this.c.strokeStyle = this.skin.globeStyle;
		var lineWidth = this.c.lineWidth;
		this.c.lineWidth = this.c.lineWidth * 1;
		this.renderGlobe(maze.meridians, maze.tropics + 1, rotationMatrix);
		this.c.strokeStyle = strokeStyle;
		this.c.lineWidth = lineWidth;
	}

	var center = new SphereVector();
	var point1 = new SphereVector();
	var point2 = new SphereVector();
	var point3 = new SphereVector();
	var radius;

	//Draw edges
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

	//Draw endpoints
	for (var tropic = 1; tropic < maze.nodes.length; tropic++) {
		for (var meridian = 0; meridian < maze.nodes[1].length; meridian++) {
			var node = maze.nodes[tropic][meridian];
			if (node.isReflex()) continue;
			center.set(node.position);
			center.rotate(rotationMatrix);
			this.point(center);
		}
	}
	center.set(maze.southPole.position);
	center.rotate(rotationMatrix);
	this.point(center);
	

	//Draw player and goal.
	center.set(maze.playerPosition);
	center.rotate(rotationMatrix);
	this.pointLarge(center);
	center.set(maze.northPole.position);
	center.rotate(rotationMatrix);
	this.point(center);
	var goalCircleTime = (this.timer % this.GOAL_RADIUS_PERIOD) / this.GOAL_RADIUS_PERIOD;
	goalCircleTime *= TAU;
	var goalRadius = this.GOAL_RADIUS_MIN + Math.sin(goalCircleTime) * this.GOAL_RADIUS_DIFF;
	this.circle(center, goalRadius);
};

//"Light" skin
StereographicRenderer.lightSkin = {
	"name": "light",
	"lineWidth": 3,
	"backgroundColor": "#FFF",
	"lineColor": "#000",
	"drawGlobe": false
};

StereographicRenderer.lightSkin.update = function(delta, renderer) {};

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

//"Dark" skin
StereographicRenderer.darkSkin = {
	"name": "dark",
	"lineWidth": 3,
	"backgroundColor": "#000",
	"lineColor": "#FFF",
	"drawGlobe": false
};

StereographicRenderer.darkSkin.update = function(delta, renderer) {};

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

//"Cyber" skin
StereographicRenderer.cyberSkin = {
	"name": "cyber",
	"lineWidth": 3,
	"backgroundColor": "#2f2f2f",
	"lineColor": "#0fa",
	"timer": 0,
	"timeBetweenFlashes": 4,
	"flashTime": 0.5,
	"flashStyle": "linear",
	"darkColor": "#0fa",
	"lightColor": "#e6ffdd",
	"flashing": true,
	"renderGlobe": true,
	"globeStyle": "#1f1f1f",
};

StereographicRenderer.cyberSkin.update = function(delta, renderer) {
	var skin = StereographicRenderer.cyberSkin;
	skin.timer += delta;
	if (skin.flashing && skin.timer > skin.flashTime) {
		skin.timer = 0;
		skin.flashing = false;
	}
	if (!skin.flashing && skin.timer > skin.timeBetweenFlashes) {
		skin.timer = 0;
		skin.flashing = true;
	}

	skin.lineColor = renderer.c.createRadialGradient(
		renderer.xoffset,
		renderer.yoffset,
		0,
		renderer.xoffset,
		renderer.yoffset,
		Math.max(renderer.xoffset, renderer.yoffset)
	);

	if (skin.flashing) {
		var timerPercentage = skin.timer / skin.flashTime;
		var flashPercentage;
		if (skin.flashStyle == 'sine') {
			flashPercentage = 0.1 + 0.9 * Math.sin(Math.PI * timerPercentage);
		} else {
			flashPercentage = 0.1 + 0.9 * timerPercentage;
		}
		if (flashPercentage != 0) {
			skin.lineColor.addColorStop(0, skin.darkColor)
		}
		if (flashPercentage > 0.02) {
			var innerDarkStop;
			if (timerPercentage < 0.5) {
				innerDarkStop = flashPercentage * 0.5;
			} else {
				innerDarkStop = flashPercentage - 0.01;
			}
			skin.lineColor.addColorStop(innerDarkStop, skin.darkColor);
		}
		skin.lineColor.addColorStop(flashPercentage, skin.lightColor);
		if (flashPercentage < 0.98) {
			var outerDarkStop;
			if (timerPercentage < 0.05) {
				outerDarkStop = flashPercentage + 0.01;
			} else {
				outerDarkStop = 1 - 0.5 * (1 - flashPercentage);
			}
			skin.lineColor.addColorStop(outerDarkStop, skin.darkColor);
		}
		skin.lineColor.addColorStop(1, skin.darkColor);
	} else {
		skin.lineColor.addColorStop(0, skin.darkColor);
		skin.lineColor.addColorStop(1, skin.darkColor);
	}
};

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