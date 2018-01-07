//Stereographic Drawer

function StereographicRenderer(context) {
	this.c = context;
	this.v1 = new Vector(0,0);
	this.v2 = new Vector(0,0);
	this.v3 = new Vector(0,0);
	this.scale = 100;
	this.update();
}
StereographicRenderer.prototype = Object.create(StereographicRenderer);
StereographicRenderer.prototype.constructor = StereographicRenderer;

StereographicRenderer.prototype.update = function() {
	this.xoffset = this.c.canvas.width / 2;
	this.yoffset = this.c.canvas.height / 2;
};

StereographicRenderer.prototype.circle = function(ctheta, cphi, radius) {
	//Find two antipodal points by rotating the zenith angle by the
	//radius of the circle.  If the zenith angle becomes less than
	//0 or larger than pi, reflect it and rotate theta by pi.
	var theta1 = ctheta;
	var phi1 = cphi + radius;
	if (phi1 > Math.PI) {
		phi1 = Projection.TAU - phi1;
		theta1 += Math.PI;
	} else if (phi1 < 0) {
		phi1 *= -1;
		theta1 += Math.PI;
	}
	var theta2 = ctheta;
	var phi2 = cphi - radius;
	if (phi2 > Math.PI) {
		phi2 = Projection.TAU - phi1;
		theta2 += Math.PI;
	} else if (phi2 < 0) {
		phi2 *= -1;
		theta2 += Math.PI;
	}
	var v1 = Projection.project(theta1, phi1);
	var v2 = Projection.project(theta2, phi2);
	console.log("Antipodal points, projected:");
	console.log("(" + v1.x + ", " + v1.y + ") " +
		"(" + v2.x + ", " + v2.y);
	this.v1.set((v1.x + v2.x) / 2, (v1.y + v2.y) / 2);
	console.log("Center point:");
	console.log("(" + this.v1.x + ", " + this.v1.y + ")");
	this.planarCircle(this.v1.x, this.v1.y, this.v1.distance(v1));
};

StereographicRenderer.prototype.planarArc = function(cx, cy, x1, y1, x2, y2) {
	this.v2.set(x1 - cx, y1 - cy);
	this.v3.set(x2 - cx, y2 - cy);
	var angle1 = this.v2.toAngles();
	var angle2 = this.v3.toAngles();
	var radius = this.v2.length();

	this.c.beginPath();
	this.c.arc(this.scale * cx + this.xoffset, this.scale * cy + this.yoffset, this.scale * radius, angle1, angle2);
	this.c.stroke();
};

StereographicRenderer.prototype.planarCircle = function(cx, cy, radius) {
	this.c.beginPath();
	this.c.arc(this.scale * cx + this.xoffset, this.scale * cy + this.yoffset, this.scale * radius, 0, Projection.TAU);
	this.c.stroke();
	console.log("Drawing circle at:");
	console.log("(" + (this.scale * cx + this.xoffset) + ", " + (this.scale * cy + this.yoffset) + ")");
	console.log("with radius:");
	console.log(this.scale * radius);
};

function Vector(x, y) {
	this.x = x || 0;
	this.y = y || 0;
}

Vector.prototype = {
	negative: function() {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	},
	add: function(v) {
		if (v instanceof Vector) {
			this.x += v.x;
			this.y += v.y;
		} else {
			this.x += v;
			this.y += v;
		}
		return this;
	},
	subtract: function(v) {
		if (v instanceof Vector) {
			this.x -= v.x;
			this.y -= v.y;
		} else {
			this.x -= v;
			this.y -= v;
		}
		return this;
	},
	multiply: function(v) {
		if (v instanceof Vector) {
			this.x *= v.x;
			this.y *= v.y;
		} else {
			this.x *= v;
			this.y *= v;
		}
		return this;
	},
	divide: function(v) {
		if (v instanceof Vector) {
			if(v.x != 0) this.x /= v.x;
			if(v.y != 0) this.y /= v.y;
		} else {
			if(v != 0) {
				this.x /= v;
				this.y /= v;
			}
		}
		return this;
	},
	equals: function(v) {
		return this.x == v.x && this.y == v.y;
	},
	dot: function(v) {
		return this.x * v.x + this.y * v.y;
	},
	cross: function(v) {
		return this.x * v.y - this.y * v.x
	},
	length: function() {
		return Math.sqrt(this.dot(this));
	},
	normalize: function() {
		return this.divide(this.length());
	},
	min: function() {
		return Math.min(this.x, this.y);
	},
	max: function() {
		return Math.max(this.x, this.y);
	},
	distance: function(v) {
		var dx = this.x - v.x;
		var dy = this.y - v.y;
		return Math.sqrt(dx * dx + dy * dy);
	},
	toAngles: function() {
		return -Math.atan2(-this.y, this.x);
	},
	angleTo: function(a) {
		return Math.acos(this.dot(a) / (this.length() * a.length()));
	},
	toArray: function(n) {
		return [this.x, this.y].slice(0, n || 2);
	},
	clone: function() {
		return new Vector(this.x, this.y);
	},
	set: function(x, y) {
		this.x = x; this.y = y;
		return this;
	}
};

/* STATIC METHODS */
Vector.negative = function(v) {
	return new Vector(-v.x, -v.y);
};
Vector.add = function(a, b) {
	if (b instanceof Vector) return new Vector(a.x + b.x, a.y + b.y);
	else return new Vector(a.x + v, a.y + v);
};
Vector.subtract = function(a, b) {
	if (b instanceof Vector) return new Vector(a.x - b.x, a.y - b.y);
	else return new Vector(a.x - v, a.y - v);
};
Vector.multiply = function(a, b) {
	if (b instanceof Vector) return new Vector(a.x * b.x, a.y * b.y);
	else return new Vector(a.x * v, a.y * v);
};
Vector.divide = function(a, b) {
	if (b instanceof Vector) return new Vector(a.x / b.x, a.y / b.y);
	else return new Vector(a.x / v, a.y / v);
};
Vector.equals = function(a, b) {
	return a.x == b.x && a.y == b.y;
};
Vector.dot = function(a, b) {
	return a.x * b.x + a.y * b.y;
};
Vector.cross = function(a, b) {
	return a.x * b.y - a.y * b.x;
};

var Projection = {};
Projection.TAU = Math.PI * 2;
Projection.project = function(theta, phi) {
	if (phi == 0) {
		phi = 0.00001;
	}
	var r = Math.sin(phi) / (1 - Math.cos(phi));
	return new Vector(r * Math.sin(theta), r * Math.cos(theta));
};