import { useEffect, useMemo, useRef, useState } from "react";

const GRID_PRESETS = [
  { id: "small", label: "Petite (9x9)", cols: 9, rows: 9, cell: 22, speedScale: 0.28 },
  { id: "medium", label: "Moyenne (12x12)", cols: 12, rows: 12, cell: 16, speedScale: 0.38 },
  { id: "classic", label: "Classic (36x26)", cols: 36, rows: 26, cell: 6, speedScale: 0.5 },
];

const SPRITE_SIZE = 6;

const SPRITES = {
  mouth: [
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 1,
    0, 0, 0, 1, 1, 0,
    0, 0, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
  ],
  bite: [
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 0, 1,
    0, 0, 0, 0, 1, 0,
    0, 0, 0, 0, 1, 1,
    0, 0, 0, 1, 0, 0,
    0, 0, 0, 0, 0, 0,
  ],
  head: [
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    1, 0, 1, 1, 1, 1,
    1, 1, 0, 1, 1, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
  ],
  body: [
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
  ],
  bodyEnd: [
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 1, 1,
    1, 1, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
  ],
  corner: [
    0, 0, 1, 1, 0, 0,
    0, 0, 1, 1, 0, 0,
    0, 0, 1, 0, 1, 0,
    0, 0, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
  ],
};

const COLORS = {
  screen: "#8aa56c",
  grid: "#6f8755",
  snake: "#7f858c",
  head: "#a6adb5",
  apple: "#e12828",
  overlay: "rgba(199, 209, 138, 0.85)",
};

const TABS = [
  { id: "game", label: "Game" },
  { id: "controls", label: "Controls" },
  { id: "rules", label: "Rules" },
];

const GAME_MODES = [
  {
    id: "classic",
    label: "Classic",
    wrap: false,
    baseSpeed: 6,
    speedStep: 0.25,
    maxSpeed: 12,
    fixedSpeed: false,
    appleCount: 1,
    description: "Classic Nokia challenge: walls are lethal and speed increases with your score.",
    chips: ["Walls = Game Over", "No diagonal moves", "Speed scales"],
    rules: [
      "Eat apples to grow and earn points.",
      "Don’t hit the walls or your own body.",
      "Speed increases as your score rises.",
    ],
  },
  {
    id: "infinite",
    label: "Infinite (No Walls)",
    wrap: true,
    baseSpeed: 7,
    speedStep: 0,
    maxSpeed: 7,
    fixedSpeed: true,
    appleCount: 1,
    description: "No wall collision: the snake wraps around the screen with a fixed speed.",
    chips: ["Walls disabled", "No diagonal moves", "Fixed speed"],
    rules: [
      "Eat apples to grow and earn points.",
      "Walls are disabled: crossing an edge wraps to the opposite side.",
      "You only lose if the snake collides with itself.",
    ],
  },
  {
    id: "orchard",
    label: "Orchard (Multi-Apple)",
    wrap: false,
    baseSpeed: 5,
    speedStep: 0,
    maxSpeed: 5,
    fixedSpeed: true,
    appleCount: 1,
    description: "Fixed-speed mode where apple count grows after each bite using Fibonacci progression.",
    chips: ["Walls = Game Over", "Fibonacci apples", "Fixed speed"],
    rules: [
      "Apple count grows with Fibonacci progression after each apple until the grid is full.",
      "Speed stays fixed for the full run.",
      "You lose on wall collision or self-collision.",
    ],
  },
];

const getGridCells = (grid) => grid.cols * grid.rows;

const to2D = (arr) => Array.from({ length: SPRITE_SIZE }, (_, i) => arr.slice(i * SPRITE_SIZE, (i + 1) * SPRITE_SIZE));

const rotatePattern = (arr, times = 1) => {
  let result = arr;
  const steps = ((times % 4) + 4) % 4;
  for (let i = 0; i < steps; i += 1) {
    const grid = to2D(result);
    const rotated = [];
    for (let x = 0; x < SPRITE_SIZE; x += 1) {
      for (let y = SPRITE_SIZE - 1; y >= 0; y -= 1) {
        rotated.push(grid[y][x]);
      }
    }
    result = rotated;
  }
  return result;
};

