// Terminal logic
const outputEl = document.getElementById("output");
const inputEl = document.getElementById("command-input");
const mouseSaberEl = document.getElementById("mouse-saber");
const inputRowEl = document.querySelector(".input-row");
const inputMirrorEl = document.getElementById("input-mirror");
const inputCaretEl = document.getElementById("input-caret");
const gridBgEl = document.getElementById("grid-bg");

const promptLabel = "ammouri@portfolio:~$";
const cvPath = "cv.pdf";
const saberAudio = new Audio("assets/audio/saber-swing.mp3");
let saberAudioReady = false;

saberAudio.preload = "auto";
saberAudio.addEventListener("canplaythrough", () => {
  saberAudioReady = true;
});
saberAudio.addEventListener("error", () => {
  saberAudioReady = false;
});

let audioContext;
let noiseBuffer;

function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function openCvFile() {
  const popup = window.open(cvPath, "_blank", "noopener,noreferrer");
  if (popup) return true;

  const fallback = document.createElement("a");
  fallback.href = cvPath;
  fallback.target = "_blank";
  fallback.rel = "noopener noreferrer";
  fallback.click();
  return false;
}

function getNoiseBuffer() {
  if (noiseBuffer) return noiseBuffer;
  const duration = 0.25;
  const buffer = audioContext.createBuffer(
    1,
    audioContext.sampleRate * duration,
    audioContext.sampleRate
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.7;
  }
  noiseBuffer = buffer;
  return buffer;
}

function playSaberSound() {
  if (saberAudioReady) {
    saberAudio.currentTime = 0;
    saberAudio.play().catch(() => {
      // Ignore si le navigateur bloque l'autoplay
    });
    return;
  }

  ensureAudioContext();
  const now = audioContext.currentTime;

  const whoosh = audioContext.createOscillator();
  const whooshGain = audioContext.createGain();
  whoosh.type = "sawtooth";
  whoosh.frequency.setValueAtTime(640, now);
  whoosh.frequency.exponentialRampToValueAtTime(140, now + 0.18);
  whooshGain.gain.setValueAtTime(0.0001, now);
  whooshGain.gain.exponentialRampToValueAtTime(0.22, now + 0.015);
  whooshGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  whoosh.connect(whooshGain).connect(audioContext.destination);
  whoosh.start(now);
  whoosh.stop(now + 0.22);

  const body = audioContext.createOscillator();
  const bodyGain = audioContext.createGain();
  body.type = "triangle";
  body.frequency.setValueAtTime(200, now);
  body.frequency.exponentialRampToValueAtTime(90, now + 0.16);
  bodyGain.gain.setValueAtTime(0.0001, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  body.connect(bodyGain).connect(audioContext.destination);
  body.start(now);
  body.stop(now + 0.2);

  const noise = audioContext.createBufferSource();
  noise.buffer = getNoiseBuffer();
  const filter = audioContext.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1800, now);
  filter.frequency.exponentialRampToValueAtTime(700, now + 0.16);
  const noiseGain = audioContext.createGain();
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.12, now + 0.012);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  noise.connect(filter).connect(noiseGain).connect(audioContext.destination);
  noise.start(now);
  noise.stop(now + 0.2);
}

function createSparks(x, y) {
  const count = 10 + Math.floor(Math.random() * 6);
  for (let i = 0; i < count; i += 1) {
    const spark = document.createElement("span");
    spark.className = "saber-spark";
    const angle = Math.random() * Math.PI * 2;
    const distance = 18 + Math.random() * 24;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.setProperty("--dx", `${dx}px`);
    spark.style.setProperty("--dy", `${dy}px`);
    document.body.appendChild(spark);
    spark.addEventListener("animationend", () => spark.remove(), { once: true });
  }
}

function swingMouseSaber(event) {
  if (!mouseSaberEl) return;
  mouseSaberEl.classList.remove("swing");
  void mouseSaberEl.offsetWidth;
  mouseSaberEl.classList.add("swing");
  if (event) {
    createSparks(event.clientX, event.clientY);
  }
  playSaberSound();
}

