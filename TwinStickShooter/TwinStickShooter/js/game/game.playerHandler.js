window.game = window.game || {};

class Player { //turn into class
	constructor(controller) {
		this.controller = controller;
		this.model = null;
		this.mesh = null;
		this.shape = null;
		this.rigidBody = null;
		// Player mass which affects other rigid bodies in the world
		this.mass = 3;
		// HingeConstraint to limit player's air-twisting
		this.orientationConstraint = null;
		// Jump flags
		this.isGrounded = false;
		this.jumpHeight = 38;
		// Configuration for player speed
		this.speed = 40;
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
		this.model = three.createModel(window.game.models.player, 12, [
			new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan, shading: THREE.FlatShading }),
			new THREE.MeshLambertMaterial({ color: window.game.static.colors.green, shading: THREE.FlatShading })
		]);
		// Create the shape, mesh and rigid body for the player character and assign the physics material to it
		this.shape = new CANNON.Box(this.model.halfExtents);
		this.rigidBody = new CANNON.RigidBody(this.mass, this.shape, cannon.createPhysicsMaterial(cannon.playerPhysicsMaterial));
		this.rigidBody.position.set(0, 0, 50);
		this.mesh = cannon.addVisual(this.rigidBody, null, this.model.mesh);
		// Create a HingeConstraint to limit player's air-twisting - this needs improvement
		this.orientationConstraint = new CANNON.HingeConstraint(this.rigidBody, new CANNON.Vec3(0, 0, 0), new CANNON.Vec3(0, 0, 1), this.rigidBody, new CANNON.Vec3(0, 0, 1), new CANNON.Vec3(0, 0, 1));
		cannon.world.addConstraint(this.orientationConstraint);
		// this.rigidBody.postStep = function() { //function to run after rigidbody equations
		// };
		// Collision event listener for the jump mechanism
		// this.rigidBody.addEventListener("collide", function(event) {
		// 	// Checks if player's is on ground
		// 	if (!this.isGrounded) {
		// 		 Ray intersection test to check if player is colliding with an object beneath him
		// 		this.isGrounded = (new CANNON.Ray(this.mesh.position, new CANNON.Vec3(0, 0, -1)).intersectBody(event.contact.bi).length > 0);
		// 	}
		// });
	}

	destroy(cannon) {
		cannon.removeVisual(this.rigidBody);
		this.controller.player = null;
	}

	update(cannon,three,game,controllerHandler) {
		// Basic game logic to update player and camera
		this.processUserInput(cannon, controllerHandler);
		this.updateCamera(three);
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
		this.rigidBody.velocity.set(horizontal * this.speed, vertical * this.speed, this.rigidBody.velocity.z);
	}

	rotateOnAxis(horizontal, vertical, cannon) {
		this.rigidBody.angularVelocity.z = 0;
		if (horizontal == 0 && vertical == 0) return;
		var polar = window.game.helpers.cartesianToPolar(horizontal,vertical);
		cannon.setOnAxis(this.rigidBody, new CANNON.Vec3(0, 0, 1), polar.angle);
	}

	processUserInput(cannon, controllerHandler) {
		if (this.controller != null) { //controller connected
			this.moveWithAxis(this.controller.axes[this.axisCode.leftHorizontal],this.controller.axes[this.axisCode.leftVertical]);
			this.rotateOnAxis(this.controller.axes[this.axisCode.rightHorizontal],this.controller.axes[this.axisCode.rightVertical],cannon);
		}
	}

	checkGameOver(game) {
		// Example game over mechanism which resets the game if the player is falling beneath -800
		if (this.mesh.position.z <= -800) {
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
		