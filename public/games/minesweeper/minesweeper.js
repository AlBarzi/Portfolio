/**
 * Demineur : interface.
 *
 * La logique vit dans minesweeper-core.js. Ce fichier ne fait que trois
 * choses : traduire les gestes (souris, tactile, clavier) en coups, peindre
 * les cases que chaque coup signale, et tenir l'affichage (chrono, compteur,
 * records, langue).
 */
(function () {
  "use strict";

  const Core = window.MinesweeperCore;
  if (!Core) return;
  const { LEVELS, HIDDEN, OPEN, FLAG } = Core;

  /** Meme cle que le portfolio : la langue choisie la-bas s'applique ici. */
  const LANG_KEY = "portfolio.lang";
  const BEST_KEY = "portfolio.minesweeper.best";
  const LEVEL_KEY = "portfolio.minesweeper.level";

  const LONG_PRESS_MS = 380;
  const MIN_CELL = 18;
  const MAX_CELL = 40;
  const COMFORT_CELL = 30;
  /** Hauteur occupee sous le plateau : etat de la partie, reglages, marge de la carte. */
  const BELOW_BOARD = 176;
  /** Sous cette largeur, la grille expert (30 x 16) est jouee debout (16 x 30). */
  const PORTRAIT_BELOW = 760;

  const STRINGS = {
    fr: {
      docTitle: "Démineur — Ramzy Youcef Ammouri",
      back: "Retour au portfolio",
      kicker: "Jeu 06 · JavaScript sans dépendance",
      title: "Démineur",
      lede: "Le classique, refait à la main : premier clic toujours sûr, cascade animée, et des commandes pensées pour la souris, le tactile et le clavier.",
      gameLabel: "Jeu du démineur",
      boardLabel: "Plateau du démineur",
      minesLeft: "Mines restantes",
      time: "Temps",
      newGame: "Nouvelle partie",
      newGameHint: "Nouvelle partie (R)",
      level: "Niveau",
      easy: "Débutant",
      medium: "Intermédiaire",
      hard: "Expert",
      flagMode: "Mode drapeau",
      replay: "Rejouer",
      footer: "Portfolio interactif",
      ready: "Cliquez une case pour commencer : le premier coup est toujours sûr.",
      left: (n) => (n === 1 ? "1 case sûre à ouvrir" : `${n} cases sûres à ouvrir`),
      won: (t) => `Terrain déminé en ${t} s.`,
      record: " Nouveau record !",
      lost: (n) => (n === 1 ? "Boum. Il restait 1 case sûre." : `Boum. Il restait ${n} cases sûres.`),
      chipWon: "BRAVO",
      chipLost: "BOUM",
      best: (t) => `Record : ${t} s`,
      noBest: "Aucun record pour l'instant",
      seeded: (s) => `Grille fixe (seed ${s}) : records désactivés`,
      howTitle: "Comment jouer",
      howMouse: "Souris",
      howTouch: "Tactile",
      howKeys: "Clavier",
      howMouseText:
        "<kbd>Clic</kbd> ouvre une case, <kbd>clic droit</kbd> pose un drapeau. Sur un chiffre dont les drapeaux sont posés, un clic ouvre toutes ses voisines.",
      howTouchText:
        "Touchez pour ouvrir, <kbd>appui long</kbd> pour le drapeau. Le mode drapeau inverse les deux.",
      howKeysText:
        "<kbd>←</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>→</kbd> se déplacer, <kbd>Entrée</kbd> ouvrir, <kbd>F</kbd> drapeau, <kbd>R</kbd> rejouer, <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> niveau.",
      hoodTitle: "Sous le capot",
      hood1:
        "Les mines sont posées <strong>après</strong> le premier clic : la case choisie et ses huit voisines sont garanties sans mine.",
      hood2:
        "La cascade est un <strong>parcours en largeur itératif</strong> (une file, aucune récursion) : pas de dépassement de pile, même en expert.",
      hood3:
        "Tirage des mines par <strong>mélange de Fisher-Yates partiel</strong>. La logique est séparée du DOM et couverte par des tests unitaires.",
      hood4: "Ajoutez <code>?seed=42</code> à l'adresse pour rejouer exactement la même grille.",
      cell: (r, c) => `Ligne ${r}, colonne ${c} : `,
      cellHidden: "case fermée",
      cellFlag: "drapeau",
      cellEmpty: "vide",
      cellCount: (n) => (n === 1 ? "1 mine voisine" : `${n} mines voisines`),
      cellMine: "mine",
      cellBoom: "mine déclenchée",
      cellWrong: "drapeau mal placé",
    },
    en: {
      docTitle: "Minesweeper — Ramzy Youcef Ammouri",
      back: "Back to portfolio",
      kicker: "Game 06 · Dependency-free JavaScript",
      title: "Minesweeper",
      lede: "The classic, rebuilt by hand: a first click that is always safe, cascading reveals, and controls designed for mouse, touch and keyboard.",
      gameLabel: "Minesweeper game",
      boardLabel: "Minesweeper board",
      minesLeft: "Mines left",
      time: "Time",
      newGame: "New game",
      newGameHint: "New game (R)",
      level: "Level",
      easy: "Beginner",
      medium: "Intermediate",
      hard: "Expert",
      flagMode: "Flag mode",
      replay: "Play again",
      footer: "Interactive portfolio",
      ready: "Click any tile to start: the first move is always safe.",
      left: (n) => (n === 1 ? "1 safe tile to go" : `${n} safe tiles to go`),
      won: (t) => `Field cleared in ${t} s.`,
      record: " New best time!",
      lost: (n) => (n === 1 ? "Boom. 1 safe tile was left." : `Boom. ${n} safe tiles were left.`),
      chipWon: "CLEAR",
      chipLost: "BOOM",
      best: (t) => `Best: ${t} s`,
      noBest: "No best time yet",
      seeded: (s) => `Fixed board (seed ${s}): best times off`,
      howTitle: "How to play",
      howMouse: "Mouse",
      howTouch: "Touch",
      howKeys: "Keyboard",
      howMouseText:
        "<kbd>Click</kbd> opens a tile, <kbd>right-click</kbd> plants a flag. On a number whose flags are placed, a click opens all its neighbours.",
      howTouchText: "Tap to open, <kbd>long-press</kbd> to flag. Flag mode swaps the two.",
      howKeysText:
        "<kbd>←</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>→</kbd> move, <kbd>Enter</kbd> open, <kbd>F</kbd> flag, <kbd>R</kbd> restart, <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> level.",
      hoodTitle: "Under the hood",
      hood1:
        "Mines are laid <strong>after</strong> the first click: the chosen tile and its eight neighbours are guaranteed to be safe.",
      hood2:
        "The cascade is an <strong>iterative breadth-first traversal</strong> (a queue, no recursion): no stack overflow, even on expert.",
      hood3:
        "Mines are drawn with a <strong>partial Fisher–Yates shuffle</strong>. The game logic is DOM-free and covered by unit tests.",
      hood4: "Add <code>?seed=42</code> to the URL to replay the exact same board.",
      cell: (r, c) => `Row ${r}, column ${c}: `,
      cellHidden: "hidden",
      cellFlag: "flagged",
      cellEmpty: "empty",
      cellCount: (n) => (n === 1 ? "1 adjacent mine" : `${n} adjacent mines`),
      cellMine: "mine",
      cellBoom: "exploded mine",
      cellWrong: "misplaced flag",
    },
  };

  const byId = (id) => document.getElementById(id);
  const els = {
    game: document.querySelector(".game"),
    board: byId("board"),
    minesLeft: byId("mines-left"),
    time: byId("time"),
    face: byId("face"),
    progress: byId("progress"),
    statusbar: byId("statusbar"),
    statusChip: byId("status-chip"),
    status: byId("status"),
    replay: byId("replay"),
    levels: byId("levels"),
    flagMode: byId("flag-mode"),
    best: byId("best"),
  };
  if (!els.board || !els.game) return;

  /** localStorage peut etre refuse (navigation privee, iframe) : le jeu doit tourner quand meme. */
  const store = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        /* sans stockage : la preference vaut pour cette page seulement */
      }
    },
  };

  const params = new URLSearchParams(window.location.search);
  const seedParam = params.get("seed");
  const seed = seedParam !== null && /^\d{1,9}$/.test(seedParam) ? Number(seedParam) : null;

  const pickLang = () => {
    const asked = params.get("lang");
    if (asked === "fr" || asked === "en") return asked;
    const stored = store.get(LANG_KEY);
    if (stored === "fr" || stored === "en") return stored;
    return (navigator.language || "").toLowerCase().startsWith("fr") ? "fr" : "en";
  };

  const pickLevel = () => {
    const asked = params.get("level");
    if (asked && LEVELS[asked]) return asked;
    const stored = store.get(LEVEL_KEY);
    return stored && LEVELS[stored] ? stored : "easy";
  };

  const loadBest = () => {
    try {
      const parsed = JSON.parse(store.get(BEST_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  };

  let lang = pickLang();
  let levelKey = pickLevel();
  let best = loadBest();

  let game = null;
  let rows = 0;
  let cols = 0;
  let cellEls = [];
  let focusIndex = 0;
  let flagMode = false;
  let freshRecord = false;

  let timerId = null;
  let startedAt = 0;
  let elapsed = 0;

  let lastPointerType = "mouse";
  let longPressTimer = null;
  let pressOrigin = null;
  let suppressClick = false;
  let peeked = [];

  const text = () => STRINGS[lang];
  const isOver = () => game.status === "won" || game.status === "lost";
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const pad3 = (value) => String(clamp(value, 0, 999)).padStart(3, "0");

  /* --- Affichage ------------------------------------------------------- */

  function cellLabel(index, kind) {
    const t = text();
    const where = t.cell(Math.floor(index / cols) + 1, (index % cols) + 1);
    if (kind === "flag") return where + t.cellFlag;
    if (kind === "mine") return where + t.cellMine;
    if (kind === "boom") return where + t.cellBoom;
    if (kind === "wrong") return where + t.cellWrong;
    if (kind === "open") {
      const count = game.adjacentAt(index);
      return where + (count === 0 ? t.cellEmpty : t.cellCount(count));
    }
    return where + t.cellHidden;
  }

  function setKind(index, kind, delayMs) {
    const el = cellEls[index];
    el.dataset.s = kind;
    if (delayMs !== undefined) el.style.setProperty("--d", `${delayMs}ms`);
    el.setAttribute("aria-label", cellLabel(index, kind));
  }

  /** Peint une case d'apres l'etat du moteur. */
  function paintCell(index, delayMs) {
    const el = cellEls[index];
    const state = game.stateAt(index);
    let kind = "hidden";
    let label = "";
    delete el.dataset.n;

    if (state === FLAG) {
      kind = "flag";
    } else if (state === OPEN) {
      if (game.isMine(index)) {
        kind = "boom";
      } else {
        kind = "open";
        const count = game.adjacentAt(index);
        if (count > 0) {
          label = String(count);
          el.dataset.n = label;
        }
      }
    }

    el.textContent = label;
    setKind(index, kind, delayMs);
  }

  function setFace(state) {
    els.face.dataset.state = state;
  }

  function updateHud() {
    const left = game.mines - game.flags;
    els.minesLeft.textContent = left < 0 ? `-${String(Math.min(99, -left)).padStart(2, "0")}` : pad3(left);
    els.time.textContent = pad3(Math.floor(elapsed));
    els.progress.style.transform = `scaleX(${game.progress.toFixed(4)})`;
  }

  function updateStatus() {
    const t = text();
    const kind = game.status;
    els.statusbar.dataset.kind = kind;
    els.replay.hidden = !isOver();

    if (kind === "won") {
      els.statusChip.textContent = t.chipWon;
      els.status.textContent = t.won(Math.floor(elapsed)) + (freshRecord ? t.record : "");
    } else if (kind === "lost") {
      els.statusChip.textContent = t.chipLost;
      els.status.textContent = t.lost(game.safeLeft);
    } else {
      els.statusChip.textContent = "";
      els.status.textContent = kind === "ready" ? t.ready : t.left(game.safeLeft);
    }
  }

  function updateBest() {
    const t = text();
    const value = best[levelKey];
    els.best.dataset.fresh = String(freshRecord);
    if (seed !== null) els.best.textContent = t.seeded(seed);
    else els.best.textContent = Number.isFinite(value) ? t.best(value) : t.noBest;
  }

  function updateControls() {
    els.levels.querySelectorAll("button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.level === levelKey));
    });
    els.flagMode.setAttribute("aria-pressed", String(flagMode));
    document.querySelectorAll(".lang button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
    });
  }

  /** Applique la langue a tout le texte statique, puis aux textes vivants. */
  function applyLanguage() {
    const t = text();
    document.documentElement.lang = lang;
    document.title = t.docTitle;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t[el.dataset.i18n];
    });
    // Chaines du dictionnaire ci-dessus uniquement : aucun contenu externe.
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = t[el.dataset.i18nHtml];
    });
    document.querySelectorAll("[data-i18n-label]").forEach((el) => {
      el.setAttribute("aria-label", t[el.dataset.i18nLabel]);
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.title = t[el.dataset.i18nTitle];
    });

    updateControls();
    if (!game) return;
    for (let i = 0; i < cellEls.length; i += 1) {
      cellEls[i].setAttribute("aria-label", cellLabel(i, cellEls[i].dataset.s));
    }
    updateStatus();
    updateBest();
  }

  /** Taille des cases : la plus grande qui tient dans la carte et dans l'ecran. */
  function layout() {
    if (!game) return;
    const card = getComputedStyle(els.game);
    const board = getComputedStyle(els.board);
    const available = els.game.clientWidth - parseFloat(card.paddingLeft) - parseFloat(card.paddingRight) - 4;
    const padding = parseFloat(board.paddingLeft) + parseFloat(board.paddingRight);
    const gap = parseFloat(board.columnGap) || 2;

    // Hauteur : ce qui reste sous le haut du plateau, moins l'etat et les
    // reglages. Jamais sous COMFORT_CELL : une grande grille fait defiler la
    // page plutot que de devenir injouable.
    const top = els.board.getBoundingClientRect().top + window.scrollY;
    const byWidth = (available - padding - (cols - 1) * gap) / cols;
    const byHeight = (window.innerHeight - top - BELOW_BOARD - padding - (rows - 1) * gap) / rows;
    const size = clamp(Math.floor(Math.min(byWidth, Math.max(byHeight, COMFORT_CELL))), MIN_CELL, MAX_CELL);
    els.board.style.setProperty("--cell", `${size}px`);
  }

  /* --- Chrono ---------------------------------------------------------- */

  function tick() {
    elapsed = (performance.now() - startedAt) / 1000;
    els.time.textContent = pad3(Math.floor(elapsed));
  }

  function startTimer() {
    startedAt = performance.now();
    timerId = window.setInterval(tick, 200);
  }

  function stopTimer() {
    if (timerId === null) return;
    window.clearInterval(timerId);
    timerId = null;
    tick();
  }

  /* --- Partie ---------------------------------------------------------- */

  function buildBoard() {
    const fragment = document.createDocumentFragment();
    cellEls = new Array(rows * cols);

    for (let r = 0; r < rows; r += 1) {
      const rowEl = document.createElement("div");
      rowEl.className = "row";
      rowEl.setAttribute("role", "row");
      for (let c = 0; c < cols; c += 1) {
        const index = r * cols + c;
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "cell";
        cell.setAttribute("role", "gridcell");
        cell.dataset.i = String(index);
        cell.dataset.alt = String((r + c) % 2);
        cell.tabIndex = -1;
        // Delai du reflet de victoire : il balaie le plateau en diagonale.
        cell.style.setProperty("--w", `${(r + c) * 18}ms`);
        cellEls[index] = cell;
        rowEl.appendChild(cell);
      }
      fragment.appendChild(rowEl);
    }

    els.board.className = "board";
    els.board.style.setProperty("--cols", String(cols));
    els.board.setAttribute("aria-rowcount", String(rows));
    els.board.setAttribute("aria-colcount", String(cols));
    els.board.replaceChildren(fragment);
  }

  function newGame(nextLevel) {
    if (nextLevel && LEVELS[nextLevel]) {
      levelKey = nextLevel;
      store.set(LEVEL_KEY, levelKey);
    }

    // Au clavier (touche R), le focus doit survivre a la reconstruction du plateau.
    const hadFocus = els.board.contains(document.activeElement);

    stopTimer();
    elapsed = 0;
    freshRecord = false;
    clearPress();
    els.progress.style.backgroundColor = "";

    const level = LEVELS[levelKey];
    const upright = level.cols > level.rows && window.innerWidth < PORTRAIT_BELOW;
    rows = upright ? level.cols : level.rows;
    cols = upright ? level.rows : level.cols;

    game = Core.createGame({
      rows,
      cols,
      mines: level.mines,
      rng: seed === null ? Math.random : Core.createRng(seed),
    });

    buildBoard();
    focusIndex = Math.floor(rows / 2) * cols + Math.floor(cols / 2);
    for (let i = 0; i < cellEls.length; i += 1) paintCell(i);
    cellEls[focusIndex].tabIndex = 0;
    if (hadFocus) cellEls[focusIndex].focus({ preventScroll: true });

    setFace("idle");
    updateHud();
    updateStatus();
    updateBest();
    updateControls();
    layout();
  }

  function onWin() {
    stopTimer();
    setFace("won");
    els.board.classList.add("is-over", "is-won");

    const seconds = Math.floor(elapsed);
    if (seed === null && (!Number.isFinite(best[levelKey]) || seconds < best[levelKey])) {
      best[levelKey] = seconds;
      store.set(BEST_KEY, JSON.stringify(best));
      freshRecord = true;
    }
    updateBest();
  }

  function onLose(explodedIndex) {
    stopTimer();
    setFace("lost");
    els.board.classList.add("is-over", "is-lost");
    els.progress.style.backgroundColor = "var(--accent)";

    const er = Math.floor(explodedIndex / cols);
    const ec = explodedIndex % cols;
    paintCell(explodedIndex);

    // Les autres mines apparaissent en onde autour de l'explosion.
    for (let i = 0; i < game.size; i += 1) {
      const state = game.stateAt(i);
      if (game.isMine(i) && state === HIDDEN) {
        const distance = Math.max(Math.abs(Math.floor(i / cols) - er), Math.abs((i % cols) - ec));
        setKind(i, "mine", Math.min(1100, 120 + distance * 45));
      } else if (!game.isMine(i) && state === FLAG) {
        setKind(i, "wrong");
      }
    }
  }

  /** Repercute a l'ecran ce qu'un coup a change. */
  function applyResult(result) {
    for (let k = 0; k < result.opened.length; k += 1) {
      const change = result.opened[k];
      paintCell(change.index, Math.min(change.step, 18) * 26);
    }
    for (let k = 0; k < result.autoFlagged.length; k += 1) paintCell(result.autoFlagged[k]);

    if (game.status === "playing" && timerId === null) startTimer();
    if (result.exploded >= 0) onLose(result.exploded);
    else if (game.status === "won") onWin();

    updateHud();
    updateStatus();
  }

  function toggleFlagAt(index) {
    if (game.toggleFlag(index) === null) return false;
    paintCell(index);
    updateHud();
    return true;
  }

  /** Coup principal : ouvrir, accorder sur un chiffre, ou poser un drapeau en mode drapeau. */
  function primaryAction(index) {
    if (isOver()) return;
    const state = game.stateAt(index);
    if (state === OPEN) {
      applyResult(game.chord(index));
    } else if (flagMode) {
      toggleFlagAt(index);
    } else if (state === HIDDEN) {
      applyResult(game.reveal(index));
    }
  }

  /* --- Gestes ---------------------------------------------------------- */

  function indexOf(target) {
    const cell = target instanceof Element ? target.closest(".cell") : null;
    return cell && els.board.contains(cell) ? Number(cell.dataset.i) : -1;
  }

  function setFocus(index, moveFocus) {
    cellEls[focusIndex].tabIndex = -1;
    focusIndex = index;
    cellEls[index].tabIndex = 0;
    if (moveFocus) cellEls[index].focus();
  }

  function clearPeek() {
    for (let k = 0; k < peeked.length; k += 1) peeked[k].classList.remove("is-peek");
    peeked = [];
  }

  function clearPress() {
    if (longPressTimer !== null) window.clearTimeout(longPressTimer);
    longPressTimer = null;
    pressOrigin = null;
    clearPeek();
  }

  els.board.addEventListener("pointerdown", (event) => {
    lastPointerType = event.pointerType || "mouse";
    suppressClick = false;
    clearPress();

    const index = indexOf(event.target);
    if (index < 0 || isOver()) return;

    if (lastPointerType === "mouse") {
      if (event.button !== 0) return;
      setFace("tense");
      // Sur un chiffre : montre les voisines qu'un accord ouvrirait.
      if (game.stateAt(index) === OPEN && game.adjacentAt(index) > 0) {
        game.neighbors(index).forEach((n) => {
          if (game.stateAt(n) === HIDDEN) {
            cellEls[n].classList.add("is-peek");
            peeked.push(cellEls[n]);
          }
        });
      }
      return;
    }

    // Tactile / stylet : l'appui long pose le drapeau (ou ouvre, en mode drapeau).
    pressOrigin = { x: event.clientX, y: event.clientY };
    longPressTimer = window.setTimeout(() => {
      longPressTimer = null;
      if (isOver() || game.stateAt(index) === OPEN) return;
      suppressClick = true;
      if (flagMode) {
        if (game.stateAt(index) === HIDDEN) applyResult(game.reveal(index));
      } else {
        toggleFlagAt(index);
      }
      if (navigator.vibrate) navigator.vibrate(12);
    }, LONG_PRESS_MS);
  });

  els.board.addEventListener("pointermove", (event) => {
    if (!pressOrigin) return;
    // Le doigt glisse : c'est un defilement, pas un appui long.
    if (Math.hypot(event.clientX - pressOrigin.x, event.clientY - pressOrigin.y) > 10) clearPress();
  });

  const endPress = () => {
    clearPress();
    if (game && !isOver()) setFace("idle");
  };
  els.board.addEventListener("pointerup", endPress);
  els.board.addEventListener("pointercancel", endPress);
  els.board.addEventListener("pointerleave", endPress);

  els.board.addEventListener("click", (event) => {
    const index = indexOf(event.target);
    if (index < 0) return;
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    setFocus(index, false);
    primaryAction(index);
  });

  els.board.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    // Au doigt, l'appui long est deja gere par le minuteur ci-dessus.
    if (lastPointerType !== "mouse") return;
    const index = indexOf(event.target);
    if (index >= 0 && !isOver()) toggleFlagAt(index);
  });

  els.board.addEventListener("auxclick", (event) => {
    if (event.button !== 1) return;
    const index = indexOf(event.target);
    if (index < 0 || isOver()) return;
    event.preventDefault();
    applyResult(game.chord(index));
  });

  els.board.addEventListener("keydown", (event) => {
    const index = indexOf(event.target);
    if (index < 0 || event.altKey || event.ctrlKey || event.metaKey) return;

    const row = Math.floor(index / cols);
    const col = index % cols;
    let next = -1;

    switch (event.key) {
      case "ArrowUp":
        if (row > 0) next = index - cols;
        break;
      case "ArrowDown":
        if (row < rows - 1) next = index + cols;
        break;
      case "ArrowLeft":
        if (col > 0) next = index - 1;
        break;
      case "ArrowRight":
        if (col < cols - 1) next = index + 1;
        break;
      case "Home":
        next = row * cols;
        break;
      case "End":
        next = row * cols + cols - 1;
        break;
      case "f":
      case "F":
        event.preventDefault();
        if (!isOver()) toggleFlagAt(index);
        return;
      default:
        return;
    }

    event.preventDefault();
    if (next >= 0 && next !== index) setFocus(next, true);
  });

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "r" || event.key === "R") newGame();
    else if (event.key === "1") newGame("easy");
    else if (event.key === "2") newGame("medium");
    else if (event.key === "3") newGame("hard");
  });

  els.face.addEventListener("click", () => newGame());
  els.replay.addEventListener("click", () => {
    // Le bouton disparait avec la nouvelle partie : on rend le focus au plateau.
    newGame();
    cellEls[focusIndex].focus({ preventScroll: true });
  });

  els.levels.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("button[data-level]") : null;
    if (button) newGame(button.dataset.level);
  });

  els.flagMode.addEventListener("click", () => {
    flagMode = !flagMode;
    updateControls();
  });

  document.querySelectorAll(".lang button").forEach((button) => {
    button.addEventListener("click", () => {
      lang = button.dataset.lang === "en" ? "en" : "fr";
      store.set(LANG_KEY, lang);
      applyLanguage();
    });
  });

  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(layout);
  });

  applyLanguage();
  newGame();
})();
