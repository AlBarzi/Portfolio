import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  APPLE,
  APPLE_COLORS,
  SPRITE_SIZE,
  WALL,
  directionBetween,
  getSegmentPattern,
} from "./sprites.js";

/**
 * Grilles calees sur le format de l'ecran du 3310 (106x78, soit ~1.36).
 * Les anciens presets etaient carres (9x9, 12x12) ou tres denses (36x26) :
 * etires dans un ecran rectangulaire, les cases devenaient des rectangles et
 * le serpent illisible. Le rendu calcule desormais des cases carrees ; ces
 * ratios evitent de perdre de la place sur les cotes, et cette densite rend
 * au serpent le trait fin qu'il avait, sans le flou.
 */
const GRID_PRESETS = [
  { id: "small", label: "Small (13x9)", cols: 13, rows: 9, speedScale: 0.7 },
  { id: "medium", label: "Medium (17x12)", cols: 17, rows: 12, speedScale: 0.85 },
  { id: "large", label: "Large (22x16)", cols: 22, rows: 16, speedScale: 1 },
];

const DEFAULT_GRID_ID = "medium";

/**
 * Les quatre modes classiques du genre : le Snake d'origine, le mode sans
 * murs de Snake II, ses niveaux a obstacles, et une variante rapide pour le
 * score. Le mode Fibonacci a ete retire : il saturait la grille de pommes au
 * bout de six bouchees.
 *
 * Vitesses exprimees en cases par seconde. L'ancien modele multipliait une
 * vitesse arbitraire par une echelle de grille puis appliquait un plancher a
 * 3.2, ce qui rendait le chiffre affiche sans rapport avec le ressenti.
 */
const GAME_MODES = [
  {
    id: "classic",
    label: "Classic",
    wrap: false,
    maze: false,
    baseSpeed: 8,
    speedStep: 0.25,
    maxSpeed: 18,
    fixedSpeed: false,
    appleCount: 1,
    description: "The original Nokia challenge: walls are lethal and the snake speeds up as you score.",
    chips: ["Walls = Game Over", "No diagonal moves", "Speed scales"],
    rules: [
      "Eat apples to grow and earn points.",
      "Don't hit the walls or your own body.",
      "Speed increases as your score rises.",
    ],
  },
  {
    id: "infinite",
    label: "No Walls",
    wrap: true,
    maze: false,
    baseSpeed: 9,
    speedStep: 0.2,
    maxSpeed: 16,
    fixedSpeed: false,
    appleCount: 1,
    description: "The Snake II favourite: edges wrap around, so only your own body can end the run.",
    chips: ["Edges wrap", "No diagonal moves", "Speed scales"],
    rules: [
      "Eat apples to grow and earn points.",
      "Crossing an edge brings you back on the opposite side.",
      "You only lose if the snake collides with itself.",
    ],
  },
  {
    id: "maze",
    label: "Maze",
    wrap: false,
    maze: true,
    baseSpeed: 7,
    speedStep: 0.2,
    maxSpeed: 14,
    fixedSpeed: false,
    appleCount: 1,
    description: "Snake II levels: four blocks stand in the field and are just as lethal as the walls.",
    chips: ["Obstacles = Game Over", "Walls = Game Over", "Speed scales"],
    rules: [
      "Four blocks split the field: hitting one ends the run.",
      "The outer walls are lethal too.",
      "Apples never appear inside a block.",
    ],
  },
  {
    id: "blitz",
    label: "Blitz",
    wrap: false,
    maze: false,
    baseSpeed: 14,
    speedStep: 0.5,
    maxSpeed: 26,
    fixedSpeed: false,
    appleCount: 1,
    description: "Fast from the first move and getting faster. Short runs, made for chasing a best score.",
    chips: ["Walls = Game Over", "Fast start", "Steep ramp"],
    rules: [
      "The snake starts near top speed and keeps accelerating.",
      "Walls and your own body are lethal.",
      "Made for short runs and personal bests.",
    ],
  },
];

/**
 * Obstacles du mode Labyrinthe : quatre blocs symetriques, places en
 * proportion de la grille. Ils laissent libres la bande centrale — ou le
 * serpent demarre — et le pourtour.
 */
