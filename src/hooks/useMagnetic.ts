import { useEffect } from "react";

/**
 * Boutons magnetiques : l'element glisse de quelques pixels vers le
 * curseur quand il le survole, puis revient. Publie --mag-x / --mag-y ;
 * le CSS decide de l'amplitude et de la courbe de retour.
 */
const useMagnetic = (deps: unknown[] = []) => {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
    const cleanups: Array<() => void> = [];

    nodes.forEach((node) => {
      const strength = Number.parseFloat(node.dataset.magnetic || "") || 0.28;

      const onMove = (event: PointerEvent) => {
        const rect = node.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        node.style.setProperty("--mag-x", `${(dx * strength).toFixed(1)}px`);
        node.style.setProperty("--mag-y", `${(dy * strength).toFixed(1)}px`);
      };

      const onLeave = () => {
        node.style.setProperty("--mag-x", "0px");
        node.style.setProperty("--mag-y", "0px");
      };

      node.addEventListener("pointermove", onMove);
      node.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        node.removeEventListener("pointermove", onMove);
        node.removeEventListener("pointerleave", onLeave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useMagnetic;
