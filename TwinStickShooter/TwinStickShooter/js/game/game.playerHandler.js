window.game = window.game || {};

class player { //turn into class
			// Attributes
			playerNumber = 0,
			// Player entity including mesh and rigid body
			model = null;
			mesh = null;
			shape = null;
			rigidBody = null;
			// Player mass which affects other rigid bodies in the world
			mass = 3;

			// Configuration for player speed (acceleration and maximum speed)
			speed = 1.5;
			speedMax = 45;
			// Configuration for player rotation (rotation acceleration and maximum rotation speed)
			rotationSpeed = 0.007;
			rotationSpeedMax = 0.04;
			// Rotation values
			rotationRadians = new THREE.Vector3(0, 0, 0);
			rotationAngleY = null;
			// Acceleration values
			acceleration = 0;
			rotationAcceleration = 0;
			// Keyboard configuration for game.events.js (controlKeys must be associated to game.events.keyboard.keyCodes)
			
			controlKeys = {
				forward : "w",
				backward : "s",
				left : "a",
				right : "d",
				jump : "space"
			};

			//controller configuration
			controllerCodes =  {
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

			axisCode = {
				leftHorizontal : 0,
				leftVertical : 1,
				rightHorizontal : 2,
				leftHorizontal : 3
			};
			
			// Methods
			create = function() {
				// Create a global physics material for the player which will be used as ContactMaterial for all other objects in the level
				_cannon.playerPhysicsMaterial = new CANNON.Material("playerMaterial");
				// Create a player character based on an imported 3D model that was already loaded as JSON into game.models.player
				_game.player.model = _three.createModel(window.game.models.player, 12, [
					new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan, shading: THREE.FlatShading }),
					new THREE.MeshLambertMaterial({ color: window.game.static.colors.green, shading: THREE.FlatShading })
				]);

