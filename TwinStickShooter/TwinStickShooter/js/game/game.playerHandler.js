window.game = window.game || {};

class Weapon {
	constructor(player, cannon) {
		this.player = player;
		this.cannon = cannon;
		this.projectiles = [];
		this.numProjectiles = 0;
		this.shootPosition = new CANNON.Vec3(0,0,0);

		this.fireRate = 0.2;
		this.fireRateClock = new THREE.Clock();
		this.fireRateClock.start();

		this.reloadRate = 1;
		this.reloadRateClock = new THREE.Clock();
		this.reloading = false;

		this.magazineMax = 8;
		this.magazine = this.magazineMax;

		this.update();
	}

	update() {
		this.player.body.pointToWorldFrame(new CANNON.Vec3(0,0.65,-1.8), this.shootPosition);
		//for (var i = this.projectiles.length - 1; i >= 0; i--) {
		//	this.projectiles[i].update();
		//}
		var p;
		for (p in this.projectiles) {
			this.projectiles[p].update();
		}

		if (this.reloadRateClock.getElapsedTime() > this.reloadRate && this.reloading) {
			this.reloading = false;
			this.magazine = this.magazineMax;
		}
	}

	removeProjectile(p) {
		for (var i = this.projectiles.length - 1; i >= 0; i--) {
			if (this.projectiles[i].index == p.index) {
				this.cannon.removeVisual(p.body);
				this.projectiles.splice(i,1);
				return;
			}
		}
	}

	fire(cannon) {
		if (!this.reloading) {
			if (this.fireRateClock.getElapsedTime() > this.fireRate) {
				this.projectiles.push(new Projectile(this, cannon, this.numProjectiles));
				this.numProjectiles++;
				if (this.numProjectiles > 200) this.numProjectiles = 0;
				this.fireRateClock.start();
				this.magazine--;
				if (this.magazine <= 0) {
					this.reloading = true;
					this.reloadRateClock.start();
				}
			}
		}
	}
}

class Projectile {
	constructor(weapon, cannon, i) {
		this.weapon = weapon;
		this.speed = 6;
		this.damage = 2;
		this.lastDistance = 0.0001;
		this.clock = new THREE.Clock();
		this.index = i;
		this.clock.start();
		this.shootPosition = null;
		this.body = cannon.createBody({
			mass: 1,
			position: {
				x: weapon.shootPosition.x,
				y: weapon.shootPosition.y,
				z: weapon.shootPosition.z
			},
			meshMaterial: new THREE.MeshBasicMaterial({color: 0x010101}),
			shape: new CANNON.Sphere(0.1),
			material: cannon.solidMaterial,
			collisionGroup: cannon.collisionGroup.projectile,
			collisionFilter: cannon.collisionGroup.solids // | cannon.collisionGroup.enemy
		});
		this.body.velocity.set(
			(this.body.position.x - weapon.player.body.position.x)*this.speed,
			0,
			(this.body.position.z - weapon.player.body.position.z)*this.speed
		);
		this.shootPosition = weapon.shootPosition;
		//console.log(cannon.world.raycastClosest(from, to, raycastOptions, result));
		//console.log(result.body.position);
		this.body.addEventListener("collide", function(e){
			if (e.body.collisionFilterGroup == cannon.collisionGroup.solids) {
				setTimeout(function() {
					weapon.removeProjectile(this);
				}, 0);
			}
		//	var enemy = weapon.player.enemyHandler.getEnemyFromBody(e.body);
		//		if (enemy != null) {
		//			enemy.takeDamage(2);
		//			weapon.removeProjectile(this);
		//		//setTimeout(function() { //have to set timeout or else removes body before end of physics frame
        //  		//	console.log("collided with ", enemy);
        //  		//	weapon.player.enemyHandler.removeEnemy(enemy);
    	//		//}, 0);
		//		}
		});
	}

