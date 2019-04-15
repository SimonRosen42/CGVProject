/*
 * Game Core - Demo 1 (Simple demo)
 *
 * A simple example with basic controls (see _game.core.js for an uncommented version of this file)
 */

window.game = window.game || {};

window.game.core = function () {
	var _game = {
		// Attributes
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
			_game.level.create();
			//_game.enemy.create();
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
			_playerHandler.destroy();
			_enemyHandler.destroy();

			// Recreate player and level objects by using initial values which were copied at the first start
			//_game.player = window.game.helpers.cloneObject(_gameDefaults.player);
			_game.level = window.game.helpers.cloneObject(_gameDefaults.level);

			// Create level again
			_game.level.create();

			// Continue with the game loop
			_game.loop();
		},
		loop: function() {
			// Assign an id to the animation frame loop
			_animationFrameLoop =  window.requestAnimationFrame(_game.loop);
			_controllerHandler.updateStatus();
			// Update Cannon.js world and player state
			_cannon.updatePhysics();
			_playerHandler.updatePlayers();
			_game.enemy.update();
			_enemyHandler.updateEnemies();
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
			_playerHandler = window.game.playerHandler();

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
			_controllerHandler.init(_playerHandler);
			_playerHandler.init(_cannon,_three,_game,_controllerHandler,_ui);
			_enemyHandler.init(_cannon,_three,_game,_playerHandler);
			_enemyHandler.addEnemy(new THREE.Vector3(200,200,100));

			// Add specific events for key down
			_events.onKeyDown = function () {
				if (!_ui.hasClass("infoboxIntro", "fade-out")) {
					_ui.fadeOut("infoboxIntro");
					_playerHandler.addPlayer();
				}
			};

			 _controllerHandler.anyControllerButtonPressed = function() {
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
	var _playerHandler;
	// Game defaults which will be set one time after first start
	var _gameDefaults = {
		// player: window.game.helpers.cloneObject(_game.player),
		level: window.game.helpers.cloneObject(_game.level)
	};

	return _game;
};