function updateMouseSaber(event) {
  if (!mouseSaberEl) return;
  mouseSaberEl.style.left = `${event.clientX}px`;
  mouseSaberEl.style.top = `${event.clientY}px`;
  mouseSaberEl.classList.add("is-visible");
}

// Terminal command handling
const commands = {
  help: () => [
    "Commandes disponibles:",
    "- help : affiche cette aide",
    "- about : a propos rapide",
    "- project : liste des projets",
    "- games : liste des jeux",
    `- cv : ouvre ${cvPath}`,
    "- clear : nettoie l'ecran",
  ],
  about: () => [
    "Salut, je suis Ammouri.",
    "Developpeur web. J'aime construire des experiences propres et utiles.",
  ],
  project: () => [
    "Projets:",
    "1) Portfolio terminal (ce site)",
    "2) A definir...",
  ],
  games: () => [
    "Jeux:",
    "1) sudoku",
    "2) snake",
    "3) minesweeper",
    "Astuce: tape 'sudoku', 'snake' ou 'minesweeper' pour ouvrir le jeu.",
  ],
  sudoku: () => {
    const gamePath = "games/sudoku/index.html";
    window.open(gamePath, "_blank", "noopener,noreferrer");
    return [
      "Ouverture du Sudoku...",
      {
        html: `Lien direct: <a href="${gamePath}" target="_blank" rel="noopener noreferrer">Ouvrir Sudoku</a>`,
      },
    ];
  },
  snake: () => {
    const builtPath = "games/snake/dist/index.html";
    const gamePath = "games/snake/index.html";
    const target = window.fetch ? builtPath : gamePath;
    window.open(target, "_blank", "noopener,noreferrer");
    return [
      "Ouverture du Snake...",
      {
        html: `Lien direct: <a href="${builtPath}" target="_blank" rel="noopener noreferrer">Ouvrir Snake (build)</a><br><a href="${gamePath}" target="_blank" rel="noopener noreferrer">Ouvrir Snake (dev)</a>`,
      },
    ];
  },
  minesweeper: () => {
    const gamePath = "games/minesweeper/index.html";
    window.open(gamePath, "_blank", "noopener,noreferrer");
    return [
      "Ouverture du Minesweeper...",
      {
        html: `Lien direct: <a href="${gamePath}" target="_blank" rel="noopener noreferrer">Ouvrir Minesweeper</a>`,
      },
    ];
  },
  cv: () => {
    const opened = openCvFile();
    return [
      opened ? "Ouverture du CV..." : "Pop-up bloquee, clique le lien ci-dessous:",
      {
        html: `Lien direct: <a href="${cvPath}" target="_blank" rel="noopener noreferrer">Ouvrir le CV</a>`,
      },
      `Si rien ne s'ouvre, verifie que ${cvPath} existe a la racine.`,
    ];
  },
  clear: () => {
    outputEl.innerHTML = "";
    return [];
  },
};

function appendLine(text, className) {
  const line = document.createElement("div");
  line.className = `line${className ? ` ${className}` : ""}`;
  line.textContent = text;
  outputEl.appendChild(line);
  outputEl.scrollTop = outputEl.scrollHeight;
}

function appendHtmlLine(html, className) {
  const line = document.createElement("div");
  line.className = `line${className ? ` ${className}` : ""}`;
  line.innerHTML = html;
  outputEl.appendChild(line);
  outputEl.scrollTop = outputEl.scrollHeight;
}

