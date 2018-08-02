var autoDodge = function(game, variables) {
	
	var bulletBarn = variables.bulletBarn;
	var player = variables.player;
	var key = variables.key;
	// console.log(bulletBarn.prototype.render);
	var binded = false;

	if(!!!bulletBarn || !!!player) {
		console.log("Cannot init autododge");
		return;
	}

	var getSelfPos = function() {
		return game.scope.lt.pos;
	}

	/* duration - msec */
	var pressKey = function(keyCode, duration) {
		game.scope.we.keys[keyCode] = true;
	}

	var releaseKey = function(keyCode) {
		delete game.scope.we.keys[keyCode];
	}

	var posErr = 1;
	var moveToAbsCoords = function(targetX, targetY) {
		var selfPos = getSelfPos();

		releaseKey(key.W);
		releaseKey(key.A);
		releaseKey(key.S);
		releaseKey(key.D);

		if(	Math.abs(targetX - selfPos.x) < posErr &&
		 	Math.abs(targetY - selfPos.y) < posErr) 
		 	return;

		if(selfPos.x < targetX) {
			pressKey(key.D);
		} else if(selfPos.x > targetX) {
			pressKey(key.A);
		}

		if(selfPos.y < targetY) {
			pressKey(key.W);
		} else if(selfPos.Y > targetY) {
			pressKey(key.S);
		}

		setTimeout(function() {
			moveToAbsCoords(targetX, targetY);
		}, 50);
	}

	var calculateXCoordLineIntersection = function(Mx, My, px, py) {
		return (py * Mx - px * My) / py;
	}

	var calculateYCoordLineIntersection = function(Mx, My, px, py) {
		return (py * Mx - px * My) / (-px);
	}	

	var detectBullets = function() {
		var result = [];
		var selfPos = getSelfPos();
		var intersectionWarningThreshold = player.maxVisualRadius * Math.sqrt(2); // Attention radius

		for(var i = 0; i < game.scope.Ce.bullets.length; i++) {
			if(game.scope.Ce.bullets[i].alive) {
				if(game.scope.lt.layer == game.scope.Ce.bullets[i].layer) {
					
					var bulletRelativePos = {
						x: game.scope.Ce.bullets[i].pos.x - selfPos.x,
						y: game.scope.Ce.bullets[i].pos.y - selfPos.y
					}

					var bulletDir = game.scope.Ce.bullets[i].dir;

					// Check if the bullet flying from ourself
					if(	Math.sign(bulletRelativePos.x) == Math.sign(bulletDir.x) &&
						Math.sign(bulletRelativePos.y) == Math.sign(bulletDir.y)) {

						continue;

					} else {

						var intersectionOfCoordLines = {
							x: calculateXCoordLineIntersection(bulletRelativePos.x, bulletRelativePos.y, bulletDir.x, bulletDir.y),
							y: calculateYCoordLineIntersection(bulletRelativePos.x, bulletRelativePos.y, bulletDir.x, bulletDir.y)
						}

						if(	Math.abs(intersectionOfCoordLines.x) < intersectionWarningThreshold ||
							Math.abs(intersectionOfCoordLines.y) < intersectionWarningThreshold) {

							result.push({
								bullet: game.scope.Ce.bullets[i],
								intersectionOfCoordLines: intersectionOfCoordLines
							});
						}
					}
				}
			}
		}

		return result;
	}

	var calculateDistance = function(cx, cy, ex, ey) {
		return Math.sqrt(Math.pow((cx - ex), 2) + Math.pow((cy - ey), 2));
	}

	var dodge = function(bullets) {
		if(!bullets.length) return;
		
		var selfPos = getSelfPos();
		var intersectionWarningThreshold = player.maxVisualRadius * Math.sqrt(2);

		var avgMoveD = {
			x: 0,
			y: 0
		}

		for(var i = 0; i < bullets.length; i++) {
			var moveDx = intersectionWarningThreshold - Math.abs(bullets[i].intersectionOfCoordLines.x);
			var moveDy = intersectionWarningThreshold - Math.abs(bullets[i].intersectionOfCoordLines.y);

			moveDx *= -Math.sign(bullets[i].intersectionOfCoordLines.x);
			moveDy *= -Math.sign(bullets[i].intersectionOfCoordLines.y);

			avgMoveD.x += moveDx;
			avgMoveD.y += moveDy;
		}

		avgMoveD.x /= bullets.length;
		avgMoveD.y /= bullets.length;

		moveToAbsCoords(selfPos.x + avgMoveD.x, selfPos.y + avgMoveD.y);
	}

	var defaultBulletBarnRenderFunction = function(e) {};

	var bind = function() {

		defaultBulletBarnRenderFunction = bulletBarn.prototype.render;
		bulletBarn.prototype.render = function(e) {
			var bulletBarnRenderContext = this;

			dodge(detectBullets());

			defaultBulletBarnRenderFunction.call(bulletBarnRenderContext, e);
		};

		binded = true;
	}

	var unbind = function() {
		bulletBarn.prototype.render = defaultBulletBarnRenderFunction;
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