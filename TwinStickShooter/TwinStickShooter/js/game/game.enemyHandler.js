window.game = window.game || {}

class Enemy {

	// // keeps track of players
	// // static variables shared between each instance of this class
	// static players = [];

	constructor(players) {

		this.enemy = new THREE.Object3D();

		this.enemy.userData = {
			mass : 3,
			acceleration : 1,
			speedMax : 30, // Enemy mass which affects other rigid bodies in the world
		}
		
		// Enemy entity including mesh and rigid body
		this.model = null; 

		// reference to controllable players 
		this.players = players;
			
		//enemy.rotation = rotation;
		
	};

	create(cannon, three, position) {

		// function that creates an enemy character

		cannon.enemyPhysicsMaterial = cannon.createPhysicsMaterial(new CANNON.Material("enemyMaterial"), 0.0, 0.0);

		enemy.collider = new CANNON.Cylinder(10, 10, 30, 32);

		enemy.rigidBody = new CANNON.RigidBody(enemy.mass, enemy.collider, window.game.core._cannon.enemyPhysicsMaterial);
		enemy.rigidBody.position.set(position.x, position.y, position.z);

		//enemy.userData.model = window.game.core._three
		enemy.mesh = cannon.addVisual(enemy.rigidBody, null, new THREE.mesh(new THREE.CylinderGeometry(10, 10, 30, 32), new THREE.MeshBasicMaterial({color : 0xff0000})));

		enemy.rigidBody.addEventListener("collide", function(event) {

		} );
	}

	destroy(cannon) {
		cannon.removeVisual(this.rigidBody);
		this.enemy = null;
	}


	update() {

		// utility function to find the straight line distance between two points
		// in a 3D space
		var getStraightLineDistance = function(positionA, positionB) {
			return Math.sqrt(Math.pow((positionA.x - positionB.x), 2) + Math.pow((positionA.y - positionB.y), 2) + Math.pow((positionA.z - positionB.z), 2))
		}

		// find index of player that's closest to the enemy
		var min = 10000000;
		var minPlayerIndex = -1;
		for (var i = 0; i < this.players.length; i++) {
			var currDistance = getStraightLineDistance(this.enemy.rigidBody.position, this.players[i].rigidBody.position);
			if (currDistance < min) {
				min = currDistance;
				minPlayerIndex = i;
			}
		}
  
		var closestPlayer = this.players[minPlayerIndex];
		var closestPlayerPosition = closestPlayer.rigidBody.position;

		// TODO: use variables above to set the path for the enemy

	};

}

window.game.enemyHandler = function() {

	var _enemyHandler = {
	
		numEnemies: 0,
		cannon: null,
		three: null,
		game: null,
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

		updateEnemies: function(players) {

			// update players (player coordinates may have changed)
			this.players = players;

			for (var i = 0; i < _enemyHandler.enemies.length; i++) {
				_enemyHandler.enemies[i].update();
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

		init: function(c,t,g,ch) {
			_enemyHandler.cannon = c;
			_enemyHandler.three = t;
			_enemyHandler.game = g;
			_enemyHandler.controllerHandler = ch;
		}
	}

	return _enemyHandler;
}