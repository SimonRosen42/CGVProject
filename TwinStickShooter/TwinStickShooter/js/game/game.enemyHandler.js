window.game = window.game || {}

class Enemy {

	enemy = new THREE.Object3D();
		// Enemy entity including mesh and rigid body
	model = null;
	mesh = null;
	collider = null;
	rigidBody = null;
		// Enemy mass which affects other rigid bodies in the world
	mass = 3;

	acceleration = 1;
	speedMax = 30;

	create = function() {

		window.game.core._cannon.enemyPhysicsMaterial = window.game.core._cannon.createPhysicsMaterial(new CANNON.Material("enemyMaterial"), 0.0, 0.0);

		enemy.collider = new CANNON.Cylinder(10, 10, 30, 32);

		enemy.rigidBody = new CANNON.RigidBody(enemy.mass, enemy.collider, window.game.core._cannon.enemyPhysicsMaterial);
		enemy.rigidBody.position.set(enemy.position.x, enemy.position.y, enemy.position.z);

		//enemy.userData.model = window.game.core._three
		enemy.mesh = window.game.core._cannon.addVisual(enemy.rigidBody, null, new THREE.mesh(new THREE.CylinderGeometry(10, 10, 30, 32), new THREE.MeshBasicMaterial({color : 0xff0000})));

		enemy.rigidBody.addEventListener("collide", function(event) {

		} );
	};

	constructor(position, rotation) {
		//enemy.position = position;
		//enemy.rotation = rotation;
		window.game.core._cannon.enemyPhysicsMaterial = window.game.core._cannon.createPhysicsMaterial(new CANNON.Material("enemyMaterial"), 0.0, 0.0);

		enemy.collider = new CANNON.Cylinder(10, 10, 30, 32);

		enemy.rigidBody = new CANNON.RigidBody(enemy.mass, enemy.collider, window.game.core._cannon.enemyPhysicsMaterial);
		enemy.rigidBody.position.set(enemy.position.x, enemy.position.y, enemy.position.z);

		//enemy.userData.model = window.game.core._three
		enemy.mesh = window.game.core._cannon.addVisual(enemy.rigidBody, null, new THREE.mesh(new THREE.CylinderGeometry(10, 10, 30, 32), new THREE.MeshBasicMaterial({color : 0xff0000})));

		enemy.rigidBody.addEventListener("collide", function(event) {

		} );
	};


	update = function() {


		var playerPos = [];
		for (var i = 0; i < window.game.playerHandler.players.length; i++) 
			playerPos.push(window.game.playerHandler.players[i].rigidBody.position - enemy.rigidBody.position);

		var min = 10000000;
		var minPlayerIndex = -1;
		for (var i = 0; i < playerPos.length; i++) {
			if (playerPos[i] < min) {
				min = playerPos[i];
				minPlayerIndex = i;
			}
		}

	};

}

window.game.enemyHandler = function() {
	var _enemyHandler = {
		enemies : {},

		addEnemy: function(enemy) {
			enemies.push(enemy);
		},

		removeEnemy: function(id) {
			for (var i = 0; i < enemies.length; i++) {
				if (enemies[i] != null && enemies[i].uuid == id) {
					delete enemies[i];
					break;
				}
			}
		},

		update: function() {
			for (var i = 0; i < enemies.length; i++) {
				enemies[i].update();
			}
		}
	}

	return _enemyHandler;
}