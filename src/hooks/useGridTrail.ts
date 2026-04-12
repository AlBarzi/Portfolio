import { useEffect } from "react";
import type { RefObject } from "react";

const CELL_SIZE = 28;
const FADE_HOLD_MS = 32;
const FADE_GAP_MS = 60;
const FADE_START_DELAY_MS = 300;

const useGridTrail = (gridRef: RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    let lastMouseX: number | null = null;
    let lastMouseY: number | null = null;
    const fadeQueue: HTMLDivElement[] = [];
    let fadeRunning = false;

    const processFadeQueue = () => {
      if (fadeRunning) return;
      fadeRunning = true;

      const next = () => {
        const cell = fadeQueue.shift();
        if (!cell) {
          fadeRunning = false;
          return;
        }

        window.setTimeout(() => {
          cell.classList.remove("is-lit");
          cell.dataset.queued = "";
          window.setTimeout(next, FADE_GAP_MS);
        }, FADE_HOLD_MS);
      };

      window.setTimeout(next, FADE_START_DELAY_MS);
    };

    const setupGrid = () => {
      const cols = Math.ceil(window.innerWidth / CELL_SIZE);
      const rows = Math.ceil(window.innerHeight / CELL_SIZE);
      grid.style.setProperty("--grid-cols", String(cols));
      grid.style.setProperty("--grid-rows", String(rows));
      grid.replaceChildren();

      for (let i = 0; i < cols * rows; i += 1) {
        const cell = document.createElement("div");
        cell.className = "grid-cell";
        grid.appendChild(cell);
      }
    };

    const lightGridAt = (x: number, y: number) => {
      const rect = grid.getBoundingClientRect();
      const col = Math.floor((x - rect.left) / CELL_SIZE);
      const row = Math.floor((y - rect.top) / CELL_SIZE);
      const colsValue = Number(getComputedStyle(grid).getPropertyValue("--grid-cols"));
      const index = row * colsValue + col;
      const cell = grid.children[index] as HTMLDivElement | undefined;
      if (!cell) return;

      cell.classList.add("is-lit");
      if (!cell.dataset.queued) {
        cell.dataset.queued = "1";
        fadeQueue.push(cell);
        processFadeQueue();
      }
    };

    const lightTrail = (event: MouseEvent) => {
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
    };

    const resetMouse = () => {
      lastMouseX = null;
      lastMouseY = null;
    };

    setupGrid();

    window.addEventListener("mousemove", lightTrail);
    window.addEventListener("resize", setupGrid);
    window.addEventListener("mouseleave", resetMouse);

    return () => {
      window.removeEventListener("mousemove", lightTrail);
      window.removeEventListener("resize", setupGrid);
      window.removeEventListener("mouseleave", resetMouse);
    };
  }, [gridRef]);
};

export default useGridTrail;

