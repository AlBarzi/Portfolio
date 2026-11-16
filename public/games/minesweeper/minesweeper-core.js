/**
 * Demineur : logique pure, sans DOM.
 *
 * Tout l'etat du plateau vit dans des tableaux types indexes par
 * `ligne * colonnes + colonne`. L'interface (minesweeper.js) ne fait que
 * lire cet etat et peindre les cases que chaque coup lui signale : la
 * logique se teste donc sans navigateur (voir games/minesweeper/tests).
 *
 * Le module s'attache a `globalThis.MinesweeperCore` pour rester un simple
 * script classique, sans bundler, charge tel quel par la page.
 */
(function (root) {
  "use strict";

  const LEVELS = Object.freeze({
    easy: Object.freeze({ rows: 9, cols: 9, mines: 10 }),
    medium: Object.freeze({ rows: 16, cols: 16, mines: 40 }),
    hard: Object.freeze({ rows: 16, cols: 30, mines: 99 }),
  });

  const HIDDEN = 0;
  const OPEN = 1;
  const FLAG = 2;

  /**
   * Generateur pseudo-aleatoire deterministe (mulberry32).
   * Sert a rejouer une grille precise (`?seed=42`) et a ecrire des tests
   * reproductibles. Renvoie des flottants dans [0, 1[.
   */
  function createRng(seed) {
    let a = seed >>> 0;
    return function next() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const NOTHING = Object.freeze({ opened: Object.freeze([]), exploded: -1, autoFlagged: Object.freeze([]) });

  function createGame(options) {
    const rows = options.rows;
    const cols = options.cols;
    const mines = options.mines;
    const rng = options.rng || Math.random;
    const size = rows * cols;

    if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1) {
      throw new RangeError("rows and cols must be positive integers");
    }
    if (!Number.isInteger(mines) || mines < 0 || mines >= size) {
      throw new RangeError("mines must be between 0 and rows * cols - 1");
    }

    const mine = new Uint8Array(size);
    const adjacent = new Uint8Array(size);
    const state = new Uint8Array(size);

    /** ready (aucune mine posee) -> playing -> won | lost */
    let status = "ready";
    let opened = 0;
    let flags = 0;
    let exploded = -1;

    function neighbors(index) {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const list = [];
      for (let dr = -1; dr <= 1; dr += 1) {
        const r = row + dr;
        if (r < 0 || r >= rows) continue;
        for (let dc = -1; dc <= 1; dc += 1) {
          const c = col + dc;
          if ((dr === 0 && dc === 0) || c < 0 || c >= cols) continue;
          list.push(r * cols + c);
        }
      }
      return list;
    }

    /**
     * Pose les mines au premier coup. La case jouee et ses huit voisines
     * sont exclues : le premier clic ouvre toujours une zone. Si le plateau
     * est trop petit pour l'accorder, seule la case jouee reste garantie.
     */
    function placeMines(safeIndex) {
      const safeZone = new Set(neighbors(safeIndex));
      safeZone.add(safeIndex);

      let candidates = [];
      for (let i = 0; i < size; i += 1) {
        if (!safeZone.has(i)) candidates.push(i);
      }
      if (candidates.length < mines) {
        candidates = [];
        for (let i = 0; i < size; i += 1) {
          if (i !== safeIndex) candidates.push(i);
        }
      }

      // Fisher-Yates partiel : seuls les `mines` premiers tirages comptent.
      for (let k = 0; k < mines; k += 1) {
        const j = k + Math.floor(rng() * (candidates.length - k));
        const picked = candidates[j];
        candidates[j] = candidates[k];
        candidates[k] = picked;
        mine[picked] = 1;
      }

      for (let i = 0; i < size; i += 1) {
        if (mine[i]) continue;
        let count = 0;
        const around = neighbors(i);
        for (let n = 0; n < around.length; n += 1) count += mine[around[n]];
        adjacent[i] = count;
      }
    }

    function finishIfWon(result) {
      if (status !== "playing" || opened !== size - mines) return result;
      status = "won";
      const autoFlagged = [];
      for (let i = 0; i < size; i += 1) {
        if (mine[i] && state[i] !== FLAG) {
          state[i] = FLAG;
          autoFlagged.push(i);
        }
      }
      flags = mines;
      return { opened: result.opened, exploded: -1, autoFlagged };
    }

    /**
     * Ouvre une case. Une case vide declenche une cascade : parcours en
     * largeur iteratif (file), sans recursion. Chaque case ouverte porte
     * sa distance a l'origine (`step`) pour que l'interface anime l'onde.
     */
    function openFrom(index, changes) {
      if (mine[index]) {
        state[index] = OPEN;
        exploded = index;
        status = "lost";
        return;
      }

      const queue = [index];
      const steps = [0];
      state[index] = OPEN;
      opened += 1;
      changes.push({ index, step: 0 });

      for (let head = 0; head < queue.length; head += 1) {
        const current = queue[head];
        if (adjacent[current] !== 0) continue;
        const around = neighbors(current);
        for (let n = 0; n < around.length; n += 1) {
          const next = around[n];
          // Une case marquee d'un drapeau reste fermee, comme dans l'original.
          if (state[next] !== HIDDEN) continue;
          state[next] = OPEN;
          opened += 1;
          changes.push({ index: next, step: steps[head] + 1 });
          queue.push(next);
          steps.push(steps[head] + 1);
        }
      }
    }

    function reveal(index) {
      if (status === "won" || status === "lost") return NOTHING;
      if (index < 0 || index >= size || state[index] !== HIDDEN) return NOTHING;

      if (status === "ready") {
        placeMines(index);
        status = "playing";
      }

      const changes = [];
      openFrom(index, changes);
      if (status === "lost") return { opened: changes, exploded, autoFlagged: [] };
      return finishIfWon({ opened: changes, exploded: -1, autoFlagged: [] });
    }

    /** Pose ou retire un drapeau. Renvoie le nouvel etat, ou null si le coup est refuse. */
    function toggleFlag(index) {
      if (status === "won" || status === "lost") return null;
      if (index < 0 || index >= size || state[index] === OPEN) return null;
      if (state[index] === FLAG) {
        state[index] = HIDDEN;
        flags -= 1;
      } else {
        state[index] = FLAG;
        flags += 1;
      }
      return state[index];
    }

    /**
     * Accord : sur un chiffre deja ouvert dont le compte de drapeaux voisins
     * est atteint, ouvre toutes les autres voisines. Un drapeau mal place
     * fait donc sauter une mine, c'est le risque du raccourci.
     */
    function chord(index) {
      if (status !== "playing") return NOTHING;
      if (index < 0 || index >= size || state[index] !== OPEN || adjacent[index] === 0) return NOTHING;

      const around = neighbors(index);
      let flagged = 0;
      for (let n = 0; n < around.length; n += 1) {
        if (state[around[n]] === FLAG) flagged += 1;
      }
      if (flagged !== adjacent[index]) return NOTHING;

      const changes = [];
      // Les mines d'abord : si l'accord doit echouer, aucune case sure n'est
      // ouverte avant l'explosion et le plateau final reste coherent.
      for (let n = 0; n < around.length; n += 1) {
        const next = around[n];
        if (state[next] === HIDDEN && mine[next]) {
          openFrom(next, changes);
          return { opened: changes, exploded, autoFlagged: [] };
        }
      }
      for (let n = 0; n < around.length; n += 1) {
        const next = around[n];
        if (state[next] === HIDDEN) openFrom(next, changes);
      }
      return finishIfWon({ opened: changes, exploded: -1, autoFlagged: [] });
    }

    return {
      rows,
      cols,
      mines,
      size,
      neighbors,
      reveal,
      toggleFlag,
      chord,
      isMine: (index) => mine[index] === 1,
      adjacentAt: (index) => adjacent[index],
      stateAt: (index) => state[index],
      get status() {
        return status;
      },
      get flags() {
        return flags;
      },
      get opened() {
        return opened;
      },
      get exploded() {
        return exploded;
      },
      /** Cases sures qu'il reste a ouvrir. */
      get safeLeft() {
        return size - mines - opened;
      },
      /** Part du terrain deminee, entre 0 et 1. */
      get progress() {
        return size === mines ? 1 : opened / (size - mines);
      },
    };
  }

  root.MinesweeperCore = Object.freeze({ LEVELS, HIDDEN, OPEN, FLAG, createRng, createGame });
})(typeof globalThis !== "undefined" ? globalThis : this);
