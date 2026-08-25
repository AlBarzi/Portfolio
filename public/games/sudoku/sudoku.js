const boardEl = document.getElementById("sudoku-board");
const timerEl = document.getElementById("timer");
const statusEl = document.getElementById("status-message");
const mistakesEl = document.getElementById("mistakes");
const newGameBtn = document.getElementById("new-game");
const solveBtn = document.getElementById("solve-game");
const notesBtn = document.getElementById("toggle-notes");
const hintBtn = document.getElementById("hint-game");
const overlayEl = document.getElementById("game-overlay");
const overlayTitleEl = document.getElementById("overlay-title");
const overlayMessageEl = document.getElementById("overlay-message");
const restartBtn = document.getElementById("restart-game");
const difficultyButtons = document.querySelectorAll("[data-difficulty]");
const numberButtons = document.querySelectorAll(".num");

let puzzle = [];
let solution = [];
let fixed = new Set();
let selectedIndex = null;
let notesMode = false;
let timer = null;
let startTime = null;
let currentDifficulty = "easy";
let mistakes = 0;
let hintsLeft = 5;
let gameOver = false;

const maxMistakes = 3;
const maxHints = 5;
const wrongMap = new Map();

const difficulties = {
  easy: 38,
  medium: 46,
  hard: 54,
};

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function startTimer() {
  stopTimer();
  startTime = Date.now();
  timer = setInterval(() => {
    timerEl.textContent = formatTime(Date.now() - startTime);
  }, 1000);
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function setStatus(message, tone = "") {
  statusEl.textContent = message;
  statusEl.dataset.tone = tone;
}

function updateMistakes() {
  mistakesEl.textContent = `Mistakes: ${mistakes}/${maxMistakes}`;
}

function updateHintButton() {
  hintBtn.textContent = `Hint (${hintsLeft})`;
  hintBtn.disabled = hintsLeft <= 0 || gameOver;
}

function showOverlay(title, message) {
  overlayTitleEl.textContent = title;
  overlayMessageEl.textContent = message;
  overlayEl.classList.remove("is-hidden");
}

function hideOverlay() {
  overlayEl.classList.add("is-hidden");
}

function endGame(win) {
  gameOver = true;
  stopTimer();
  if (win) {
    showOverlay("You win!", "Great job. Ready for another puzzle?");
    setStatus("Puzzle solved!", "good");
  } else {
    showOverlay("Game over", "You made too many mistakes.");
    setStatus("Game over.", "bad");
  }
  updateHintButton();
}

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isValid(grid, row, col, value) {
  for (let i = 0; i < 9; i += 1) {
    if (grid[row][i] === value) return false;
    if (grid[i][col] === value) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      if (grid[boxRow + r][boxCol + c] === value) return false;
    }
  }
  return true;
}

function solveGrid(grid) {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (grid[row][col] === 0) {
        for (const value of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
          if (isValid(grid, row, col, value)) {
            grid[row][col] = value;
            if (solveGrid(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function countSolutions(grid) {
  let count = 0;

  function search() {
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        if (grid[row][col] === 0) {
          for (let value = 1; value <= 9; value += 1) {
            if (isValid(grid, row, col, value)) {
              grid[row][col] = value;
              search();
              grid[row][col] = 0;
              if (count > 1) return;
            }
          }
          return;
        }
      }
    }
    count += 1;
  }

  search();
  return count;
}

function generateSolvedGrid() {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  solveGrid(grid);
  return grid;
}

function generatePuzzle(difficulty) {
  const solved = generateSolvedGrid();
  const puzzleGrid = solved.map((row) => row.slice());
  const targetRemove = difficulties[difficulty];
  const positions = shuffle(Array.from({ length: 81 }, (_, i) => i));

  let removed = 0;
  for (const index of positions) {
    if (removed >= targetRemove) break;
    const row = Math.floor(index / 9);
    const col = index % 9;
    const backup = puzzleGrid[row][col];
    if (backup === 0) continue;

    puzzleGrid[row][col] = 0;
    const snapshot = puzzleGrid.map((r) => r.slice());
    const solutions = countSolutions(snapshot);
    if (solutions !== 1) {
      puzzleGrid[row][col] = backup;
    } else {
      removed += 1;
    }
  }

  return { puzzle: puzzleGrid, solution: solved };
}

function renderBoard() {
  boardEl.innerHTML = "";
  puzzle.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      const cell = document.createElement("div");
      const index = rowIndex * 9 + colIndex;
      cell.className = "cell";
      cell.dataset.index = String(index);
      cell.setAttribute("role", "gridcell");
      if (fixed.has(index)) cell.classList.add("fixed");
      if (value !== 0) cell.textContent = value;
      cell.addEventListener("click", () => selectCell(index));
      boardEl.appendChild(cell);
    });
  });
  applyErrorStyles();
}

