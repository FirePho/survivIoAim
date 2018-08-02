window.autoHeal = function(game, variables) {

	var key = variables.key;
	var binded = false;
	var timer = null;

	var pressKey = function(key) {
		if(!game.scope.we.keys[key]) {
			setTimeout(function() {
				game.scope.we.keys[key] = true;
				setTimeout(function() {
					delete game.scope.we.keys[key]
				}, 90);
			}, 0);
		}
	}

	var isNoEnemy = function() {
		if(!game.scope.Te.vt[game.scope.ce]) return false;

		var selfTeamId = game.scope.Te.vt[game.scope.ce].teamId;
		var selfId = game.scope.ce;
		var playerIds = Object.keys(game.scope.Te.vt);

		for(var i = 0; i < playerIds.length; i++) {
			if( game.scope.nt.idToObj[playerIds[i]] && 
				(!game.scope.nt.idToObj[playerIds[i]].q.dead) && 
				(!game.scope.nt.idToObj[playerIds[i]].q.downed) &&
				game.scope.Te.vt[playerIds[i]].teamId != selfTeamId) {
				
				return false;
			}
		}

		return true;
	}

	var heal = function() {
		if(isNoEnemy()) {
			if(game.scope.lt.U.health < 30) {
				if(game.scope.lt.U.inventory["healthkit"] > 0 ) {
					pressKey(key.Eight);
					return;
				}
			}

			if(game.scope.lt.U.health < 70) {
				if(game.scope.lt.U.inventory["bandage"] > 0 ) {
					pressKey(key.Seven);
					return;
				}
			}

			if(game.scope.lt.U.boost < 50) {
				if(game.scope.lt.U.inventory["painkiller"] > 0 ) {
					pressKey(key.Zero);
					return;
				}
			}

			if(game.scope.lt.U.boost < 75) {
				if(game.scope.lt.U.inventory["soda"] > 0 ) {
					pressKey(key.Nine);
					return;
				}
			}
		}
	}

	var runHeal = function() {
		heal();
		timer = setTimeout(runHeal, 1000);
	}

	var stopHeal = function() {
		clearTimeout(timer);
		timer = null;
	}	

	var bind = function() {
		runHeal();
        binded = true;
	}

	var unbind = function() {
		stopHeal();
		binded = false;
	}

	var isBinded = function() {
		return binded;
	}

	return {
		bind: bind,
		unbind: unbind,
		isBinded: isBinded
	}
}
