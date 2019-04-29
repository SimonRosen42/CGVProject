
// import * as THREE from "../libs/three";
// import * as CANNON from "../libs/cannon";

/*global window*/

// import * as THREE from "../libs/three";

window.game = window.game || {}

class Level {
	constructor(){
		this.size = 10;
		this.shape = null;
		this.mass = 0; //a wall is immovable
	}
	create(cannon, three){ //, pos
		this.shape = new CANNON.Box(new CANNON.Vec3(1,3,5));
		//https://github.com/schteppe/cannon.js/blob/master/demos/compound.html - compound objects
		this.body = new cannon.createBody({
			mass: this.mass,
			shape: this.shape,
			material: cannon.solidMaterial,
			meshMaterial: new THREE.MeshLambertMaterial({color : 0xff0000}),
			position: {
				// x: pos.x,
				// y: pos.y,
				// z: pos.z
				x: 0,
				y: 1,
				z: 0.2
			},
			castShadow: true,
			collisionGroup: cannon.collisionGroup.solids, //should change to own collisionGroup but using this for now
			collisionFilter: cannon.collisionGroup.solids | cannon.collisionGroup.player | cannon.collisionGroup.enemy
		});
		this.mesh = cannon.getMeshFromBody(this.body);
	}
}

class Room{
	constructor(i){
		//
	}
	create(cannon, three){
		//
	}
}


window.game.levelHandler = function () {
	"use strict";
	var _levelHandler;
	_levelHandler = {
		cannon: null,
		three: null,

		//initialise
		init: function (c, t) {
			_levelHandler.cannon = c;
			_levelHandler.three = t;
		},



		create: function(){
			var floorSize = 800.0;
			var floorHeight = 20;

			var geometry = new THREE.BufferGeometry();
			var vertices = new Float32Array([

				-floorSize / 2, -floorSize / 2, 0.0,
				floorSize / 2, -floorSize / 2, 0.0,
				-floorSize / 2, floorSize / 2, 0.0,

				-floorSize / 2, floorSize / 2, 0.0,
				floorSize / 2, -floorSize / 2, 0.0,
				floorSize / 2, floorSize / 2, 0.0

			]);

			// add vertices to our geometry
			geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

			const zone = 'level1';

			var temp = new Level();
			temp.create(_levelHandler.cannon, _levelHandler.three);
			//

			// Add a floor
			// _levelHandler.cannon.createRigidBody({
			// 	shape: new CANNON.Box(new CANNON.Vec3(floorSize, floorSize, floorHeight)),
			// 	mass: 0,
			// 	position: new CANNON.Vec3(0, 0, -floorHeight),
			// 	meshMaterial: new THREE.MeshLambertMaterial({color: window.game.static.colors.black}),
			// 	physicsMaterial: _levelHandler.cannon.solidMaterial
			// });
		}
	};
	return _levelHandler;
}

// window.game.levelHandler = function () {
// 	var _levelHandler = {
//
// 		create: function () {
// 			// Create a solid material for all objects in the world
// 			window.game.core._cannon.solidMaterial = window.game.core._cannon.createPhysicsMaterial(new CANNON.Material("solidMaterial"), 0, 0.1);
// 			// Define floor settings
// 			var floorSize = 800.0;
// 			var floorHeight = 20;
//
// 			var geometry = new THREE.BufferGeometry();
//
// 			var vertices = new Float32Array([
//
// 				-floorSize / 2, -floorSize / 2, 0.0,
// 				floorSize / 2, -floorSize / 2, 0.0,
// 				-floorSize / 2, floorSize / 2, 0.0,
//
// 				-floorSize / 2, floorSize / 2, 0.0,
// 				floorSize / 2, -floorSize / 2, 0.0,
// 				floorSize / 2, floorSize / 2, 0.0
//
// 			]);
//
// 			// add vertices to our geometry
// 			geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
//
// 			// create level
// 			// const pathfinding = new Pathfinding();
// 			const zone = 'level1';
// 			// pathfinding.setZoneData(zone, Pathfinding.createZone(geometry));
//
// 			// findPath = function(a, b) {
// 			// 	const groupID = pathfinding.getGroup(zone, a);
// 			// 	const path = pathfinding.findPath(a, b, zone, groupID);
// 			// 	return path;
// 			// }
//
// 			// Add a floor
// 			window.game.core._cannon.createRigidBody({
// 				shape: new CANNON.Box(new CANNON.Vec3(floorSize, floorSize, floorHeight)),
// 				mass: 0,
// 				position: new CANNON.Vec3(0, 0, -floorHeight),
// 				meshMaterial: new THREE.MeshLambertMaterial({color: window.game.static.colors.black}),
// 				physicsMaterial: window.game.core._cannon.solidMaterial
// 			});
// 			// Add some boxes
// 			window.game.core._cannon.createRigidBody({
// 				shape: new CANNON.Box(new CANNON.Vec3(30, 30, 30)),
// 				mass: 0,
// 				position: new CANNON.Vec3(-240, -200, 30 - 1),
// 				meshMaterial: new THREE.MeshLambertMaterial({color: window.game.static.colors.cyan}),
// 				physicsMaterial: window.game.core._cannon.solidMaterial
// 			});
// 			window.game.core._cannon.createRigidBody({
// 				shape: new CANNON.Box(new CANNON.Vec3(30, 30, 30)),
// 				mass: 0,
// 				position: new CANNON.Vec3(-300, -260, 90),
// 				meshMaterial: new THREE.MeshLambertMaterial({color: window.game.static.colors.cyan}),
// 				physicsMaterial: window.game.core._cannon.solidMaterial
// 			});
// 			window.game.core._cannon.createRigidBody({
// 				shape: new CANNON.Box(new CANNON.Vec3(30, 30, 30)),
// 				mass: 0,
// 				position: new CANNON.Vec3(-180, -200, 150),
// 				meshMaterial: new THREE.MeshLambertMaterial({color: window.game.static.colors.cyan}),
// 				physicsMaterial: window.game.core._cannon.solidMaterial
// 			});
// 			window.game.core._cannon.createRigidBody({
// 				shape: new CANNON.Box(new CANNON.Vec3(30, 30, 30)),
// 				mass: 0,
// 				position: new CANNON.Vec3(-120, -140, 210),
// 				meshMaterial: new THREE.MeshLambertMaterial({color: window.game.static.colors.cyan}),
// 				physicsMaterial: window.game.core._cannon.solidMaterial
// 			});
// 			window.game.core._cannon.createRigidBody({
// 				shape: new CANNON.Box(new CANNON.Vec3(30, 30, 30)),
// 				mass: 0,
// 				position: new CANNON.Vec3(-60, -80, 270),
// 				meshMaterial: new THREE.MeshLambertMaterial({color: window.game.static.colors.cyan}),
// 				physicsMaterial: window.game.core._cannon.solidMaterial
// 			});
//
// 			// Grid Helper
// 			var grid = new THREE.GridHelper(floorSize, floorSize / 10);
// 			grid.position.z = 0.5;
// 			grid.rotation.x = window.game.helpers.degToRad(90);
// 			window.game.core._three.scene.add(grid);
// 		}
// 	}
// 	return _levelHandler;
// }
