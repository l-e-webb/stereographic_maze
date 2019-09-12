//Maze

function Maze(difficulty) {

	var difficultySettings;
	switch (difficulty) {
		case "easy":
			difficultySettings = Maze.EASY;
			break;
		case "medium":
			difficultySettings = Maze.MEDIUM;
			break;
		case "hard":
			difficultySettings = Maze.HARD;
			break;
	}

	this.meridians = difficultySettings.meridians;
	this.tropics = difficultySettings.tropics;
	this.northPole = new Node(0, 0);
	this.southPole = new Node(0, PI);
	this.nodes = [];

	//Create node array
	var thetaAngles =[];
	for (var i = 0; i < this.meridians; i++) {
		thetaAngles[i] = i * 2 * PI / this.meridians;
	}
	for (var i = 1; i <= this.tropics; i++) {
		var tropicPhi = i * PI / (this.tropics + 1);
		this.nodes[i] = [];
		for (var j = 0; j < this.meridians; j++) {
			this.nodes[i].push(new Node(thetaAngles[j], tropicPhi));
		}
	}

	//Add edges
	//Add north/south pole edges.
	this.edges = [];
	var northPoleEdge = new Edge(this.northPole, this.nodes[1][0]);
	this.northPole.south = northPoleEdge;
	this.nodes[1][0].north = northPoleEdge;
	this.edges.push(northPoleEdge);
	var southPoleEdge = new Edge(this.nodes[this.tropics][0], this.southPole);
	this.southPole.north = southPoleEdge;
	this.nodes[this.tropics][0].south = southPoleEdge;
	this.edges.push(southPoleEdge);
	//Add east/west edges.
	for (var i = 1; i <= this.tropics; i++) {
		for (var j = 0; j < this.meridians; j++) {
			var node1 = this.nodes[i][j];
			var node2 = this.nodes[i][(j + 1) % this.meridians];
			var edge = new Edge(node1, node2);
			node1.east = edge;
			node2.west = edge;
			this.edges.push(edge);
		}
	}
	//Add north/south edges.
	for (var j = 0; j < this.meridians; j++) {
		for (var i = 1; i < this.tropics; i++) {
			var node1 = this.nodes[i][j];
			var node2 = this.nodes[(i + 1)][j];
			var edge = new Edge(node1, node2);
			node1.south = edge;
			node2.north = edge;
			this.edges.push(edge);
		}
	}

	//Generate maze.
	this.northPole.connected = true;
	while (true) {
		var bestSoFar = null;
		for (var i = 0; i < this.edges.length; i++) {
			var edge = this.edges[i];
			if ((edge.node1.connected ^ edge.node2.connected)
				 && (!bestSoFar || bestSoFar.weight < edge.weight)) {
				bestSoFar = edge;
			}
		}
		if (bestSoFar) {
			bestSoFar.node1.connected = true;
			bestSoFar.node2.connected = true;
			bestSoFar.present = true;
		} else {
			break;
		}
	}

	//Complete equator
	if (difficultySettings.completeEquator) {
		var equatorIndex = Math.ceil(this.tropics / 2);
		for (var j = 0; j < this.meridians; j++) {
			var equatorNode = this.nodes[equatorIndex][j];
			equatorNode.east.present = true;
			equatorNode.west.present = true;
		}
	}

	var addedEdges = 0;
	while (addedEdges < difficultySettings.randomlyAddEdges) {
		var edge = this.edges[Math.floor(Math.random() * this.edges.length)];
		if (!edge.present) {
			edge.present = true;
			addedEdges++;
		}
	}

	this.playerPosition = new SphereVector(0, PI - 0.01);
	//Goal is tethered at half the phi of the northernmost tropic.
	this.goalTether = new SphereVector(PI, PI / (this.tropics + 1) / 2);
}
Maze.prototype = Object.create(Maze);
Maze.prototype.constructor = Maze;
Maze.WIN_MARGIN = 0.02;
Maze.PUSH_MARGIN= 0.05;
Maze.NORTH = 0;
Maze.EAST = 1;
Maze.SOUTH = 2;
Maze.WEST = 3;
Maze.GOAL_TEXT = "GOAL";
Maze.START_TEXT = "START";