	update() {
		this.body.position.set(
			this.body.position.x,
			this.shootPosition.y,
			this.body.position.z
		);
		this.body.velocity.set(
			this.body.velocity.x,
			0,
			this.body.velocity.z
		);
		var totalVel = Math.sqrt(Math.pow(this.body.velocity.x,2) + Math.pow(this.body.velocity.z,2));
		var velInFrame = totalVel*this.clock.getDelta() * 5; //optimizing raycasts to only be called initially and nearby the enemy
		if (this.lastDistance > velInFrame * 5 || this.lastDistance <= 0) {
			this.lastDistance -= velInFrame;
		} else {
			var from = this.body.position;
			var distance = 3 - this.clock.getElapsedTime();
			var to = new CANNON.Vec3(from.x + this.body.velocity.x * distance, from.y, from.z + this.body.velocity.z * distance);
			var result = new CANNON.RaycastResult();
			var raycastOptions = {
				collisionFilterGroup: this.weapon.cannon.collisionGroup.projectile,
				collisionFilterMask: this.weapon.cannon.collisionGroup.enemy //| this.weapon.cannon.collisionGroup.solids
			};
			this.weapon.cannon.world.raycastClosest(from, to, raycastOptions, result);
			if (result.body){
				if (result.body.collisionFilterGroup == this.weapon.cannon.collisionGroup.enemy) {
					this.lastDistance = this.body.position.distanceTo(result.body.position);
					if (this.body.position.distanceTo(result.body.position) < result.body.shapes[0].boundingSphereRadius + this.body.shapes[0].boundingSphereRadius) {
						var enemy = this.weapon.player.enemyHandler.getEnemyFromBody(result.body);
						if (enemy != null) {
							enemy.takeDamage(this.damage);
							this.weapon.removeProjectile(this);
						}
					}
				}
			}
		}
		if (this.clock.getElapsedTime() > 3) {
			this.weapon.removeProjectile(this);
		}

	}
}

