
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
		this.mixer = null;
		//enemy.rotation = rotation;
		
	}

	create(cannon, three, pos, gltfFilePath) {
		// function that creates an enemy character
		var loader = new THREE.GLTFLoader();

	    this.shape = new CANNON.Box(new CANNON.Vec3(1,1,1));

	    var self = this;
	    loader.load(gltfFilePath, function(gltf) {

    	gltf.scene.scale.set(0.5,0.5,0.5)

		self.model = gltf.scene; 

		self.mixer = new THREE.AnimationMixer(self.model);
		var clip1 = gltf.animations[15];
		var action1 = self.mixer.clipAction(clip1);
		action1.play();
			// self.model.setScale(0.2, 0.2, 0.2);

			//this.model = modelTemp;

			//      this.shape = modelTemp;

		self.body = new cannon.createBody({
			shape: self.shape, 
			mesh: self.model,
			material: cannon.enemyPhysicsMaterial,
			meshMaterial: new THREE.MeshLambertMaterial({color : 0xff0000}),
			position: {
				x: pos.x,
				y: pos.y,
				z: pos.z
			},
			castShadow: true,
			collisionGroup: cannon.collisionGroup.enemy,
			collisionFilter: cannon.collisionGroup.player | cannon.collisionGroup.solids | cannon.collisionGroup.enemy | cannon.collisionGroup.projectile
		});

			//enemy.userData.model = window.game.core._three
		self.mesh = cannon.getMeshFromBody(self.body);

	    })

		// this.body.addEventListener("collide", function(event) {

		// } );
	}

	takeDamage(damage) {
		this.health -= damage;
	}

	destroy(cannon) {
		cannon.removeVisual(this.body);
	}


	update(playerHandler, dt) {

		if (this.mixer != null)
			this.mixer.update(dt);

		// utility function to find the straight line distance between two points
		// in a 3D space
		var getStraightLineDistance = function(positionA, positionB) {
			return Math.sqrt(Math.pow((positionA.x - positionB.x), 2) + Math.pow((positionA.y - positionB.y), 2) + Math.pow((positionA.z - positionB.z), 2))
		}

		if (this.position != null) {
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

		}

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

			var filePath = "models/zombieee.gltf";
			enemy.create(_enemyHandler.cannon, _enemyHandler.three, position, filePath);
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

		updateEnemies: function(dt) {

			// update players (player coordinates may have changed)
			for (var i = 0; i < _enemyHandler.enemies.length; i++) {
				_enemyHandler.enemies[i].update(_enemyHandler.playerHandler, dt);
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