				// Create the shape, mesh and rigid body for the player character and assign the physics material to it
				_game.player.shape = new CANNON.Box(_game.player.model.halfExtents);
				_game.player.rigidBody = new CANNON.RigidBody(_game.player.mass, _game.player.shape, _cannon.createPhysicsMaterial(_cannon.playerPhysicsMaterial));
				_game.player.rigidBody.position.set(0, 0, 50);
				_game.player.mesh = _cannon.addVisual(_game.player.rigidBody, null, _game.player.model.mesh);
				// Collision event listener for the jump mechanism
				_game.player.rigidBody.addEventListener("collide", function(event) {
					// Checks if player's is on ground
						// Ray intersection test to check if player is colliding with an object beneath him
						//_game.player.isGrounded = (new CANNON.Ray(_game.player.mesh.position, new CANNON.Vec3(0, 0, -1)).intersectBody(event.contact.bi).length > 0);
				});
			};

			update = function() {
				// Basic game logic to update player and camera
				_game.player.processUserInput();
				_game.player.accelerate();
				_game.player.rotate();

				// Level-specific logic
				_game.player.checkGameOver();
			};

			updateCamera = function() {
				// Calculate camera coordinates by using Euler radians from player's last rotation
				_game.player.cameraCoords = window.game.helpers.polarToCartesian(_game.player.cameraOffsetH, _game.player.rotationRadians.z);

				// Apply camera coordinates to camera position
				_three.camera.position.x = _game.player.mesh.position.x + _game.player.cameraCoords.x;
				_three.camera.position.y = _game.player.mesh.position.y + _game.player.cameraCoords.y;
				_three.camera.position.z = _game.player.mesh.position.z + _game.player.cameraOffsetV;

				// Place camera focus on player mesh
				_three.camera.lookAt(_game.player.mesh.position);
			};

			processUserInput: function() {
				// Jump
				if ((_controllerHandler.getControllerByPlayer(0).pressed[_game.player.controllerCodes.cross]) || (_events.keyboard.pressed[_game.player.controlKeys.jump])) {
					_game.player.jump();
				}

				// Movement: forward, backward, left, right
				if ((_controllerHandler.getControllerByPlayer(0).pressed[_game.player.controllerCodes.up]) || (_events.keyboard.pressed[_game.player.controlKeys.forward])) {
					_game.player.updateAcceleration(_game.player.playerAccelerationValues.position, 1);

					// Reset orientation in air
					if (!_cannon.getCollisions(_game.player.rigidBody.index)) {
						_game.player.rigidBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), _game.player.rotationRadians.z);
					}
				}

				if ((_controllerHandler.getControllerByPlayer(0).pressed[_game.player.controllerCodes.down]) || (_events.keyboard.pressed[_game.player.controlKeys.backward])) {
					_game.player.updateAcceleration(_game.player.playerAccelerationValues.position, -1);
				}

				if ((_controllerHandler.getControllerByPlayer(0).pressed[_game.player.controllerCodes.right]) || (_events.keyboard.pressed[_game.player.controlKeys.right])) {
					_game.player.updateAcceleration(_game.player.playerAccelerationValues.rotation, 1);
				}

				if ((_controllerHandler.getControllerByPlayer(0).pressed[_game.player.controllerCodes.left]) || (_events.keyboard.pressed[_game.player.controlKeys.left])) {
					_game.player.updateAcceleration(_game.player.playerAccelerationValues.rotation, -1);
				}
			};

			updateOrientation: function() {
				// Convert player's Quaternion to Euler radians and save them to _game.player.rotationRadians
				_game.player.rotationRadians = new THREE.Euler().setFromQuaternion(_game.player.rigidBody.quaternion);

				// Round angles
				_game.player.rotationAngleX = Math.round(window.game.helpers.radToDeg(_game.player.rotationRadians.x));
				_game.player.rotationAngleY = Math.round(window.game.helpers.radToDeg(_game.player.rotationRadians.y));

				// Prevent player from being upside-down on a slope - this needs improvement
				if ((_cannon.getCollisions(_game.player.rigidBody.index) &&
					((_game.player.rotationAngleX >= 90) ||
						(_game.player.rotationAngleX <= -90) ||
						(_game.player.rotationAngleY >= 90) ||
						(_game.player.rotationAngleY <= -90)))
					)
				{
					// Reset orientation
					_game.player.rigidBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), _game.player.rotationRadians.z);
				}
			};

			checkGameOver: function () {
				// Example game over mechanism which resets the game if the player is falling beneath -800
				if (_game.player.mesh.position.z <= -800) {
					_game.destroy();
				}
			};
		}

window.game.playerHandler = function () {
	var _playerHandler = {
	
		players: {},

		addplayer: function(gamepad) {
			var temp = new controller(gamepad, _controllerHandler.players, gamepad.index);
			_controllerHandler.players++;
		  	_controllerHandler.controllers[gamepad.index] = temp;
		},

		getControllerByPlayer: function(playerNumber) {
			for (var i = 0; i < 4; i++) {
				if (_controllerHandler.controllers[i] != null){
					if (_controllerHandler.controllers[i].player == playerNumber) {
						console.log(_controllerHandler.controllers[i]);
						return _controllerHandler.controllers[i];
					}
				}
			}
			return null;
		},	

		disconnecthandler: function(e) {
		  	_controllerHandler.removegamepad(e.gamepad);
		},

		removegamepad: function(gamepad) {
		  	for (var i = 0; i < 4; i++) {
		  		if (_controllerHandler.controllers[i].gamepad == gamepad) {
		  			delete controller[i];
		  			_controllerHandler.players--;
		  			return;
		  		}
		  	}
		},

		init: function() {
			window.addEventListener("gamepadconnected", _controllerHandler.updateStatus);
			window.addEventListener("gamepaddisconnected", _controllerHandler.disconnecthandler);
		}
	}
	
	return _controllerHandler;
}
		