'use strict';

var gameStart = {},
  gameSpeed = {},
  gameArea = {},
scoreDisplay = {},
  //manualStep = {},
  directionButtons = [],
  gameAreaContext = {},
  snake = [],
  gameAreaWidth = 0,
  gameAreaHeight = 0,
  cellWidth = 0,
  playerScore = 0,
  snakeFood = {},
  snakeDirection = '',
  speedSize = 0,
  timer = {};

function initElement() {
  gameStart = document.querySelector('#gameStart');
  gameSpeed = document.querySelector('#gameSpeed');
  gameArea = document.querySelector('#gameArea');
  scoreDisplay = document.querySelector('#score');
  //manualStep = document.querySelector('#manualStep');
  directionButtons = document.querySelectorAll('.direction-button');

  gameAreaContext = gameArea.getContext('2d');
  gameAreaWidth = 400;
  gameAreaHeight = 600;
  cellWidth = 20;
  gameArea.width = gameAreaWidth;
  gameArea.height = gameAreaHeight;
}

// Create game area
function createGameArea() {
  gameAreaContext.fillStyle = '#FFFFFF';
  gameAreaContext.fillRect(0, 0, gameAreaWidth, gameAreaHeight);
  gameAreaContext.strokeStyle = '#000000';
  gameAreaContext.strokeRect(0, 0, gameAreaWidth, gameAreaHeight);
}

// Create food
function createFood() {
  snakeFood = {
    x: Math.round(Math.random() * (gameAreaWidth - cellWidth) / cellWidth),
    y: Math.round(Math.random() * (gameAreaHeight - cellWidth) / cellWidth),
  };
}

// Check if the snake is onitself
function snakeOnItself(x, y, array) {
  for (var index = 0, length = array.length; index < length; index++) {
    if (array[index].x == x && array[index].y == y) return true;
  }
  return false;
}

function writeScore() {
  scoreDisplay.textContent = 'Score: ' + playerScore;
}

function drawSnakeSegment(x, y, isHead, index) {
  var pixelX = x * cellWidth;
  var pixelY = y * cellWidth;
  var gradient = gameAreaContext.createLinearGradient(
    pixelX,
    pixelY,
    pixelX + cellWidth,
    pixelY + cellWidth
  );

  if (isHead) {
    gradient.addColorStop(0, '#a8ee79');
    gradient.addColorStop(0.5, '#4caf50');
    gradient.addColorStop(1, '#145c2a');
  } else if (index % 2 === 0) {
    gradient.addColorStop(0, '#8bd553');
    gradient.addColorStop(0.5, '#3d8f35');
    gradient.addColorStop(1, '#164c27');
  } else {
    gradient.addColorStop(0, '#6fbf42');
    gradient.addColorStop(0.5, '#2f7b31');
    gradient.addColorStop(1, '#103f22');
  }

  gameAreaContext.fillStyle = gradient;
  gameAreaContext.fillRect(pixelX, pixelY, cellWidth, cellWidth);
  gameAreaContext.strokeStyle = '#174d23';
  gameAreaContext.lineWidth = 1;
  gameAreaContext.strokeRect(pixelX + 0.5, pixelY + 0.5, cellWidth - 1, cellWidth - 1);

  if (isHead) {
    var eyePositions;
    if (snakeDirection === 'left') {
      eyePositions = [[pixelX + 6, pixelY + 5, -1, 0], [pixelX + 6, pixelY + 15, -1, 0]];
    } else if (snakeDirection === 'up') {
      eyePositions = [[pixelX + 5, pixelY + 6, 0, -1], [pixelX + 15, pixelY + 6, 0, -1]];
    } else if (snakeDirection === 'down') {
      eyePositions = [[pixelX + 5, pixelY + 14, 0, 1], [pixelX + 15, pixelY + 14, 0, 1]];
    } else {
      eyePositions = [[pixelX + 14, pixelY + 5, 1, 0], [pixelX + 14, pixelY + 15, 1, 0]];
    }

    eyePositions.forEach(function (eye) {
      gameAreaContext.beginPath();
      gameAreaContext.fillStyle = '#f5ffe9';
      gameAreaContext.arc(eye[0], eye[1], 2.5, 0, Math.PI * 2);
      gameAreaContext.fill();
      gameAreaContext.beginPath();
      gameAreaContext.fillStyle = '#102b16';
      gameAreaContext.arc(eye[0] + eye[2], eye[1] + eye[3], 1.2, 0, Math.PI * 2);
      gameAreaContext.fill();
    });
  } else {
    gameAreaContext.beginPath();
    gameAreaContext.fillStyle = 'rgba(205, 255, 170, 0.42)';
    gameAreaContext.arc(pixelX + 6, pixelY + 6, 2, 0, Math.PI * 2);
    gameAreaContext.fill();
    gameAreaContext.beginPath();
    gameAreaContext.fillStyle = 'rgba(10, 55, 22, 0.38)';
    gameAreaContext.arc(pixelX + 14, pixelY + 14, 2, 0, Math.PI * 2);
    gameAreaContext.fill();
  }
}

