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
StereographicRenderer.TEXT_VERT_OFFSET = 4;
StereographicRenderer.TEXT_OSC_AMPLITUDE = 5;
StereographicRenderer.TEXT_OSC_PERIOD = 3;
StereographicRenderer.MIN_FONT_SIZE = 20;
StereographicRenderer.MAX_FONT_SIZE = 45;
StereographicRenderer.FONT_SIZE_RADIUS_COEFF = 0.25;

StereographicRenderer.prototype.update = function(delta) {
	if (this.c.canvas.width != document.body.clientWidth ||
	 this.c.canvas.height != document.body.clientHeight) {
	 	this.updateCanvas();
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

StereographicRenderer.prototype.updateCanvas = function() {
	this.c.canvas.width = document.body.clientWidth;
	this.c.canvas.height = document.body.clientHeight;
	this.xoffset = this.c.canvas.width / 2;
	this.yoffset = this.c.canvas.height / 2;
	this.scale = Math.min(this.c.canvas.width / 2.0, this.c.canvas.height / 2.0);
	this.setSkin(skin);
	this.needsRedraw = true;
}

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
	this.c.textAlign = "center";
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
	diameterEndpoint1.set(center);
	diameterEndpoint2.set(center)
	diameterEndpoint1.move(0, radius);
	diameterEndpoint2.move(0, -radius);

	var planarEndpoint1 = diameterEndpoint1.project();
	var planarEndpoint2 = diameterEndpoint2.project();
	var center = new Vector2(
		(planarEndpoint1.x + planarEndpoint2.x) / 2,
		(planarEndpoint1.y + planarEndpoint2.y) / 2
	);
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

StereographicRenderer.prototype.text = function(text, center, xoffset, yoffset) {
	var planarCenter = center.project();
	this.planarText(text, planarCenter.x, planarCenter.y, xoffset, yoffset);
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

StereographicRenderer.prototype.planarText = function(text, x, y, xoffset, yoffset) {
	this.c.fillText(text, this.scale * x + this.xoffset + xoffset, this.scale * y + this.yoffset + yoffset);
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
		//In case we want to add scaling to the line width.
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
	this.c.fillStyle = this.skin.textColor;
	this.c.strokeStyle = this.skin.textColor;

	center.set(maze.playerPosition);
	center.rotate(rotationMatrix);
	this.pointLarge(center);
	center.set(maze.northPole.position);
	center.rotate(rotationMatrix);
	this.pointLarge(center);
	/*
	Uncomment for modulating circle at goal.
	var goalCircleTime = (this.timer % this.GOAL_RADIUS_PERIOD) / this.GOAL_RADIUS_PERIOD;
	goalCircleTime *= TAU;
	var goalRadius = this.GOAL_RADIUS_MIN + Math.sin(goalCircleTime) * this.GOAL_RADIUS_DIFF;
	this.circle(center, goalRadius);*/

	//Draw text.

	//Find the radius of the northernmost tropic (for scaling purposes).
	var phiInterval = maze.phiInterval();
	point1.set(center);
	point1.move(0, phiInterval);
	point2.set(center);
	point2.move(0, -phiInterval);
	var nTropicRadius = point1.project().distance(point2.project()) * this.scale;
	//Determine text size.
	var textSize = Math.clamp(
		StereographicRenderer.FONT_SIZE_RADIUS_COEFF * nTropicRadius,
		StereographicRenderer.MIN_FONT_SIZE,
		StereographicRenderer.MAX_FONT_SIZE
	);
	this.c.font = textSize + "px " + this.skin.font;
	//Determine vertical offset.
	vertOffset = -StereographicRenderer.TEXT_VERT_OFFSET + 
		StereographicRenderer.TEXT_OSC_AMPLITUDE * Math.sin(2 * PI * this.timer / StereographicRenderer.TEXT_OSC_PERIOD);
	//Draw text.
	this.text(Maze.GOAL_TEXT, center, 0, vertOffset);
	
	//Repeat for start text.
	center.set(maze.southPole.position)
	center.rotate(rotationMatrix);
	point1.set(center);
	point1.move(0, phiInterval);
	point2.set(center);
	point2.move(0, -phiInterval);
	var sTropicRadius = point1.project().distance(point2.project()) * this.scale;
	var textSize = Math.clamp(
		StereographicRenderer.FONT_SIZE_RADIUS_COEFF * sTropicRadius,
		StereographicRenderer.MIN_FONT_SIZE,
		StereographicRenderer.MAX_FONT_SIZE
	);
	this.c.font = textSize + "px " + this.skin.font;
	vertOffset = 3 * StereographicRenderer.TEXT_VERT_OFFSET + 
		StereographicRenderer.TEXT_OSC_AMPLITUDE * Math.sin(2 * PI * this.timer / StereographicRenderer.TEXT_OSC_PERIOD);
	this.text(Maze.START_TEXT, center, 0, vertOffset);

	this.c.fillStyle = this.skin.lineColor;
	this.c.strokeColor = this.skin.lineColor;
};

//"Light" skin
StereographicRenderer.lightSkin = {
	"name": "light",
	"lineWidth": 3,
	"backgroundColor": "#FFF",
	"lineColor": "#000",
	"textColor": "#00F",
	"drawGlobe": false,
	"font": "Bubble, monospace",
	"textOscillation": 0
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
	"textColor": "#0FF",
	"drawGlobe": false,
	"font": "Bubble, monospace",
	"textOscillation": 0
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
	"backgroundColor": "#202020",
	"lineColor": "#00ffbb",
	"textColor": "#bb00ff",
	"flashTimer": 0,
	"glowTimer": 0,
	"timeBetweenFlashes": 7.5,
	"flashTime": 0.5,
	"flashStyle": "linear",
	"darkColor": "#00c0a0",
	"darkTextColor": "#a000c0",
	"glowColor": "#50ffdd",
	"glowTextColor": "#aa40ff",
	"glowPeriod": 1.5,
	"lightColor": "#e6ffdd",
	"flashing": true,
	"renderGlobe": true,
	"globeStyle": "#101010",
	"font": "Bubble, monospace"
};

StereographicRenderer.cyberSkin.update = function(delta, renderer) {
	var skin = StereographicRenderer.cyberSkin;
	skin.lineColor = renderer.c.createRadialGradient(
		renderer.xoffset,
		renderer.yoffset,
		0,
		renderer.xoffset,
		renderer.yoffset,
		Math.max(renderer.xoffset, renderer.yoffset)
	);
	
	//Handle glow:
	skin.glowTimer = (skin.glowTimer + delta) % skin.glowPeriod;
	var glowPercentage = Math.pow(Math.sin(Math.PI * skin.glowTimer / skin.glowPeriod), 2);
	//var glowPercentage = 0.5 * (1 + Math.sin(2 * Math.PI * skin.glowTimer / skin.glowPeriod));
	var darkColor = ColorUtil.blendColors(skin.darkColor, skin.glowColor, glowPercentage);
	skin.textColor = ColorUtil.blendColors(skin.darkTextColor, skin.glowTextColor, glowPercentage);

	//Handle flash
	skin.flashTimer += delta;
	if (skin.flashing && skin.flashTimer > skin.flashTime) {
		skin.flashTimer = 0;
		skin.flashing = false;
	}
	if (!skin.flashing && skin.flashTimer > skin.timeBetweenFlashes) {
		skin.flashTimer = 0;
		skin.flashing = true;
	}
	if (skin.flashing) {
		var timerPercentage = skin.flashTimer / skin.flashTime;
		var flashPercentage;
		if (skin.flashStyle == 'sine') {
			flashPercentage = 0.1 + 0.9 * Math.sin(Math.PI * timerPercentage);
		} else {
			flashPercentage = 0.1 + 0.9 * timerPercentage;
		}
		if (flashPercentage != 0) {
			skin.lineColor.addColorStop(0, darkColor);
		}
		if (flashPercentage > 0.02) {
			var innerDarkStop;
			if (timerPercentage < 0.5) {
				innerDarkStop = flashPercentage * 0.5;
			} else {
				innerDarkStop = flashPercentage - 0.01;
			}
			skin.lineColor.addColorStop(innerDarkStop, darkColor);
		}
		skin.lineColor.addColorStop(flashPercentage, skin.lightColor);
		if (flashPercentage < 0.98) {
			var outerDarkStop;
			if (timerPercentage < 0.05) {
				outerDarkStop = flashPercentage + 0.01;
			} else {
				outerDarkStop = 1 - 0.5 * (1 - flashPercentage);
			}
			skin.lineColor.addColorStop(outerDarkStop, darkColor);
		}
		skin.lineColor.addColorStop(1, darkColor);
	} else {
		skin.lineColor.addColorStop(0, darkColor);
		skin.lineColor.addColorStop(1, darkColor);
	}

	//Uncomment to make the text the same color as the lines.
	//skin.textColor = skin.lineColor;
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