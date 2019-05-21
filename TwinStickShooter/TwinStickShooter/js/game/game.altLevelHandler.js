// New class to test new code

window.game = window.game || {};
var globalCannon, globalThree;
//Used in procedural generation of level
var tileWidth = 1; //In x dimension
var tileLength = 1; //In z dimension
var MAP_WIDTH = 50, MAP_HEIGHT = 50; //for 2D representation of map MAP_HEIGHT is in z dimension
var wallWidth = 0.5;
var wallHeight = 1.5;
var walls = [];

//Notes:
//May implement functionality to only render certain amount of level to increase performance - Fuck dat shit
class Level {
    constructor(maxRoomNo, maxRoomSize, minRoomSize, renderAll = true){
        this.renderAll = renderAll;
        //this.size = size
        this.maxRoomSize = maxRoomSize;
        this.minRoomSize = minRoomSize;
        this.maxRoomNo = maxRoomNo;
        // create array for room storage for easy access
        this.rooms = [];
    }

    create(){
        //Create level objects but do not render
        this.placeRooms();
    }

    render(){
        //Render all or render some
        if (this.renderAll){
            //Render entire map
            //Loop through rooms and render
            for (var i = 0; i< this.maxRoomNo; i++){
                this.rooms[i].render();
            }
        } else {
            //Render part of map
        }
    }

    //functions to procedurally generate level xD
    placeRooms() {
        // randomize values for each room
        for (var i = 0; i <  this.maxRoomNo; i++) { // for loop from 0 to max rooms
            //fix to use actual js random method
            var w = this.minRoomSize + Math.random()*(this.maxRoomSize - this.minRoomSize + 1);
            var h = this.minRoomSize + Math.random()*(this.maxRoomSize - this.minRoomSize + 1);
            w = Math.round(w)
            h = Math.round(h)
            var x = Math.random()*(MAP_WIDTH - w - 1) + 1 - (MAP_WIDTH/2);
            var y = Math.random()*(MAP_HEIGHT - h - 1) + 1 - (MAP_HEIGHT/2);
            x = Math.round(x)
            y = Math.round(y)

            var pos = {x:x, z:y};
            var dim = {w:w, l:h};
            // create room with randomized values
            var newRoom = new Room(pos, dim);

            var failed = false;
            for (var i = 0; i< this.rooms.length; i++) {
                if (newRoom.intersects(this.rooms[i])) {
                    failed = true;
                    break;
                }
            }
            if (!failed) {
                // local function to carve out new room //Don't think this is necessary
                //createRoom(newRoom);

                // push new room into rooms array
                console.log(newRoom)
                this.rooms.push(newRoom)
            }
        }
    }
}



class Room {
    // constructor(pos, dim, cornerPos = null, doorPoses = null){ //iffy variable name for door positions but anyways
    //     //Set up variables
    //     this.pos = pos; //centre of room in respect to level {x,y,z}
    //     this.dim = dim; //dimensions of room {w,h,l} // w - width (w), h - height (y), l - length (z)
    //     this.doorPoses = doorPoses;
    //     this.cornerPos = cornerPos; //positions of corners of room {x1,x2,z1,z2}
    //     this.dimTiles = {w: tileWidth, l: tileLength}; //dimensions in terms of tiles {w,l} //w - width (x), l - length (z) //2D representation of room
    // }

    constructor(pos, dim, doorPoses = null){ //iffy variable name for door positions but anyways
        //Set up variables
        this.doorPoses = doorPoses;
        this.pos = pos; //position of top right corner of room {x,z}
        this.dim = dim;
        this.tileDims = {w: tileWidth, l: tileLength}; //dimensions in terms of tiles {w,l} //w - width (x), l - length (z) //2D representation of room

        this.x1 = pos.x;
        this.x2 = pos.x + dim.w;
        this.z1 = pos.z;
        this.z2 = pos.z + dim.l;

        // this.x = pos.x * this.tileDims.w;
        // this.z = pos.z * this.tileDims.l;

        this.centre = {x: Math.floor((this.x1 + this.x2) / 2), z: Math.floor((this.z1 + this.z2) / 2)};

        //Calculated
        this.roomCentre = null; //calculated
        this.wallHeight = 2; //Tweak later



    }

