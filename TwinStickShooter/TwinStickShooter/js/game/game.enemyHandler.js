
window.game = window.game || {}

// enum of enemy animations
// maps keys to indices
var enemyAnimation = {
	ATTACK1_L : 0,
	ATTACK1_R : 1,
	ATTACK2 : 2,
	ATTACK3 : 3,
	DEAD1 : 4,
	DEAD2 : 5,
	DEAD3 : 6,
	ENTER : 7,
	HURT1 : 8,
	HURT2 : 9,
	HURT_HEAD : 10,
	HURT_L : 11,
	HURT_R : 12,
	IDLE : 13,
	RUN : 14,
	WALK : 15
}

var enemyState = {
	IDLE : 0,
	WALK : 1,

}

class Enemy {

	// // keeps track of players
	// // static variables shared between each instance of this class
	// static players = [];

	constructor(i) {

		this.mass = 3,
		this.speed = 1,
		this.speedMax = 30, // Enemy mass which affects other rigid bodies in the world
		this.lastAngle = null;
		this.body = null;
		// Enemy entity including mesh and rigid body
		this.model = null; 
		this.shape = null;
		this.index = i;
		this.health = 10;
		this.mixer = null;

		this.hasLoaded = false;
		this.state = null;

		this.currentAnimation = null;
		this.currentAction = null;
		this.animations = [];
		//enemy.rotation = rotation;
		
	}

	create(cannon, three, pos, gltfFilePath) {
		// function that creates an enemy character
		var loader = new THREE.GLTFLoader();

	    this.shape = new CANNON.Box(new CANNON.Vec3(0.75,2,0.75));

	    var self = this;
	    loader.load(gltfFilePath, 
	    	function(gltf) {

	    	gltf.scene.scale.set(0.5,0.5,0.5);

			self.model = gltf.scene; 
			gltf.scene.traverse( function( node ) {

        		if ( node instanceof THREE.Mesh ) { 
        			node.castShadow = true; 
        			node.receiveShadow = true;
        			self.model = node.parent;
        			self.model.scale.set(2,2,2);
        		}

   			 });

			// set mixer for animations and load animationa
			self.mixer = new THREE.AnimationMixer(self.model);

			for (var i = 0; i < gltf.animations.length; i++)
				self.animations.push(gltf.animations[i]);

			// using animations example
			self.switchCurrentAnimation(enemyAnimation.ENTER , true);
			//self.playCurrentAnimation();
			self.mixer.addEventListener( 'finished', function( e ) { 
				if (self.currentAnimation == self.animations[enemyAnimation.ENTER]) {
					self.switchCurrentAnimation(enemyAnimation.IDLE);
				} else self.currentAnimation = null;
			})
			self.body = new cannon.createBody({
				mass: self.mass,
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
				offset: new CANNON.Vec3(0,+2,0), //corrective offset for the model
				collisionGroup: cannon.collisionGroup.enemy,
				collisionFilter: cannon.collisionGroup.player | cannon.collisionGroup.solids | cannon.collisionGroup.enemy | cannon.collisionGroup.projectile
			});

			self.hasLoaded = true;

			self.mesh = cannon.getMeshFromBody(self.body);

	    	},function ( xhr ) {

				console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

			},function ( error ) {

				console.log( 'An error happened' );

			}
		);

		// this.body.addEventListener("collide", function(event) {

		// } );
	}

	switchCurrentAnimation(animationEnumKey, once) {
		if (this.currentAnimation != this.animations[animationEnumKey]) {
			if (this.currentAnimation != null) this.stopCurrentAnimation();
			this.currentAnimation = this.animations[animationEnumKey];
			if (once)
				this.playCurrentAnimationOnce();
			else this.playCurrentAnimation();
		}
	}

	playCurrentAnimation() {
		this.currentAction = this.mixer.clipAction(this.currentAnimation);
		this.currentAction.play();
	}

	playCurrentAnimationOnce() {
		this.currentAction = this.mixer.clipAction(this.currentAnimation);
		this.currentAction.loop = THREE.LoopOnce;
		this.currentAction.enabled = true;
		this.currentAction.clampWhenFinished = false;
		this.currentAction.play().reset();
	}

	stopCurrentAnimation() {
		this.currentAction.stop();
	}

	takeDamage(damage) {
		this.health -= damage;
		this.switchCurrentAnimation(enemyAnimation.HURT1, true);
	}

	destroy(cannon) {
		cannon.removeVisual(this.body);
	}


	update(playerHandler, dt) {

		if (this.hasLoaded) {
		
			if (this.mixer != null)
				this.mixer.update(dt);
			// utility function to find the straight line distance between two points
			// in a 3D space
			var getStraightLineDistance = function(positionA, positionB) {
				return Math.sqrt(Math.pow((positionA.x - positionB.x), 2) + Math.pow((positionA.y - positionB.y), 2) + Math.pow((positionA.z - positionB.z), 2))
			}

			//if (this.body != null && this.body.position != null) {
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
				if (this.currentAnimation != this.animations[enemyAnimation.HURT1]) {
					var closestPlayer = playerHandler.player[minPlayerIndex];
					var closestPlayerPosition = closestPlayer.body.position;
					var v = new CANNON.Vec3(closestPlayerPosition.x - this.body.position.x, 0, closestPlayerPosition.z - this.body.position.z);
					var magnitude = Math.sqrt(Math.pow(v.x,2)+Math.pow(v.y,2)+Math.pow(v.z,2));
					var direction = new CANNON.Vec3(v.x/magnitude,v.y/magnitude,v.z/magnitude);
					direction = new CANNON.Vec3(direction.x*this.speed,this.body.velocity.y,direction.z*this.speed);
					this.body.velocity.set(direction.x,this.body.velocity.y,direction.z);
					this.lastAngle = window.game.helpers.cartesianToPolar(direction.x,-1*direction.z).angle - Math.PI/2;
					this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), this.lastAngle);
					this.switchCurrentAnimation(enemyAnimation.WALK, false);
				} else {
					this.body.velocity = new CANNON.Vec3(0,0,0);
					this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), this.lastAngle);
				}
			} else {
				this.body.velocity.set(0,0,0);
			}

		}
		//}

	}

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

			var filePath = "models/zombie.gltf";
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