class Player { //turn into class
	constructor(controller, enemyHandler, index) {

		this.index = index;
		this.controller = controller;
		this.weapon = null; //weapon holder
		this.enemyHandler = enemyHandler;
		//mesh, body and shape of collider
		this.mesh = null;
		this.shape = null;
		this.body = null;
		this.model = null;
		//lastRotation to keep player from rolling around
		this.lastRotation = null;
		// Player mass which affects other rigid bodies in the world
		this.mass = 3;
		// Configuration for player speed
		this.speed = 5;
		this.health = 10;

		// animation variables
		this.mixer = null;
		this.walkingAnimation = null;
		this.walkingAction = null;

		// Third-person camera configuration
		this.cameraCoords = null;
		// Camera offsets behind the player (horizontally and vertically)
		this.cameraOffsetH = 380;
		this.cameraOffsetV = 280;
		// Keyboard configuration for game.events.js (controlKeys must be associated to game.events.keyboard.keyCodes)
		this.controlKeys = {
			forward: "w",
			backward: "s",
			left: "a",
			right: "d",
			jump: "space"
		};

		this.controllerCodes =  {
			cross : 0,
			circle : 1,
			square : 2,
			triangle : 3,
			L1 : 4,
			R1 : 5,
			L2 : 6,
			R2 : 7,
			share : 8,
			start : 9,
			L3 : 10,
			R3 : 11,
			up : 12,
			down : 13,
			left : 14,
			right : 15,
			ps : 16
		};

		this.axisCode = {
			leftHorizontal : 0,
			leftVertical : 1,
			rightHorizontal : 2,
			rightVertical : 3
		};

		this.hasLoaded = false;
	}
		// Methods
	create(cannon, three) {
		// Create a player character based on an imported 3D model that was already loaded as JSON into game.models.player
		//this.model = three.createModel(window.game.models.player, 12, [
		//	new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan, shading: THREE.FlatShading }),
		//	new THREE.MeshLambertMaterial({ color: window.game.static.colors.green, shading: THREE.FlatShading })
		//]);
		// Create the shape, mesh and rigid body for the player character and assign the physics material to it


		this.shape = new CANNON.Box(new CANNON.Vec3(1,1,1)); //1 is half of actual size

		var loader = new THREE.GLTFLoader();
		var filePath =  "models/player" + this.index.toString() + ".glb";
		console.log(filePath);
		var self = this;
		loader.load(filePath, function (gltf) {

	   	gltf.scene.scale.set(0.75,0.75,0.75);

			self.model = gltf.scene;

			gltf.scene.traverse( function( node ) {
			
         		if ( node instanceof THREE.SkinnedMesh ) {
         			node.castShadow = true;
         			node.receiveShadow = true;
         			//self.model = node.parent;
         			//self.model.scale.set(2,2,2);
         		}
			
   		 	});

			// set mixer for animations
			self.mixer = new THREE.AnimationMixer(self.model);

			// set walk animation
			self.walkingAnimation = gltf.animations[0];

			self.body = cannon.createBody({
				//geometry: this.model,
				position: {
					x: 0,
					y: 2,
					z: 0
				},
				meshMaterial: new THREE.MeshLambertMaterial({color: window.game.static.colors.cyan, flatShading: true}),
				mass: self.mass,
				mesh: self.model,
				shape: self.shape,
				material: cannon.playerPhysicsMaterial,
				castShadow: true,
				offset: new CANNON.Vec3(0,-1,0), //corrective offset for the model
				collisionGroup: cannon.collisionGroup.player,
				collisionFilter: cannon.collisionGroup.enemy | cannon.collisionGroup.solids
			});

			self.mesh = cannon.getMeshFromBody(self.body);
			self.weapon = new Weapon(self, cannon);

			self.hasLoaded = true;
			self.currentAction = self.mixer.clipAction(self.walkingAnimation);
			self.currentAction.loop = THREE.LoopRepeat;
			self.currentAction.play();
		})

		//this.mesh.castShadow = true;
		//this.mesh.receiveShadow = true;
		// Create a HingeConstraint to limit player's air-twisting - this needs improvement
		//this.orientationConstraint = new CANNON.HingeConstraint(this.body, new CANNON.Vec3(0, 0, 0), [new CANNON.Vec3(0, 0, 1), this.body, new CANNON.Vec3(0, 0, 1), new CANNON.Vec3(0, 0, 1)]);
		//cannon.world.addConstraint(this.orientationConstraint);
		// this.body.postStep = function() { //function to run after body equations
		// };
		// Collision event listener for the jump mechanism
		// this.body.addEventListener("collide", function(event) {
		// 	// Checks if player's is on ground
		// 	if (!this.isGrounded) {
		// 		 Ray intersection test to check if player is colliding with an object beneath him
		// 		this.isGrounded = (new CANNON.Ray(this.mesh.position, new CANNON.Vec3(0, 0, -1)).intersectBody(event.contact.bi).length > 0);
		// 	}
		// });
	}

	playWalkingAnimation() {
		if (!this.currentAction.isRunning()) {
			this.currentAction.play();
			console.log("playing");
		}
	}

	stopWalkingAnimation() {
		if (this.currentAction != null) 
			if (this.currentAction.isRunning())
				this.currentAction.stop();
	}

	destroy(cannon) {
		cannon.removeVisual(this.body);
		this.controller.player = null;
	}

	update(cannon,three,game,controllerHandler) {

		if (this.hasLoaded) {
			// Basic game logic to update player and camera
			this.processUserInput(cannon, controllerHandler);

			if (this.weapon != null)
				this.weapon.update();
			//this.updateCamera(three);
			// Level-specific logic

			this.checkGameOver(game);
		}
	}

	updateCamera(three) {
		// Calculate camera coordinates by using Euler radians from a fixed angle (135 degrees)
		this.cameraCoords = window.game.helpers.polarToCartesian(this.cameraOffsetH, window.game.helpers.degToRad(135));
		// Apply camera coordinates to camera position
		three.camera.position.x = this.mesh.position.x + this.cameraCoords.x;
		three.camera.position.y = this.mesh.position.y + this.cameraCoords.y;
		three.camera.position.z = this.mesh.position.z + this.cameraOffsetV;
		// Place camera focus on player mesh
		three.camera.lookAt(this.mesh.position);
	}

