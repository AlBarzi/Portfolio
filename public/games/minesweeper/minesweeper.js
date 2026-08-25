const LEVELS = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

const DEFAULT_LEVEL = "easy";

let boardEl;
let mineCounterEl;
let timeCounterEl;
let levelSelectEl;
let faceButtonEl;
let statusEl;

let state = null;

function pad3(value) {
  const safe = Math.max(0, Math.min(999, value));
  return String(safe).padStart(3, "0");
}

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function setFace(mode) {
  if (faceButtonEl) faceButtonEl.dataset.face = mode;
}

function updateCounters() {
  if (!state) return;
  if (mineCounterEl) mineCounterEl.textContent = pad3(state.mines - state.flags);
  if (timeCounterEl) timeCounterEl.textContent = pad3(state.timer);
}

function startTimer() {
  if (!state || state.timerId) return;
  state.timerId = window.setInterval(() => {
    state.timer += 1;
    updateCounters();
  }, 1000);
}

function stopTimer() {
  if (state?.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function createState(levelKey) {
  const { rows, cols, mines } = LEVELS[levelKey] || LEVELS[DEFAULT_LEVEL];
  const size = rows * cols;
  return {
    levelKey,
    rows,
    cols,
    mines,
    cells: Array.from({ length: size }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    })),
    revealedCount: 0,
    flags: 0,
    timer: 0,
    timerId: null,
    firstClick: true,
    gameOver: false,
  };
}

function indexFromRowCol(row, col) {
  return row * state.cols + col;
}

function neighbors(index) {
  const row = Math.floor(index / state.cols);
  const col = index % state.cols;
  const list = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= state.rows || nc < 0 || nc >= state.cols) continue;
      list.push(indexFromRowCol(nr, nc));
    }
  }
  return list;
}

function placeMines(excludeIndex) {
  const available = [];
  for (let i = 0; i < state.cells.length; i += 1) {
    if (i !== excludeIndex) available.push(i);
  }

  for (let m = 0; m < state.mines; m += 1) {
    const pick = Math.floor(Math.random() * available.length);
    const index = available.splice(pick, 1)[0];
    state.cells[index].mine = true;
  }

  state.cells.forEach((cell, idx) => {
    if (cell.mine) return;
    const count = neighbors(idx).reduce((total, n) => total + (state.cells[n].mine ? 1 : 0), 0);
    cell.adjacent = count;
  });
}

function updateBoardSize() {
  if (!state || !boardEl) return;
  const viewportWidth = Math.max(320, window.innerWidth || 0);
  const maxWidth = Math.min(viewportWidth - 48, 720);
  const minSize = 18;
  let size = Math.floor(maxWidth / state.cols);
  if (!Number.isFinite(size) || size < minSize) size = minSize;
  boardEl.style.setProperty("--cell", `${size}px`);
  boardEl.style.width = `${size * state.cols}px`;
  boardEl.style.height = `${size * state.rows}px`;
}

function buildBoard() {
  if (!boardEl || !state) return;
  boardEl.innerHTML = "";
  boardEl.style.setProperty("--cols", state.cols);
  boardEl.style.setProperty("--rows", state.rows);
  boardEl.style.setProperty("--cell", "24px");

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < state.cells.length; i += 1) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cell";
    btn.setAttribute("data-index", String(i));
    btn.setAttribute("role", "gridcell");
    btn.setAttribute("aria-label", "Hidden tile");
    fragment.appendChild(btn);
  }
  boardEl.appendChild(fragment);
  requestAnimationFrame(updateBoardSize);
}

function revealCell(index) {
  const cell = state.cells[index];
  const cellEl = boardEl.children[index];
  if (!cell || !cellEl || cell.revealed || cell.flagged) return;

  cell.revealed = true;
  state.revealedCount += 1;
  cellEl.classList.add("revealed");
  cellEl.setAttribute("aria-label", "Revealed tile");

  if (cell.mine) {
    cellEl.classList.add("mine");
    cellEl.textContent = "*";
    loseGame();
    return;
  }

  if (cell.adjacent > 0) {
    cellEl.textContent = String(cell.adjacent);
    cellEl.classList.add(`n${cell.adjacent}`);
  } else {
    floodReveal(index);
  }

  checkWin();
}

