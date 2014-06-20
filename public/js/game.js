// Declare Variables

var canvasBg = document.getElementById('canvasBg');
var ctxBg = canvasBg.getContext('2d');

var canvasPlayer = document.getElementById('canvasPlayer');
var ctxPlayer = canvasPlayer.getContext('2d');

var gameWidth = canvasBg.width;
var gameHeight = canvasBg.height;
var isPlaying = false;
var requestAnimFrame = window.requestAnimationFrame ||
                       window.webkitRequestAnimationFrame ||
                       window.mozRequestAnimationFrame ||
                       window.msRequestAnimationFrame ||
                       window.oRequestAnimationFrame ||
                       function(callback) {
                        window.setTimeout(callback, 1000 / 60);
                       };



var spriteSheet = new Image();
spriteSheet.src = "sprite-sheet.png";
spriteSheet.addEventListener('load', init, false);

var bgDrawX1 = 0;
var bgDrawX2 = 2048;

function moveBg() {
  bgDrawX1 -= 8;
  bgDrawX2 -= 8;
  if (bgDrawX1 <= -2048) {
    bgDrawX1 = 2048;
  } else if (bgDrawX2 <= -2048) {
    bgDrawX2 = 2048;
  }
  drawBg();
}

var player;





// Main Functions

function init() {
  player = new Player();
  drawBg();
  startLoop();
  document.addEventListener('keydown', keyDown, false);
  document.addEventListener('keyup', keyUp, false);
}

function loop() {
  if (isPlaying) {
    moveBg();
    player.draw();
    requestAnimFrame(loop);
  }
}

function startLoop() {
  isPlaying = true;
  loop();
}

function stopLoop() {
  isPlaying = false;
}

function drawBg() {
  var srcX = 0;
  var srcY = 0;
  var drawY = 0;
  ctxBg.clearRect(0, 0, gameWidth, gameHeight);
  ctxBg.drawImage(spriteSheet, srcX, srcY, 2048, gameHeight, bgDrawX1, drawY, 2048, gameHeight);
  ctxBg.drawImage(spriteSheet, srcX, srcY, 2048, gameHeight, bgDrawX2, drawY, 2048, gameHeight);
}

function clearCtxPlayer() {
  ctxPlayer.clearRect(0, 0, gameWidth, gameHeight);
}





// Player Functions

function Player(){
  this.srcX = 0;
  this.srcY = 640;
  this.drawX = 200;
  this.drawY = 200;
  this.width = 110;
  this.height = 78;
  this.speed = 2;
  this.moveUp = false;
  this.moveDown = false;
  this.moveLeft = false;
  this.moveRight = false;

}

Player.prototype.draw = function() {
  clearCtxPlayer();
  player.motion();
  ctxPlayer.drawImage(spriteSheet, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
};

Player.prototype.motion = function() {
  if (this.moveUp) {
    this.drawY -= this.speed;
  }
  if (this.moveDown) {
    this.drawY += this.speed;
  }
  if (this.moveLeft) {
    this.drawX -= this.speed;
  }
  if (this.moveRight) {
    this.drawX += this.speed;
  }
}





// Event Functions

function keyDown(event) {
  var handled = true;

  switch (event.keyCode) {

  case UP_KEY:
    player.moveUp = true;
    break;

  case DOWN_KEY:
    player.moveDown = true;
    break;

  case LEFT_KEY:
    player.moveLeft = true;
    break;

  case RIGHT_KEY:
    player.moveRight = true;
    break;

  case SPACE_KEY:
    player.fire = true;
    break;

  default:
    handled = false;
    break;
  }

  if (handled) {
    event.preventDefault();
  }
}

function keyUp(event) {
  var handled = true;

  switch (event.keyCode) {

  case UP_KEY:
    player.moveUp = false;
    break;

  case DOWN_KEY:
    player.moveDown = false;
    break;

  case LEFT_KEY:
    player.moveLeft = false;
    break;

  case RIGHT_KEY:
    player.moveRight = false;
    break;

  case SPACE_KEY:
    player.fire = false;
    player.fired = false;
    break;

  default:
    handled = false;
    break;
  }

  if (handled) {
    event.preventDefault();
  }
}