const flipPatternHorizontal = (arr) => {
  const grid = to2D(arr);
  const flipped = [];
  for (const row of grid) flipped.push(...row.slice().reverse());
  return flipped;
};

const flipPatternVertical = (arr) => {
  const grid = to2D(arr);
  const flipped = [];
  for (let i = SPRITE_SIZE - 1; i >= 0; i -= 1) {
    flipped.push(...grid[i]);
  }
  return flipped;
};

const getDirectionKey = (from, to) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx > 0) return "right";
  if (dx < 0) return "left";
  if (dy > 0) return "down";
  return "up";
};

const orientPattern = (pattern, directionKey) => {
  if (directionKey === "right") return flipPatternHorizontal(pattern);
  if (directionKey === "up") return rotatePattern(pattern, 1);
  if (directionKey === "down") return flipPatternVertical(rotatePattern(pattern, 1));
  return pattern;
};

const getStraightBodySprite = (directionKey) => {
  if (directionKey === "up" || directionKey === "down") return rotatePattern(SPRITES.body, 1);
  return SPRITES.body;
};

const getTailSprite = (directionKey) => {
  return orientPattern(SPRITES.bodyEnd, directionKey);
};

const getCornerSprite = (inDir, outDir) => {
  const key = `${inDir}-${outDir}`;
  if (key === "up-right" || key === "right-up") return rotatePattern(SPRITES.corner, 1);
  if (key === "right-down" || key === "down-right") return rotatePattern(SPRITES.corner, 2);
  if (key === "down-left" || key === "left-down") return rotatePattern(SPRITES.corner, 3);
  return SPRITES.corner;
};

const drawSprite = (ctx, pattern, gridX, gridY, cell, color) => {
  const pixelSize = cell / SPRITE_SIZE;
  const gap = Math.max(0.25, pixelSize * 0.08);

  for (let i = 0; i < pattern.length; i += 1) {
    if (!pattern[i]) continue;
    const px = i % SPRITE_SIZE;
    const py = Math.floor(i / SPRITE_SIZE);
    const x = gridX * cell + px * pixelSize + gap * 0.5;
    const y = gridY * cell + py * pixelSize + gap * 0.5;
    const size = Math.max(0.8, pixelSize - gap);

    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
  }
};

const SNAKE_COLOR = "#000";
const ORCHARD_SPAWN_BURST = 6;
const MAX_FIB_GROWTH = 1000000;
const ORCHARD_MAX_APPLES = 60;
const MAX_STEPS_PER_FRAME = 3;
const MAX_INPUT_QUEUE = 3;

const areSameDirection = (a, b) => a.x === b.x && a.y === b.y;
const areOppositeDirections = (a, b) => a.x === -b.x && a.y === -b.y;

const DIRECTION_BY_KEY = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

const drawAppleSprite = (ctx, gridX, gridY, cell) => {
  const appleSize = Math.max(3, cell - 2);
  const appleX = gridX * cell + Math.floor((cell - appleSize) / 2);
  const appleY = gridY * cell + Math.floor((cell - appleSize) / 2);

  // Shadow gives depth while staying cheap to render.
  ctx.fillStyle = "#7f1212";
  ctx.fillRect(appleX + 1, appleY + 1, appleSize, appleSize);

  // Main body + subtle top highlight.
  ctx.fillStyle = "#d71f1f";
  ctx.fillRect(appleX, appleY, appleSize, appleSize);
  ctx.fillStyle = "#f14a4a";
  ctx.fillRect(appleX + 1, appleY + 1, Math.max(1, appleSize - 3), 1);

  // Cut corners to fake a rounded pixel shape.
  ctx.fillStyle = COLORS.screen;
  ctx.fillRect(appleX, appleY, 1, 1);
  ctx.fillRect(appleX + appleSize - 1, appleY, 1, 1);
  ctx.fillRect(appleX, appleY + appleSize - 1, 1, 1);
  ctx.fillRect(appleX + appleSize - 1, appleY + appleSize - 1, 1, 1);

  // Specular pixel and stem/leaf details.
  ctx.fillStyle = "#ffd8d8";
  ctx.fillRect(appleX + 1, appleY + 2, 1, 1);

  const stemX = appleX + Math.floor(appleSize / 2);
  if (appleY > 0) {
    ctx.fillStyle = "#5f3a1f";
    ctx.fillRect(stemX, appleY - 1, 1, 1);
    ctx.fillStyle = "#4f8d42";
    ctx.fillRect(stemX + 1, appleY - 1, 1, 1);
  }
};