const buildWalls = (grid, mode) => {
  const walls = new Set();
  if (!mode.maze) return walls;

  const blockW = Math.max(2, Math.round(grid.cols * 0.14));
  const blockH = Math.max(2, Math.round(grid.rows * 0.18));
  const left = Math.round(grid.cols * 0.2);
  const right = grid.cols - left - blockW;
  const top = Math.round(grid.rows * 0.16);
  const bottom = grid.rows - top - blockH;

  for (const originX of [left, right]) {
    for (const originY of [top, bottom]) {
      for (let y = originY; y < originY + blockH; y += 1) {
        for (let x = originX; x < originX + blockW; x += 1) {
          if (x >= 0 && x < grid.cols && y >= 0 && y < grid.rows) walls.add(`${x}:${y}`);
        }
      }
    }
  }

  return walls;
};

const TABS = [
  { id: "game", label: "Game" },
  { id: "controls", label: "Controls" },
  { id: "rules", label: "Rules" },
];

const COLORS = {
  /** Le verre, entre les pixels : c'est lui qui dessine la trame. */
  screen: "#7f9a61",
  /** Un pixel eteint, legerement plus clair que le verre. */
  pixelOff: "#90ad70",
  apple: "#e12828",
  overlay: "rgba(199, 209, 138, 0.85)",
  /** Les obstacles restent plus clairs que le serpent : la lecture est immediate. */
  wall: "#41522f",
};

const SNAKE_COLOR = "#000";

const MAX_INPUT_QUEUE = 3;
/** Au-dela, on resynchronise l'horloge au lieu de rattraper les pas perdus. */
const MAX_CATCH_UP_STEPS = 2;

/** Dimensions nominales du boitier, base du calcul d'echelle. */
const PHONE_WIDTH = 170;
const PHONE_HEIGHT = 360;
/** Place laissee de chaque cote pour l'ombre portee du boitier. */
const PHONE_SHADOW_MARGIN = 24;
const MIN_PHONE_SCALE = 1.2;
/** Le zoom de reference du design : on ne le depasse jamais. */
const MAX_PHONE_SCALE = 2.85;

const VECTOR_BY_DIRECTION = {
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

const DIRECTION_BY_KEY = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
  // Le pave numerique, comme sur le telephone d'origine.
  2: { x: 0, y: -1 },
  8: { x: 0, y: 1 },
  4: { x: -1, y: 0 },
  6: { x: 1, y: 0 },
};

const getGridCells = (grid) => grid.cols * grid.rows;
const areSameDirection = (a, b) => a.x === b.x && a.y === b.y;
const areOppositeDirections = (a, b) => a.x === -b.x && a.y === -b.y;

const getSpeed = (mode, grid, score) => {
  const raw = mode.fixedSpeed
    ? mode.baseSpeed
    : Math.min(mode.maxSpeed, mode.baseSpeed + score * mode.speedStep);
  return raw * (grid.speedScale ?? 1);
};

const formatSpeed = (speed) => `${speed.toFixed(1)} cells/s`;

function spawnApple(occupiedCells, grid, walls = null) {
  const occupied = new Set(occupiedCells.map((cell) => `${cell.x}:${cell.y}`));
  if (walls) for (const key of walls) occupied.add(key);
  const freeCells = getGridCells(grid) - occupied.size;
  if (freeCells <= 0) return null;

  const targetFreeIndex = Math.floor(Math.random() * freeCells);
  let currentFreeIndex = 0;

  for (let y = 0; y < grid.rows; y += 1) {
    for (let x = 0; x < grid.cols; x += 1) {
      if (occupied.has(`${x}:${y}`)) continue;
      if (currentFreeIndex === targetFreeIndex) return { x, y };
      currentFreeIndex += 1;
    }
  }

  return null;
}

function spawnApples(snake, count, grid, walls) {
  const apples = [];
  const occupied = [...snake];

  for (let index = 0; index < count; index += 1) {
    const apple = spawnApple(occupied, grid, walls);
    if (!apple) break;
    apples.push(apple);
    occupied.push(apple);
  }

  return apples;
}

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
    if (audioCtx.state === "suspended") void audioCtx.resume().catch(() => {});
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

/**
 * Dessine une trame 8x8 dans une case.
 *
 * Les bornes de chaque pixel sont arrondies a l'entier : meme quand la case
 * n'est pas un multiple de 8, les rectangles restent jointifs et nets, au lieu
 * de baver sur des demi-pixels comme dans la version precedente.
 */
/** Ecart entre deux pixels de la matrice, en pixels d'ecran. */
const lcdGap = (unit) => (unit >= 4 ? 1 : 0);

