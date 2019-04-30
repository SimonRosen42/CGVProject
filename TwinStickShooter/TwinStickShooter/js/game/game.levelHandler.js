// import * as THREE from "../libs/three";
// import * as CANNON from "../libs/cannon";

/*global window*/

// import * as THREE from "../libs/three";

window.game = window.game || {}

var allWalls = []; // list of all walls
var wallWidth = 0.5;
var wallHeight = 1.5;

class Level {
	constructor(){
		this.size = 10;
		this.shape = null;
		this.mass = 0; //a wall is immovable
	}
	create(cannon, three){ //, pos
		//create level
		var roomPos = {x: 0, y: wallHeight, z:0}
		var doorPos = new Array({x: 0, y: 0, z: 2},{x: 0, y: 0, z: 2}, null, null) //note these are in respect to the room's origin

		var room = new Room(RoomType.Start, roomPos, 10, 10, doorPos)
		room.create(cannon,three)
	}
}

var RoomType = {
	Start: 0,
	Loot: 1,
	EnemySpawn: 2,
	Finish: 3
}

var walls = [];

class Room{
	// Arguments:
	// roomType - type of room
	// roomPos - (x,y) coords of room in respect to world
	// w - width of room, l - length of room
	// doorPos - (x,y) coords of door in respect to room (0,0) being top left corner of room
	constructor(roomType, roomPos, w, l, doorPos){ //doorPos is an array of each door position
		this.roomType = roomType;
		this.roomPos = roomPos;
		this.w = w;
		this.h = 2;
		this.l = l;
		this.doorPos = doorPos; // should be fixed length of 4 (null element represents no door)
		// this can be changed to be dynamic in the future but for now it ain't
		this.cameraPos = null; //(x,y,z) coordinate of where camera should point from // is calculated
		this.roomLight = null;
	}

