/*
 * Game UI
 *
 * A class for handling the user interface of the gaming providing DOM element management and some helpers
 */

class  playerUI {
	constructor(player){
		this.player = player;
		this.healthBar,
		this.ammo
	
	}
	
	
	create(three){
		var geometry = new THREE.RingGeometry( 1, 5, 32 );
		var material = new THREE.MeshBasicMaterial( { color: 'white', side: THREE.DoubleSide } );
		this.healthBar = new THREE.Mesh( geometry, material );
		three.scene.add( this.healthBar );
	}
	// methods
	update(){
		

		if (this.player.takeDamage()){
			// animate health bar to turn into semi circle
				var	maxArcAngle = (player.health/10) * (2*Math.pi);
				var geometry = new THREE.RingGeometry(1,5,32,0,maxArcAngle);
				var material = new THREE.MeshBasicMaterial({color: 'green', side: THREE.DoubleSide}	);
				three.scene.remove(this.healthbar);
				this.healthbar = new THREE.Mesh(geometry,material);
				three.scene.add(this.healthbar);
		}


	}
		}





window.game = window.game || {};

window.game.ui = function() {
	
	
	
	var _ui = {
		
		// Attributes
		elements: {
			// Properties for DOM elements are stored here
			infoboxIntro: null,
			playerUIData: []
		},

		// Methods
		init: function (three) {
			// Get DOM elements and bind events to them
			_ui.getElements();
			_ui.bindEvents();
			_ui.three = three;
		},
		addUI: function(player) {
			var temp = new playerUI(player);
			_ui.elements.playerUIData.push(temp);
			player.ui = temp;
		},
		destroy: function () {

		},
		update: function(){
			for (let i = 0; i < _ui.elements.playerUIData.length; i++) {
				var p = _ui.elements.playerUIData[i];
				p.update();
			}
		},
		getElements: function () {
			// Store the DOM elements in the elements object to make them accessible in addClass, removeClass and hasClass
			_ui.elements.glow = document.querySelector("glow");
			//_ui.elements.playerUIMain = document.querySelector(playerUIMain);
		},
		bindEvents: function () {
			// Event bindings
		},
		glow: function(element){
			_ui.addClass(element,"glow");
		},

		fadeOut: function (element) {
			// Add a CSS class, fading is done via CSS3 transitions

			_ui.addClass(element, "fade-out");
		},
		addClass: function (element, className) {
			// Adds a class to a specified element
			if (!_ui.hasClass(element, className)) {
				_ui.elements[element].className = _ui.elements[element].className + " " + className;
			}
		},
		removeClass: function (element, className) {
			// Removes a class from a specified element
			var classNameRegEx = new RegExp("\\s\\b" + className + "\\b", "gi");
			_ui.elements[element].className = _ui.elements[element].className.replace(classNameRegEx, "");
		},
		hasClass: function (element, className) {
			// Checksif a specified element contains the given class name
			return _ui.elements[element].className.match(className);
		}
	};

	return _ui;
};