/**
 * Dessine une trame 6x6 en allumant des pixels de la matrice LCD.
 *
 * `unit` est entier par construction (voir `measure`), donc chaque pixel
 * allume tombe exactement sur une case de la matrice : le serpent fait partie
 * de l'ecran au lieu d'etre pose dessus.
 */
const drawPattern = (ctx, pattern, originX, originY, cell, color) => {
  const unit = cell / SPRITE_SIZE;
  const gap = lcdGap(unit);
  const size = Math.max(1, unit - gap);

  ctx.fillStyle = color;
  for (let index = 0; index < pattern.length; index += 1) {
    if (!pattern[index]) continue;
    const px = index % SPRITE_SIZE;
    const py = Math.floor(index / SPRITE_SIZE);
    ctx.fillRect(originX + px * unit, originY + py * unit, size, size);
  }
};

/**
 * Matrice de pixels du 3310, en motif repete : une tuile d'un pixel LCD
 * (verre + pixel eteint) est etiree sur toute l'aire de jeu. Beaucoup moins
 * couteux que de remplir les quelques milliers de pixels un par un a chaque
 * image, et parfaitement aligne sur la trame des sprites.
 */
const createLcdPattern = (ctx, unit) => {
  const gap = lcdGap(unit);
  const tile = document.createElement("canvas");
  tile.width = unit;
  tile.height = unit;
  const tileCtx = tile.getContext("2d");
  if (!tileCtx) return null;
  tileCtx.fillStyle = COLORS.screen;
  tileCtx.fillRect(0, 0, unit, unit);
  tileCtx.fillStyle = COLORS.pixelOff;
  tileCtx.fillRect(0, 0, Math.max(1, unit - gap), Math.max(1, unit - gap));
  return ctx.createPattern(tile, "repeat");
};

/** Pomme, allumee sur la meme matrice que le serpent. */
const drawApple = (ctx, originX, originY, cell) => {
  const unit = cell / SPRITE_SIZE;
  const size = Math.max(1, unit - lcdGap(unit));

  for (let index = 0; index < APPLE.length; index += 1) {
    const value = APPLE[index];
    if (!value) continue;
    const px = index % SPRITE_SIZE;
    const py = Math.floor(index / SPRITE_SIZE);
    ctx.fillStyle = APPLE_COLORS[value];
    ctx.fillRect(originX + px * unit, originY + py * unit, size, size);
  }
};

