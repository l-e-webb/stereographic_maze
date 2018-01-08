//Javascript backage for underlying geometry.

var PI = Math.PI;
var TAU = PI * 2;

function Vector2(x, y) {
	this.x = x || 0;
	this.y = y || 0;
}

Vector2.prototype = {
	negative: function() {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	},
	add: function(v) {
		if (v instanceof Vector2) {
			this.x += v.x;
			this.y += v.y;
		} else {
			this.x += v;
			this.y += v;
		}
		return this;
	},
	subtract: function(v) {
		if (v instanceof Vector2) {
			this.x -= v.x;
			this.y -= v.y;
		} else {
			this.x -= v;
			this.y -= v;
		}
		return this;
	},
	multiply: function(v) {
		if (v instanceof Vector2) {
			this.x *= v.x;
			this.y *= v.y;
		} else {
			this.x *= v;
			this.y *= v;
		}
		return this;
	},
	divide: function(v) {
		if (v instanceof Vector2) {
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
		return new Vector2(this.x, this.y);
	},
	set: function(x, y) {
		this.x = x; this.y = y;
		return this;
	},
	toString: function() {
		return "(" + this.x + ", " + this.y + ")";
	}
};

Vector2.prototype.constructor = Vector2;

/* STATIC METHODS */
Vector2.negative = function(v) {
	return new Vector2(-v.x, -v.y);
};
Vector2.add = function(a, b) {
	if (b instanceof Vector2) return new Vector2(a.x + b.x, a.y + b.y);
	else return new Vector2(a.x + v, a.y + v);
};
Vector2.subtract = function(a, b) {
	if (b instanceof Vector2) return new Vector2(a.x - b.x, a.y - b.y);
	else return new Vector2(a.x - v, a.y - v);
};
Vector2.multiply = function(a, b) {
	if (b instanceof Vector2) return new Vector2(a.x * b.x, a.y * b.y);
	else return new Vector2(a.x * v, a.y * v);
};
Vector2.divide = function(a, b) {
	if (b instanceof Vector2) return new Vector2(a.x / b.x, a.y / b.y);
	else return new Vector2(a.x / v, a.y / v);
};
Vector2.equals = function(a, b) {
	return a.x == b.x && a.y == b.y;
};
Vector2.dot = function(a, b) {
	return a.x * b.x + a.y * b.y;
};
Vector2.cross = function(a, b) {
	return a.x * b.y - a.y * b.x;
};

function SphereVector(theta, phi) {
	this.theta = theta || 0;
	this.phi = phi || 0;
}

SphereVector.prototype = {
	add: function(sv) {
		if (sv instanceof SphereVector) {
			this.move(sv.theta, sv.phi);
		}
	},
	move: function(thetaR, phiR) {
		this.theta += thetaR;
		this.phi += phiR;
		if (this.phi < 0) {
			this.phi *= -1;
			this.theta += PI;
		} else if (this.phi > PI) {
			this.phi = TAU - this.phi;
			this.theta += PI;
		}
		this.theta = this.theta % TAU;
	},
	rotate: function(m) {
		var rotatedV3 = m.vectorMultiply(this.vector3());
		this.set(Math.atan2(rotatedV3[1], rotatedV3[0]), Math.acos(rotatedV3[2]));
	},
	vector3: function() {
		return [
			Math.cos(this.theta) * Math.sin(this.phi),
			Math.sin(this.theta) * Math.sin(this.phi),
			Math.cos(this.phi)
		];
	},
	project: function() {
		//Small phi values cause problemos.
		var phi = Math.max(0.00001, this.phi);
		var r = Math.sin(phi) / (1 - Math.cos(phi));
		//console.log("Projecting " + this.toString() + " to (" + r + ", " + this.theta + ")");
		return new Vector2(r * Math.sin(this.theta), r * Math.cos(this.theta));
	},
	set: function(theta, phi) {
		this.theta = theta;
		this.phi = phi;
	},
	toString: function() {
		return "(" + this.theta + ", " + this.phi + ")";
	}
};

SphereVector.prototype.constructor = SphereVector;

function Matrix3(row1, row2, row3) {
	this[0] = row1 || [1, 0, 0];
	this[1] = row2 || [0, 1, 0];
	this[2] = row3 || [0, 0, 1];
};
Matrix3.prototype = Object.create(Matrix3);
Matrix3.prototype.constructor = Matrix3;

Matrix3.prototype.multiply = function(m) {
	var row1 = [
		this[0][0] * m[0][0] + this[0][1] * m[1][0] + this[0][2] * m[2][0],
		this[0][0] * m[0][1] + this[0][1] * m[1][1] + this[0][2] * m[2][1],
		this[0][0] * m[0][2] + this[0][1] * m[1][2] + this[0][2] * m[2][2]
	];
	var row2 = [
		this[1][0] * m[0][0] + this[1][1] * m[1][0] + this[1][2] * m[2][0],
		this[1][0] * m[0][1] + this[1][1] * m[1][1] + this[1][2] * m[2][1],
		this[1][0] * m[0][2] + this[1][1] * m[1][2] + this[1][2] * m[2][2]
	];
	var row3 = [
		this[2][0] * m[0][0] + this[2][1] * m[1][0] + this[2][2] * m[2][0],
		this[2][0] * m[0][1] + this[2][1] * m[1][1] + this[2][2] * m[2][1],
		this[2][0] * m[0][2] + this[2][1] * m[1][2] + this[2][2] * m[2][2]
	];
	this[0] = row1;
	this[1] = row2;
	this[2] = row3;
};

Matrix3.prototype.vectorMultiply = function(v) {
	return [
		this[0][0] * v[0] + this[0][1] * v[1] + this[0][2] * v[2],
		this[1][0] * v[0] + this[1][1] * v[1] + this[1][2] * v[2],
		this[2][0] * v[0] + this[2][1] * v[1] + this[2][2] * v[2]
	];
};

Matrix3.Rx = function(theta) {
	var sin = Math.sin(theta);
	var cos = Math.cos(theta);
	var row1 = [1, 0, 0];
	var row2 = [0, cos, -sin];
	var row3 = [0, sin, cos];
	return new Matrix3(row1, row2, row3);
};

Matrix3.Ry = function(theta) {
	var sin = Math.sin(theta);
	var cos = Math.cos(theta);
	var row1 = [cos, 0, sin];
	var row2 = [0, 1, 0];
	var row3 = [-sin, 0, cos];
	return new Matrix3(row1, row2, row3);
};

Matrix3.Rz = function(theta) {
	var sin = Math.sin(theta);
	var cos = Math.cos(theta);
	var row1 = [cos, -sin, 0];
	var row2 = [sin, cos, 0];
	var row3 = [0, 0, 1];
	return new Matrix3(row1, row2, row3);
};
