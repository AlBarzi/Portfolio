/**
 * Sprites du serpent.
 *
 * Les motifs sont ceux d'origine, pixel pour pixel. Seule leur ORIENTATION est
 * corrigee ici. Trois defauts la faussaient :
 *
 * 1. Les virages etaient decales d'un quart de tour. Le motif `corner` relie le
 *    HAUT et la DROITE de la case ; l'ancienne table lui appliquait une
 *    rotation pour la paire haut-droite, une deuxieme pour droite-bas, etc.
 *    Chaque coude pointait donc vers la mauvaise paire de cotes.
 * 2. Les orientations "right" et "down" etaient obtenues par miroir et non par
 *    rotation. Un miroir inverse la lateralite du dessin : la queue et la tete
 *    se retrouvaient a l'envers selon le sens de deplacement.
 * 3. En mode Infinite, deux segments voisins de part et d'autre d'un bord
 *    donnaient un ecart de toute la largeur de la grille, donc une direction
 *    inversee.
 *
 * Le module est pur : ni React ni canvas, pour que `tests/sprites.test.mjs`
 * puisse le rendre en ASCII et verifier les quatre directions.
 */

export const SPRITE_SIZE = 6;

/* ------------------------------------------------------------------ */
/* Motifs d'origine, inchanges                                         */
/* ------------------------------------------------------------------ */