	create(cannon, three){
		var bodyPos; //(x,y,z)
		var wallProps; //(w,l,h);

		// create floor
		// var floor = cannon.createBody({
		// 	mass: 0,
		// 	shape: new CANNON.Plane(),
		// 	position: {
		// 		x: this.roomPos.x,
		// 		y: this.roomPos.y,
		// 		z: this.roomPos.z
		// 	},
		// 	rotation: [new CANNON.Vec3(1,0,0), -Math.PI/2],
		// 	geometry: new THREE.PlaneGeometry( this.w, this.l), //, 50, 50
		// 	meshMaterial: new THREE.MeshLambertMaterial({ color: 0xdddddd }),
		// 	receiveShadow: true,
		// 	castShadow: false,
		// 	material: cannon.groundMaterial,
		// 	collisionGroup: cannon.collisionGroup.solids,
		// 	collisionFilter: cannon.collisionGroup.enemy | cannon.collisionGroup.player | cannon.collisionGroup.solids
		// });

		// note: roomPos denotes the centre of the room
		//-this.l/2
 		// top wall
		var wallPos = {x: 0 + this.roomPos.x, y:0 + this.roomPos.y, z:-this.l + this.roomPos.z}; // note wallPos is an offset of roomPos
		var wallProps = {w: this.w - wallWidth, l: wallWidth, h:wallHeight};

		var wall = new Wall(cannon,three,wallPos, wallProps);
		var doors = [];
		var doorWidth = 0.5;
		walls.push(wall);

		// bottom wall
		wallPos = {x: 0 + this.roomPos.x, y:0 + this.roomPos.y, z:+this.l + this.roomPos.z}; // note wallPos is an offset of roomPos
		wallProps = {w: this.w + wallWidth, l: wallWidth, h:wallHeight};
		walls.push(new Wall(cannon,three,wallPos, wallProps))

		// left wall
		wallPos = {x: -this.w + this.roomPos.x, y:0 + this.roomPos.y, z: 0 + this.roomPos.z}; // note wallPos is an offset of roomPos
		wallProps = {w: wallWidth, l: this.l + wallWidth, h:wallHeight};
		walls.push(new Wall(cannon,three,wallPos, wallProps))

		// right wall
		wallPos = {x: this.w + this.roomPos.x, y:0 + this.roomPos.y, z: 0 + this.roomPos.z}; // note wallPos is an offset of roomPos
		wallProps = {w: wallWidth, l: this.l + wallWidth, h:wallHeight};
		walls.push(new Wall(cannon,three,wallPos, wallProps))

		//var centre = new Wall(cannon,three,{x:this.roomPos.x,y:this.roomPos.y,z:this.roomPos.z}, {w:0.5, l:0.5, h:0.5}) // just for refrence to show centre of level

		//var corridor = new Corridor(cannon,three,{x:0,y:0,z:0}, {x:2,y:0,z:0});
		//door 1 - left door //vertical wall
		if (this.doorPos[0] !== null){
			// console.log("Yo 1");
			// wallPos = {x:0, y:0, z:0};
			// wallProps = {w: wallWidth, l: this.doorPos[0].z, h:wallHeight};
			// walls.push(new Wall(cannon,three,wallPos, wallProps));
			// doors[0] = new Door(cannon,three,this.doorPos[0]);
			//honestly just yoloing
			// wallPos.z = this.doorPos[0].z+2;
			// wallPos = {x:0, y:0, z:this.doorPos[0].z};
			// wallProps = {w: wallWidth, l: this.l - this.doorPos[0].z, h:wallHeight};
			// wallProps.l = this.l - this.doorPos[0].z - 2 //?
			//doing it like this because JS is a piece of shit
			// walls.push(new Wall(cannon,three,
			// 	{x:0, y:0, z:this.doorPos[0].z},wallProps)); //wallPos
				//{w: wallWidth, l: this.l - this.doorPos[0].z, h:wallHeight})); //wallProps
		} else {
			//null therefore no door
		}
		//door 2 - top door
		if (this.doorPos[1] !== null){
			console.log("Yo 2");
		} else {
			console.log("Ma 2");
		}
		//door 3 - right door
		if (this.doorPos[2] !== null){
			console.log("Yo 3");
		} else {
			console.log("Ma 3");
		}
		//door 4 - bottom door
		if (this.doorPos[3] !== null){
			console.log("Yo 4");
		} else {
			console.log("Ma 4");
		}

		//consists of up to 8 walls

		// this.createWall(cannon,three,wallPos, wallProps)
		// // top right
		// wallPos = {x:this.w, y:0, z:0};
		// this.createWall(cannon,three,wallPos, wallProps)
		// // bottom left
		// wallPos = {x:0, y:0, z:this.l};
		// this.createWall(cannon,three,wallPos, wallProps)
		// // bottom right
		// wallPos = {x:this.w, y:0, z:this.l};
		// this.createWall(cannon,three,wallPos, wallProps)
		//create walls and doors
		// if door on top wall

		// if door on bottom wall

		// if door on left wall

		//if door on right wall

		switch (this.roomType) {
			case RoomType.Start: //Start Room
				// //top wall
				// var wallPos = {x:0, y:0, z:0}; // note wallPos is an offset of roomPos
				// var wallProps = {w: this.w, l: wallWidth, h:wallHeight};
				// this.createWall(cannon,three,wallPos, wallProps)
				// //bottom wall
				// wallPos = {x:0, y:0, z:this.l};
				// this.createWall(cannon,three,wallPos, wallProps)
				break;
			case RoomType.Loot: //Loot Room
				//
				break;
			case RoomType.EnemySpawn: //Enemy Spawn Room - Where most of fighting happens
				//
				break;
			case RoomType.Finish: //Finish Room
				//
				break;
		}
	}
}