function createBeepEngine() {
  let ctx = null;

  const ensure = () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) ctx = new AudioCtx();
    return ctx;
  };

  const unlock = () => {
    const audioCtx = ensure();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") {
      void audioCtx.resume().catch(() => {});
    }
  };

  const play = (freq = 520, duration = 0.08, volume = 0.12) => {
    const audioCtx = ensure();
    if (!audioCtx || audioCtx.state !== "running") return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  };

  return { unlock, play };
}

function useSnakeGame({ modeId, gridPresetId, onEat, onGameOver, onUserInteract }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const frameRef = useRef(0);
  const directionQueueRef = useRef([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("snake-best") || 0));
  const [speedLabel, setSpeedLabel] = useState("1.0x");
  const [status, setStatus] = useState("Press Start");
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const mode = useMemo(
    () => GAME_MODES.find((item) => item.id === modeId) || GAME_MODES[0],
    [modeId]
  );
  const grid = useMemo(
    () => GRID_PRESETS.find((item) => item.id === gridPresetId) || GRID_PRESETS[0],
    [gridPresetId]
  );

  const updateHud = (nextScore) => {
    const rawSpeed = mode.fixedSpeed
      ? mode.baseSpeed
      : Math.min(mode.maxSpeed, mode.baseSpeed + nextScore * mode.speedStep);
    const speed = Math.max(3.2, rawSpeed * (grid.speedScale ?? 1));
    setSpeedLabel(`${speed.toFixed(1)}x`);
    return speed;
  };

  const reset = () => {
    const startX = Math.floor(grid.cols / 2);
    const startY = Math.floor(grid.rows / 2);
    const snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];
    const apples = spawnApples(snake, mode.appleCount, grid);
    engineRef.current = {
      snake,
      apples,
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      running: false,
      paused: false,
      gameOver: false,
      lastTick: 0,
      tickInterval: 1000 / updateHud(0),
      score: 0,
      modeId,
      modeConfig: mode,
      grid,
      orchardFibA: 1,
      orchardFibB: 2,
    };
    directionQueueRef.current = [];
    setScore(0);
    setPaused(false);
    setGameOver(false);
    setWon(false);
    setRunning(false);
    setStatus("Press Start");
    setShowSplash(true);
    updateHud(0);
  };

  const start = () => {
    if (onUserInteract) onUserInteract();
    if (!engineRef.current) return;
    if (engineRef.current.gameOver) {
      reset();
    }
    engineRef.current.running = true;
    engineRef.current.paused = false;
    engineRef.current.lastTick = performance.now();
    setRunning(true);
    setPaused(false);
    setWon(false);
    setStatus("Good luck!");
    setShowSplash(false);
  };

  const togglePause = () => {
    if (onUserInteract) onUserInteract();
    if (!engineRef.current || !engineRef.current.running) return;
    engineRef.current.paused = !engineRef.current.paused;
    if (!engineRef.current.paused) {
      engineRef.current.lastTick = performance.now();
    }
    setPaused(engineRef.current.paused);
    setStatus(engineRef.current.paused ? "Paused" : "Good luck!");
  };

  const restart = () => {
    if (onUserInteract) onUserInteract();
    reset();
    engineRef.current.running = true;
    engineRef.current.lastTick = performance.now();
    setRunning(true);
    setWon(false);
    setStatus("Good luck!");
    setShowSplash(false);
  };

  const queueDirection = (x, y) => {
    const engine = engineRef.current;
    if (!engine) return;
    const nextDirection = { x, y };
    const queue = directionQueueRef.current;
    const lastPlannedDirection = queue.length > 0
      ? queue[queue.length - 1]
      : engine.nextDir;

    if (areSameDirection(lastPlannedDirection, nextDirection)) return;
    if (areOppositeDirections(lastPlannedDirection, nextDirection)) return;

    if (queue.length >= MAX_INPUT_QUEUE) {
      queue.shift();
    }
    queue.push(nextDirection);
  };

  const handleKey = (event) => {
    if (onUserInteract) onUserInteract();
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

    if (DIRECTION_BY_KEY[key]) {
      event.preventDefault();
      if (event.repeat) return;
      queueDirection(DIRECTION_BY_KEY[key].x, DIRECTION_BY_KEY[key].y);
      return;
    }

    switch (key) {
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight":
      case "w":
      case "s":
      case "a":
      case "d":
        break;
      case " ":
      case "Spacebar":
        event.preventDefault();
        if (event.repeat) return;
        if (!engineRef.current?.running) start();
        else togglePause();
        break;
      case "r":
        if (event.repeat) return;
        restart();
        break;
      default:
        break;
    }
  };

  const step = () => {
    const engine = engineRef.current;
    if (!engine || !engine.running || engine.paused || engine.gameOver) return;
    const modeConfig = engine.modeConfig;

    const queuedDirection = directionQueueRef.current.shift();
    if (queuedDirection && !areOppositeDirections(engine.dir, queuedDirection)) {
      engine.nextDir = queuedDirection;
    }
    engine.dir = engine.nextDir;
    const head = engine.snake[0];
    let next = { x: head.x + engine.dir.x, y: head.y + engine.dir.y };

    if (modeConfig.wrap) {
      next = {
        x: (next.x + grid.cols) % grid.cols,
        y: (next.y + grid.rows) % grid.rows,
      };
    } else if (next.x < 0 || next.x >= grid.cols || next.y < 0 || next.y >= grid.rows) {
      endGame();
      return;
    }

    const eatenIndex = engine.apples.findIndex((apple) => apple.x === next.x && apple.y === next.y);
    const selfCollisionBody = eatenIndex === -1 ? engine.snake.slice(0, -1) : engine.snake;
    if (selfCollisionBody.some((segment) => segment.x === next.x && segment.y === next.y)) {
      endGame();
      return;
    }

    engine.snake.unshift(next);

    if (eatenIndex !== -1) {
      engine.score += 1;
      setScore(engine.score);
      if (engine.score > best) {
        const nextBest = engine.score;
        setBest(nextBest);
        localStorage.setItem("snake-best", String(nextBest));
      }
      const rawSpeed = modeConfig.fixedSpeed
        ? modeConfig.baseSpeed
        : Math.min(modeConfig.maxSpeed, modeConfig.baseSpeed + engine.score * modeConfig.speedStep);
      const speed = Math.max(3.2, rawSpeed * (grid.speedScale ?? 1));

      if (modeConfig.id === "orchard") {
        engine.apples.splice(eatenIndex, 1);
        const maxPossible = Math.max(0, getGridCells(grid) - engine.snake.length);
        const safeAppleCap = Math.min(maxPossible, ORCHARD_MAX_APPLES);
        const targetAppleCount = Math.min(engine.orchardFibB, safeAppleCap);
        const stagedTarget = Math.min(targetAppleCount, engine.apples.length + ORCHARD_SPAWN_BURST);
        engine.apples = ensureAppleCount(engine.snake, engine.apples, stagedTarget, grid);
        const nextFib = Math.min(MAX_FIB_GROWTH, engine.orchardFibA + engine.orchardFibB);
        engine.orchardFibA = engine.orchardFibB;
        engine.orchardFibB = nextFib;
      } else {
        const occupied = [
          ...engine.snake,
          ...engine.apples.filter((_, index) => index !== eatenIndex),
        ];
        const nextApple = spawnApple(occupied, grid);
        if (nextApple) {
          engine.apples[eatenIndex] = nextApple;
        } else {
          engine.apples.splice(eatenIndex, 1);
        }
      }

      engine.tickInterval = 1000 / speed;
      updateHud(engine.score);
      if (onEat) onEat();

      if (engine.snake.length >= getGridCells(grid)) {
        winGame();
        return;
      }
    } else {
      engine.snake.pop();
    }
  };

  const winGame = () => {
    const engine = engineRef.current;
    if (!engine) return;
    directionQueueRef.current = [];
    engine.running = false;
    engine.paused = false;
    engine.gameOver = false;
    setRunning(false);
    setPaused(false);
    setGameOver(false);
    setWon(true);
    setStatus("Victory! Grid completed");
  };

  const endGame = () => {
    if (!engineRef.current) return;
    directionQueueRef.current = [];
    engineRef.current.gameOver = true;
    engineRef.current.running = false;
    engineRef.current.paused = false;
    setWon(false);
    setGameOver(true);
    setRunning(false);
    setStatus("Game Over");
    if (onGameOver) onGameOver();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = COLORS.screen;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cell = grid.cell;

    // Subtle alternating pixels for a cleaner retro LCD texture.
    ctx.fillStyle = "rgba(58, 76, 44, 0.09)";
    for (let y = 0; y < grid.rows; y += 1) {
      for (let x = (y % 2); x < grid.cols; x += 2) {
        ctx.fillRect(x * cell, y * cell, 1, 1);
      }
    }

    ctx.strokeStyle = COLORS.grid;
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = 1;
    for (let x = 0; x <= grid.cols; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * cell, 0);
      ctx.lineTo(x * cell, grid.rows * cell);
      ctx.stroke();
    }
    for (let y = 0; y <= grid.rows; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y * cell);
      ctx.lineTo(grid.cols * cell, y * cell);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    engine.apples.forEach((apple) => {
      drawAppleSprite(ctx, apple.x, apple.y, cell);
    });

    const head = engine.snake[0];
    const willEat = engine.apples.some(
      (apple) => apple.x === head.x + engine.dir.x && apple.y === head.y + engine.dir.y
    );
    const headSpriteBase = willEat ? SPRITES.bite : SPRITES.mouth;

    for (let i = 0; i < engine.snake.length; i += 1) {
      const segment = engine.snake[i];
      const prev = engine.snake[i - 1] ?? null;
      const nextPart = engine.snake[i + 1] ?? null;

      if (i === 0) {
        const directionKey = getDirectionKey(segment, { x: segment.x + engine.dir.x, y: segment.y + engine.dir.y });
        drawSprite(ctx, orientPattern(headSpriteBase, directionKey), segment.x, segment.y, cell, SNAKE_COLOR);
        continue;
      }

      if (i === engine.snake.length - 1 && prev) {
        const tailDir = getDirectionKey(segment, prev);
        drawSprite(ctx, getTailSprite(tailDir), segment.x, segment.y, cell, SNAKE_COLOR);
        continue;
      }

      if (i === 1 && prev) {
        const neckDir = getDirectionKey(segment, prev);
        drawSprite(ctx, orientPattern(SPRITES.head, neckDir), segment.x, segment.y, cell, SNAKE_COLOR);
        continue;
      }

      if (prev && nextPart) {
        const inDir = getDirectionKey(segment, prev);
        const outDir = getDirectionKey(segment, nextPart);
        const isStraight = (inDir === "left" && outDir === "right")
          || (inDir === "right" && outDir === "left")
          || (inDir === "up" && outDir === "down")
          || (inDir === "down" && outDir === "up");

        if (isStraight) {
          drawSprite(ctx, getStraightBodySprite(inDir), segment.x, segment.y, cell, SNAKE_COLOR);
        } else {
          drawSprite(ctx, getCornerSprite(inDir, outDir), segment.x, segment.y, cell, SNAKE_COLOR);
        }
      }
    }
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = grid.cols * grid.cell;
    canvas.height = grid.rows * grid.cell;
    draw();
  };

  const loop = (timestamp) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (!engine.lastTick) engine.lastTick = timestamp;
    let delta = timestamp - engine.lastTick;
    let safetySteps = 0;
    while (delta >= engine.tickInterval && safetySteps < MAX_STEPS_PER_FRAME) {
      step();
      engine.lastTick += engine.tickInterval;
      delta = timestamp - engine.lastTick;
      safetySteps += 1;
    }

    // Re-sync timeline after long frame drops to avoid spiral-of-death.
    if (safetySteps === MAX_STEPS_PER_FRAME) {
      engine.lastTick = timestamp;
    }
    draw();
    frameRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    reset();
    resizeCanvas();
    frameRef.current = requestAnimationFrame(loop);

    window.addEventListener("keydown", handleKey);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("keydown", handleKey);
    };
  }, [modeId, gridPresetId]);

  return {
    canvasRef,
    score,
    best,
    speedLabel,
    status,
    running,
    paused,
    gameOver,
    won,
    showSplash,
    start,
    togglePause,
    restart,
    resizeCanvas,
  };
}

