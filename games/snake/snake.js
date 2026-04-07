const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const speedEl = document.getElementById("speed");
const overlayEl = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("btn-start");
const pauseBtn = document.getElementById("btn-pause");
const restartBtn = document.getElementById("btn-restart");

const settings = {
  cols: 30,
  rows: 20,
  cell: 24,
  baseSpeed: 8,
  speedStep: 0.25,
  maxSpeed: 16,
};

const colors = {
  bg: "#0b111a",
  grid: "#151e2b",
  snake: "#6ee7b7",
  head: "#7dd3fc",
  apple: "#f87171",
};

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let apple = { x: 10, y: 10 };
let score = 0;
let best = Number(localStorage.getItem("snake-best") || 0);
let running = false;
let paused = false;
let gameOver = false;
let lastTick = 0;
let tickInterval = 1000 / settings.baseSpeed;

function reset() {
  const startX = Math.floor(settings.cols / 2);
  const startY = Math.floor(settings.rows / 2);
  snake = [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  paused = false;
  gameOver = false;
  spawnApple();
  updateHud();
  showOverlay("Press Start", "Use arrows or WASD to move.");
}

function updateHud() {
  scoreEl.textContent = String(score);
  bestEl.textContent = String(best);
  const speed = Math.min(settings.maxSpeed, settings.baseSpeed + score * settings.speedStep);
  speedEl.textContent = `${speed.toFixed(1)}x`;
  tickInterval = 1000 / speed;
}

function showOverlay(title, text) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlayEl.classList.add("is-visible");
}

function hideOverlay() {
  overlayEl.classList.remove("is-visible");
}

function spawnApple() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * settings.cols),
      y: Math.floor(Math.random() * settings.rows),
    };
  } while (snake.some((segment) => segment.x === pos.x && segment.y === pos.y));
  apple = pos;
}

function setDirection(x, y) {
  if (direction.x === -x && direction.y === -y) return;
  nextDirection = { x, y };
}

function step() {
  if (!running || paused || gameOver) return;

  direction = nextDirection;
  const head = snake[0];
  const next = { x: head.x + direction.x, y: head.y + direction.y };

  if (next.x < 0 || next.x >= settings.cols || next.y < 0 || next.y >= settings.rows) {
    endGame();
    return;
  }

  if (snake.some((segment) => segment.x === next.x && segment.y === next.y)) {
    endGame();
    return;
  }

  snake.unshift(next);

  if (next.x === apple.x && next.y === apple.y) {
    score += 1;
    if (score > best) {
      best = score;
      localStorage.setItem("snake-best", String(best));
    }
    spawnApple();
    updateHud();
  } else {
    snake.pop();
  }
}

function endGame() {
  gameOver = true;
  running = false;
  showOverlay("Game Over", "Press R to restart.");
}

function drawGrid() {
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x <= settings.cols; x += 1) {
    ctx.beginPath();
    ctx.moveTo(x * settings.cell, 0);
    ctx.lineTo(x * settings.cell, settings.rows * settings.cell);
    ctx.stroke();
  }
  for (let y = 0; y <= settings.rows; y += 1) {
    ctx.beginPath();
    ctx.moveTo(0, y * settings.cell);
    ctx.lineTo(settings.cols * settings.cell, y * settings.cell);
    ctx.stroke();
  }
}

function draw() {
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  ctx.fillStyle = colors.apple;
  ctx.fillRect(apple.x * settings.cell + 4, apple.y * settings.cell + 4, settings.cell - 8, settings.cell - 8);

  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? colors.head : colors.snake;
    ctx.fillRect(
      segment.x * settings.cell + 3,
      segment.y * settings.cell + 3,
      settings.cell - 6,
      settings.cell - 6
    );
  });
}

function loop(timestamp) {
  if (!lastTick) lastTick = timestamp;
  const delta = timestamp - lastTick;
  if (delta >= tickInterval) {
    step();
    lastTick = timestamp;
  }
  draw();
  requestAnimationFrame(loop);
}

function startGame() {
  if (gameOver) {
    reset();
  }
  running = true;
  paused = false;
  hideOverlay();
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  if (paused) {
    showOverlay("Paused", "Press Space to resume.");
  } else {
    hideOverlay();
  }
}

function restartGame() {
  reset();
  running = true;
  hideOverlay();
}

startBtn.addEventListener("click", () => startGame());
pauseBtn.addEventListener("click", () => togglePause());
restartBtn.addEventListener("click", () => restartGame());

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
    case "w":
    case "W":
      setDirection(0, -1);
      break;
    case "ArrowDown":
    case "s":
    case "S":
      setDirection(0, 1);
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      setDirection(-1, 0);
      break;
    case "ArrowRight":
    case "d":
    case "D":
      setDirection(1, 0);
      break;
    case " ":
      if (!running) {
        startGame();
      } else {
        togglePause();
      }
      break;
    case "r":
    case "R":
      restartGame();
      break;
    default:
      break;
  }
});

reset();
requestAnimationFrame(loop);