function drawFood(x, y) {
  var centerX = x * cellWidth + cellWidth / 2;
  var centerY = y * cellWidth + cellWidth / 2;
  var gradient = gameAreaContext.createRadialGradient(
    centerX - 3,
    centerY - 4,
    1,
    centerX,
    centerY,
    cellWidth / 2
  );
  gradient.addColorStop(0, '#ffb3a7');
  gradient.addColorStop(0.45, '#e53935');
  gradient.addColorStop(1, '#8e111b');

  gameAreaContext.beginPath();
  gameAreaContext.moveTo(centerX, centerY - 5);
  gameAreaContext.bezierCurveTo(centerX - 8, centerY - 12, centerX - 12, centerY - 2, centerX - 8, centerY + 4);
  gameAreaContext.bezierCurveTo(centerX - 7, centerY + 10, centerX - 2, centerY + 10, centerX, centerY + 7);
  gameAreaContext.bezierCurveTo(centerX + 4, centerY + 11, centerX + 9, centerY + 7, centerX + 9, centerY + 1);
  gameAreaContext.bezierCurveTo(centerX + 12, centerY - 5, centerX + 6, centerY - 9, centerX, centerY - 5);
  gameAreaContext.closePath();
  gameAreaContext.fillStyle = gradient;
  gameAreaContext.fill();

  gameAreaContext.beginPath();
  gameAreaContext.strokeStyle = '#59351c';
  gameAreaContext.lineWidth = 2;
  gameAreaContext.moveTo(centerX, centerY - 5);
  gameAreaContext.lineTo(centerX + 2, centerY - 10);
  gameAreaContext.stroke();

  gameAreaContext.beginPath();
  gameAreaContext.fillStyle = '#3e8b3e';
  gameAreaContext.ellipse(centerX + 4, centerY - 8, 4, 2, -0.5, 0, Math.PI * 2);
  gameAreaContext.fill();
}

function checkDirectionUpdatePosition() {
  var snakeX = snake[0].x;
  var snakeY = snake[0].y;
  if (snakeDirection == 'right') {
    snakeX++;
  } else if (snakeDirection == 'left') {
    snakeX--;
  } else if (snakeDirection == 'down') {
    snakeY++;
  } else if (snakeDirection == 'up') {
    snakeY--;
  }
  return { snakeX, snakeY };
}

function didSnakeEatTheFood(snakeX, snakeY) {
  if (snakeX == snakeFood.x && snakeY == snakeFood.y) {
    return true;
  } else {
    return false;
  }
}

function updateGameArea() {

  var snakeAteFootVar = false;
  var isSnakeOnItself = false

  createGameArea();
  
  var newPosition = checkDirectionUpdatePosition();
  var snakeX = newPosition.snakeX;
  var snakeY = newPosition.snakeY;
    
  
  // make snake hit itself
  var isSnakeOnItself = snakeOnItself(snakeX, snakeY, snake)  
  if(isSnakeOnItself) {
    writeScore();
    clearInterval(timer);
    gameStart.disabled = false;
    return
  }
    
  
  
  // make snake hit the wall
  if(checkSnakeOutOfBounds(snakeX, snakeY, isSnakeOnItself)) {
    writeScore();
    clearInterval(timer);
    gameStart.disabled = false;
    return
  }
    
    
  
  // make snake eat the food
  snakeAteFootVar = didSnakeEatTheFood(snakeX, snakeY);
  if (snakeAteFootVar) {
    var newHead = { x: snakeX, y: snakeY };
    playerScore += speedSize;
    writeScore();
    createFood();
  } 
  
  
  
  // make snake move
  if(!snakeAteFootVar) {
    var newHead = snake.pop();
    newHead.x = snakeX;
    newHead.y = snakeY;
  }
  snake.unshift(newHead);
  

  
  // create the snake
  for (var index = 0, length = snake.length; index < length; index++) {
    drawSnakeSegment(snake[index].x, snake[index].y, index === 0, index);
  } 
    
    
  
  // create the food
  drawFood(snakeFood.x, snakeFood.y);
  
}

function checkSnakeOutOfBounds(snakeX, snakeY) {
  if ((snakeX == -1) || 
    (snakeX == gameAreaWidth / cellWidth) || 
    (snakeY == -1) || 
    (snakeY == gameAreaHeight / cellWidth)) {
      return true;
  }
  return false;
}

function startGame() {

  // initally create snake
  snake = [];
  snake.push({ x: 0, y: cellWidth });

  // create the food
  createFood();

  // make the snake move automatically
   clearInterval(timer);
  timer = setInterval(updateGameArea, 500 / speedSize);
}

function stepOnClick() {
  updateGameArea();
}

function onStartGame() {
  this.disabled = true;

  // reset score
  playerScore = 0;
  writeScore();

  // reset direction to right
  snakeDirection = 'right';

  // reset speed the set value
  speedSize = parseInt(gameSpeed.value);
  if (speedSize > 9) {
    speedSize = 9;
  } else if (speedSize < 0) {
    speedSize = 1;
  }

  startGame();
}

function setDirection(direction) {
  var oppositeDirections = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  };
  if (direction !== oppositeDirections[snakeDirection]) {
    snakeDirection = direction;
  }
}

function changeDirection(e) {
  var keyDirections = {
    ArrowDown: 'down',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowLeft: 'left',
  };
  var direction = keyDirections[e.key];
  if (direction) setDirection(direction);
}



function initEvent() {
  gameStart.addEventListener('click', onStartGame);
 // manualStep.addEventListener('click', stepOnClick)
  window.addEventListener('keydown', changeDirection);
  directionButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      setDirection(button.dataset.direction);
    });
  });
}

function init() {
  initElement();
  writeScore();
  createGameArea()
  initEvent();
}

window.addEventListener('DOMContentLoaded', init);
