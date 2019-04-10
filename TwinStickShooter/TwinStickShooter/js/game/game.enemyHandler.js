window.game = window.game || {}

class Enemy {

	enemy = new THREE.Object3D();
	enemy.userData = {

		// Enemy entity including mesh and rigid body
		model : null;
		mesh : null;
		collider : null;
		rigidBody : null;
		// Enemy mass which affects other rigid bodies in the world
		mass : 3;

		acceleration : 1;
		speedMax : 30;
		
	}

	constructor(index, position, rotation) {
		enemy.position = position;
		enemy.rotation = rotation;
		create();
	}

	create = function() {

		window.game.core._cannon.enemyPhysicsMaterial = window.game.core._cannon.createPhysicsMaterial(new CANNON.Material("enemyMaterial"), 0.0, 0.0);

		enemy.userData.collider = new CANNON.Cylinder(10, 10, 30, 32);

		enemy.userData.rigidBody = new CANNON.RigidBody(enemy.userData.mass, enemy.userData.collider, window.game.core._cannon.enemyPhysicsMaterial);
		enemy.userData.rigidBody.position.set(enemy.position);

		enemy.userData.model = window.game.core._three
		enemy.userData.mesh = window.game.core._cannon.addVisual(enemy.userData.rigidBody, null, new THREE.mesh(new THREE.CylinderGeometry(10, 10, 30, 32), new THREE.MeshBasicMaterial({color : 0xff0000})));

		enemy.userData.rigidBody.addEventListener("collide", function(event) {

		} );
	};


	update = function() {


		var playerPos = [];
		for (var i = 0; i < window.game.playerHandler.players.length; i++) 
			playerPos.push(window.game.playerHandler.players[i].userData.rigidBody.position - enemy.userData.rigidBody.position);

		var min = 10000000;
		var minPlayerIndex = -1;
		for (var i = 0; i < playerPos.length; i++) {
			if (playerPos[i] < min) {
				min = playerPos[i];
				minPlayerIndex = i;
			}
		}

	}



}

window.game.enemyHandler = function() {
	
	enemies : {};

	addEnemy: function(enemy) {
		enemies.push(enemy);
	}

	removeEnemy: function(id) {
		for (var i = 0; i < enemies.length; i++) {
			if (enemies[i] != null && enemies[i].uuid == id) {
				delete enemies[i];
				break;
			}
		}
	}

	update: function() {
		for (var i = 0; i < enemies.length; i++) {
			enemies[i].update();
		}
	}


}