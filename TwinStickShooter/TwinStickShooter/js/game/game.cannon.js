/*
 * Game Cannon.js module
 *
 * A class for the Cannon.js setup providing rigid body management, collision detection extensions and some helpers
 */

window.game = window.game || {};

window.game.cannon = function() {
	var _cannon = {
		// Cannon.js world holding all rigid bodies of the level
		world: null,
		// Bodies correspond to the physical objects inside the Cannon.js world
		bodies: [],
		// Visuals are the visual representations of the bodies that are finally rendered by THREE.js
		visuals: [],
		// Default friction and restitution
		friction: 0.0,
		restitution: 0.0,
		// Default Z gravity (approximation of 9,806)
		gravity: -10,
		// Interval speed for Cannon.js to step the physics simulation
		timestep: 1 / 16,
		// Player physics material that will be assigned in game.core.js
		playerPhysicsMaterial: null,
		// Enemy physics material that will be assigned in game.core.js
		enemyPhysicsMaterial: null,
		// Solid material for all other level objects
		solidMaterial: null,
		// Local storage of three
		three: null,

		// Methods
		init: function(t) {
			_cannon.three = t;
			_cannon.world = new CANNON.World();
            _cannon.world.quatNormalizeSkip = 0;
            _cannon.world.quatNormalizeFast = false;

            var solver = new CANNON.GSSolver();

            _cannon.world.defaultContactMaterial.contactEquationStiffness = 1e9;
            _cannon.world.defaultContactMaterial.contactEquationRelaxation = 4;

            solver.iterations = 7;
            solver.tolerance = 0.1;
            var split = true;
            if(split)
                _cannon.world.solver = new CANNON.SplitSolver(solver);
        	else
                _cannon.world.solver = solver;

            _cannon.world.gravity.set(0,_cannon.gravity,0);
            _cannon.world.broadphase = new CANNON.NaiveBroadphase();

            // Create a slippery material (friction coefficient = 0.0)
            var physicsMaterial = new CANNON.Material("slipperyMaterial");
            playerPhysicsMaterial = new CANNON.ContactMaterial(physicsMaterial,
                                                                    physicsMaterial,
                                                                    0.0, // friction coefficient
                                                                    0.0  // restitution
                                                                    );
            // We must add the contact materials to the world
            _cannon.world.addContactMaterial(playerPhysicsMaterial);

            // Create a sphere
           	//var mass = 5, radius = 1.3;
           	//var sphereShape = new CANNON.Sphere(radius);
           	//var sphereBody = new CANNON.Body({ mass: mass });
           	//sphereBody.addShape(sphereShape);
           	//sphereBody.position.set(0,5,0);
           	//sphereBody.linearDamping = 0.9;
           	//_cannon.world.add(sphereBody);
		},

		setup: function() {

		},

		destroy: function () {
			// Remove all entities from the scene and Cannon's world
			_cannon.removeAllVisuals();
		},

		rotateOnAxis: function(body, axis, radians) { //additive to rotation
			// Equivalent to THREE's Object3D.rotateOnAxis
			var rotationQuaternion = new CANNON.Quaternion();
			rotationQuaternion.setFromAxisAngle(axis, radians);
			body.quaternion = rotationQuaternion.mult(body.quaternion);
		},

		setOnAxis: function(body, axis, radians) { //sets rotations
			//set rotation of object from radians
			body.quaternion.setFromAxisAngle(axis, radians);
		},

		createBody: function(options) {
			// Creates a new rigid body based on specific options
			var body  = new CANNON.Body({mass: options.mass, shape: options.shape/*, material: options.physicsMaterial */});
			body.position.set(options.position.x, options.position.y, options.position.z);

			// Apply a rotation if set by using Quaternions
			if (options.rotation) {
				_cannon.setOnAxis(body, options.rotation[0], options.rotation[1]);
				//_cannon.rotateGeometry(options.geometry, options.rotation[0], options.rotation[1]);
			}

			//create visual mesh
			var mesh = null;
			if (options.meshMaterial) {
				if (!options.geometry) {
					var shape = body.shapes[0];
					mesh = _cannon.shape2mesh(shape, options.meshMaterial);
				} else {
					mesh = new THREE.Mesh(options.geometry, options.meshMaterial);
				}
			} else {
				console.error("Cannot create mesh without material");
				return;
			}
			mesh.position.set(options.position.x, options.position.y, options.position.z);
			if (options.receiveShadow) mesh.receiveShadow = options.receiveShadow;
			if (options.castShadow) mesh.castShadow = options.castShadow;
			// Add the entity to the scene and world

			_cannon.addVisual(body, mesh);
			return body;
		},

		getMeshFromBody: function(body) {
			var bodyCount = _cannon.bodies.length;
				for (var j = 0; j < bodyCount; j++){
					if (body == _cannon.bodies[j]) {
						break;
					}
				}
			return _cannon.visuals[j];
		},

		//rotateGeometry: function(geometry, axis, radians) {
		//	if (axis.x == 1) geometry.applyMatrix( new THREE.Matrix4().makeRotationX( radians ) );
		//	else if (axis.y == 1) geometry.applyMatrix( new THREE.Matrix4().makeRotationY( radians ) );
		//	else if (axis.z == 1) geometry.applyMatrix( new THREE.Matrix4().makeRotationZ( radians ) );
		//},

		createPhysicsMaterial: function(material, friction, restitution) {
			// Create a new material and add a Cannon ContactMaterial to the world always using _cannon.playerPhysicsMaterial as basis
			var physicsMaterial = material || new CANNON.Material();
			var contactMaterial = new CANNON.ContactMaterial(physicsMaterial, _cannon.playerPhysicsMaterial, friction || _cannon.friction, restitution || _cannon.restitution);

			_cannon.world.addContactMaterial(contactMaterial);

			return physicsMaterial;
		},

		addVisual: function(body, mesh) {
			// Populate the bodies and visuals arrays
			if (body && mesh) {
				_cannon.bodies.push(body);
				_cannon.visuals.push(mesh);
				// Add body/mesh to scene/world
				_cannon.three.scene.add(mesh);
				_cannon.world.add(body);
			} else {
				console.error("body or mesh not found, cannot add visual mesh");
			}
		},

		removeVisual: function(body){
			// Remove an entity from the scene/world
			if (body) {
				_cannon.three.scene.remove(_cannon.getMeshFromBody(body));
				_cannon.world.remove(body);
				for (var i = _cannon.bodies.length - 1; i >= 0; i--) {
					if (_cannon.bodies[i] == body) {
						_cannon.visuals.splice(i,1);
						_cannon.bodies.splice(i,1);
						return;
					}
				}
			}
		},
		removeAllVisuals: function() {
			// Clear the whole physics world and THREE.js scene
			var bodyCount = _cannon.bodies.length;
			for (var i = 0; i < bodyCount; i++ ){
				_cannon.three.scene.remove(visuals[i]);
				_cannon.world.remove(bodies[i]);
			};
			_cannon.bodies.splice(0,numBodies);
			_cannon.visuals.splice(0,numBodies);
		},
		updatePhysics: function() {
			// Store the amount of bodies into bodyCount
			var bodyCount = _cannon.bodies.length;
			// Copy coordinates from Cannon.js to Three.js
			for (var i = 0; i < bodyCount; i++) {
				var body = _cannon.bodies[i], visual = _cannon.visuals[i];
				visual.position.set(body.position.x, body.position.y, body.position.z);

				// Update the Quaternions
				if (body.quaternion) {
					visual.quaternion.set(body.quaternion.x,body.quaternion.y,body.quaternion.z,body.quaternion.w);
				}
			}
			// Perform a simulation step
			_cannon.world.step(_cannon.timestep);
		},
		shape2mesh: function(shape, material) {
		 	// Convert a given shape to a THREE.js mesh
		 	var mesh;
		 	//var submesh;
		 	switch (shape.type){
		 		case CANNON.Shape.types.SPHERE:
		 			var sphere = new THREE.SphereGeometry(shape.radius, 32, 32);
		 			mesh = new THREE.Mesh(sphere, material);
		 			break;

		// 		case CANNON.Shape.types.PLANE:
		// 			var geometry = new THREE.PlaneGeometry(100, 100);
		// 			mesh = new THREE.Object3D();
		// 			submesh = new THREE.Object3D();
		// 			var ground = new THREE.Mesh(geometry, currentMaterial);
		// 			ground.scale = new THREE.Vector3(1000, 1000, 1000);
		// 			submesh.add(ground);

		// 			ground.castShadow = true;
		// 			ground.receiveShadow = true;

		// 			mesh.add(submesh);
		// 			break;

		 		case CANNON.Shape.types.BOX: {
		 			var box = new THREE.BoxGeometry(shape.halfExtents.x * 2,
		 					shape.halfExtents.y * 2,
		 					shape.halfExtents.z * 2);
		 			mesh = new THREE.Mesh(box, material);
		 			mesh.castShadow = true;
		 			mesh.receiveShadow = true;
		 			break;
		 		}

		 		case CANNON.Shape.types.CONVEXPOLYHEDRON: {
            		var geo = new THREE.Geometry();

        			// Add vertices
            		for (var i = 0; i < shape.vertices.length; i++) {
                		var v = shape.vertices[i];
            		    geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
            		}
		
            		for(var i=0; i < shape.faces.length; i++){
            		    var face = shape.faces[i];
		
            		    // add triangles
            		    var a = face[0];
            		    for (var j = 1; j < face.length - 1; j++) {
            		        var b = face[j];
            		        var c = face[j + 1];
            		        geo.faces.push(new THREE.Face3(a, b, c));
            		    }
            		}
            		geo.computeBoundingSphere();
            		geo.computeFaceNormals();
            		mesh = new THREE.Mesh( geo, material );
            		break;
            	}

		// 		case CANNON.Shape.types.COMPOUND:
		// 			// recursive compounds
		// 			var o3d = new THREE.Object3D();
		// 			for(var i = 0; i<shape.childShapes.length; i++){

		// 				// Get child information
		// 				var subshape = shape.childShapes[i];
		// 				var o = shape.childOffsets[i];
		// 				var q = shape.childOrientations[i];

		// 				submesh = _cannon.shape2mesh(subshape);
		// 				submesh.position.set(o.x,o.y,o.z);
		// 				submesh.quaternion.set(q.x,q.y,q.z,q.w);

		// 				submesh.useQuaternion = true;
		// 				o3d.add(submesh);
		// 				mesh = o3d;
		// 			}
		// 			break;

		 		default:
		 			throw "Visual type not recognized: " + shape.type;
			}

		// 	if (mesh.children) {
		// 		for (var i = 0; i < mesh.children.length; i++) {
		// 			mesh.children[i].castShadow = true;
		// 			mesh.children[i].receiveShadow = true;

		// 			if (mesh.children[i]){
		// 				for(var j = 0; j < mesh.children[i].length; j++) {
		// 					mesh.children[i].children[j].castShadow = true;
		// 					mesh.children[i].children[j].receiveShadow = true;
		// 				}
		// 			}
		// 		}
		// 	}

	 		return mesh;
		}
	};

	var _three;

	return _cannon;
};