/*
 * Game Core - Demo 1 (Simple demo)
 *
 * A simple example with basic controls (see _game.core.js for an uncommented version of this file)
 */

window.game = window.game || {};

import { Pathfinding } from 'three-pathfinding';

window.game.core = function () {
	var _game = {
		// Attributes
		level: {
			// Methods
			create: function() {
				// Create a solid material for all objects in the world
				_cannon.solidMaterial = _cannon.createPhysicsMaterial(new CANNON.Material("solidMaterial"), 0, 0.1);

				// Define floor settings
				var floorSize = 800.0;
				var floorHeight = 20;

				// buffer geowmetry for nav mesh
				var geometry = new THREE.BufferGeometry();

				// vertices for our flat, square mesh
				var vertices = new Float32Array ( [
				
					-floorSize/2, -floorSize/2, 0.0,
					floorSize/2, -floorSize/2, 0.0,
					-floorSize/2, floorSize/2, 0.0,

					-floorSize/2, floorSize/2, 0.0,
					floorSize/2, -floorSize/2, 0.0,
					floorSize/2, floorSize/2, 0.0					
					
				]);

				// add vertices to our geometry
				geometry.addAttribute ('position', new THREE.BufferAttribute(vertices, 3));

				// create level
				const pathfinding = new Pathfinding();
				const zone = 'level1';
				pathfinding.setZoneData(zone, Pathfinding.createZone(geometry));

				// 
				findPath = function(a, b) {
					const groupID = pathfinding.getGroup(zone, a);
					const path = pathfinding.findPath(a, b, zone, groupID);
					return path;
				}

				// Add a floor
				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(floorSize, floorSize, floorHeight)),
					mass: 0,
					position: new CANNON.Vec3(0, 0, -floorHeight),
					meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.black }),
					physicsMaterial: _cannon.solidMaterial
				});

				// Add some boxes
				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(30, 30, 30)),
					mass: 0,
					position: new CANNON.Vec3(-240, -200, 30 - 1),
					meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan }),
					physicsMaterial: _cannon.solidMaterial
				});

				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(30, 30, 30)),
					mass: 0,
					position: new CANNON.Vec3(-300, -260, 90),
					meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan }),
					physicsMaterial: _cannon.solidMaterial
				});

				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(30, 30, 30)),
					mass: 0,
					position: new CANNON.Vec3(-180, -200, 150),
					meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan }),
					physicsMaterial: _cannon.solidMaterial
				});

				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(30, 30, 30)),
					mass: 0,
					position: new CANNON.Vec3(-120, -140, 210),
					meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan }),
					physicsMaterial: _cannon.solidMaterial
				});

				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(30, 30, 30)),
					mass: 0,
					position: new CANNON.Vec3(-60, -80, 270),
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

			// Update Cannon.js world and player state
			_cannon.updatePhysics();
			_game.player.update();

			// Render visual scene
			_three.render();
		},
		initComponents: function (options) {
			// Reference game components one time
			_events = window.game.events();
			_controllerHandler = window.game.controllerHandler();
			_three = window.game.three();
			_cannon = window.game.cannon();
			_ui = window.game.ui();

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
	var _controllerHandler;
	var _three;
	var _cannon;
	var _ui;
	var _animationFrameLoop;
	// Game defaults which will be set one time after first start
	var _gameDefaults = {
		player: window.game.helpers.cloneObject(_game.player),
		level: window.game.helpers.cloneObject(_game.level)
	};

	return _game;
};