    getCoords(){
        var coords = {x1: this.x1, x2: this.x2, z1: this.z1, z2: this.z2};
        return coords;
    }

    //return true if room intersects with this one //TODO: Fix
    intersects(room){
        var roomCoords = room.getCoords();
        var w = Math.abs(roomCoords.x2 - roomCoords.x1);
        var l = Math.abs(roomCoords.z1 - roomCoords.z2);
        w = 0; l = 0;
        //'scale' room
        roomCoords= {x1:roomCoords.x1-w/2, x2:roomCoords.x2+w/2, z1:roomCoords.z1-l/2, z2:roomCoords.z2+l/2}
        return (this.x1 <= roomCoords.x2 && this.x2 >= roomCoords.x1 && this.z1 <= roomCoords.z2 && roomCoords.z2 >= roomCoords.z1);
    }

    create(doorPoses=null){ //will use doorPoses created in constructor if this is not used
        //
    }

    render(){
        this.roomPos = {x:this.centre.x, y:wallHeight, z:this.centre.z};
        this.w = this.dim.w;
        this.l = this.dim.l;
        // top wall
        var wallPos = {x: 0 + this.roomPos.x, y:0 + this.roomPos.y, z:-this.l + this.roomPos.z}; // note wallPos is an offset of roomPos
        var wallProps = {w: this.w - wallWidth, l: wallWidth, h:wallHeight};

        var wall = new Wall(wallPos, wallProps);
        var doors = [];
        var doorWidth = 0.5;
        walls.push(wall);

        // bottom wall
        wallPos = {x: 0 + this.roomPos.x, y:0 + this.roomPos.y, z:+this.l + this.roomPos.z}; // note wallPos is an offset of roomPos
        wallProps = {w: this.w + wallWidth, l: wallWidth, h:wallHeight};
        walls.push(new Wall(wallPos, wallProps))

        // left wall
        wallPos = {x: -this.w + this.roomPos.x, y:0 + this.roomPos.y, z: 0 + this.roomPos.z}; // note wallPos is an offset of roomPos
        wallProps = {w: wallWidth, l: this.l + wallWidth, h:wallHeight};
        walls.push(new Wall(wallPos, wallProps));

        // right wall
        wallPos = {x: this.w + this.roomPos.x, y:0 + this.roomPos.y, z: 0 + this.roomPos.z}; // note wallPos is an offset of roomPos
        wallProps = {w: wallWidth, l: this.l + wallWidth, h:wallHeight};
        walls.push(new Wall(wallPos, wallProps));
    }
}

class Wall{
    constructor(pos, props){ //note transformation applied so that position is in respect to the top left of the wall
        this.cannon = globalCannon;
        this.three = globalThree;
        this.pos = pos; // (x,y,z)
        this.props = props; // (w,h,l)
        var cannon = globalCannon;
        var three = globalThree;

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
            collisionFilter: cannon.collisionGroup.solids | cannon.collisionGroup.player | cannon.collisionGroup.enemy// | cannon.collisionGroup.projectile
        });
        this.mesh = cannon.getMeshFromBody(this.body);

        this.layout = null;
        //allWalls.push(this);
    }

    setTransparency(transparency){
        this.body.meshMaterial = new THREE.MeshLambertMaterial({color : 0xff0000, opacity: transparency, transparent: true});
        this.mesh = this.cannon.getMeshFromBody(this.body);
    }

}

class Door{
    //
}

class Grate{
    //
}

window.game.levelHandler = function () {
    "use strict";
    var _levelHandler = {
        //Add variables
        cannon: null,
        three: null,
        //initialise
        init: function (c, t) {
            _levelHandler.cannon = c;
            _levelHandler.three = t;
            //set cannon and three variables - used later
            globalCannon = c;
            globalThree = t;
        },

        create: function(){
            //Do stuff
            //Create and render objects
            var level = new Level(5,5, 2);
            level.create();
            level.render();
            var fam = "";
        }
    };
    return _levelHandler;
}