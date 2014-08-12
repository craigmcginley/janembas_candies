// Declare Variables

var canvasBg = document.getElementById('canvasBg');
var ctxBg = canvasBg.getContext('2d');

var canvasPlayer = document.getElementById('canvasPlayer');
var ctxPlayer = canvasPlayer.getContext('2d');

var canvasCandy = document.getElementById('canvasCandy');
var ctxCandy = canvasCandy.getContext('2d');
var gameOver = false;
var boss = false;

var gameWidth = canvasBg.width;
var gameHeight = canvasBg.height;

window.requestAnimFrame = function(){
    return (
        window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback){
            window.setTimeout(callback, 1000 / 60);
        }
    );
}();

var blastSounds = [], index = 0;
for (var i = 0; i < 4; i++) {
  blastSounds.push(new Audio('shoot1.mp3'));
}

function playBlastSound() {
  if (window.chrome) blastSounds[index].load();
  blastSounds[index].play();
  index = (index + 1) % blastSounds.length;
}

var candyExplosionSounds = [], index = 0;
for (var i = 0; i < 4; i++) {
  candyExplosionSounds.push(new Audio('explosioncandy.mp3'));
}

function playCandyExplosionSound() {
  if (window.chrome) candyExplosionSounds[index].load();
  candyExplosionSounds[index].play();
  index = (index + 1) % candyExplosionSounds.length;
}

var blastExplosionSounds = [], index = 0;
for (var i = 0; i < 4; i++) {
  blastExplosionSounds.push(new Audio('disc.mp3'));
}

function playBlastExplosionSound() {
  if (window.chrome) blastExplosionSounds[index].load();
  blastExplosionSounds[index].play();
  index = (index + 1) % blastExplosionSounds.length;
}

var bgMusic = new Audio('music.mp3');

var spriteSheet = new Image();
spriteSheet.src = "sprite-sheet.png";
spriteSheet.addEventListener('load', init, false);

allColors = [["#ffffff", "#ff99ff", "#ff66ff", "#990099"],
             ["#ffffff", "#cc99ff", "#9966cc", "#330066"],
             ["#ffffff", "#ffff66", "ffff00", "#cccc00"],
             ["#ffffff", "#3399ff", "#0066cc", "#003366"],
             ["#ffffff", "#99ff99", "#66ff66", "#33cc33"],
             ["#ffffff", "#ff9999", "#ff6666", "#cc0033"],
             ["#ffffff", "#ffcc99", "#ff9900", "#cc3300"]]

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
var farCandies = [];

var time = Date.now();
var startTime = Date.now();
var points = 0;
var loopTimer = 0;

while (candies.length < 15) {
  candies.push(new Candy(getRandomNum(gameWidth, gameWidth + 400), getRandomNum(0, gameHeight), getRandomNum(15, 75), allColors, 'near'));
}
while (farCandies.length < 200) {
  farCandies.push(new Candy(getRandomNum(0, gameWidth), getRandomNum(0, 470), getRandomNum(.7, 4), allColors, 'far'));
}

var blasts = []
var candyExplosions = []
var blastExplosions = []





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
  if (!gameOver) {

    moveBg(bgSky, 1);
    moveBg(bgGround, 8);
    clearCtxCandy();

    player.motion();
    clearCtxPlayer();
    player.draw();

    loopChecks();

    drawText(ctxPlayer, 'Score: ' + points, 55, 35, 25, 'Arial');
    drawText(ctxPlayer, 'Time: ' + time, 450, 35, 25, 'Arial');
    drawText(ctxPlayer, 'Hit Points: ' + player.hits, 950, 35, 25, 'Arial');

    requestAnimFrame(loop);

  }
}

function startLoop() {
  loop();
  bgMusic.play();
}

function stopLoop() {
  gameOver = true;
}

