window.game = window.game || {}

window.game.levelHandler = function () {
		create: function() {
		// Create a solid material for all objects in the world
		window.game.core._cannon.solidMaterial = window.game.core._cannon.createPhysicsMaterial(new CANNON.Material("solidMaterial"), 0, 0.1);
		// Define floor settings
		var floorSize = 800;
		var floorHeight = 20;
		// Add a floor
		window.game.core._cannon.createRigidBody({
			shape: new CANNON.Box(new CANNON.Vec3(floorSize, floorSize, floorHeight)),
			mass: 0,
			position: new CANNON.Vec3(0, 0, -floorHeight),
			meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.black }),
			physicsMaterial: window.game.core._cannon.solidMaterial
		});
		// Add some boxes
		window.game.core._cannon.createRigidBody({
			shape: new CANNON.Box(new CANNON.Vec3(30, 30, 30)),
			mass: 0,
			position: new CANNON.Vec3(-240, -200, 30 - 1),
			meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan }),
			physicsMaterial: window.game.core._cannon.solidMaterial
		});
		window.game.core._cannon.createRigidBody({
			shape: new CANNON.Box(new CANNON.Vec3(30, 30, 30)),
			mass: 0,
			position: new CANNON.Vec3(-300, -260, 90),
			meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan }),
			physicsMaterial: window.game.core._cannon.solidMaterial
		});
		window.game.core._cannon.createRigidBody({
			shape: new CANNON.Box(new CANNON.Vec3(30, 30, 30)),
			mass: 0,
			position: new CANNON.Vec3(-180, -200, 150),
			meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan }),
			physicsMaterial: window.game.core._cannon.solidMaterial
		});
		window.game.core._cannon.createRigidBody({
			shape: new CANNON.Box(new CANNON.Vec3(30, 30, 30)),
			mass: 0,
			position: new CANNON.Vec3(-120, -140, 210),
			meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan }),
			physicsMaterial: window.game.core._cannon.solidMaterial
		});
		window.game.core._cannon.createRigidBody({
			shape: new CANNON.Box(new CANNON.Vec3(30, 30, 30)),
			mass: 0,
			position: new CANNON.Vec3(-60, -80, 270),
			meshMaterial: new THREE.MeshLambertMaterial({ color: window.game.static.colors.cyan }),
			physicsMaterial: window.game.core._cannon.solidMaterial
		});
		// Grid Helper
		var grid = new THREE.GridHelper(floorSize, floorSize / 10);
		grid.position.z = 0.5;
		grid.rotation.x = window.game.helpers.degToRad(90);
		window.game.core._three.scene.add(grid);
	}
}
}