function useSnakeGame({ modeId, gridPresetId, onEat, onGameOver, onUserInteract }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const rafRef = useRef(0);
  const layoutRef = useRef({ cell: 0, offsetX: 0, offsetY: 0 });
  const directionQueueRef = useRef([]);
  const bestRef = useRef(0);
  const callbacksRef = useRef({ onEat, onGameOver, onUserInteract });

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("snake-best") || 0));
  const [speedLabel, setSpeedLabel] = useState(() => formatSpeed(GAME_MODES[0].baseSpeed));
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
    () => GRID_PRESETS.find((item) => item.id === gridPresetId)
      || GRID_PRESETS.find((item) => item.id === DEFAULT_GRID_ID),
    [gridPresetId]
  );

  // Les rappels et le record sont lus par la boucle : on les garde dans des
  // refs pour qu'elle ne travaille jamais sur une valeur figee au montage,
  // comme c'etait le cas du record avant (le score ne battait qu'une fois).
  callbacksRef.current = { onEat, onGameOver, onUserInteract };
  bestRef.current = best;

  /**
   * Aligne la resolution du canvas sur sa taille reelle a l'ecran (transform du
   * boitier et densite de pixels comprises), puis en deduit une case carree.
   * Avant, le canvas avait une taille fixe etiree par le CSS vers une zone de
   * proportions differentes : cases rectangulaires et sprites flous.
   */
  const measure = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return false;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    // La case vaut un nombre ENTIER de pixels LCD : sans cela, la matrice de
    // fond et les sprites tomberaient sur des trames decalees.
    const unit = Math.max(1, Math.floor(Math.min(
      width / (grid.cols * SPRITE_SIZE),
      height / (grid.rows * SPRITE_SIZE)
    )));
    const cell = unit * SPRITE_SIZE;

    const previous = layoutRef.current;
    layoutRef.current = {
      cell,
      unit,
      offsetX: Math.floor((width - cell * grid.cols) / 2),
      offsetY: Math.floor((height - cell * grid.rows) / 2),
      pattern: previous.unit === unit ? previous.pattern : null,
    };
    return true;
  }, [grid]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const layout = layoutRef.current;
    const { cell, unit, offsetX, offsetY } = layout;
    if (!cell) return;

    const wrap = engine.modeConfig.wrap;

    // Le verre deborde l'aire de jeu : l'ecran est plein, comme sur l'appareil.
    ctx.fillStyle = COLORS.screen;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Matrice de pixels eteints, sur TOUT l'ecran et pas seulement l'aire de
    // jeu : sur l'appareil, la dalle est pixelisee de bord a bord. Le decalage
    // aligne la trame sur la grille. Plus de quadrillage de cases : le 3310
    // n'en avait pas, c'est la trame des pixels qui structure l'ecran.
    if (!layout.pattern) layout.pattern = createLcdPattern(ctx, unit);
    if (layout.pattern) {
      ctx.save();
      ctx.translate(offsetX % unit, offsetY % unit);
      ctx.fillStyle = layout.pattern;
      ctx.fillRect(-unit, -unit, canvas.width + 2 * unit, canvas.height + 2 * unit);
      ctx.restore();
    }

    // Obstacles du mode Labyrinthe, en damier pour ne pas se confondre avec
    // le serpent, qui est plein.
    for (const key of engine.walls) {
      const [wx, wy] = key.split(":");
      drawPattern(ctx, WALL, offsetX + Number(wx) * cell, offsetY + Number(wy) * cell, cell, COLORS.wall);
    }

    for (const apple of engine.apples) {
      drawApple(ctx, offsetX + apple.x * cell, offsetY + apple.y * cell, cell);
    }

    // La bouche ne s'ouvre que si une pomme occupe vraiment la case visee ;
    // l'orientation vient de la geometrie du serpent, pas de l'etat du moteur.
    const snake = engine.snake;
    const head = snake[0];
    const facing = snake[1] ? directionBetween(snake[1], head, grid, wrap) : null;
    const aim = facing ? VECTOR_BY_DIRECTION[facing] : engine.dir;
    const target = wrap
      ? {
          x: (head.x + aim.x + grid.cols) % grid.cols,
          y: (head.y + aim.y + grid.rows) % grid.rows,
        }
      : { x: head.x + aim.x, y: head.y + aim.y };
    const mouthOpen = engine.apples.some(
      (apple) => apple.x === target.x && apple.y === target.y
    );

    for (let index = 0; index < snake.length; index += 1) {
      const segment = snake[index];
      const pattern = getSegmentPattern(snake, index, {
        grid,
        wrap,
        mouthOpen: index === 0 && mouthOpen,
      });
      drawPattern(
        ctx,
        pattern,
        offsetX + segment.x * cell,
        offsetY + segment.y * cell,
        cell,
        SNAKE_COLOR
      );
    }
  }, [grid]);

  const stopLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const endGame = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    directionQueueRef.current = [];
    engine.gameOver = true;
    engine.running = false;
    engine.paused = false;
    setWon(false);
    setGameOver(true);
    setRunning(false);
    setStatus("Game Over");
    callbacksRef.current.onGameOver?.();
  }, []);

  const winGame = useCallback(() => {
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
  }, []);

  const step = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !engine.running || engine.paused || engine.gameOver) return;
    const modeConfig = engine.modeConfig;

    // Une seule direction consommee par pas : deux touches pressees dans la
    // meme frame ne peuvent plus faire pivoter le serpent sur lui-meme.
    const queue = directionQueueRef.current;
    while (queue.length) {
      const candidate = queue.shift();
      if (areSameDirection(engine.dir, candidate)) continue;
      if (areOppositeDirections(engine.dir, candidate)) continue;
      engine.dir = candidate;
      break;
    }

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

    if (engine.walls.has(`${next.x}:${next.y}`)) {
      endGame();
      return;
    }

    const eatenIndex = engine.apples.findIndex(
      (apple) => apple.x === next.x && apple.y === next.y
    );
    // Sans pomme la queue libere sa case dans le meme pas : elle ne compte
    // donc pas comme collision.
    const body = eatenIndex === -1 ? engine.snake.slice(0, -1) : engine.snake;
    if (body.some((segment) => segment.x === next.x && segment.y === next.y)) {
      endGame();
      return;
    }

    engine.snake.unshift(next);

    if (eatenIndex === -1) {
      engine.snake.pop();
      return;
    }

    engine.score += 1;
    setScore(engine.score);
    if (engine.score > bestRef.current) {
      bestRef.current = engine.score;
      setBest(engine.score);
      localStorage.setItem("snake-best", String(engine.score));
    }

    const occupied = [
      ...engine.snake,
      ...engine.apples.filter((_, index) => index !== eatenIndex),
    ];
    const nextApple = spawnApple(occupied, grid, engine.walls);
    if (nextApple) engine.apples[eatenIndex] = nextApple;
    else engine.apples.splice(eatenIndex, 1);

    const speed = getSpeed(modeConfig, grid, engine.score);
    engine.tickInterval = 1000 / speed;
    setSpeedLabel(formatSpeed(speed));
    callbacksRef.current.onEat?.();

    if (engine.snake.length >= getGridCells(grid)) winGame();
  }, [endGame, grid, winGame]);

  /**
   * Boucle de jeu.
   *
   * L'ancienne version rattrapait jusqu'a trois pas par frame : un onglet passe
   * en arriere-plan, ou une frame longue, faisait avancer le serpent de
   * plusieurs cases d'un seul rendu — d'ou les a-coups et les morts
   * inexpliquees. Au-dela de deux pas de retard on repart de l'instant present.
   */
  const loop = useCallback((timestamp) => {
    const engine = engineRef.current;
    if (!engine) {
      rafRef.current = 0;
      return;
    }

    if (!engine.running || engine.paused || engine.gameOver) {
      rafRef.current = 0;
      draw();
      return;
    }

    if (!engine.lastTick) engine.lastTick = timestamp;
    let elapsed = timestamp - engine.lastTick;

    if (elapsed > engine.tickInterval * MAX_CATCH_UP_STEPS) {
      engine.lastTick = timestamp - engine.tickInterval;
      elapsed = engine.tickInterval;
    }

    let steps = 0;
    while (elapsed >= engine.tickInterval && steps < MAX_CATCH_UP_STEPS) {
      step();
      engine.lastTick += engine.tickInterval;
      elapsed = timestamp - engine.lastTick;
      steps += 1;
      if (!engine.running || engine.gameOver) break;
    }

    draw();
    rafRef.current = engine.running && !engine.paused && !engine.gameOver
      ? requestAnimationFrame(loop)
      : 0;
  }, [draw, step]);

  const startLoop = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || rafRef.current) return;
    engine.lastTick = performance.now();
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const reset = useCallback(() => {
    const startX = Math.max(2, Math.floor(grid.cols / 2) - 1);
    const startY = Math.floor(grid.rows / 2);
    const snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];
    const speed = getSpeed(mode, grid, 0);
    const walls = buildWalls(grid, mode);

    engineRef.current = {
      snake,
      walls,
      apples: spawnApples(snake, mode.appleCount, grid, walls),
      dir: { x: 1, y: 0 },
      running: false,
      paused: false,
      gameOver: false,
      lastTick: 0,
      tickInterval: 1000 / speed,
      score: 0,
      modeConfig: mode,
    };

    directionQueueRef.current = [];
    stopLoop();
    setScore(0);
    setPaused(false);
    setGameOver(false);
    setWon(false);
    setRunning(false);
    setStatus("Press Start");
    setShowSplash(true);
    setSpeedLabel(formatSpeed(speed));
  }, [grid, mode, stopLoop]);

  const start = useCallback(() => {
    callbacksRef.current.onUserInteract?.();
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.gameOver || engine.snake.length >= getGridCells(grid)) reset();

    const current = engineRef.current;
    current.running = true;
    current.paused = false;
    setRunning(true);
    setPaused(false);
    setWon(false);
    setGameOver(false);
    setStatus("Good luck!");
    setShowSplash(false);
    startLoop();
  }, [grid, reset, startLoop]);

  const togglePause = useCallback(() => {
    callbacksRef.current.onUserInteract?.();
    const engine = engineRef.current;
    if (!engine || !engine.running) return;
    engine.paused = !engine.paused;
    setPaused(engine.paused);
    setStatus(engine.paused ? "Paused" : "Good luck!");
    if (engine.paused) stopLoop();
    else startLoop();
  }, [startLoop, stopLoop]);

  const restart = useCallback(() => {
    callbacksRef.current.onUserInteract?.();
    reset();
    const engine = engineRef.current;
    engine.running = true;
    setRunning(true);
    setWon(false);
    setStatus("Good luck!");
    setShowSplash(false);
    startLoop();
  }, [reset, startLoop]);

  const queueDirection = useCallback((x, y) => {
    const engine = engineRef.current;
    if (!engine) return;
    const queue = directionQueueRef.current;
    const planned = queue.length > 0 ? queue[queue.length - 1] : engine.dir;
    const next = { x, y };

    if (areSameDirection(planned, next)) return;
    if (areOppositeDirections(planned, next)) return;
    if (queue.length >= MAX_INPUT_QUEUE) queue.shift();
    queue.push(next);
  }, []);

  /** Une direction demandee sur un jeu a l'arret le lance : plus direct au doigt. */
  const requestDirection = useCallback((x, y) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.gameOver) restart();
    else if (!engine.running) start();
    queueDirection(x, y);
  }, [queueDirection, restart, start]);

  useEffect(() => {
    reset();
    measure();
    draw();
    return stopLoop;
  }, [draw, measure, reset, stopLoop]);

  // Redimensionnement : le canvas suit la taille reelle de l'ecran du boitier.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const handle = () => {
      if (measure()) draw();
    };

    handle();
    const observer = new ResizeObserver(handle);
    observer.observe(canvas);
    window.addEventListener("resize", handle);
    window.addEventListener("orientationchange", handle);
    if (document.fonts?.ready) void document.fonts.ready.then(handle).catch(() => {});

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handle);
      window.removeEventListener("orientationchange", handle);
    };
  }, [draw, measure]);

  useEffect(() => {
    const handleKey = (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const direction = DIRECTION_BY_KEY[key];

      if (direction) {
        event.preventDefault();
        if (event.repeat) return;
        callbacksRef.current.onUserInteract?.();
        requestDirection(direction.x, direction.y);
        return;
      }

      if (key === " " || key === "Spacebar") {
        event.preventDefault();
        if (event.repeat) return;
        if (!engineRef.current?.running) start();
        else togglePause();
        return;
      }

      if (key === "r" && !event.repeat) restart();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [requestDirection, restart, start, togglePause]);

  // Onglet masque ou fenetre defocalisee : on met en pause plutot que de
  // laisser l'horloge deriver pendant que requestAnimationFrame est gele.
  useEffect(() => {
    const pauseIfRunning = () => {
      const engine = engineRef.current;
      if (!engine || !engine.running || engine.paused) return;
      engine.paused = true;
      setPaused(true);
      setStatus("Paused");
      stopLoop();
    };

    const handleVisibility = () => {
      if (document.hidden) pauseIfRunning();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", pauseIfRunning);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", pauseIfRunning);
    };
  }, [stopLoop]);

  const refresh = useCallback(() => {
    if (measure()) draw();
  }, [draw, measure]);

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
    requestDirection,
    refresh,
  };
}