//Get the rotation matrix associated with the player's current position.
//This matrix rotates the sphere so that the player's position is the south
//pole.
Maze.prototype.getRotationMatrix = function() {
	var rotationMatrix = Matrix3.Ry(PI - this.playerPosition.phi);
	rotationMatrix.multiply(Matrix3.Rz(-this.playerPosition.theta));
	return rotationMatrix;
};

Maze.prototype.movePlayer = function(leftRight, upDown) {
	if (leftRight == 0 || upDown == 0) {
		var nearestEdge = this.getNearestEdge(this.playerPosition);
		var nearestNode;
		var direction;
		if (nearestEdge.node1.pseudodistance(this.playerPosition) < Maze.PUSH_MARGIN) {
			nearestNode = nearestEdge.node1;
			if (nearestEdge.type == Edge.MERIDIAN) {
				direction = Maze.NORTH;
			} else {
				direction = Maze.WEST;
			}
		} else if (nearestEdge.node2.pseudodistance(this.playerPosition) < Maze.PUSH_MARGIN) {
			nearestNode = nearestEdge.node2;
			if (nearestEdge.type == Edge.MERIDIAN) {
				direction = Maze.SOUTH;
			} else {
				direction = Maze.EAST;
			}
		}

		//If we are very near a node...
		if (nearestNode) {
			//If the node is north of us, and we are trying to go east
			//or west, and that node has the appropriate edge, go north
			//towards the node.
			if (
				direction == Maze.NORTH &&
				((leftRight < 0 && nearestNode.west && nearestNode.west.present) ||
				(leftRight > 0 && nearestNode.east && nearestNode.east.present))
			) {
				upDown = -Math.abs(leftRight);
			}

			//If the node is south of us, and we are trying to go east
			//or west, and that node has the appropriate edge, go south
			//towards the node.  
			else if (
				direction == Maze.SOUTH &&
				((leftRight < 0 && nearestNode.west && nearestNode.west.present) ||
				(leftRight > 0 && nearestNode.east && nearestNode.east.present))
			) {
				upDown = Math.abs(leftRight);
			}

			//If the node is east of us, and we are trying to go north
			//or south, and that node has the appropriate edge, go east
			//towards the node.
			else if (
				direction == Maze.EAST &&
				((upDown < 0 && nearestNode.north && nearestNode.north.present) ||
				(upDown > 0 && nearestNode.south && nearestNode.south.present))
			) {
				leftRight = Math.abs(upDown);
			}

			//If the node is west of us, and we are trying to go north
			//or south, and that node has the appropriate edge, go east
			//towards the node.
			else if (
				direction == Maze.WEST &&
				((upDown < 0 && nearestNode.north && nearestNode.north.present) ||
				(upDown > 0 && nearestNode.south && nearestNode.south.present))
			) {
				leftRight = -Math.abs(upDown);
			} 
		}
	}
	leftRight *= this.getTropicRotationFactor();
	if (upDown + this.playerPosition.phi > PI ||
		upDown + this.playerPosition.phi < 0) upDown = 0;
	this.playerPosition.move(leftRight, upDown);
	this.snapToEdge();
};

Maze.prototype.snapToEdge = function(snapEdge) {
	var snapEdge = this.getNearestEdge(this.playerPosition);
	if (!snapEdge) return;
	if (snapEdge.pseudodistance(this.playerPosition) < 0.001) return;
	if (snapEdge.type == Edge.MERIDIAN) {
		this.playerPosition.set(
			snapEdge.constantAngle + 0.0001,
			Math.clamp(this.playerPosition.phi, snapEdge.lowerBound, snapEdge.upperBound)
		);
	} else if (snapEdge.type == Edge.TROPIC) {
		var theta = this.playerPosition.theta;
		if (snapEdge.crossesThetaEdge && (theta < snapEdge.lowerBound && theta > snapEdge.upperBound)
			|| !snapEdge.crossesThetaEdge && (theta < snapEdge.lowerBound || theta > snapEdge.upperBound)) {
			//Snap theta as well.
			var distanceLB = Math.modDifference(theta, snapEdge.lowerBound, TAU);
			var distanceUB = Math.modDifference(theta, snapEdge.upperBound, TAU);
			theta = distanceLB > distanceUB ? snapEdge.upperBound : snapEdge.lowerBound;
		}
		this.playerPosition.set(
			theta,
			snapEdge.constantAngle + 0.0001
		);
	}
};

