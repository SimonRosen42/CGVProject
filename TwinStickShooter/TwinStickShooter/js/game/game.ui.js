/*
 * Game UI
 *
 * A class for handling the user interface of the gaming providing DOM element management and some helpers
 */

class playerUI {
	constructor(player){
		this.player = player;
		this.healthBar,
		this.ammo
	
	}
	
	
	create(three){
		var geometry = new THREE.RingGeometry( 1, 5, 32 );
		var material = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
		this.healthBar = new THREE.Mesh( geometry, material );
		three.scene.add( this.healthBar );
	}
	// methods
	update(){



	}

}



window.game = window.game || {};

window.game.ui = function() {
	
	
	
	var _ui = {
		three,
		// Attributes
		elements: {
			// Properties for DOM elements are stored here
			infoboxIntro: null,
			playerUIs: []
		},

		// Methods
		init: function (three) {
			// Get DOM elements and bind events to them
			_ui.getElements();
			_ui.bindEvents();
			_ui.three = three;
			var temp = new playerUI(null);
			temp.create(_ui.three);
			playerUIs.push(temp);
		},
		destroy: function () {

		},
		update: function(){
			for (let i = 0; i < playerUIs.length; i++) {
				const p = playerUIs[i];
				p.update();
			}
		},
		getElements: function () {
			// Store the DOM elements in the elements object to make them accessible in addClass, removeClass and hasClass
			_ui.elements.infoboxIntro = document.querySelector("#infobox-intro");
			//_ui.elements.playerUIMain = document.querySelector(playerUIMain);
		},
		bindEvents: function () {
			// Event bindings
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