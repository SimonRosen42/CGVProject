window.game = window.game || {};

class Weapon {
	constructor(player, cannon) {
		this.player = player;
		this.cannon = cannon;
		this.projectiles = [];
		this.shootPosition = new CANNON.Vec3(0,0,0);
		this.update();
	}

	update() {
		this.player.body.pointToWorldFrame(new CANNON.Vec3(1,0,0), this.shootPosition);
		for (var i = this.projectiles.length - 1; i >= 0; i--) {
			this.projectiles[i].update();
		}
	}

	removeProjectile(p) {
		for (var i = this.projectiles.length - 1; i >= 0; i--) {
			if (this.projectiles[i] == p) {
				this.cannon.removeVisual(p.body);
				this.projectiles.splice(i,1);
				return;
			}	
		}
	}

	fire(cannon) {
		console.log("fired");
		this.projectiles.push(new Projectile(this, cannon));
	}
}

class Projectile {
	constructor(weapon, cannon) {
		this.weapon = weapon;
		this.speed = 5;
		this.clock = new THREE.Clock();
		this.clock.start();
		this.body = cannon.createBody({
			mass: 0,
			position: {
				x: weapon.shootPosition.x,
				y: weapon.shootPosition.y,
				z: weapon.shootPosition.z
			},
			meshMaterial: new THREE.MeshBasicMaterial({color: 0x010101}),
			shape: new CANNON.Sphere(0.1),
			material: cannon.solidMaterial
		});
		this.body.velocity.set(
			(this.body.position.x - this.weapon.player.body.position.x)*this.speed,
			(this.body.position.y - this.weapon.player.body.position.y)*this.speed,
			(this.body.position.z - this.weapon.player.body.position.z)*this.speed
		);
	}

	update() {
		if (this.clock.getElapsedTime() > 1) {
			this.weapon.removeProjectile(this);
		}

	}
}

class Player { //turn into class
	constructor(controller) {
		this.controller = controller;
		this.weapon = null; //weapon holder
		this.model = null;
		this.mesh = null;
		this.shape = null;
		this.body = null;
		this.lastRotation = null;
		// Player mass which affects other rigid bodies in the world
		this.mass = 3;
		// HingeConstraint to limit player's air-twisting
		this.orientationConstraint = null;
		// Jump flags
		this.isGrounded = false;
		this.jumpHeight = 38;
		// Configuration for player speed
		this.speed = 5;
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
		//this.model = new THREE.BoxGeometry(1,1,1);
		this.body = cannon.createBody({
			//geometry: this.model,
			position: {
				x: 0,
				y: 1,
				z: 0
			},
			meshMaterial: new THREE.MeshLambertMaterial({color: window.game.static.colors.cyan, flatShading: true}),
			mass: this.mass, 
			shape: this.shape, 
			material: cannon.playerPhysicsMaterial,
			castShadow: true
		});
		this.mesh = cannon.getMeshFromBody(this.body);
		this.weapon = new Weapon(this, cannon);
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

	destroy(cannon) {
		cannon.removeVisual(this.body);
		this.controller.player = null;
	}

	update(cannon,three,game,controllerHandler) {
		// Basic game logic to update player and camera
		this.processUserInput(cannon, controllerHandler);
		this.weapon.update();
		//this.updateCamera(three);
		// Level-specific logic
		
		this.checkGameOver(game);
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
		this.body.velocity.set(horizontal * this.speed, this.body.velocity.y, vertical * this.speed);
	}

	rotateOnAxis(horizontal, vertical, cannon) {
		this.body.angularVelocity.y = 0;
		if (this.lastRotation == null) {
			this.lastRotation = window.game.helpers.cartesianToPolar(0,0);
		}
		if (horizontal == 0 && vertical == 0) {
			cannon.setOnAxis(this.body, new CANNON.Vec3(0, 1, 0), this.lastRotation.angle);
		} else {
			this.lastRotation = window.game.helpers.cartesianToPolar(horizontal,vertical);
			cannon.setOnAxis(this.body, new CANNON.Vec3(0, 1, 0), this.lastRotation.angle);
		}
	}

	processUserInput(cannon, controllerHandler) {
		if (this.controller != null) { //controller connected
			this.moveWithAxis(this.controller.axes[this.axisCode.leftHorizontal],this.controller.axes[this.axisCode.leftVertical]);
			this.rotateOnAxis(this.controller.axes[this.axisCode.rightHorizontal],this.controller.axes[this.axisCode.rightVertical],cannon);
			if (this.controller.pressed[this.controllerCodes.cross]) {
				this.weapon.fire(cannon);
			}
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

		player: [],

		addPlayer: function(controller) {
			var temp = new Player(controller);
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
			_playerHandler.players = 0;
			var player;
			for (player in _playerHandler.player) {
				player.destroy(_playerHandler.cannon);
			}
			_playerHandler.player.splice(0,_playerHandler.player.length);
		},

		init: function(c,t,g,ch,ui) {
			_playerHandler.cannon = c;
			_playerHandler.three = t;
			_playerHandler.game = g;
			_playerHandler.controllerHandler = ch;
			// Create a global physics material for the player which will be used as ContactMaterial for all other objects in the level
			_playerHandler.cannon.playerPhysicsMaterial = new CANNON.Material("playerMaterial");
			_playerHandler.ui = ui;
		}

	}
	
	return _playerHandler;
}
		