Maze.prototype.getNearestEdge = function(sphereVector) {
	var nearestEdge = null;
	var bestSoFar = TAU;
	for (var i = 0; i < this.edges.length; i++) {
		var edge = this.edges[i];
		if (!edge.present) continue;
		var distance = edge.pseudodistance(sphereVector);
		if (distance < 0.001) {
			//If there is an edge with distance 0, we're on it.
			return edge;
		}
		if (distance == -1) continue;
		if (distance < bestSoFar) {
			nearestEdge = edge;
			bestSoFar = distance;
		}
	}
	return nearestEdge;
};

Maze.prototype.getNearestNode = function(sphereVector) {
	var nearestNode = null;
	var bestSoFar = TAU;
	for (var i = 1; i < this.nodes.length; i++) {
		for (var j = 0; j < this.node[i].length; j++) {
			var node = this.node[i][j];
			var distance = node.pseudodistance(sphereVector);
			if (distance < 0.001) {
				return node;
			}
			if (distance < bestSoFar) {
				bestSoFar = distance;
				nearestNode = node;
			}
		}
	}
	if (this.northPole.pseudodistance(sphereVector) < bestSoFar) {
		return this.northPole;
	}
	if (this.southPole.pseudodistance(sphereVector) < bestSoFar) {
		return this.southPole;
	}
	return nearestNode;
};

//Tropic rotation should be faster closer to the poles to maintain constant
//linear velocity on the surface where the player is.
Maze.prototype.getTropicRotationFactor = function() {
	return Math.min(1 / Math.sqrt(Math.sin(this.playerPosition.phi)), 3);
};

Maze.prototype.isWin = function() {
	return this.playerPosition.phi < Maze.WIN_MARGIN;
};

Maze.prototype.phiInterval = function() {
	return PI / (this.tropics + 1);
};

Maze.prototype.logMaze = function() {
	console.log("+");
	console.log("|");
	for (var tropic = 1; tropic < this.nodes.length; tropic++) {
		var nodesRow = this.nodes[tropic];
		var printRow1 = "";
		var printRow2 = "";
		for (var meridian = 0; meridian < nodesRow.length; meridian++) {
			var node = nodesRow[meridian];
			printRow1 += "+";
			if (node.east && node.east.present) {
				printRow1 += "--";
			} else {
				printRow1 += "  ";
			}
			if (node.south && node.south.present) {
				printRow2 += "|  ";
			} else {
				printRow2 += "   ";
			}
		}
		console.log(printRow1);
		console.log(printRow2);
	}
	console.log("+");
};

function Node(theta, phi) {
	this.position = new SphereVector(theta, phi);
	this.north = null;
	this.south = null;
	this.east = null;
	this.west = null;
	this.connected = false;
}
Node.prototype = Object.create(Node);
Node.prototype.constructor = Node;

Node.prototype.isReflex = function() {
	if (this.north && this.north.present && this.south && this.south.present &&
	 !this.east.present && !this.west.present) return true;
	if (this.east.present && this.west.present &&
	 (!this.north || !this.north.present) && (!this.south || !this.south.present)) return true;
	return false;
};

Node.prototype.pseudodistance = function(sphereVector) {
	return this.position.pseudodistance(sphereVector);
};

