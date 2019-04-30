/*
 * Game THREE.js module
 *
 * A class for the main THREE.js setup including camera, renderer and Cannon.js helpers
 */

window.game = window.game || {};

window.game.three = function() {
	var _three = {
		// container which will hold the final canvas element of THREE.js
		container: null,
		// Scene, camera and renderer
		camera: null,
		scene: null,
		renderer: null,
		//default field of view setting for the camera
		fov: 45,
		//default near setting for camera
		near: 1,
		//default far setting for camera
		far: 1000,

		texture: null,

		// Methods
        init: function(cannon, options) {
        	_three.container = options.container;
        	if (options.fov) { //if fov is in options change default camera fov rendering distance
				_three.fov = options.fov;
			}
			if (options.near) { //if near is in options change default camera near rendering distance
				_three.near = options.near;
			}
			if (options.far) { //if far is in options change default camera far rendering distance
				_three.far = options.far;
			}

        	_three.setupCamera();
            _three.setupRenderer();
            window.addEventListener( 'resize', _three.onWindowResize, false );

            _three.reset(cannon);
            // Add boxes
          //var halfExtents = new CANNON.Vec3(1,1,1);
          //var boxShape = new CANNON.Box(halfExtents);
          //var boxGeometry = new THREE.BoxGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);
          //for(var i=0; i<7; i++){
          //    var xP = (Math.random()-0.5)*20;
          //    var yP = 1 + (Math.random()-0.5)*1;
          //    var zP = (Math.random()-0.5)*20;
          //    cannon.createBody({
          //    	mass: 5,
          //    	shape: boxShape,
          //    	position: {
          //    		x: xP,
          //    		y: yP,
          //    		z: zP
          //    	},
          //    	//geometry: boxGeometry,
          //    	meshMaterial: new THREE.MeshLambertMaterial({color: 0x991199}),
          //    	receiveShadow: false,
          //    	castShadow: true,
          //    	collisionGroup: cannon.collisionGroup.solids,
          //		collisionFilter: cannon.collisionGroup.enemy | cannon.collisionGroup.player | cannon.collisionGroup.solids
          //    });
                //var boxBody = new CANNON.Body({ mass: 5 });
                //boxBody.addShape(boxShape);
                //var boxMesh = new THREE.Mesh( boxGeometry, material );
                //cannon.world.add(boxBody);
                //_three.scene.add(boxMesh);
                //boxBody.position.set(x,y,z);
                //boxMesh.position.set(x,y,z);
                //boxMesh.castShadow = true;
                //boxMesh.receiveShadow = true;
            //}
        },
        reset: function(cannon) {
			_three.setupScene();
			_three.setupLights();
			_three.setupSkybox();

			// floor
            cannon.createBody({
            	mass: 0,
            	shape: new CANNON.Plane(),
            	position: {
            		x: 0,
            		y: 0,
            		z: 0
            	},
            	rotation: [new CANNON.Vec3(1,0,0), -Math.PI/2],
            	geometry: new THREE.PlaneGeometry( 40, 40, 50, 50 ),
            	meshMaterial: new THREE.MeshLambertMaterial({ color: 0xdddddd, opacity: 0.8, transparent:true }),
            	receiveShadow: true,
            	castShadow: false,
            	material: cannon.groundMaterial,
            	collisionGroup: cannon.collisionGroup.solids,
            	collisionFilter: cannon.collisionGroup.enemy | cannon.collisionGroup.player | cannon.collisionGroup.solids
            });
		},
		setupSkybox() {
			//load skybox
			var video = document.createElement('video');
			video.src = "models/stars.mp4";
			video.autoplay = true;
			video.loop = true;

			texture = new THREE.VideoTexture(video);
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			texture.format = THREE.RGBFormat;

			materialArray = [];
			for (var i = 0; i < 6; i++) {
					materialArray.push( new THREE.MeshStandardMaterial({
			 			map: texture,
			 			side: THREE.BackSide
					}));
			}

			var material = new THREE.MeshBasicMaterial({map:texture});
			material.side = THREE.BackSide;

			var starsGeometry = new THREE.CubeGeometry( 75, 75, 75 );
		//	var skyMaterial = new THREE.MeshBasicMaterial( materialArray );
			var skyBox = new THREE.Mesh( starsGeometry, material);
			skyBox.rotation.x += Math.PI / 2;
			_three.scene.add( skyBox );

			// var supGif = new SuperGif({ gif: "models/stars.gif" } );
			// supGif.load();
			// var gifCanvas = supGif.get_canvas();
			//
			// materialArray = [];
			// for (var i = 0; i < 6; i++) {
			// 		materialArray.push( new THREE.MeshStandardMaterial({
			//  			map: new THREE.Texture( gifCanvas ),
			//  			side: THREE.BackSide,
			// 			displacementMap: material.map
			// 		}));
			// }
			//
			// var starsGeometry = new THREE.CubeGeometry( 500, 500, 500 );
			// var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
			// var skyBox = new THREE.Mesh( starsGeometry, skyMaterial );
			// skyBox.rotation.x += Math.PI / 2;
			// _three.scene.add( skyBox );
		},
        setupCamera: function() {
        	//set up camera
            _three.camera = new THREE.PerspectiveCamera( _three.fov, window.innerWidth / window.innerHeight, _three.near, _three.far );
            _three.camera.up.set(0,1,0); //makes sure up vector is along y-axis
            _three.camera.position.set(0,40,50);
            _three.camera.lookAt(0,0,0);
        },
        setupScene: function() {
        	//setup scene
            _three.scene = new THREE.Scene();
            //_three.scene.fog = new THREE.Fog( 0x222222, 0, 500 ); //add fog
        },
        setupRenderer: function() {
        	_three.renderer = new THREE.WebGLRenderer({antialias: true}); //setup renderer with antialiasing
        	//set up shadows
            _three.renderer.shadowMap.enabled = true;
            _three.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            _three.renderer.setSize( window.innerWidth, window.innerHeight );
            _three.renderer.setClearColor( 0x222222, 1 );
            document.body.appendChild( _three.renderer.domElement );
        },
		setupLights: function() {
			//add ambient light
            var ambient = new THREE.AmbientLight( 0x111111 );
            _three.scene.add( ambient );

            //spotlight that can cast shadows
            var light = new THREE.SpotLight( 0xffffff );
            light.position.set( 10, 30, 20 );
            light.target.position.set( 0, 0, 0 );
            light.castShadow = true;

            light.shadow.camera.near = 20;
            light.shadow.camera.far = 100;
            light.shadow.camera.fov = 45;
            light.shadowMapBias = 0.1;
            light.shadowMapDarkness = 0.7;
            light.shadow.mapSize.width = 512*2;
            light.shadow.mapSize.height = 512*2;

            //light.shadowCameraVisible = true;
            _three.scene.add( light );
			//var hemiLight = new THREE.HemisphereLight(window.game.static.colors.white, window.game.static.colors.white, 0.6);
			//	hemiLight.position.set(0, 0, -1);
			//	_three.scene.add(hemiLight);
//
			//	var spotLight = new THREE.SpotLight(window.game.static.colors.white);
			//	spotLight.position.set(0, 0, 500);
			//	//spotLight.castShadow = true;
			//	_three.scene.add(spotLight);
		},
		render: function() {
			// Update the scene
			_three.renderer.render(_three.scene, _three.camera);
		},
 		onWindowResize: function() {
			// Keep screen size when window resizes
			_three.camera.aspect = window.innerWidth / window.innerHeight;
			_three.camera.updateProjectionMatrix();
			_three.renderer.setSize(window.innerWidth, window.innerHeight);
		}
	};

	return _three;
};