function loopChecks() {

  if (player.hits === 0) {
    gameOver = true;
    player.frameCount = 0;
  }

  for (var i = 0; i < farCandies.length; i++) {
      if (farCandies[i].x < -10) {
        farCandies.splice(i, 1);
        farCandies.push(new Candy(getRandomNum(gameWidth+10, gameWidth+20), getRandomNum(0, 470), getRandomNum(.7, 4), allColors, 'far'));
      }
      farCandies[i].draw();
    }

  loopTimer += 1;
  time = Math.floor((Date.now() - startTime)/1000);

  if (loopTimer > 300) {
    candies.push(new Candy(getRandomNum(gameWidth+250, gameWidth + 500), getRandomNum(0, gameHeight), getRandomNum(15, 75), allColors, 'near'));
    loopTimer = 0;
  }

  if (player.fired === 12) {
      blasts.push(new EnergyBlast(player.drawX+75, player.drawY+15));
      playBlastSound();
    }

  for (var i = 0; i < blasts.length; i++) {
    blasts[i].draw();
    if (blasts[i].drawX > 1025) {
      blasts.splice(i, 1);
    }
  }

  for (var i = 0; i < candies.length; i++) {
    if (candies[i].x < -75) {
      candies.splice(i, 1);
      candies.push(new Candy(getRandomNum(gameWidth+250, gameWidth + 500), getRandomNum(0, gameHeight), getRandomNum(15, 75), allColors, 'near'));
    }
    if (intersects(candies[i], player)) {
      player.hits -= 1;
      candyExplosions.push(new CandyExplosion(candies[i]));
      playCandyExplosionSound();
      candies.splice(i, 1);
      candies.push(new Candy(getRandomNum(gameWidth+250, gameWidth + 500), getRandomNum(0, gameHeight), getRandomNum(15, 75), allColors, 'near'));
      break;
    }
    candies[i].draw();
    for (var j = 0; j < blasts.length; j++) {
      if (intersects(candies[i], blasts[j])) {
        candies[i].hits -= 1;
        if (candies[i].hits !== 0){
          blastExplosions.push(new BlastExplosion(blasts[j], candies[i]));
          playBlastExplosionSound();
        }
        if (candies[i].hits === 0) {
          candyExplosions.push(new CandyExplosion(candies[i]));
          playCandyExplosionSound();
          points += (Math.floor(candies[i].radius/15));
          candies.splice(i, 1);
          candies.push(new Candy(getRandomNum(gameWidth+250, gameWidth + 500), getRandomNum(0, gameHeight), getRandomNum(15, 75), allColors, 'near'));
        }
        blasts.splice(j, 1);
        break;
      }
    }
  }

  for (var i = 0; i < candyExplosions.length; i++) {
    candyExplosions[i].draw();
    if (candyExplosions[i].frameCount === 25) {
      candyExplosions.splice(i, 1);
    }
  }

  for (var i = 0; i < blastExplosions.length; i++) {
    blastExplosions[i].draw();
    if (blastExplosions[i].frameCount === 25) {
      blastExplosions.splice(i, 1);
    }
  }

  if (gameOver) {
    drawText(ctxPlayer, 'Game Over', 500, 300, 100, 'Arial');
    drawText(ctxPlayer, "Press 'R' to restart", 500, 350, 25, 'Arial');
  }

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

function intersects(circle, rect) {
  var rectCenterX = rect.drawX + (rect.width / 2);
  var rectCenterY = rect.drawY + (rect.height / 2);

  var distanceX = Math.abs(circle.x - rectCenterX);
  var distanceY = Math.abs(circle.y - rectCenterY);

  if (distanceX > (rect.width / 2 + circle.radius) ||
      distanceY > (rect.height / 2 + circle.radius)) {
    return false;
  }

  if (distanceX <= (rect.width / 2) ||
      distanceY <= (rect.height / 2)) {
    return true;
  }

  var cornerDistanceSq =
    Math.pow((distanceX - rect.width / 2), 2) +
    Math.pow((distanceY - rect.height / 2), 2)

  return cornerDistanceSq <= Math.pow(circle.radius, 2);
}

function drawText(context, text, x, y, fontHeight, fontName) {
  context.font = fontHeight + 'px ' + fontName;
  var textWidth = context.measureText(text).width;

  var actualX = x - (textWidth / 2);
  var actualY = y - (fontHeight / 2);

  context.fillText(text, actualX, actualY);
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
  this.speed = 3;
  this.moveUp = false;
  this.moveDown = false;
  this.moveLeft = false;
  this.moveRight = false;
  this.fired = 0;
  this.hits = 3;
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
  player.updateCoors();
  if (this.fired > 0) {
    if (this.fired === 1) {
      this.frameCount = 0;
      this.frameX = 0;
    }
    this.frameY = 770;
    this.frameX = (this.frameCount % 16) * 128;
    ctxPlayer.drawImage(spriteSheet, this.frameX, this.frameY, 128, 96, this.drawX, this.drawY, 128, 96);
    this.frameCount += 1;
    this.fired += 1;
    if (this.fired > 16) {
      this.fired = 0;
      this.frameCount = 0;
      this.frameY = 640;
    }
  } else {
    this.frameX = (this.frameCount % 16) * this.width;
    this.frameCount += 1;
    ctxPlayer.drawImage(spriteSheet, this.frameX, this.frameY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
  }
};

Player.prototype.drawDeath = function() {
  this.width = 80;
  this.height = 118;
  this.frameY = 917;
  this.frameX = (this.frameCount % 20) * this.width;
  ctxPlayer.drawImage(spriteSheet, this.frameX, this.frameY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
  if (this.frameCount !== 20){
    this.frameCount += 1;
  }
}

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
function Candy(x, y, radius, allColors, distance) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.hits = (2 * Math.floor(radius/15));
  this.colors = allColors[Math.floor(getRandomNum(0,6))];
  if (distance === 'near') {
    this.speed = (1/radius) * 100;
  } else {
    this.speed = radius;
  }
}

Candy.prototype.draw = function() {
  this.x -= this.speed;
  drawCircle(this.x, this.y, this.radius, this.colors);
}

function clearCtxCandy() {
  ctxCandy.clearRect(0, 0, gameWidth, gameHeight);
}

function drawCircle(x, y, radius, colors) {
  radialGradient = ctxCandy.createRadialGradient(x-radius+((radius/100) * 70), y-radius+((radius/100) * 70), 0, x-radius+((radius/100) * 70), y-radius+((radius/100) * 70), (radius-(radius/100)*2));
  radialGradient.addColorStop(0, colors[0]);
  radialGradient.addColorStop(0.4, colors[1]);
  radialGradient.addColorStop(0.6, colors[2]);
  radialGradient.addColorStop(1, colors[3]);
  ctxCandy.fillStyle = radialGradient;

  ctxCandy.beginPath();
  ctxCandy.arc(x, y, radius, 0, Math.PI * 2, false);
  ctxCandy.fill();
}





// Energy Blast Functions
function EnergyBlast(x, y) {
  this.drawX = x;
  this.drawY = y;
  this.width = 90;
  this.height = 50;
  this.speed = 10;
  this.frameX = 0;
  this.frameY = 720;
  this.frameCount = 0;
}

EnergyBlast.prototype.front = function() {
  return this.drawX + this.width;
}

EnergyBlast.prototype.draw = function() {
  this.drawX += this.speed;
  this.frameX = (this.frameCount % 4) * this.width;
  this.frameCount += 1;
  ctxPlayer.drawImage(spriteSheet, this.frameX, this.frameY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
}





// Explosion Functions
function CandyExplosion(candy) {
  this.drawX = candy.x - candy.radius - 25;
  this.drawY = candy.y - candy.radius;
  this.width = 60;
  this.height = 51;
  this.drawWidth = candy.radius * 2.2;
  this.drawHeight = candy.radius * 2.2;
  this.frameX = 0;
  this.frameY = 866;
  this.frameCount = 0;
}

CandyExplosion.prototype.draw = function () {
  this.frameX = (this.frameCount % 25) * this.width;
  this.frameCount += 1;
  ctxPlayer.drawImage(spriteSheet, this.frameX, this.frameY, this.width, this.height, this.drawX, this.drawY, this.drawWidth, this.drawHeight);
}

function BlastExplosion(blast, candy) {
  this.drawX = blast.drawX + (blast.width / 2);
  this.drawY = blast.drawY;
  this.width = 60;
  this.height = 51;
  this.speed = candy.speed;
  this.frameX = 0;
  this.frameY = 866;
  this.frameCount = 0;
}

BlastExplosion.prototype.draw = function() {
  this.drawX -= this.speed;
  this.frameX = (this.frameCount % 25) * this.width;
  this.frameCount += 1;
  ctxPlayer.drawImage(spriteSheet, this.frameX, this.frameY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
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

  case R_KEY:
    document.location.href = ""
    break;

  case SPACE_KEY:
  if (player.fired === 0) {
    player.fired = 1;
    break;
  }

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

  default:
    handled = false;
    break;
  }

  if (handled) {
    event.preventDefault();
  }
}