function Edge(node1, node2, weight) {
	this.node1 = node1;
	this.node2 = node2;
	this.lowerBound = 0;
	this.upperBound = 0;
	this.constantAngle = 0;
	this.crossesThetaEdge = false;
	this.midpoint = new SphereVector();
	if (node1.position.theta == node2.position.theta) {
		this.type = Edge.MERIDIAN;
		var phi1 = node1.position.phi;
		var phi2 = node2.position.phi;
		if (phi1 > phi2) {
			this.midpoint.set(
				node1.position.theta,
				phi2 + (phi1 - phi2) / 2
			);
			this.lowerBound = phi2;
			this.upperBound = phi1;
		} else {
			this.midpoint.set(
				node1.position.theta,
				phi1 + (phi2 - phi1) / 2
			);
			this.lowerBound = phi1;
			this.upperBound = phi2;
		}
		this.constantAngle = this.midpoint.theta;
	} else if (node1.position.phi == node2.position.phi) {
		this.type = Edge.TROPIC;
		var theta1 = node1.position.theta;
		var theta2 = node2.position.theta;
		var midpointTheta;
		if (theta1 > theta2) {
			if ((theta1 - theta2) > PI) {
				midpointTheta = (theta1 + (theta2 - theta1 + TAU) / 2) % TAU;
				this.lowerBound = theta1;
				this.upperBound = theta2;
				this.crossesThetaEdge = true;
			} else {
				midpointTheta = theta2 + (theta1 - theta2) / 2;
				this.lowerBound = theta2;
				this.upperBound = theta1;
			}
		} else {
			if ((theta2 - theta1) > PI) {
				midpointTheta = (theta2 + (theta1 - theta2 + TAU) / 2) % TAU;
				this.lowerBound = theta2;
				this.upperBound = theta1;
				this.crossesThetaEdge = true;
			} else {
				midpointTheta = theta1 + (theta2 - theta1) / 2;
				this.lowerBound = theta1;
				this.upperBound = theta2;
			}
		}
		this.midpoint.set(midpointTheta, node1.position.phi);
		this.constantAngle = this.midpoint.phi;
	} else {
		this.type = Edge.OTHER;
	}
	this.weight = weight || Math.random();
	this.present = false;
}
Edge.prototype = Object.create(Edge);
Edge.prototype.constructor = Edge;

//Not spherical distance, but rectangular distance in theta/phi parameter space.
Edge.prototype.pseudodistance = function(point) {
	var distance = 0;
	if (this.type == Edge.MERIDIAN) {
		//Add theta-distance from meridian.
		distance += Math.modDifference(point.theta, this.constantAngle, TAU);
		//If outside of meridian's phi range, add phi distance to nearest endpoint.
		if (point.phi < this.lowerBound) {
			distance += this.lowerBound - point.phi;
		} else if (point.phi > this.upperBound) {
			distance += point.phi - this.upperBound;
		}
	} else if (this.type == Edge.TROPIC) {
		//Add phi-distance from the topic.
		distance += Math.abs(point.phi - this.constantAngle);

		if (this.crossesThetaEdge && (point.theta > this.lowerBound || point.theta < this.upperBound)
			|| 
			(!this.crossesThetaEdge && point.theta > this.lowerBound && point.theta < this.upperBound)) {
			//Do nothing, the point is in the appropriate theta range.
		} else {
			//Add theta distance from point to nearest 
			distance += Math.min(
				Math.modDifference(point.theta, this.lowerBound, TAU),
				Math.modDifference(point.theta, this.upperBound, TAU)
			);
		}
	}
	return distance;
};

Edge.MERIDIAN = 0;
Edge.TROPIC = 1;
Edge.OTHER = 2;
Edge.ENDPOINT_PROXIMITY = 0.01;

Maze.EASY = {
	"meridians": 10,
	"tropics": 7,
	"completeEquator": true,
	"randomlyAddEdges": 6
};
Maze.MEDIUM = {
	"meridians": 12,
	"tropics": 13,
	"completeEquator": true,
	"randomlyAddEdges": 5
};
Maze.HARD = {
	"meridians": 16,
	"tropics": 15,
	"completeEquator": false,
	"randomlyAddEdges": 0
};