function selectCell(index) {
  if (gameOver) return;
  selectedIndex = index;
  updateHighlights();
}

function updateHighlights() {
  const cells = boardEl.querySelectorAll(".cell");
  cells.forEach((cell) => {
    cell.classList.remove("selected", "related", "error", "completed", "match");
  });

  if (selectedIndex === null) return;
  const row = Math.floor(selectedIndex / 9);
  const col = selectedIndex % 9;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  const selectedCell = cells[selectedIndex];
  const selectedValue = selectedCell ? Number(selectedCell.textContent) : 0;

  cells.forEach((cell) => {
    const index = Number(cell.dataset.index);
    const r = Math.floor(index / 9);
    const c = index % 9;
    const inRow = r === row;
    const inCol = c === col;
    const inBox = r >= boxRow && r < boxRow + 3 && c >= boxCol && c < boxCol + 3;
    if (inRow || inCol || inBox) cell.classList.add("related");

    const cellValue = Number(cell.textContent);
    if (selectedValue && cellValue === selectedValue) {
      cell.classList.add("match");
    }
  });

  if (selectedCell) selectedCell.classList.add("selected");
  applyErrorStyles();
}

function applyErrorStyles() {
  const cells = boardEl.querySelectorAll(".cell");
  cells.forEach((cell) => cell.classList.remove("error"));

  wrongMap.forEach((value, index) => {
    const cell = cells[index];
    if (!cell) return;
    if (Number(cell.textContent) === value) {
      cell.classList.add("error");
    }
  });
}

function recordMistake(index, value) {
  const prev = wrongMap.get(index);
  if (prev === value) return;
  wrongMap.set(index, value);
  mistakes += 1;
  updateMistakes();
  if (mistakes >= maxMistakes) {
    endGame(false);
  }
}

function setValue(value) {
  if (gameOver) return;
  if (selectedIndex === null) return;
  if (fixed.has(selectedIndex)) return;

  const row = Math.floor(selectedIndex / 9);
  const col = selectedIndex % 9;
  if (notesMode) {
    toggleNote(row, col, value);
    return;
  }
  puzzle[row][col] = value;
  if (value === solution[row][col]) {
    wrongMap.delete(selectedIndex);
  } else {
    recordMistake(selectedIndex, value);
  }
  renderBoard();
  updateHighlights();
  animateCompletions(row, col);
  if (isSolved()) {
    endGame(true);
  }
}

function clearValue() {
  if (gameOver) return;
  if (selectedIndex === null) return;
  if (fixed.has(selectedIndex)) return;

  const row = Math.floor(selectedIndex / 9);
  const col = selectedIndex % 9;
  puzzle[row][col] = 0;
  wrongMap.delete(selectedIndex);
  renderBoard();
  updateHighlights();
}

function toggleNote(row, col, value) {
  const cell = boardEl.querySelector(`.cell[data-index="${row * 9 + col}"]`);
  if (!cell) return;

  let notes = cell.querySelector(".notes");
  if (!notes) {
    notes = document.createElement("div");
    notes.className = "notes";
    for (let i = 1; i <= 9; i += 1) {
      const span = document.createElement("span");
      span.dataset.value = String(i);
      notes.appendChild(span);
    }
    cell.textContent = "";
    cell.appendChild(notes);
  }
  const span = notes.querySelector(`span[data-value="${value}"]`);
  if (!span) return;
  span.textContent = span.textContent ? "" : String(value);
}

