window.game = window.game || {}

class Enemy {

	// // keeps track of players
	// // static variables shared between each instance of this class
	// static players = [];

	constructor() {

		this.collider = null;
		this.mass = 3,
		this.speed = 3,
		this.speedMax = 30, // Enemy mass which affects other rigid bodies in the world
		this.body = null;
		// Enemy entity including mesh and rigid body
		this.model = null; 
		this.shape = null;
		//enemy.rotation = rotation;
		
	}

	create(cannon, three, position) {

		// function that creates an enemy character

		cannon.enemyPhysicsMaterial = cannon.createPhysicsMaterial(new CANNON.Material("enemyMaterial"), 0.0, 0.0);

		this.collider = new CANNON.Cylinder(10, 10, 30, 32);

		this.body = new CANNON.Body(this.mass, this.collider, cannon.enemyPhysicsMaterial);
		this.body.position.set(position.x, position.y, position.z);
		this.shape = new CANNON.Sphere(1);
		this.body.addShape(this.shape);

		//enemy.userData.model = window.game.core._three
		this.mesh = cannon.addVisual(this.body, new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 30, 32), new THREE.MeshBasicMaterial({color : 0xff0000})));

		// this.body.addEventListener("collide", function(event) {

		// } );
	}

	destroy(cannon) {
		cannon.removeVisual(this.body);
	}


	update(playerHandler) {

		// utility function to find the straight line distance between two points
		// in a 3D space
		var getStraightLineDistance = function(positionA, positionB) {
			return Math.sqrt(Math.pow((positionA.x - positionB.x), 2) + Math.pow((positionA.y - positionB.y), 2) + Math.pow((positionA.z - positionB.z), 2))
		}

		// find index of player that's closest to the enemy
		var min = 10000000;
		var minPlayerIndex = -1;
		for (var i = 0; i < playerHandler.player.length; i++) {
			var currDistance = getStraightLineDistance(this.body.position, playerHandler.player[i].body.position);
			if (currDistance < min) {
				min = currDistance;
				minPlayerIndex = i;
			}
		}
		if (playerHandler.player[minPlayerIndex] != null) {
			var closestPlayer = playerHandler.player[minPlayerIndex];
			var closestPlayerPosition = closestPlayer.body.position;
			var v = new CANNON.Vec3(closestPlayerPosition.x - this.body.position.x, 0, closestPlayerPosition.z - this.body.position.z);
			var magnitude = Math.sqrt(Math.pow(v.x,2)+Math.pow(v.y,2)+Math.pow(v.z,2));
			var direction = new CANNON.Vec3(v.x/magnitude,v.y/magnitude,v.z/magnitude);
			direction = new CANNON.Vec3(direction.x*this.speed,this.body.velocity.y,direction.z*this.speed);
			this.body.velocity.set(direction.x,this.body.velocity.y,direction.z);
		}

		// TODO: use variables above to set the path for the enemy

	};

}

window.game.enemyHandler = function() {

	var _enemyHandler = {
	
		numEnemies: 0,
		cannon: null,
		three: null,
		game: null,
		playerHandler: null,
		enemies: [],

		addEnemy: function(position) {
			var enemy = new Enemy();
			enemy.create(_enemyHandler.cannon, _enemyHandler.three, position);
			_enemyHandler.enemies.push(enemy);
			_enemyHandler.numEnemies++;

		},

		removeEnemy: function(id) {
			for (var i = 0; i < _enemyHandler.enemies.length; i++) {
				if (_enemyHandler.enemies[i] != null && _enemyHandler.enemies[i].id == id) {
					_enemyHandler.enemies[i].destroy(_enemyHandler.cannon);
					_enemyHandler.splice(i, 1);
					_enemyHandler.numEnemies--;
					break;
				}
			}
		},

		updateEnemies: function() {

			// update players (player coordinates may have changed)
			for (var i = 0; i < _enemyHandler.enemies.length; i++) {
				_enemyHandler.enemies[i].update(_enemyHandler.playerHandler);
			}
		},

		destroy: function() {

			var enemy;
			for (enemy in _enemyHandler.enemies) {
				enemy.destroy(_enemyHandler.cannon);
			}
			_enemyHandler.enemies.splice(0,_enemyHandler.enemies.length);

			_enemyHandler.numEnemies = 0;
		},

		init: function(c,t,g,ph) {
			_enemyHandler.cannon = c;
			_enemyHandler.three = t;
			_enemyHandler.game = g;
			_enemyHandler.playerHandler = ph;
		}
	}

	return _enemyHandler;
}