window.game = window.game || {}

class Enemy {

	// // keeps track of players
	// // static variables shared between each instance of this class
	// static players = [];

	constructor(i) {

		this.mass = 3,
		this.speed = 1,
		this.speedMax = 30, // Enemy mass which affects other rigid bodies in the world
		this.body = null;
		// Enemy entity including mesh and rigid body
		this.model = null; 
		this.shape = null;
		this.index = i;
		this.health = 10;
		//enemy.rotation = rotation;
		
	}

	create(cannon, three, pos) {
		// function that creates an enemy character
		this.shape = new CANNON.Cylinder(1, 1, 3, 32);
		//this.model = new THREE.CylinderGeometry(1, 1, 3, 32);
		this.body = new cannon.createBody({
			mass: this.mass, 
			shape: this.shape, 
			material: cannon.enemyPhysicsMaterial,
			meshMaterial: new THREE.MeshLambertMaterial({color : 0xff0000}),
			position: {
				x: pos.x,
				y: pos.y,
				z: pos.z
			},
			//geometry: this.model
			castShadow: true,
			collisionGroup: cannon.collisionGroup.enemy,
			collisionFilter: cannon.collisionGroup.player | cannon.collisionGroup.solids | cannon.collisionGroup.projectile
		});
		
		//enemy.userData.model = window.game.core._three
		this.mesh = cannon.getMeshFromBody(this.body);

		// this.body.addEventListener("collide", function(event) {

		// } );
	}

	takeDamage(damage) {
		this.health -= damage;
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
			var enemy = new Enemy(_enemyHandler.numEnemies);
			enemy.create(_enemyHandler.cannon, _enemyHandler.three, position);
			_enemyHandler.enemies.push(enemy);
			_enemyHandler.numEnemies++;

		},

		removeEnemy: function(enemy) {
			for (var i = 0; i < _enemyHandler.enemies.length; i++) {
				if (_enemyHandler.enemies[i].index == enemy.index) {
					_enemyHandler.enemies[i].destroy(_enemyHandler.cannon);
					_enemyHandler.enemies.splice(i, 1);
					_enemyHandler.numEnemies--;
					return;
				}
			}
		},

		updateEnemies: function() {

			// update players (player coordinates may have changed)
			for (var i = 0; i < _enemyHandler.enemies.length; i++) {
				_enemyHandler.enemies[i].update(_enemyHandler.playerHandler);
				if (_enemyHandler.enemies[i].health <= 0) {
					_enemyHandler.removeEnemy(_enemyHandler.enemies[i]);
				}
			}
		},

		getEnemyFromBody: function(body) {
			for (var i = 0; i < _enemyHandler.enemies.length; i++) {
				if (_enemyHandler.enemies[i].body == body) {
					return _enemyHandler.enemies[i];
				}
			}
			return null;
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