window.game = window.game || {};

class controller {

	gamePad;
	player;
	gamepadIndex;

	constructor(gamepad, p, i) {
		this.gamePad = gamepad;
		this.player = p;
		this.gamepadIndex = i;
	}
			// keyCodes = {
			// 	0: "cross",
			// 	1: "circle",
			// 	2: "square",
			// 	3: "triangle",
			// 	4: "L1",
			// 	5: "R1",
			// 	6: "L2",
			// 	7: "R2",
			// 	8: "share",
			// 	9: "start",
			// 	10: "L3",
			// 	11: "R3",
			// 	12: "up",
			// 	13: "down",
			// 	14: "left",
			// 	15: "right",
			// 	16: "ps",
			// };

			// axisCode = {
			// 	0: "leftHorizontal",
			// 	1: "leftVertical",
			// 	2: "rightHorizontal",
			// 	3: "leftHorizontal"
			// };

			pressed = {
				
			};

			val = {

			};

			axes = {

			};

			poll = function() {
				var flag = false;
				for (var i = 0; i < this.gamePad.buttons.length; i++) {
	      			var val = this.gamePad.buttons[i].value;
	      			var pressedt = val == 1;
        			this.pressed[i] = pressedt;
       				this.val[i] = val.value;
       				if (pressedt) flag = true;
	    		}
	    		for (i = 0; i < this.gamePad.axes.length; i++) {
	    			if ( i == 3 || i ==0)
	      				this.axes[i] = -1 *this.gamePad.axes[i].toFixed(4);
	      			else 
	      				this.axes[i] = this.gamePad.axes[i].toFixed(4);
	      			if (Math.abs(this.axes[i]) < 0.1) this.axes[i] = 0;
	    		}
	    		if (flag) return true;
	    		else return false;
			};
		}

window.game.controllerHandler = function () {
	var _controllerHandler = {

		controllers: {},
		players: 0,

		buttonPressed: function() {
			
		},



		connecthandler: function(e) {
	  		_controllerHandler.addgamepad(e.gamepad);
		},

		addgamepad: function(gamepad) {
			var temp = new controller(gamepad, _controllerHandler.players, gamepad.index);
			_controllerHandler.players++;
		  	_controllerHandler.controllers[gamepad.index] = temp;
		},

		getControllerByPlayer: function(playerNumber) {
			for (var i = 0; i < 4; i++) {
				if (_controllerHandler.controllers[i] != null){
					if (_controllerHandler.controllers[i].player == playerNumber) {
						return _controllerHandler.controllers[i];
					}
				}
			}
			return null;
		},	

		disconnecthandler: function(e) {
		  	_controllerHandler.removegamepad(e.gamepad);
		},

		removegamepad: function(gamepad) {
		  	for (var i = 0; i < 4; i++) {
		  		if (_controllerHandler.controllers[i].gamepad == gamepad) {
		  			delete controller[i];
		  			_controllerHandler.players--;
		  			return;
		  		}
		  	}
		},

		updateStatus: function() {
		  _controllerHandler.scangamepads();

		  var j;

		  for (j in _controllerHandler.controllers) {
		    	var controller = _controllerHandler.controllers[j];
		    	if (controller.poll()) {
		    		_controllerHandler.buttonPressed();
		    	}
		  }

		  window.requestAnimationFrame(_controllerHandler.updateStatus);
		},

		scangamepads: function() {
		  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
		  for (var i = 0; i < 4; i++) {
		    if (gamepads[i]) {
				var found = false;
				for (var j = 0; j < 4; j++) {
					if (_controllerHandler.controllers[j]) {
						if (gamepads[i].index == _controllerHandler.controllers[j].gamepadIndex && !found) {
							_controllerHandler.controllers[j].gamePad = gamepads[i];
							found = true;
						}
					}
				}
				if (!found) {
					_controllerHandler.addgamepad(gamepads[i]);
				}
		    }
		  }
		}, 

		init: function() {
			window.addEventListener("gamepadconnected", _controllerHandler.updateStatus);
			window.addEventListener("gamepaddisconnected", _controllerHandler.disconnecthandler);
		}
	}
	
	return _controllerHandler;
}