/**
 * Zoom du boitier sur ecran etroit uniquement.
 *
 * Sur ordinateur, rien ne change : la valeur reste celle du CSS (2.85). Sous
 * 980px, ce zoom donnerait un telephone de 484 x 1026 px, plus large que
 * l'ecran ; on calcule alors la plus grande echelle qui tient dans la place
 * disponible.
 */
function usePhoneScale() {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const update = () => {
      if (!window.matchMedia("(max-width: 980px)").matches) {
        setScale((previous) => (previous === null ? previous : null));
        return;
      }

      // Seule la largeur commande. Le boitier est volontairement coupe en bas,
      // comme sur ordinateur : c'est le cadrage voulu, et il laisse a l'ecran
      // de jeu toute la largeur disponible. On garde une marge pour que
      // l'ombre portee du boitier ne soit pas rognee par le masque.
      const width = container.clientWidth - PHONE_SHADOW_MARGIN;
      if (width < 1) return;
      const next = width / PHONE_WIDTH;
      const clamped = Math.min(MAX_PHONE_SCALE, Math.max(MIN_PHONE_SCALE, next));
      setScale((previous) =>
        previous !== null && Math.abs(previous - clamped) < 0.01 ? previous : clamped
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return { containerRef, scale };
}

/** Balayage du doigt sur l'ecran : le geste attendu sur telephone. */
function useSwipeControls(onDirection, onTap) {
  const startRef = useRef(null);
  const movedRef = useRef(false);

  const onTouchStart = (event) => {
    const touch = event.touches[0];
    startRef.current = { x: touch.clientX, y: touch.clientY };
    movedRef.current = false;
  };

  const onTouchMove = (event) => {
    const origin = startRef.current;
    if (!origin) return;
    const touch = event.touches[0];
    const dx = touch.clientX - origin.x;
    const dy = touch.clientY - origin.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;

    if (event.cancelable) event.preventDefault();
    movedRef.current = true;
    if (Math.abs(dx) > Math.abs(dy)) onDirection(dx > 0 ? 1 : -1, 0);
    else onDirection(0, dy > 0 ? 1 : -1);
    // Nouveau point de depart : on enchaine les virages sans relever le doigt.
    startRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = () => {
    if (!movedRef.current) onTap();
    startRef.current = null;
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}

/**
 * Pave numerique du boitier, a l'identique. Les touches 2 / 4 / 6 / 8 portent
 * en plus une direction : elles deviennent de vrais boutons, comme sur le
 * telephone d'origine ou l'on jouait avec elles. Leur apparence ne change pas.
 */
const KEYPAD = [
  { key: "1", label: "o_o", side: "left", compact: true },
  { key: "2", label: "abc", side: "middle", direction: { x: 0, y: -1 }, hint: "up" },
  { key: "3", label: "def", side: "right" },
  { key: "4", label: "ghi", side: "left", direction: { x: -1, y: 0 }, hint: "left" },
  { key: "5", label: "jkl", side: "middle" },
  { key: "6", label: "mno", side: "right", direction: { x: 1, y: 0 }, hint: "right" },
  { key: "7", label: "pqrs", side: "left" },
  { key: "8", label: "tuv", side: "middle", direction: { x: 0, y: 1 }, hint: "down" },
  { key: "9", label: "wxyz", side: "right" },
  { key: "*", label: "+", side: "left" },
  { key: "0", label: "[", side: "middle", rotate: true },
  { key: "#", label: "", side: "right", home: true },
];

export default function App() {
  const [tab, setTab] = useState("game");
  const [modeId, setModeId] = useState("classic");
  const [gridPresetId, setGridPresetId] = useState(DEFAULT_GRID_ID);
  const audio = useMemo(() => createBeepEngine(), []);
  const { containerRef, scale } = usePhoneScale();

  const game = useSnakeGame({
    modeId,
    gridPresetId,
    onEat: () => audio.play(660, 0.07, 0.14),
    onGameOver: () => audio.play(220, 0.2, 0.16),
    onUserInteract: audio.unlock,
  });

  const { requestDirection, running, start, togglePause, refresh } = game;

  const handleTouchDirection = useCallback((x, y) => {
    audio.unlock();
    requestDirection(x, y);
  }, [audio, requestDirection]);

  const handleScreenTap = useCallback(() => {
    audio.unlock();
    if (!running) start();
    else togglePause();
  }, [audio, running, start, togglePause]);

  const swipe = useSwipeControls(handleTouchDirection, handleScreenTap);

  const backHref = useMemo(() => {
    const path = window.location.pathname;
    return path.includes("/games/snake/dist/") ? "../../../index.html" : "../../index.html";
  }, []);

  const selectedMode = useMemo(
    () => GAME_MODES.find((item) => item.id === modeId) || GAME_MODES[0],
    [modeId]
  );
  const selectedGridPreset = useMemo(
    () => GRID_PRESETS.find((item) => item.id === gridPresetId)
      || GRID_PRESETS.find((item) => item.id === DEFAULT_GRID_ID),
    [gridPresetId]
  );

  const speedRule = useMemo(() => {
    const minSpeed = getSpeed(selectedMode, selectedGridPreset, 0);
    const maxSpeed = getSpeed(selectedMode, selectedGridPreset, 999);
    if (selectedMode.fixedSpeed) {
      return `Fixed speed: ${formatSpeed(minSpeed)} for the whole run, scaled to the selected grid.`;
    }
    return `Dynamic speed: starts at ${formatSpeed(minSpeed)} and ramps up with your score, up to ${formatSpeed(maxSpeed)}.`;
  }, [selectedMode, selectedGridPreset]);

  const applesRule = useMemo(() => {
    if (selectedMode.maze) {
      return "One apple at a time, and it never appears inside a block.";
    }
    return "One apple is active at a time.";
  }, [selectedMode]);

  const statusTone = useMemo(() => {
    if (game.won) return "win";
    if (game.gameOver) return "danger";
    if (game.paused) return "pause";
    if (!game.running) return "idle";
    return "playing";
  }, [game.gameOver, game.paused, game.running, game.won]);

  const isGameTab = tab === "game";
  /** Partie en cours : l'ecran reste degage, le statut ne s'affiche qu'a l'arret. */
  const isPlaying = game.running && !game.paused && !game.gameOver && !game.won;

  useEffect(() => {
    if (isGameTab) requestAnimationFrame(refresh);
  }, [isGameTab, refresh]);

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
        {/* Le zoom est pose ici, sur l'ancetre commun : le panneau en a besoin
            lui aussi pour remonter par-dessus le bas du boitier. */}
        <section
          className="game-layout"
          style={{
            display: isGameTab ? "flex" : "none",
            ...(scale === null ? null : { "--phone-scale": scale }),
          }}
        >
          <div className="phone-column" ref={containerRef}>
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
                    <div
                      className={`screen-container ${statusTone}`}
                      onTouchStart={swipe.onTouchStart}
                      onTouchMove={swipe.onTouchMove}
                      onTouchEnd={swipe.onTouchEnd}
                    >
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
                        ) : isPlaying ? null : (
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

                  {/* Pave identique au boitier d'origine. Seules les touches
                      2 / 4 / 6 / 8 deviennent cliquables, sans changer d'aspect. */}
                  <div className="keyboard">
                    {KEYPAD.map((entry) => {
                      const content = (
                        <>
                          <span className="special">{entry.key}</span>
                          <span
                            className={`minitext${entry.rotate ? " rotate" : ""}${entry.compact ? " compact" : ""}${entry.home ? " home" : ""}`}
                          >
                            {entry.label}
                          </span>
                        </>
                      );

                      return (
                        <div
                          key={entry.key}
                          className={`button-key-container${entry.side === "right" ? " invert" : ""}`}
                          aria-hidden={entry.direction ? undefined : "true"}
                        >
                          {entry.direction ? (
                            <button
                              type="button"
                              className={`button-key ${entry.side} is-dpad`}
                              aria-label={`Move ${entry.hint}`}
                              onPointerDown={(event) => {
                                event.preventDefault();
                                handleTouchDirection(entry.direction.x, entry.direction.y);
                              }}
                            >
                              {content}
                            </button>
                          ) : (
                            <div className={`button-key ${entry.side}`}>{content}</div>
                          )}
                        </div>
                      );
                    })}
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
                <select id="game-mode" value={modeId} onChange={(event) => setModeId(event.target.value)}>
                  {GAME_MODES.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mode-row">
              <label htmlFor="grid-size">Grid size</label>
              <div className="mode-select-wrap">
                <select id="grid-size" value={gridPresetId} onChange={(event) => setGridPresetId(event.target.value)}>
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

        <section className="panel" style={{ display: tab === "controls" ? "block" : "none" }}>
          <h2>Controls</h2>
          <div className="controls-grid">
            <div className="control-block">
              <h3>Arrow Keys</h3>
              <div className="dpad">
                <span className="key up"><span className="key-glyph dir-up">&#9650;</span></span>
                <span className="key left"><span className="key-glyph dir-left">&#9650;</span></span>
                <span className="key down"><span className="key-glyph dir-down">&#9650;</span></span>
                <span className="key right"><span className="key-glyph dir-right">&#9650;</span></span>
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
            <div className="control-block">
              <h3>Touch</h3>
              <ul>
                <li>Swipe on the screen to turn</li>
                <li>Tap the screen to start or pause</li>
                <li>Keys 2 / 4 / 6 / 8 also steer</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="panel" style={{ display: tab === "rules" ? "block" : "none" }}>
          <h2>Rules</h2>
          <div className="mode-row rules-mode-row">
            <label htmlFor="rules-mode">Active mode</label>
            <div className="mode-select-wrap">
              <select id="rules-mode" value={modeId} onChange={(event) => setModeId(event.target.value)}>
                {GAME_MODES.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mode-row rules-mode-row">
            <label htmlFor="rules-grid-size">Grid size</label>
            <div className="mode-select-wrap">
              <select id="rules-grid-size" value={gridPresetId} onChange={(event) => setGridPresetId(event.target.value)}>
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
              <p>Arrow keys, WASD or 2 / 4 / 6 / 8 to move. Swipe the screen on touch devices. Space starts or pauses, R restarts.</p>
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