//corridor between rooms
class Corridor{
	constructor(cannon, three, start, end){
		this.corridorWidth =2;
		this.pos = {x: (start.x+end.x)/2, y: start.y, z:(start.z+end.z)/2}; //i.e. get midpoints
		this.pos1 = this.pos;
		this.pos2 = this.pos;
		if (start.x = end.x){ //i.e. horizontal
			this.pos1.z = this.pos1.z - this.corridorWidth*1/2;
			this.pos2.z = this.pos1.z + this.corridorWidth*1/2;
			this.props = {w: Math.abs(start.x - end.x), l: wallWidth, h: wallHeight};
			allWalls.push(new Wall(cannon,three,this.pos1,this.props));
			allWalls.push(new Wall(cannon,three,this.pos2,this.props));
		} else if(start.z = end.z){ //i.e. vertical
			this.pos1.x = this.pos1.x - this.corridorWidth*1/2;
			this.pos2.x = this.pos1.x + this.corridorWidth*1/2;
			this.props = {w: wallWidth, l: Math.abs(start.z - end.z), h: wallHeight};
			allWalls.push(new Wall(cannon,three,this.pos1,this.props));
			allWalls.push(new Wall(cannon,three,this.pos2,this.props));
		} else {
			Console.log("Corridor neither horizontal or vertical");
		}
	}
}

class Wall{
	constructor(cannon, three, pos, props){ //note transformation applied so that position is in respect to the top left of the wall
		this.cannon = cannon;
		this.three = three;
		this.pos = pos; // (x,y,z)
		this.props = props; // (w,h,l)

		//transforming position from centre of object to top left of object
		// this.pos.x = this.pos.x + 0.5*props.w;
		// this.pos.z = this.pos.z + 0.5*props.l;

		this.texture = null; // later use
		this.color = null;

		this.shape = new CANNON.Box(new CANNON.Vec3(props.w, props.h, props.l));
		this.body = new cannon.createBody({
			mass: 0,
			shape: this.shape,
			material: cannon.solidMaterial,
			meshMaterial: new THREE.MeshLambertMaterial({color : 0xff0000, opacity: 1, transparent: true}),
			position: {
				x: pos.x,
				y: pos.y,
				z: pos.z
			},
			castShadow: true,
			collisionGroup: cannon.collisionGroup.solids,
			collisionFilter: cannon.collisionGroup.solids | cannon.collisionGroup.player | cannon.collisionGroup.enemy
		});
		this.mesh = cannon.getMeshFromBody(this.body);

		this.layout = null;
		allWalls.push(this);
	}

	setTransparency(transparency){
		this.body.meshMaterial = new THREE.MeshLambertMaterial({color : 0xff0000, opacity: transparency, transparent: true});
		this.mesh = this.cannon.getMeshFromBody(this.body);
	}

}

class Door{
	constructor(cannon, three, pos){
		this.cannon = cannon;
		this.three = three;
		this.pos = pos; // (x,y,z)
		this.doorWidth = 0.5;
		this.doorHeight = 3;

		this.pos.x = this.pos.x + 0.5*this.doorWidth;
		this.pos.z = this.pos.z + 0.5*this.doorWidth;

		this.texture = null; // later use
		this.color = null;

		this.shape = new CANNON.Box(new CANNON.Vec3(this.doorWidth, this.doorHeight, this.doorWidth));
		this.body = new cannon.createBody({
			mass: 0,
			shape: this.shape,
			material: cannon.solidMaterial,
			meshMaterial: new THREE.MeshLambertMaterial({color : 0x00ff00, transparent : true, opacity: 0.4}),
			position: {
				x: pos.x,
				y: pos.y,
				z: pos.z
			},
			castShadow: false,
			collisionGroup: cannon.collisionGroup.solids,
			collisionFilter: cannon.collisionGroup.solids | cannon.collisionGroup.player | cannon.collisionGroup.enemy
		});
		this.mesh = cannon.getMeshFromBody(this.body);
	}
}


window.game.levelHandler = function () {
	"use strict";
	var _levelHandler = {
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