function printBlock(lines, className) {
  lines.forEach((line) => {
    if (line && typeof line === "object" && "html" in line) {
      appendHtmlLine(line.html, className);
      return;
    }
    appendLine(line, className);
  });
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function handleCommand(raw) {
  const input = raw.trim();
  if (!input) return;

  appendHtmlLine(
    `<span class="prompt">${promptLabel}</span> ${escapeHtml(input)}`,
    "muted"
  );

  const [command] = input.split(/\s+/);
  const handler = commands[command.toLowerCase()];

  if (!handler) {
    appendLine(`Commande inconnue: ${command}. Tape 'help' pour la liste.`);
    return;
  }

  const result = handler();
  if (Array.isArray(result) && result.length) {
    printBlock(result);
  }
}

function setupGridBackground() {
  if (!gridBgEl) return;
  const size = 28;
  const cols = Math.ceil(window.innerWidth / size);
  const rows = Math.ceil(window.innerHeight / size);
  gridBgEl.style.setProperty("--grid-cols", cols);
  gridBgEl.style.setProperty("--grid-rows", rows);
  gridBgEl.innerHTML = "";

  for (let i = 0; i < cols * rows; i += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    gridBgEl.appendChild(cell);
  }
}

let lastMouseX = null;
let lastMouseY = null;
const fadeQueue = [];
let fadeRunning = false;
const fadeHoldMs = 32;
const fadeGapMs = 60;
const fadeStartDelayMs = 300;

function processFadeQueue() {
  if (fadeRunning) return;
  fadeRunning = true;

  const next = () => {
    const cell = fadeQueue.shift();
    if (!cell) {
      fadeRunning = false;
      return;
    }

    setTimeout(() => {
      cell.classList.remove("is-lit");
      cell.dataset.queued = "";
      setTimeout(next, fadeGapMs);
    }, fadeHoldMs);
  };

  setTimeout(next, fadeStartDelayMs);
}

function lightGridAt(x, y) {
  if (!gridBgEl) return;
  const rect = gridBgEl.getBoundingClientRect();
  const size = 28;
  const col = Math.floor((x - rect.left) / size);
  const row = Math.floor((y - rect.top) / size);
  const cols = Number(getComputedStyle(gridBgEl).getPropertyValue("--grid-cols"));
  const index = row * cols + col;
  const cell = gridBgEl.children[index];
  if (!cell) return;

  cell.classList.add("is-lit");
  if (!cell.dataset.queued) {
    cell.dataset.queued = "1";
    fadeQueue.push(cell);
    processFadeQueue();
  }
}

function lightGridCell(event) {
  if (lastMouseX === null || lastMouseY === null) {
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    lightGridAt(event.clientX, event.clientY);
    return;
  }

  const dx = event.clientX - lastMouseX;
  const dy = event.clientY - lastMouseY;
  const distance = Math.hypot(dx, dy);
  const step = 8;
  const steps = Math.max(1, Math.ceil(distance / step));

  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    lightGridAt(lastMouseX + dx * t, lastMouseY + dy * t);
  }

  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
}

function updateCaret() {
  if (!inputMirrorEl || !inputCaretEl) return;
  inputMirrorEl.textContent = inputEl.value;
  const width = inputMirrorEl.offsetWidth;
  inputCaretEl.style.left = `${width}px`;
}

function boot() {
  printBlock([
    "Bienvenue sur mon portfolio.",
    "Tape 'help' pour voir les commandes.",
  ]);
  inputEl.focus();
  setupGridBackground();
  updateCaret();
}

inputEl.addEventListener("focus", () => {
  if (inputRowEl) inputRowEl.classList.add("is-focused");
  updateCaret();
});

inputEl.addEventListener("blur", () => {
  if (inputRowEl) inputRowEl.classList.remove("is-focused");
});

inputEl.addEventListener("input", () => {
  updateCaret();
});

inputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleCommand(inputEl.value);
    inputEl.value = "";
    updateCaret();
  } else {
    requestAnimationFrame(updateCaret);
  }
});

inputEl.addEventListener("click", () => {
  updateCaret();
});

window.addEventListener("click", () => {
  ensureAudioContext();
  inputEl.focus();
});

window.addEventListener("mousemove", (event) => {
  updateMouseSaber(event);
  lightGridCell(event);
});

window.addEventListener("mousedown", (event) => {
  swingMouseSaber(event);
});

window.addEventListener("resize", () => {
  setupGridBackground();
  updateCaret();
});

window.addEventListener("mouseleave", () => {
  lastMouseX = null;
  lastMouseY = null;
});

boot();