	moveWithAxis(horizontal, vertical) {
		//if (Math.sqrt(Math.pow(this.body.velocity.x,2) + Math.pow(this.body.velocity.z,2)) > this.speed) {
		this.body.velocity.set(horizontal * this.speed, this.body.velocity.y, vertical * this.speed);
		if (Math.abs(horizontal) > 0 || Math.abs(vertical) > 0) {
			//this.playWalkingAnimation();
		} else {
			//this.stopWalkingAnimation();
		}
		//} else this.body.applyForce(new CANNON.Vec3(horizontal * this.acceleration * 100, 0, vertical * this.acceleration * 100), this.body.position);
	}

	rotateOnAxis(horizontal, vertical, cannon) {
		this.body.angularDamping = 0;
		if (this.lastRotation == null) {
			this.lastRotation = window.game.helpers.cartesianToPolar(0,0);
		}
		if (horizontal == 0 && vertical == 0) {
			cannon.setOnAxis(this.body, new CANNON.Vec3(0, 1, 0), this.lastRotation.angle - Math.PI/2);
		} else {
			this.lastRotation = window.game.helpers.cartesianToPolar(horizontal,vertical);
			cannon.setOnAxis(this.body, new CANNON.Vec3(0, 1, 0), this.lastRotation.angle - Math.PI/2);
		}
	}

	processUserInput(cannon, controllerHandler) {
		if (this.controller != null) { //controller connected
			this.moveWithAxis(this.controller.axes[this.axisCode.leftHorizontal],this.controller.axes[this.axisCode.leftVertical]);
			this.rotateOnAxis(this.controller.axes[this.axisCode.rightHorizontal],this.controller.axes[this.axisCode.rightVertical],cannon);
			if (this.controller.pressed[this.controllerCodes.R1]) {
				this.weapon.fire(cannon);
			}
		}
	}

	takeDamage() {
		this.health--;
		if (this.health <= 0) {
			console.log("dead");
		}
	}

	checkGameOver(game) {
		// Example game over mechanism which resets the game if the player is falling beneath -800
		if (this.mesh.position.y <= -10) {
			game.destroy();
		}
	}
};

window.game.playerHandler = function () {
	var _playerHandler = {

		players: 0,
		cannon: null,
		three: null,
		game: null,
		controllerHandler: null,
		ui: null,
		enemyHandler: null,

		player: [],

		addPlayer: function(controller) {
			var temp = new Player(controller, this.enemyHandler, 1);
			temp.create(_playerHandler.cannon, _playerHandler.three);
			_playerHandler.players++;
		  	_playerHandler.player.push(temp);
		},

		updatePlayers: function() {
			if (_playerHandler.player[0] != null) {
				for (var i = _playerHandler.player.length - 1; i >= 0; i--) {
					_playerHandler.player[i].update(_playerHandler.cannon,_playerHandler.three,_playerHandler.game,_playerHandler.controllerHandler);
				}
			}
		},

		removePlayer: function(p) {
			for (var i = _playerHandler.player.length - 1; i >= 0; i--) {
				if (_playerHandler.player[i] == p) {
					_playerHandler.players--;
					_playerHandler.player[i].destroy(_playerHandler.cannon);
					_playerHandler.player.splice(i, 1);
					return;
				}
			}
		},

		destroy: function() {
			if (_playerHandler.player.length > 0) {
				var p;
				for (p in _playerHandler.player) {
					_playerHandler.player[p].destroy(_playerHandler.cannon);
				}
				_playerHandler.player.splice(0,_playerHandler.players);
				_playerHandler.players = 0; 
			}
		},

		init: function(c,t,g,ch,ui,eh) {
			_playerHandler.cannon = c;
			_playerHandler.three = t;
			_playerHandler.game = g;
			_playerHandler.controllerHandler = ch;
			// Create a global physics material for the player which will be used as ContactMaterial for all other objects in the level
			_playerHandler.ui = ui;
			_playerHandler.enemyHandler = eh;
		}

	}

	return _playerHandler;
}