function isSolved() {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (puzzle[row][col] !== solution[row][col]) return false;
    }
  }
  return true;
}

function solveBoard() {
  puzzle = solution.map((row) => row.slice());
  wrongMap.clear();
  renderBoard();
  updateHighlights();
  endGame(true);
}

function applyHint() {
  if (gameOver || hintsLeft <= 0) return;
  let targetIndex = selectedIndex;
  if (targetIndex === null || fixed.has(targetIndex)) {
    const emptyIndexes = [];
    for (let i = 0; i < 81; i += 1) {
      const row = Math.floor(i / 9);
      const col = i % 9;
      if (puzzle[row][col] === 0) emptyIndexes.push(i);
    }
    if (emptyIndexes.length === 0) return;
    targetIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
  }

  const row = Math.floor(targetIndex / 9);
  const col = targetIndex % 9;
  puzzle[row][col] = solution[row][col];
  fixed.add(targetIndex);
  wrongMap.delete(targetIndex);
  hintsLeft -= 1;
  updateHintButton();
  renderBoard();
  updateHighlights();
  if (isSolved()) {
    endGame(true);
  }
}

function setupGame() {
  const data = generatePuzzle(currentDifficulty);
  puzzle = data.puzzle;
  solution = data.solution;
  fixed = new Set();
  puzzle.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value !== 0) fixed.add(rowIndex * 9 + colIndex);
    });
  });
  selectedIndex = null;
  notesMode = false;
  notesBtn.textContent = "Notes: Off";
  mistakes = 0;
  hintsLeft = maxHints;
  wrongMap.clear();
  gameOver = false;
  hideOverlay();
  setStatus("Good luck!");
  timerEl.textContent = "00:00";
  updateMistakes();
  updateHintButton();
  renderBoard();
  updateHighlights();
  startTimer();
}

function handleKey(event) {
  if (gameOver) return;
  if (event.key >= "1" && event.key <= "9") {
    setValue(Number(event.key));
  }
  if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
    clearValue();
  }
  if (event.key === "n" || event.key === "N") {
    toggleNotesMode();
  }
}

function toggleNotesMode() {
  notesMode = !notesMode;
  notesBtn.textContent = notesMode ? "Notes: On" : "Notes: Off";
}

function bindEvents() {
  newGameBtn.addEventListener("click", setupGame);
  solveBtn.addEventListener("click", solveBoard);
  notesBtn.addEventListener("click", toggleNotesMode);
  hintBtn.addEventListener("click", applyHint);
  restartBtn.addEventListener("click", setupGame);

  difficultyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      difficultyButtons.forEach((b) => b.classList.remove("is-active"));
      button.classList.add("is-active");
      currentDifficulty = button.dataset.difficulty;
      setupGame();
    });
  });

  numberButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.value;
      if (value) {
        setValue(Number(value));
      } else if (button.dataset.action === "clear") {
        clearValue();
      }
    });
  });

  document.addEventListener("keydown", handleKey);
}

bindEvents();
setupGame();

function animateCompletions(row, col) {
  const cells = boardEl.querySelectorAll(".cell");
  const rowIndexes = Array.from({ length: 9 }, (_, c) => row * 9 + c);
  const colIndexes = Array.from({ length: 9 }, (_, r) => r * 9 + col);
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  const boxIndexes = [];
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      boxIndexes.push((boxRow + r) * 9 + (boxCol + c));
    }
  }

  const groups = [rowIndexes, colIndexes, boxIndexes];
  groups.forEach((indexes) => {
    const complete = indexes.every((i) => {
      const r = Math.floor(i / 9);
      const c = i % 9;
      return puzzle[r][c] !== 0 && puzzle[r][c] === solution[r][c];
    });
    if (!complete) return;
    indexes.forEach((i) => {
      const cell = cells[i];
      if (!cell) return;
      cell.classList.remove("celebrate");
      void cell.offsetWidth;
      cell.classList.add("celebrate");
    });
  });
}