function floodReveal(startIndex) {
  const queue = [startIndex];
  const visited = new Set([startIndex]);

  while (queue.length) {
    const current = queue.shift();
    neighbors(current).forEach((n) => {
      const nCell = state.cells[n];
      const nEl = boardEl.children[n];
      if (!nEl || visited.has(n) || nCell.revealed || nCell.flagged) return;
      nCell.revealed = true;
      state.revealedCount += 1;
      nEl.classList.add("revealed");
      nEl.setAttribute("aria-label", "Revealed tile");
      if (nCell.adjacent > 0) {
        nEl.textContent = String(nCell.adjacent);
        nEl.classList.add(`n${nCell.adjacent}`);
      } else {
        queue.push(n);
      }
      visited.add(n);
    });
  }
}

function toggleFlag(index) {
  const cell = state.cells[index];
  const cellEl = boardEl.children[index];
  if (!cell || !cellEl || cell.revealed) return;

  cell.flagged = !cell.flagged;
  cellEl.classList.toggle("flagged", cell.flagged);
  cellEl.textContent = cell.flagged ? "F" : "";
  cellEl.setAttribute("aria-label", cell.flagged ? "Flagged tile" : "Hidden tile");
  state.flags += cell.flagged ? 1 : -1;
  updateCounters();
}

function revealAllMines() {
  state.cells.forEach((cell, idx) => {
    if (!cell.mine) return;
    const cellEl = boardEl.children[idx];
    if (!cellEl) return;
    cellEl.classList.add("revealed", "mine");
    cellEl.textContent = "*";
  });
}

function loseGame() {
  if (state.gameOver) return;
  state.gameOver = true;
  stopTimer();
  revealAllMines();
  setFace("dead");
  setStatus("Game over. Click the face to try again.");
}

function winGame() {
  if (state.gameOver) return;
  state.gameOver = true;
  stopTimer();
  setFace("cool");
  setStatus("You win! Click the face to play again.");
}

function checkWin() {
  const safeTiles = state.cells.length - state.mines;
  if (state.revealedCount >= safeTiles) {
    winGame();
  }
}

function chordReveal(index) {
  const cell = state.cells[index];
  if (!cell || !cell.revealed || cell.adjacent === 0) return;
  const neighborIdx = neighbors(index);
  const flagged = neighborIdx.filter((n) => state.cells[n].flagged).length;
  if (flagged !== cell.adjacent) return;
  neighborIdx.forEach((n) => revealCell(n));
}

function startGame(levelKey) {
  stopTimer();
  state = createState(levelKey);
  setFace("smile");
  setStatus("Left click to reveal. Right click to flag.");
  updateCounters();
  buildBoard();
}

function handleBoardClick(event) {
  const target = event.target;
  if (!target.classList.contains("cell") || state.gameOver) return;
  const index = Number(target.getAttribute("data-index"));
  if (Number.isNaN(index)) return;

  if (state.firstClick) {
    placeMines(index);
    state.firstClick = false;
    startTimer();
  }

  revealCell(index);
}

function handleBoardRightClick(event) {
  event.preventDefault();
  const target = event.target;
  if (!target.classList.contains("cell") || state.gameOver || state.firstClick) return;
  const index = Number(target.getAttribute("data-index"));
  if (Number.isNaN(index)) return;
  toggleFlag(index);
}

function initGame() {
  boardEl = document.getElementById("board");
  mineCounterEl = document.getElementById("mine-counter");
  timeCounterEl = document.getElementById("time-counter");
  levelSelectEl = document.getElementById("level");
  faceButtonEl = document.getElementById("face");
  statusEl = document.getElementById("status");

  if (!boardEl || !mineCounterEl || !timeCounterEl || !levelSelectEl || !faceButtonEl || !statusEl) {
    return false;
  }

  boardEl.addEventListener("click", handleBoardClick);
  boardEl.addEventListener("contextmenu", handleBoardRightClick);
  boardEl.addEventListener("dblclick", (event) => {
    const target = event.target;
    if (!target.classList.contains("cell")) return;
    const index = Number(target.getAttribute("data-index"));
    if (Number.isNaN(index)) return;
    chordReveal(index);
  });

  boardEl.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    if (!state?.gameOver) setFace("surprised");
  });

  boardEl.addEventListener("mouseup", () => {
    if (!state?.gameOver) setFace("smile");
  });

  faceButtonEl.addEventListener("click", () => startGame(levelSelectEl.value));
  levelSelectEl.addEventListener("change", (event) => startGame(event.target.value));
  window.addEventListener("resize", updateBoardSize);

  startGame(levelSelectEl.value || DEFAULT_LEVEL);
  return true;
}

function boot(attempt = 0) {
  const ok = initGame();
  if (!ok && attempt < 8) {
    window.setTimeout(() => boot(attempt + 1), 50);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => boot(), { once: true });
} else {
  boot();
}