function spawnApple(occupiedCells, grid) {
  const occupied = new Set(occupiedCells.map((segment) => `${segment.x}:${segment.y}`));
  const freeCells = getGridCells(grid) - occupied.size;
  if (freeCells <= 0) return null;

  const targetFreeIndex = Math.floor(Math.random() * freeCells);
  let currentFreeIndex = 0;

  for (let y = 0; y < grid.rows; y += 1) {
    for (let x = 0; x < grid.cols; x += 1) {
      const key = `${x}:${y}`;
      if (occupied.has(key)) continue;
      if (currentFreeIndex === targetFreeIndex) {
        return { x, y };
      }
      currentFreeIndex += 1;
    }
  }

  return null;
}

function spawnApples(snake, count, grid) {
  const apples = [];
  const occupied = [...snake];

  for (let index = 0; index < count; index += 1) {
    const apple = spawnApple(occupied, grid);
    if (!apple) break;
    apples.push(apple);
    occupied.push(apple);
  }

  return apples;
}

function ensureAppleCount(snake, apples, requestedCount, grid) {
  const maxPossible = Math.max(0, getGridCells(grid) - snake.length);
  const desiredCount = Math.min(requestedCount, maxPossible);
  const nextApples = [...apples];

  while (nextApples.length < desiredCount) {
    const apple = spawnApple([...snake, ...nextApples], grid);
    if (!apple) break;
    nextApples.push(apple);
  }

  return nextApples;
}

