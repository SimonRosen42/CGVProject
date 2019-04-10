/*
 * Game Core - Demo 1 (Simple demo)
 *
 * A simple example with basic controls (see _game.core.js for an uncommented version of this file)
 */

window.game = window.game || {};

window.game.core = function () {
	var _game = {
		// Attributes
		player: {
			// Attributes

			// Player entity including mesh and rigid body
			model: null,
			mesh: null,
			shape: null,
			rigidBody: null,
			// Player mass which affects other rigid bodies in the world
			mass: 3,

			// HingeConstraint to limit player's air-twisting
			orientationConstraint: null,

			// Jump flags
			isGrounded: false,
			jumpHeight: 38,

			// Configuration for player speed
			speed: 40,

			// Third-person camera configuration
			cameraCoords: null,
			// Camera offsets behind the player (horizontally and vertically)
			cameraOffsetH: 380,
			cameraOffsetV: 280,

			// Keyboard configuration for game.events.js (controlKeys must be associated to game.events.keyboard.keyCodes)
			controlKeys: {
				forward: "w",
				backward: "s",
				left: "a",
				right: "d",
				jump: "space"
			},

			controllerCodes :  {
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
			},

			axisCode : {
				leftHorizontal : 0,
				leftVertical : 1,
				rightHorizontal : 2,
				rightVertical : 3
			},

			// Methods
			create: function() {
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

				// Create a HingeConstraint to limit player's air-twisting - this needs improvement
				_game.player.orientationConstraint = new CANNON.HingeConstraint(_game.player.rigidBody, new CANNON.Vec3(0, 0, 0), new CANNON.Vec3(0, 0, 1), _game.player.rigidBody, new CANNON.Vec3(0, 0, 1), new CANNON.Vec3(0, 0, 1));
				_cannon.world.addConstraint(_game.player.orientationConstraint);

				_game.player.rigidBody.postStep = function() { //function to run after rigidbody equations

				};

				// Collision event listener for the jump mechanism
				_game.player.rigidBody.addEventListener("collide", function(event) {
					// Checks if player's is on ground
					if (!_game.player.isGrounded) {
						// Ray intersection test to check if player is colliding with an object beneath him
						_game.player.isGrounded = (new CANNON.Ray(_game.player.mesh.position, new CANNON.Vec3(0, 0, -1)).intersectBody(event.contact.bi).length > 0);
					}
				});
			},
			update: function() {
				// Basic game logic to update player and camera
				_game.player.processUserInput();
				_game.player.updateCamera();

				// Level-specific logic
				_game.player.checkGameOver();
			},
			updateCamera: function() {
				// Calculate camera coordinates by using Euler radians from a fixed angle (135 degrees)
				_game.player.cameraCoords = window.game.helpers.polarToCartesian(_game.player.cameraOffsetH, window.game.helpers.degToRad(135));

				// Apply camera coordinates to camera position
				_three.camera.position.x = _game.player.mesh.position.x + _game.player.cameraCoords.x;
				_three.camera.position.y = _game.player.mesh.position.y + _game.player.cameraCoords.y;
				_three.camera.position.z = _game.player.mesh.position.z + _game.player.cameraOffsetV;

				// Place camera focus on player mesh
				_three.camera.lookAt(_game.player.mesh.position);
			},

			moveWithAxis: function(horizontal, vertical) {
				console.log(horizontal,vertical);
				_game.player.rigidBody.velocity.set(horizontal * _game.player.speed, vertical * _game.player.speed, _game.player.rigidBody.velocity.z);
			},

			rotateOnAxis: function(horizontal, vertical) {
				var polar = window.game.helpers.cartesianToPolar(horizontal,vertical);
				_cannon.setOnAxis(_game.player.rigidBody, new CANNON.Vec3(0, 0, 1), polar.angle);
			},

			processUserInput: function() {
				if (_controllerHandler.getControllerByPlayer(0) != null) { //controller connected
					_game.player.moveWithAxis(_controllerHandler.getControllerByPlayer(0).axes[_game.player.axisCode.leftHorizontal],_controllerHandler.getControllerByPlayer(0).axes[_game.player.axisCode.leftVertical]);
					_game.player.rotateOnAxis(_controllerHandler.getControllerByPlayer(0).axes[_game.player.axisCode.rightHorizontal],_controllerHandler.getControllerByPlayer(0).axes[_game.player.axisCode.rightVertical]);
				}
			},

			checkGameOver: function () {
				// Example game over mechanism which resets the game if the player is falling beneath -800
				if (_game.player.mesh.position.z <= -800) {
					_game.destroy();
				}
			}
		},

		enemy: {
			model : null,
			mesh : null,
			collider : null,
			rigidBody : null,
			// Enemy mass which affects other rigid bodies in the world
			mass : 1,
		
			acceleration : 1,
			speedMax : 30,
		
			create : function() {
		
				_cannon.enemyPhysicsMaterial = _cannon.createPhysicsMaterial(new CANNON.Material("enemyMaterial"), 0.0, 0.0);
				
				_game.enemy.collider = new CANNON.Box(new CANNON.Vec3(10,10,10));
		
				_game.enemy.rigidBody = new CANNON.RigidBody(_game.enemy.mass, _game.enemy.collider, _cannon.enemyPhysicsMaterial);
				_game.enemy.rigidBody.position.set(0, 0, 10);
				var meshVisual = new THREE.CylinderGeometry( 10, 10, 20, 32 );
				//enemy.userData.model = window.game.core._three
				_game.enemy.mesh = _cannon.addVisual(_game.enemy.rigidBody, new THREE.MeshLambertMaterial({ color: window.game.static.colors.red }), new THREE.Mesh(meshVisual, new THREE.MeshBasicMaterial({color : 0xff0000})));
		
				_game.enemy.rigidBody.addEventListener("collide", function(event) {
		
				} );
			},

			update: function() {
				//_game.enemy.rigidBody.velocity.set(1,0,10);
			}
		},

		level: {
			// Methods
			create: function() {
				// Create a solid material for all objects in the world
				_cannon.solidMaterial = _cannon.createPhysicsMaterial(new CANNON.Material("solidMaterial"), 0, 0.1);

				// Define floor settings
				var floorSize = 800;
				var floorHeight = 20;

				// Add a floor
				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(floorSize, floorSize, floorHeight)),
					mass: 0,
					position: new CANNON.Vec3(0, 0, -floorHeight),
					meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.black }),
					physicsMaterial: _cannon.solidMaterial
				});

				// Add movable rigid body (mass = 1)
				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(20, 20, 20)),
					mass: 1,
					position: new CANNON.Vec3(-320, 0, 20),
					meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan }),
					physicsMaterial: _cannon.solidMaterial
				});

				// Add static rigid bodies (mass = 0)
				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(20, 20, 20)),
					mass: 0,
					position: new CANNON.Vec3(-80, -180, 90),
					meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan }),
					physicsMaterial: _cannon.solidMaterial
				});

				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(100, 100, 2)),
					mass: 0,
					position: new CANNON.Vec3(140, -420, 175),
					meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan }),
					physicsMaterial: _cannon.solidMaterial
				});

				// Add movable rigid body (mass = 1)
				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(20, 20, 20)),
					mass: 1,
					position: new CANNON.Vec3(90, -420, 200),
					meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan }),
					physicsMaterial: _cannon.solidMaterial
				});

				// Add static rigid body (mass = 0)
				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(45, 45, 5)),
					mass: 0,
					position: new CANNON.Vec3(400, -420, 285),
					meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan }),
					physicsMaterial: _cannon.solidMaterial
				});

				// Add movable rigid body (mass = 2)
				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(10, 25, 230)),
					mass: 2,
					position: new CANNON.Vec3(402, -420, 520),
					meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan }),
					physicsMaterial: _cannon.solidMaterial
				});

				// Add static rigid bodies (mass = 0)
				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(45, 45, 5)),
					mass: 0,
					position: new CANNON.Vec3(900, -420, 285),
					meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan }),
					physicsMaterial: _cannon.solidMaterial
				});

				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(30, 30, 30)),
					mass: 0,
					position: new CANNON.Vec3(900, -110, 285),
					meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan }),
					physicsMaterial: _cannon.solidMaterial
				});

				// Grid Helper
				var grid = new THREE.GridHelper(floorSize, floorSize / 10);
				grid.position.z = 0.5;
				grid.rotation.x = window.game.helpers.degToRad(90);
				_three.scene.add(grid);
			}
		},

		// Methods
		init: function(options) {
			// Setup necessary game components (_events, _three, _cannon, _ui)
			_game.initComponents(options);

			// Create player and level
			_game.player.create();
			_game.level.create();
			_game.enemy.create();
			// Initiate the game loop
			_game.loop();
		},
		destroy: function() {
			// Pause animation frame loop
			window.cancelAnimationFrame(_animationFrameLoop);

			// Destroy THREE.js scene and Cannon.js world and recreate them
			_cannon.destroy();
			_cannon.setup();
			_three.destroy();
			_three.setup();

			// Recreate player and level objects by using initial values which were copied at the first start
			_game.player = window.game.helpers.cloneObject(_gameDefaults.player);
			_game.level = window.game.helpers.cloneObject(_gameDefaults.level);

			// Create player and level again
			_game.player.create();
			_game.level.create();

			// Continue with the game loop
			_game.loop();
		},
		loop: function() {
			// Assign an id to the animation frame loop
			_animationFrameLoop = window.requestAnimationFrame(_game.loop);
			_controllerHandler.updateStatus();
			// Update Cannon.js world and player state
			_cannon.updatePhysics();
			_game.player.update();
			_game.enemy.update();

			// Render visual scene
			_three.render();
		},
		initComponents: function (options) {
			// Reference game components one time
			_events = window.game.events();
			_three = window.game.three();
			_cannon = window.game.cannon();
			_ui = window.game.ui();
			_controllerHandler = window.game.controllerHandler();
			_enemyHandler = window.game.enemyHandler();

			// Setup lights for THREE.js
			_three.setupLights = function () {
				var hemiLight = new THREE.HemisphereLight(window.game.static.colors.white, window.game.static.colors.white, 0.6);
				hemiLight.position.set(0, 0, -1);
				_three.scene.add(hemiLight);

				var pointLight = new THREE.PointLight(window.game.static.colors.white, 0.5);
				pointLight.position.set(0, 0, 500);
				_three.scene.add(pointLight);
			};

			// Initialize components with options
			_three.init(options);
			_cannon.init(_three);
			_ui.init();
			_events.init();
			_controllerHandler.init();

			// Add specific events for key down
			_events.onKeyDown = function () {
				if (!_ui.hasClass("infoboxIntro", "fade-out")) {
					_ui.fadeOut("infoboxIntro");
				}
			};

			_controllerHandler.buttonPressed = function() {
				if (!_ui.hasClass("infoboxIntro", "fade-out")) {
					_ui.fadeOut("infoboxIntro");
				}
			};
		}
	};

	// Internal variables
	var _events;
	var _three;
	var _cannon;
	var _ui;
	var _controllerHandler;
	var _animationFrameLoop;
	var _enemyHandler;
	// Game defaults which will be set one time after first start
	var _gameDefaults = {
		player: window.game.helpers.cloneObject(_game.player),
		level: window.game.helpers.cloneObject(_game.level)
	};

	return _game;
};