import { useEffect } from "react";

/**
 * Mouvement ambiant, sans re-render : tout passe par des variables CSS
 * et des attributs poses sur <html>.
 *
 *   --scroll   progression 0..1 du defilement (barre de progression)
 *   --mx/--my  position du curseur normalisee -1..1 (parallaxe legere)
 *   [data-scrolled]  la page a quitte le haut (la pilule de nav se resserre)
 */
const useAmbientMotion = () => {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let rafScroll = 0;
    let rafPointer = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onScroll = () => {
      if (rafScroll) return;
      rafScroll = window.requestAnimationFrame(() => {
        rafScroll = 0;
        const max = root.scrollHeight - window.innerHeight;
        const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        root.style.setProperty("--scroll", progress.toFixed(4));
        root.toggleAttribute("data-scrolled", window.scrollY > 24);
      });
    };

    // Le curseur est lisse : on interpole vers la cible a chaque frame,
    // et on s'arrete des que la difference devient invisible.
    const tickPointer = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      root.style.setProperty("--mx", currentX.toFixed(3));
      root.style.setProperty("--my", currentY.toFixed(3));
      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        rafPointer = window.requestAnimationFrame(tickPointer);
      } else {
        rafPointer = 0;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth) * 2 - 1;
      targetY = (event.clientY / window.innerHeight) * 2 - 1;
      if (!rafPointer) rafPointer = window.requestAnimationFrame(tickPointer);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    if (fine && !reduced) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    return () => {
      window.cancelAnimationFrame(rafScroll);
      window.cancelAnimationFrame(rafPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);
};

export default useAmbientMotion;
