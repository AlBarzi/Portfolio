// Tests de la logique du demineur (sans navigateur).
//   node --test games/minesweeper/tests/core.test.mjs
import test from "node:test";
import assert from "node:assert/strict";

await import("../../../public/games/minesweeper/minesweeper-core.js");
const { LEVELS, HIDDEN, OPEN, FLAG, createRng, createGame } = globalThis.MinesweeperCore;

const countMines = (game) => {
  let total = 0;
  for (let i = 0; i < game.size; i += 1) total += game.isMine(i) ? 1 : 0;
  return total;
};

const safeCells = (game) => {
  const list = [];
  for (let i = 0; i < game.size; i += 1) if (!game.isMine(i)) list.push(i);
  return list;
};

test("createRng is deterministic and stays in [0, 1)", () => {
  const a = createRng(42);
  const b = createRng(42);
  const c = createRng(43);
  const seqA = Array.from({ length: 50 }, () => a());
  const seqB = Array.from({ length: 50 }, () => b());
  const seqC = Array.from({ length: 50 }, () => c());
  assert.deepEqual(seqA, seqB);
  assert.notDeepEqual(seqA, seqC);
  assert.ok(seqA.every((v) => v >= 0 && v < 1));
});

test("mines are laid on the first reveal, with the exact count", () => {
  for (const [name, level] of Object.entries(LEVELS)) {
    const game = createGame({ ...level, rng: createRng(7) });
    assert.equal(game.status, "ready", name);
    assert.equal(countMines(game), 0, `${name}: no mine before the first click`);
    game.reveal(0);
    assert.equal(countMines(game), level.mines, name);
    assert.notEqual(game.status, "ready", name);
  }
});

test("the first click and its eight neighbours are always safe", () => {
  for (const level of Object.values(LEVELS)) {
    for (let seed = 1; seed <= 120; seed += 1) {
      const game = createGame({ ...level, rng: createRng(seed) });
      const first = (seed * 37) % game.size;
      const result = game.reveal(first);
      assert.equal(result.exploded, -1);
      assert.equal(game.isMine(first), false);
      assert.equal(game.adjacentAt(first), 0, "the first click opens an area");
      for (const n of game.neighbors(first)) assert.equal(game.isMine(n), false);
      assert.ok(result.opened.length > 1);
    }
  }
});

test("tiny boards fall back to protecting only the clicked tile", () => {
  for (let seed = 1; seed <= 60; seed += 1) {
    const game = createGame({ rows: 3, cols: 3, mines: 6, rng: createRng(seed) });
    const result = game.reveal(4);
    assert.equal(result.exploded, -1);
    assert.equal(game.isMine(4), false);
    assert.equal(countMines(game), 6);
  }
});

test("adjacent counts match the mines around each tile", () => {
  const game = createGame({ ...LEVELS.hard, rng: createRng(2026) });
  game.reveal(200);
  for (const i of safeCells(game)) {
    const expected = game.neighbors(i).filter((n) => game.isMine(n)).length;
    assert.equal(game.adjacentAt(i), expected);
  }
});

test("neighbors respects the board edges", () => {
  const game = createGame({ rows: 4, cols: 5, mines: 3 });
  assert.deepEqual(game.neighbors(0).sort((a, b) => a - b), [1, 5, 6]);
  assert.deepEqual(game.neighbors(19).sort((a, b) => a - b), [13, 14, 18]);
  assert.equal(game.neighbors(7).length, 8);
  assert.equal(game.neighbors(2).length, 5);
});

test("the cascade opens exactly the connected empty area and its border", () => {
  const game = createGame({ ...LEVELS.medium, rng: createRng(11) });
  const first = 120;
  const result = game.reveal(first);

  // Reference : parcours en largeur ecrit independamment.
  const expected = new Set([first]);
  const queue = [first];
  while (queue.length) {
    const current = queue.shift();
    if (game.adjacentAt(current) !== 0) continue;
    for (const n of game.neighbors(current)) {
      if (!expected.has(n)) {
        expected.add(n);
        queue.push(n);
      }
    }
  }

  const openedSet = new Set(result.opened.map((c) => c.index));
  assert.deepEqual([...openedSet].sort((a, b) => a - b), [...expected].sort((a, b) => a - b));
  assert.equal(result.opened.length, openedSet.size, "no tile is reported twice");
  assert.equal(game.opened, expected.size);
  for (const { index, step } of result.opened) {
    assert.equal(game.isMine(index), false);
    assert.equal(game.stateAt(index), OPEN);
    assert.ok(step >= 0);
  }
  assert.equal(result.opened[0].step, 0);
});

test("flags lock a tile, are counted, and are skipped by the cascade", () => {
  const game = createGame({ ...LEVELS.easy, rng: createRng(5) });
  assert.equal(game.toggleFlag(3), FLAG, "flags are allowed before the first click");
  assert.equal(game.flags, 1);
  assert.deepEqual(game.reveal(3).opened, [], "a flagged tile cannot be revealed");
  assert.equal(game.status, "ready");
  assert.equal(game.toggleFlag(3), HIDDEN);
  assert.equal(game.flags, 0);

  const flagged = 40;
  game.toggleFlag(flagged);
  for (let i = 0; i < game.size && game.status !== "won"; i += 1) {
    if (i !== flagged && !game.isMine(i) && game.stateAt(i) === HIDDEN) game.reveal(i);
  }
  assert.equal(game.stateAt(flagged), FLAG, "the cascade never opens a flagged tile");
});