export default function App() {
  const [tab, setTab] = useState("game");
  const [modeId, setModeId] = useState("classic");
  const [gridPresetId, setGridPresetId] = useState("classic");
  const audio = useMemo(() => createBeepEngine(), []);
  const game = useSnakeGame({
    modeId,
    gridPresetId,
    onEat: () => audio.play(660, 0.07, 0.14),
    onGameOver: () => audio.play(220, 0.2, 0.16),
    onUserInteract: audio.unlock,
  });
  const backHref = useMemo(() => {
    const path = window.location.pathname;
    const isDist = path.includes("/games/snake/dist/");
    return isDist ? "../../../index.html" : "../../index.html";
  }, []);

  const isGameTab = tab === "game";
  const isControlsTab = tab === "controls";
  const isRulesTab = tab === "rules";
  const selectedMode = useMemo(
    () => GAME_MODES.find((item) => item.id === modeId) || GAME_MODES[0],
    [modeId]
  );
  const selectedGridPreset = useMemo(
    () => GRID_PRESETS.find((item) => item.id === gridPresetId) || GRID_PRESETS[0],
    [gridPresetId]
  );
  const speedRule = useMemo(() => {
    const scale = selectedGridPreset.speedScale ?? 1;
    const minSpeed = Math.max(3.2, selectedMode.baseSpeed * scale);
    const maxSpeed = Math.max(3.2, selectedMode.maxSpeed * scale);

    if (selectedMode.fixedSpeed) {
      return `Fixed speed: ${minSpeed.toFixed(1)}x throughout the run (adjusted for grid size).`;
    }
    return `Dynamic speed: starts at ${minSpeed.toFixed(1)}x and ramps up with score (max ${maxSpeed.toFixed(1)}x), adjusted for the selected grid.`;
  }, [selectedMode, selectedGridPreset]);
  const applesRule = useMemo(() => {
    if (selectedMode.id === "orchard") {
      return "Apples follow Fibonacci growth after each bite and stop increasing only when the grid has no free space left.";
    }
    return "One apple is active at a time.";
  }, [selectedMode]);

  useEffect(() => {
    if (tab === "game") {
      requestAnimationFrame(game.resizeCanvas);
    }
  }, [tab, game.resizeCanvas]);

  const statusTone = useMemo(() => {
    if (game.won) return "win";
    if (game.gameOver) return "danger";
    if (game.paused) return "pause";
    if (!game.running) return "idle";
    return "playing";
  }, [game.gameOver, game.paused, game.running, game.won]);

  return (
    <div className="page">
      <div className="topbar">
        <a className="back-link" href={backHref}>&larr; Back to terminal</a>
        <div className="brand-block">
          <p className="eyebrow">Inspired by Nokia 3310</p>
          <h1>Snake</h1>
        </div>
        <nav className="tabs" aria-label="Snake sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`tab ${tab === item.id ? "is-active" : ""} ${item.id === "game" ? "is-main" : ""}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <main className="content">
        <section
          className="game-layout"
          style={{ display: isGameTab ? "flex" : "none" }}
        >
          <div className="phone-column">
            <div className="container">
              <div className="oval-container">
                <div className="nokia3310 on">
                  <div className="nokia-head-container">
                    <div className="speaker">
                      <div className="hole"></div>
                      <div className="hole"></div>
                      <div className="hole"></div>
                      <div className="hole"></div>
                      <div className="hole"></div>
                    </div>
                    <div className="logo">NOKIA</div>
                    <div className={`screen-container ${statusTone}`}>
                      <canvas ref={game.canvasRef} aria-label="Snake game"></canvas>
                      <div className={`lcd-overlay ${game.showSplash ? "is-splash" : "is-status"}`}>
                        {game.showSplash ? (
                          <div className="splash">
                            <p className="title">Snake</p>
                            <p>Press Start or Space</p>
                          </div>
                        ) : game.won ? (
                          <div className="win-banner">
                            <p className="title">VICTORY</p>
                            <p>Grid completed</p>
                            <p>Press Restart</p>
                          </div>
                        ) : (
                          <p className="status-text">{game.status}</p>
                        )}
                      </div>
                    </div>
                    <div className="bottom-oval">
                      <div className="big button top"></div>
                    </div>
                  </div>

                  <div className="bottom-buttons">
                    <button type="button" className="big button left" onClick={game.restart}>
                      <span>C</span>
                    </button>
                    <button
                      type="button"
                      className="big button right"
                      onClick={game.running ? game.togglePause : game.start}
                    >
                      <span>&lt;</span>
                      <span>&gt;</span>
                    </button>
                  </div>

                  <div className="keyboard" aria-hidden="true">
                    <div className="button-key-container"><div className="button-key left"><span className="special">1</span><span className="minitext compact">o_o</span></div></div>
                    <div className="button-key-container"><div className="button-key middle"><span className="special">2</span><span className="minitext">abc</span></div></div>
                    <div className="button-key-container invert"><div className="button-key right"><span className="special">3</span><span className="minitext">def</span></div></div>
                    <div className="button-key-container"><div className="button-key left"><span className="special">4</span><span className="minitext">ghi</span></div></div>
                    <div className="button-key-container"><div className="button-key middle"><span className="special">5</span><span className="minitext">jkl</span></div></div>
                    <div className="button-key-container invert"><div className="button-key right"><span className="special">6</span><span className="minitext">mno</span></div></div>
                    <div className="button-key-container"><div className="button-key left"><span className="special">7</span><span className="minitext">pqrs</span></div></div>
                    <div className="button-key-container"><div className="button-key middle"><span className="special">8</span><span className="minitext">tuv</span></div></div>
                    <div className="button-key-container invert"><div className="button-key right"><span className="special">9</span><span className="minitext">wxyz</span></div></div>
                    <div className="button-key-container"><div className="button-key left"><span className="special">*</span><span className="minitext">+</span></div></div>
                    <div className="button-key-container"><div className="button-key middle"><span className="special">0</span><span className="minitext rotate">[</span></div></div>
                    <div className="button-key-container invert"><div className="button-key right"><span className="special">#</span><span className="minitext home"></span></div></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <aside className="info">
            <h2>Game</h2>
            <p>{selectedMode.description}</p>
            <div className="mode-row">
              <label htmlFor="game-mode">Game mode</label>
              <div className="mode-select-wrap">
                <select
                  id="game-mode"
                  value={modeId}
                  onChange={(event) => setModeId(event.target.value)}
                >
                  {GAME_MODES.map((mode) => (
                    <option key={mode.id} value={mode.id}>{mode.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mode-row">
              <label htmlFor="grid-size">Grid size</label>
              <div className="mode-select-wrap">
                <select
                  id="grid-size"
                  value={gridPresetId}
                  onChange={(event) => setGridPresetId(event.target.value)}
                >
                  {GRID_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>{preset.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="chip-row">
              {selectedMode.chips.map((chip) => (
                <span key={chip} className="chip">{chip}</span>
              ))}
              <span className="chip">Speed: {game.speedLabel}</span>
              <span className="chip">Grid: {selectedGridPreset.cols}x{selectedGridPreset.rows}</span>
            </div>
            <div className="game-actions">
              <button type="button" className="btn primary" onClick={game.start}>Start</button>
              <button type="button" className="btn" onClick={game.togglePause}>Pause</button>
              <button type="button" className="btn ghost" onClick={game.restart}>Restart</button>
            </div>
          </aside>
        </section>

        <section
          className="panel"
          style={{ display: isControlsTab ? "block" : "none" }}
        >
          <h2>Controls</h2>
          <div className="controls-grid">
            <div className="control-block">
              <h3>Arrow Keys</h3>
              <div className="dpad">
                <span className="key up"><span className="key-glyph dir-up">▲</span></span>
                <span className="key left"><span className="key-glyph dir-left">▲</span></span>
                <span className="key down"><span className="key-glyph dir-down">▲</span></span>
                <span className="key right"><span className="key-glyph dir-right">▲</span></span>
              </div>
            </div>
            <div className="control-block">
              <h3>WASD</h3>
              <div className="wasd">
                <span className="key">W</span>
                <span className="key">A</span>
                <span className="key">S</span>
                <span className="key">D</span>
              </div>
            </div>
            <div className="control-block">
              <h3>Actions</h3>
              <ul>
                <li>Space: Start / Pause</li>
                <li>R: Restart</li>
              </ul>
            </div>
          </div>
        </section>

        <section
          className="panel"
          style={{ display: isRulesTab ? "block" : "none" }}
        >
          <h2>Rules</h2>
          <div className="mode-row rules-mode-row">
            <label htmlFor="rules-mode">Active mode</label>
            <div className="mode-select-wrap">
              <select
                id="rules-mode"
                value={modeId}
                onChange={(event) => setModeId(event.target.value)}
              >
                {GAME_MODES.map((mode) => (
                  <option key={mode.id} value={mode.id}>{mode.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mode-row rules-mode-row">
            <label htmlFor="rules-grid-size">Grid size</label>
            <div className="mode-select-wrap">
              <select
                id="rules-grid-size"
                value={gridPresetId}
                onChange={(event) => setGridPresetId(event.target.value)}
              >
                {GRID_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>{preset.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="rules-mode-chip">
            Active mode: <strong>{selectedMode.label}</strong>
          </div>
          <ul className="rules rules-primary">
            {selectedMode.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <div className="rules-grid">
            <article className="rule-card">
              <h3>Speed</h3>
              <p>{speedRule}</p>
            </article>
            <article className="rule-card">
              <h3>Apples</h3>
              <p>{applesRule}</p>
            </article>
            <article className="rule-card">
              <h3>Loss Conditions</h3>
              <p>{selectedMode.wrap ? "You lose only on self-collision." : "You lose on wall collision or self-collision."}</p>
            </article>
            <article className="rule-card">
              <h3>Controls</h3>
              <p>Arrow keys/WASD to move, Space to start or pause, R to restart.</p>
            </article>
            <article className="rule-card rule-card-visual">
              <h3>Growth Example</h3>
              <p>Each eaten apple adds one snake segment.</p>
              <div className="growth-demo" aria-hidden="true">
                <div className="growth-row">
                  <span className="demo-segment head"></span>
                  <span className="demo-segment"></span>
                  <span className="demo-apple"></span>
                  <span className="demo-note">Eat</span>
                </div>
                <div className="growth-row">
                  <span className="demo-segment head"></span>
                  <span className="demo-segment"></span>
                  <span className="demo-segment"></span>
                  <span className="demo-apple"></span>
                  <span className="demo-note">Grow</span>
                </div>
              </div>
            </article>
          </div>
          <p className="rules-footnote">Tip: stay smooth, avoid panic turns, and protect space for late-game movement.</p>
        </section>
      </main>
    </div>
  );
}
