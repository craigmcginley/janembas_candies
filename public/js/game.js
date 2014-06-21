// Declare Variables

var canvasBg = document.getElementById('canvasBg');
var ctxBg = canvasBg.getContext('2d');

var canvasPlayer = document.getElementById('canvasPlayer');
var ctxPlayer = canvasPlayer.getContext('2d');

var canvasCandy = document.getElementById('canvasCandy');
var ctxCandy = canvasCandy.getContext('2d');

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

allColors = [["#fcc", "#f69", "#f06", "#903"],
             ["#fcc", "#a69", "#a06", "#403"],
             ["#fff", "#ffff66", "ffff00", "#cccc00"],
             ["#fff", "#99f", "66f", "#0000cc"],
             ["#fff", "#99ff99", "66ff66", "33cc33"],
             ["#fff", "#0CC", "099", "#066"]]

var radialGradient;

var bgSky = {
srcX: 0,
srcY: 0,
height: 476,
width: 2048,
drawY: 0,
drawX1: 0,
drawX2: 2048
}

var bgGround = {
srcX: 0,
srcY: 476,
height: 164,
width: 2048,
drawY: 476,
drawX1: 0,
drawX2: 2048
}

var player;

var candies = [];

while (candies.length < 15) {
  candies.push(new Candy(getRandomNum(gameWidth, gameWidth + 400), getRandomNum(0, gameHeight), getRandomNum(10, 50), allColors));
}





// Main Functions

function init() {
  player = new Player();
  drawBg(bgGround);
  drawBg(bgSky);
  startLoop();
  document.addEventListener('keydown', keyDown, false);
  document.addEventListener('keyup', keyUp, false);
}

function loop() {
  if (isPlaying) {
    moveBg(bgSky, 1);
    moveBg(bgGround, 8);
    player.draw();
    clearCtxCandy();
    for (var i = 0; i < candies.length; i++) {
      if (candies[i].x < -50) {
        candies.splice(i, 1);
        candies.push(new Candy(getRandomNum(gameWidth+250, gameWidth + 500), getRandomNum(0, gameHeight), getRandomNum(10, 50), allColors));
      }
      candies[i].draw();
    }

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

function moveBg(bg, rate) {
  bg.drawX1 -= rate;
  bg.drawX2 -= rate;
  if (bg.drawX1 <= -2048) {
    bg.drawX1 = 2048;
  } else if (bg.drawX2 <= -2048) {
    bg.drawX2 = 2048;
  }
  drawBg(bg);
}

function drawBg(bg) {
  ctxBg.clearRect(bg.srcX, bg.srcY, bg.width, bg.height);
  ctxBg.drawImage(spriteSheet, bg.srcX, bg.srcY, bg.width, bg.height, bg.drawX1, bg.drawY, bg.width, bg.height);
  ctxBg.drawImage(spriteSheet, bg.srcX, bg.srcY, bg.width, bg.height, bg.drawX2, bg.drawY, bg.width, bg.height);
}

function getRandomNum(min, max) {
  return Math.random() * (max - min + 1) + min;
}





// Player Functions
function Player() {
  this.frameCount = 0;
  this.frameX = 0;
  this.frameY = 640;
  this.drawX = 200;
  this.drawY = 200;
  this.width = 110;
  this.height = 78;
  this.leftX = this.drawX;
  this.rightX = this.drawX + this.width;
  this.topY = this.drawY;
  this.bottomY = this.drawY + this.height;
  this.speed = 2;
  this.moveUp = false;
  this.moveDown = false;
  this.moveLeft = false;
  this.moveRight = false;
}

function clearCtxPlayer() {
  ctxPlayer.clearRect(0, 0, gameWidth, gameHeight);
}

Player.prototype.updateCoors = function() {
  this.leftX = this.drawX;
  this.rightX = this.drawX + this.width;
  this.topY = this.drawY;
  this.bottomY = this.drawY + this.height;
}

Player.prototype.draw = function() {
  clearCtxPlayer();
  player.updateCoors();
  player.motion();
  this.frameX = (this.frameCount % 16) * 110;
  this.frameCount += 1;
  ctxPlayer.drawImage(spriteSheet, this.frameX, this.frameY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
};

Player.prototype.motion = function() {
  if (this.moveUp && this.topY > 0) {
    this.drawY -= this.speed;
  }
  if (this.moveDown && this.bottomY < 640) {
    this.drawY += this.speed;
  }
  if (this.moveLeft && this.leftX > 0) {
    this.drawX -= this.speed;
  }
  if (this.moveRight && this.rightX < 1024) {
    this.drawX += this.speed;
  }
}





// Candy Functions
function Candy(x, y, radius, allColors) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  // this.hits = radius;
  // this.destroyed = false;
  this.colors = allColors[Math.floor(getRandomNum(0,5))];
  this.xVel = (1/radius) * 100;
  // this.containsPoint = function(x, y) {
  //   if (x >= (this.x - this.radius) && x <= (this.x + this.radius)) {
  //     if (y >= (this.y - this.radius) && y <= (this.y + this.radius)) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } else {
  //     return false;
  //   }
  // }
}

Candy.prototype.draw = function() {
  this.x -= this.xVel;
  drawCircle(this.x, this.y, this.radius, this.colors);
}

function clearCtxCandy() {
  ctxCandy.clearRect(0, 0, gameWidth, gameHeight);
}

function drawCircle(x, y, radius, colors) {
  radialGradient = ctxCandy.createRadialGradient(x-8, y-12, 0, x-20, y-20, radius + 10);
  radialGradient.addColorStop(0, colors[0]);
  radialGradient.addColorStop(0.4, colors[1]);
  radialGradient.addColorStop(0.6, colors[2]);
  radialGradient.addColorStop(1, colors[3]);
  ctxCandy.fillStyle = radialGradient;

  ctxCandy.beginPath();
  ctxCandy.arc(x, y, radius, 0, Math.PI * 2, false);
  ctxCandy.fill();
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