test("an open tile cannot be flagged", () => {
  const game = createGame({ ...LEVELS.easy, rng: createRng(9) });
  game.reveal(40);
  assert.equal(game.toggleFlag(40), null);
  assert.equal(game.flags, 0);
});

test("revealing every safe tile wins and flags the remaining mines", () => {
  for (let seed = 1; seed <= 40; seed += 1) {
    const game = createGame({ ...LEVELS.medium, rng: createRng(seed) });
    game.reveal(seed % game.size);
    let last = null;
    for (const i of safeCells(game)) {
      if (game.stateAt(i) === HIDDEN) last = game.reveal(i);
    }
    assert.equal(game.status, "won");
    assert.equal(game.safeLeft, 0);
    assert.equal(game.progress, 1);
    assert.equal(game.flags, game.mines);
    for (let i = 0; i < game.size; i += 1) {
      assert.equal(game.stateAt(i), game.isMine(i) ? FLAG : OPEN);
    }
    if (last) assert.ok(last.autoFlagged.every((i) => game.isMine(i)));
    assert.deepEqual(game.reveal(0).opened, [], "no move after the end");
    assert.equal(game.toggleFlag(0), null);
  }
});

test("revealing a mine loses the game and freezes the board", () => {
  const game = createGame({ ...LEVELS.easy, rng: createRng(3) });
  game.reveal(40);
  let mineIndex = -1;
  for (let i = 0; i < game.size; i += 1) if (game.isMine(i)) mineIndex = i;
  const result = game.reveal(mineIndex);
  assert.equal(result.exploded, mineIndex);
  assert.equal(game.exploded, mineIndex);
  assert.equal(game.status, "lost");
  const openedBefore = game.opened;
  assert.deepEqual(game.reveal(0).opened, []);
  assert.deepEqual(game.chord(40).opened, []);
  assert.equal(game.toggleFlag(1), null);
  assert.equal(game.opened, openedBefore);
});

test("chord opens the other neighbours once the flag count matches", () => {
  let checked = 0;
  for (let seed = 1; seed <= 200 && checked < 25; seed += 1) {
    const game = createGame({ ...LEVELS.medium, rng: createRng(seed) });
    game.reveal(136);
    // Un chiffre ouvert qui a encore des voisines fermees.
    let target = -1;
    for (let i = 0; i < game.size && target < 0; i += 1) {
      if (game.stateAt(i) === OPEN && game.adjacentAt(i) > 0 &&
          game.neighbors(i).some((n) => game.stateAt(n) === HIDDEN && !game.isMine(n))) target = i;
    }
    if (target < 0) continue;
    checked += 1;

    assert.deepEqual(game.chord(target).opened, [], "no chord while flags are missing");
    for (const n of game.neighbors(target)) if (game.isMine(n)) game.toggleFlag(n);
    const result = game.chord(target);
    assert.equal(result.exploded, -1);
    assert.ok(result.opened.length > 0);
    for (const n of game.neighbors(target)) {
      assert.equal(game.stateAt(n), game.isMine(n) ? FLAG : OPEN);
    }
  }
  assert.ok(checked >= 10, "enough boards exercised");
});

test("chord with a misplaced flag blows up a mine", () => {
  let checked = 0;
  for (let seed = 1; seed <= 300 && checked < 15; seed += 1) {
    const game = createGame({ ...LEVELS.medium, rng: createRng(seed) });
    game.reveal(136);
    // Un "1" ouvert avec une voisine sure encore fermee : on y plante le drapeau a tort.
    let target = -1;
    let decoy = -1;
    for (let i = 0; i < game.size && target < 0; i += 1) {
      if (game.stateAt(i) !== OPEN || game.adjacentAt(i) !== 1) continue;
      const wrong = game.neighbors(i).find((n) => game.stateAt(n) === HIDDEN && !game.isMine(n));
      if (wrong !== undefined) {
        target = i;
        decoy = wrong;
      }
    }
    if (target < 0) continue;
    checked += 1;
    const openedBefore = game.opened;
    game.toggleFlag(decoy);
    const result = game.chord(target);
    assert.ok(result.exploded >= 0);
    assert.equal(game.isMine(result.exploded), true);
    assert.equal(game.status, "lost");
    assert.equal(game.opened, openedBefore, "no safe tile is opened by a failed chord");
  }
  assert.ok(checked >= 5, "enough boards exercised");
});

test("invalid boards are rejected", () => {
  assert.throws(() => createGame({ rows: 2, cols: 2, mines: 4 }), RangeError);
  assert.throws(() => createGame({ rows: 0, cols: 5, mines: 1 }), RangeError);
  assert.throws(() => createGame({ rows: 3, cols: 3, mines: -1 }), RangeError);
});

test("a board without mines is won on the first click", () => {
  const game = createGame({ rows: 5, cols: 5, mines: 0 });
  const result = game.reveal(12);
  assert.equal(result.opened.length, 25);
  assert.equal(game.status, "won");
});