export const SPRITES = {
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

/**
 * Mur du mode Labyrinthe : damier, pour se distinguer au premier coup d'oeil
 * du serpent, qui est plein.
 */
export const WALL = [
  1, 0, 1, 0, 1, 0,
  0, 1, 0, 1, 0, 1,
  1, 0, 1, 0, 1, 0,
  0, 1, 0, 1, 0, 1,
  1, 0, 1, 0, 1, 0,
  0, 1, 0, 1, 0, 1,
];

/* ------------------------------------------------------------------ */
/* Pomme                                                               */
/* ------------------------------------------------------------------ */

/**
 * La pomme partage la trame 6x6 du serpent : ses pixels tombent donc
 * exactement sur la matrice de l'ecran, comme tout le reste.
 * 1 = rouge, 2 = ombre, 3 = reflet, 4 = feuille, 5 = tige.
 */
export const APPLE = [
  "..54..",
  ".1111.",
  "131111",
  "111112",
  ".11122",
  "..22..",
].flatMap((row) => Array.from(row, (char) => (char === "." ? 0 : Number(char))));

export const APPLE_COLORS = {
  1: "#d42b22",
  2: "#7d1310",
  3: "#ff9d9d",
  4: "#3f7a2e",
  5: "#5f3a1f",
};

/* ------------------------------------------------------------------ */
/* Rotations                                                           */
/* ------------------------------------------------------------------ */

const to2D = (pattern) =>
  Array.from({ length: SPRITE_SIZE }, (_, row) =>
    pattern.slice(row * SPRITE_SIZE, (row + 1) * SPRITE_SIZE)
  );

/** Rotation horaire de 90 degres : new[r][c] = old[N-1-c][r]. */
const rotateOnce = (pattern) => {
  const grid = to2D(pattern);
  const rotated = new Array(pattern.length);
  for (let row = 0; row < SPRITE_SIZE; row += 1) {
    for (let col = 0; col < SPRITE_SIZE; col += 1) {
      rotated[row * SPRITE_SIZE + col] = grid[SPRITE_SIZE - 1 - col][row];
    }
  }
  return rotated;
};

export const rotatePattern = (pattern, quarterTurns = 1) => {
  let result = pattern;
  const steps = ((quarterTurns % 4) + 4) % 4;
  for (let i = 0; i < steps; i += 1) result = rotateOnce(result);
  return result;
};

/**
 * Quarts de tour horaires depuis l'orientation de reference des motifs, qui
 * est "vers la droite" : `mouth` et `bite` ont leur museau dans la moitie
 * droite de la case, `bodyEnd` s'affine vers la droite.
 * Un quart de tour horaire envoie droite -> bas -> gauche -> haut.
 */
const TURNS_FROM_RIGHT = { right: 0, down: 1, left: 2, up: 3 };

export const DIRECTION_VECTORS = {
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

const OPPOSITE = { right: "left", left: "right", up: "down", down: "up" };

export const orientPattern = (pattern, direction) =>
  rotatePattern(pattern, TURNS_FROM_RIGHT[direction] ?? 0);

/* ------------------------------------------------------------------ */
/* Tete : orientation d'origine, laissee telle quelle                  */
/* ------------------------------------------------------------------ */

const flipHorizontal = (pattern) => {
  const grid = to2D(pattern);
  const flipped = [];
  for (const row of grid) flipped.push(...row.slice().reverse());
  return flipped;
};

const flipVertical = (pattern) => {
  const grid = to2D(pattern);
  const flipped = [];
  for (let i = SPRITE_SIZE - 1; i >= 0; i -= 1) flipped.push(...grid[i]);
  return flipped;
};

/**
 * L'orientation de la tete est celle du code d'origine, miroirs compris.
 * Ce n'est pas une rotation, mais c'est ce qui donne a la tete l'aspect que
 * Ramzy veut garder : seule l'orientation du corps dans les virages est
 * corrigee.
 */
export const orientHead = (pattern, direction) => {
  if (direction === "right") return flipHorizontal(pattern);
  if (direction === "up") return rotatePattern(pattern, 1);
  if (direction === "down") return flipVertical(rotatePattern(pattern, 1));
  return pattern;
};

/**
 * Direction de `from` vers `to`, en tenant compte de l'enroulement : sans
 * cette normalisation, un serpent qui traverse un bord en mode Infinite voyait
 * ses deux segments voisins separes de toute la grille, et l'orientation
 * partait a l'oppose.
 */
export const directionBetween = (from, to, grid, wrap = false) => {
  let dx = to.x - from.x;
  let dy = to.y - from.y;

  if (wrap && grid) {
    if (Math.abs(dx) > 1) dx = dx > 0 ? -1 : 1;
    if (Math.abs(dy) > 1) dy = dy > 0 ? -1 : 1;
  }

  if (dx !== 0) return dx > 0 ? "right" : "left";
  if (dy !== 0) return dy > 0 ? "down" : "up";
  return null;
};

/**
 * Coude reliant les cotes `a` et `b`.
 *
 * Le motif `corner` non tourne relie le HAUT et la DROITE : ses pixels partent
 * de la rangee 0 (colonnes 2-3) et rejoignent la colonne 5 (rangee 3). C'est
 * donc la paire haut-droite qui vaut zero quart de tour — l'ancienne table lui
 * en donnait un, et decalait les quatre coudes d'un quart de tour.
 */
const CORNER_TURNS = [
  { sides: ["up", "right"], turns: 0 },
  { sides: ["right", "down"], turns: 1 },
  { sides: ["down", "left"], turns: 2 },
  { sides: ["left", "up"], turns: 3 },
];

export const getCornerPattern = (a, b) => {
  const entry = CORNER_TURNS.find(({ sides }) => sides.includes(a) && sides.includes(b));
  return rotatePattern(SPRITES.corner, entry ? entry.turns : 0);
};

/** Corps droit : le motif est symetrique a 180 degres, un quart de tour suffit. */
export const getStraightPattern = (pattern, direction) =>
  direction === "up" || direction === "down"
    ? rotatePattern(pattern, 1)
    : pattern;

/**
 * Motif d'un segment, deduit uniquement de la geometrie du serpent.
 *
 * L'ancienne version dessinait le segment n.1 avec un motif droit quelle que
 * soit sa forme : juste apres un virage, le cou restait droit alors que le
 * serpent tournait, d'ou la cassure visible derriere la tete.
 */
export const getSegmentPattern = (snake, index, { grid, wrap = false, mouthOpen = false } = {}) => {
  const segment = snake[index];
  const ahead = snake[index - 1] ?? null;
  const behind = snake[index + 1] ?? null;

  // Tete : dessin ET orientation d'origine. Seule difference, le sens vient de
  // la geometrie reelle (a l'oppose du segment suivant) plutot que de la
  // direction stockee dans le moteur, qui peut avoir change entre le dernier
  // pas et le rendu — a l'ecran le resultat est celui d'avant.
  if (!ahead) {
    const backward = behind ? directionBetween(segment, behind, grid, wrap) : "left";
    const facing = OPPOSITE[backward] ?? "right";
    return orientHead(mouthOpen ? SPRITES.bite : SPRITES.mouth, facing);
  }

  // Queue : la pointe s'affine a l'oppose du segment qui la precede.
  if (!behind) {
    const towardBody = directionBetween(segment, ahead, grid, wrap) ?? "right";
    return orientPattern(SPRITES.bodyEnd, OPPOSITE[towardBody] ?? "right");
  }

  const towardHead = directionBetween(segment, ahead, grid, wrap);
  const towardTail = directionBetween(segment, behind, grid, wrap);
  if (!towardHead || !towardTail) return SPRITES.body;

  // Le cou garde son motif et son orientation d'origine quand il est droit, et
  // devient un coude quand le serpent tourne — c'est ce second cas qui
  // manquait, et c'est la cassure qu'on voyait juste derriere la tete.
  if (OPPOSITE[towardHead] === towardTail) {
    return index === 1
      ? orientHead(SPRITES.head, towardHead)
      : getStraightPattern(SPRITES.body, towardHead);
  }

  return getCornerPattern(towardHead, towardTail);
};
