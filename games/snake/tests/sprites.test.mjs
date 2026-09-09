/**
 * Verification ASCII des sprites : rend un serpent sur une grille de
 * caracteres, un pixel de sprite = un caractere. Sert a relire a l'oeil que
 * la tete, les virages et la queue pointent dans le bon sens.
 *
 *   node tests/sprites.test.mjs
 */
import { SPRITE_SIZE, getSegmentPattern, directionBetween } from "../src/sprites.js";

const render = (snake, { cols, rows, wrap = false, apples = [], title }) => {
  const width = cols * SPRITE_SIZE;
  const height = rows * SPRITE_SIZE;
  const canvas = Array.from({ length: height }, () => new Array(width).fill(" "));

  for (const apple of apples) {
    for (let y = 2; y < 6; y += 1) {
      for (let x = 2; x < 6; x += 1) {
        canvas[apple.y * SPRITE_SIZE + y][apple.x * SPRITE_SIZE + x] = "o";
      }
    }
  }

  const head = snake[0];
  const facing = snake[1] ? directionBetween(snake[1], head, { cols, rows }, wrap) : "right";
  const ahead = { x: head.x, y: head.y };
  if (facing === "right") ahead.x += 1;
  if (facing === "left") ahead.x -= 1;
  if (facing === "up") ahead.y -= 1;
  if (facing === "down") ahead.y += 1;
  const mouthOpen = apples.some((apple) => apple.x === ahead.x && apple.y === ahead.y);

  snake.forEach((segment, index) => {
    const pattern = getSegmentPattern(snake, index, {
      grid: { cols, rows },
      wrap,
      mouthOpen: index === 0 && mouthOpen,
    });
    for (let i = 0; i < pattern.length; i += 1) {
      if (!pattern[i]) continue;
      const px = i % SPRITE_SIZE;
      const py = Math.floor(i / SPRITE_SIZE);
      canvas[segment.y * SPRITE_SIZE + py][segment.x * SPRITE_SIZE + px] = "#";
    }
  });

  const lines = canvas.map((row) => row.join("").replace(/\s+$/, ""));
  const first = lines.findIndex((line) => line.length > 0);
  const last = lines.length - 1 - [...lines].reverse().findIndex((line) => line.length > 0);
  const indent = Math.min(
    ...lines.slice(first, last + 1).filter((line) => line.length).map((line) => line.search(/\S/))
  );

  console.log(`\n=== ${title} ===`);
  console.log(lines.slice(first, last + 1).map((line) => line.slice(indent)).join("\n"));
};

const grid = { cols: 10, rows: 8 };

// 1. Ligne droite vers la droite, avec une pomme devant (bouche ouverte).
render(
  [
    { x: 5, y: 3 },
    { x: 4, y: 3 },
    { x: 3, y: 3 },
    { x: 2, y: 3 },
  ],
  { ...grid, apples: [{ x: 6, y: 3 }], title: "Droite -> bouche ouverte" }
);

// 2. Serpent qui vient de tourner vers le haut : cou en virage, queue a plat.
render(
  [
    { x: 5, y: 1 },
    { x: 5, y: 2 },
    { x: 4, y: 2 },
    { x: 3, y: 2 },
    { x: 2, y: 2 },
  ],
  { ...grid, title: "Virage vers le haut (cou en coude)" }
);

// 3. Virage a la queue : le dernier segment est juste derriere un coude.
render(
  [
    { x: 6, y: 4 },
    { x: 5, y: 4 },
    { x: 4, y: 4 },
    { x: 4, y: 5 },
    { x: 4, y: 6 },
  ],
  { ...grid, title: "Queue verticale sous un coude" }
);

// 4. Serpent en S : les quatre virages possibles.
render(
  [
    { x: 7, y: 1 },
    { x: 6, y: 1 },
    { x: 6, y: 2 },
    { x: 5, y: 2 },
    { x: 4, y: 2 },
    { x: 4, y: 3 },
    { x: 3, y: 3 },
    { x: 2, y: 3 },
    { x: 2, y: 4 },
    { x: 2, y: 5 },
  ],
  { ...grid, title: "Serpent en S (les quatre coudes)" }
);

// 5. Mode Infinite : la tete a franchi le bord droit, la queue est restee.
render(
  [
    { x: 0, y: 5 },
    { x: 9, y: 5 },
    { x: 8, y: 5 },
    { x: 7, y: 5 },
  ],
  { ...grid, wrap: true, title: "Enroulement (tete a gauche, corps a droite)" }
);

// 6. Descente : verifie que la tete regarde vers le bas.
render(
  [
    { x: 3, y: 5 },
    { x: 3, y: 4 },
    { x: 3, y: 3 },
    { x: 3, y: 2 },
  ],
  { ...grid, title: "Descente" }
);
