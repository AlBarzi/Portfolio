import { useCallback } from "react";
import { flushSync } from "react-dom";

/**
 * Enveloppe de l'API View Transitions.
 *
 * Le navigateur prend un instantane avant et apres la mise a jour du
 * DOM, puis interpole entre les deux. Les elements partageant un meme
 * `view-transition-name` sont morphes l'un dans l'autre : c'est ce qui
 * fait que la pilule de recherche se deploie en palette au lieu
 * d'apparaitre par-dessus.
 *
 * flushSync est indispensable : sans lui React programme le rendu apres
 * la capture de l'instantane, et la transition n'a rien a interpoler.
 *
 * Repli sur les navigateurs sans support : la mise a jour est appliquee
 * directement et l'animation CSS d'entree prend le relais.
 */

type ViewTransitionCapableDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

export const supportsViewTransitions = () =>
  typeof document !== "undefined" &&
  typeof (document as ViewTransitionCapableDocument).startViewTransition === "function";

const useViewTransition = () => {
  return useCallback((update: () => void) => {
    const doc = document as ViewTransitionCapableDocument;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!doc.startViewTransition || reducedMotion) {
      update();
      return;
    }

    doc.startViewTransition(() => {
      flushSync(update);
    });
  }, []);
};

export default useViewTransition;
