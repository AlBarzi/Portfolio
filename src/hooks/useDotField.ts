import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * Champ de points anime sur canvas.
 *
 * Remplace l'ancien useGridTrail, qui injectait ~2 700 <div> dans le DOM
 * et les recreait a chaque evenement resize.
 *
 * Trois couches se combinent :
 *   1. une grille de points fixes, pre-rendue une seule fois dans un
 *      canvas hors-ecran puis simplement recopiee a chaque frame ;
 *   2. un flow field : deplacement organique des points, calcule avec
 *      des sinusoides superposees plutot qu'un vrai bruit de Perlin
 *      (visuellement equivalent ici, environ dix fois moins cher) ;
 *   3. un spotlight qui suit le curseur en interpolation douce et
 *      n'illumine que les points a portee.
 *
 * Cout : seuls les points contenus dans le rayon du spotlight sont
 * redessines par frame, soit ~150 au lieu de ~2 800.
 */

const SPACING = 26;
const DOT_RADIUS = 1;
const SPOTLIGHT_RADIUS = 190;
const FLOW_AMPLITUDE = 2.4;
const FLOW_SPEED = 0.00016;
const CURSOR_LERP = 0.12;
const IDLE_FADE_MS = 1600;

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const readAccent = (): Rgb => {
  const fallback: Rgb = { r: 94, g: 234, b: 212 };
  if (typeof window === "undefined") return fallback;

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--accent")
    .trim();
  const hex = raw.replace("#", "");
  if (hex.length !== 6) return fallback;

  const value = Number.parseInt(hex, 16);
  if (Number.isNaN(value)) return fallback;

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const useDotField = (canvasRef: RefObject<HTMLCanvasElement>) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const accent = readAccent();

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;

    // Calque statique : la grille au repos, dessinee une seule fois.
    const baseLayer = document.createElement("canvas");
    const baseContext = baseLayer.getContext("2d");

    let pointerX = -9999;
    let pointerY = -9999;
    let smoothX = -9999;
    let smoothY = -9999;
    let lastPointerMove = 0;
    let rafId = 0;
    let resizeTimer = 0;

    const drawBaseLayer = () => {
      if (!baseContext) return;
      baseContext.setTransform(1, 0, 0, 1, 0, 0);
      baseContext.scale(dpr, dpr);
      baseContext.clearRect(0, 0, width, height);
      baseContext.fillStyle = "rgba(148, 173, 210, 0.085)";

      for (let row = 0; row <= rows; row += 1) {
        for (let col = 0; col <= cols; col += 1) {
          baseContext.beginPath();
          baseContext.arc(col * SPACING, row * SPACING, DOT_RADIUS, 0, Math.PI * 2);
          baseContext.fill();
        }
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      cols = Math.ceil(width / SPACING);
      rows = Math.ceil(height / SPACING);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      baseLayer.width = canvas.width;
      baseLayer.height = canvas.height;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);

      drawBaseLayer();
    };

    // Debounce : sans lui, un redimensionnement de fenetre declenche
    // des dizaines de reconstructions de la grille par seconde.
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 120);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      lastPointerMove = performance.now();
      if (smoothX < -1000) {
        smoothX = pointerX;
        smoothY = pointerY;
      }
    };

    const onPointerLeave = () => {
      pointerX = -9999;
      pointerY = -9999;
    };

    const render = (time: number) => {
      context.clearRect(0, 0, width, height);
      context.drawImage(baseLayer, 0, 0, width, height);

      smoothX += (pointerX - smoothX) * CURSOR_LERP;
      smoothY += (pointerY - smoothY) * CURSOR_LERP;

      // Le spotlight s'estompe quand le curseur est immobile :
      // l'ecran redevient calme au lieu de scintiller en permanence.
      const idleFor = time - lastPointerMove;
      const idleFade = idleFor > IDLE_FADE_MS ? Math.max(0, 1 - (idleFor - IDLE_FADE_MS) / 900) : 1;

      if (idleFade > 0.01 && smoothX > -1000) {
        const t = time * FLOW_SPEED;
        const minCol = Math.max(0, Math.floor((smoothX - SPOTLIGHT_RADIUS) / SPACING));
        const maxCol = Math.min(cols, Math.ceil((smoothX + SPOTLIGHT_RADIUS) / SPACING));
        const minRow = Math.max(0, Math.floor((smoothY - SPOTLIGHT_RADIUS) / SPACING));
        const maxRow = Math.min(rows, Math.ceil((smoothY + SPOTLIGHT_RADIUS) / SPACING));

        for (let row = minRow; row <= maxRow; row += 1) {
          for (let col = minCol; col <= maxCol; col += 1) {
            const baseX = col * SPACING;
            const baseY = row * SPACING;

            const dx = baseX - smoothX;
            const dy = baseY - smoothY;
            const distance = Math.hypot(dx, dy);
            if (distance > SPOTLIGHT_RADIUS) continue;

            // Falloff quadratique : bord franc au centre, fondu doux.
            const falloff = (1 - distance / SPOTLIGHT_RADIUS) ** 2 * idleFade;

            // Flow field : deux sinusoides dephasees par axe suffisent
            // a casser la regularite de la grille.
            const flowX = Math.sin(baseY * 0.021 + t) * Math.cos(baseX * 0.013 - t * 0.7);
            const flowY = Math.cos(baseX * 0.019 - t * 1.1) * Math.sin(baseY * 0.015 + t);

            const x = baseX + flowX * FLOW_AMPLITUDE * falloff * 3;
            const y = baseY + flowY * FLOW_AMPLITUDE * falloff * 3;
            const radius = DOT_RADIUS + falloff * 1.5;

            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${falloff * 0.85})`;
            context.fill();
          }
        }

        // Halo diffus : donne de la profondeur sans dessiner de points.
        const halo = context.createRadialGradient(
          smoothX,
          smoothY,
          0,
          smoothX,
          smoothY,
          SPOTLIGHT_RADIUS * 1.25
        );
        halo.addColorStop(0, `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.05 * idleFade})`);
        halo.addColorStop(1, "rgba(0, 0, 0, 0)");
        context.fillStyle = halo;
        context.fillRect(
          smoothX - SPOTLIGHT_RADIUS * 1.25,
          smoothY - SPOTLIGHT_RADIUS * 1.25,
          SPOTLIGHT_RADIUS * 2.5,
          SPOTLIGHT_RADIUS * 2.5
        );
      }

      rafId = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", onResize);

    // Sans pointeur fin (mobile, tablette) ou en mouvement reduit, on
    // s'arrete a la grille statique : aucune boucle d'animation.
    if (!hasFinePointer || reducedMotion) {
      context.drawImage(baseLayer, 0, 0, width, height);
      return () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
      };
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [canvasRef]);
};

export default useDotField;
