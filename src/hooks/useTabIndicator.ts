import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";

/**
 * Indicateur glissant mesure.
 *
 * Le probleme : un soulignement anime en CSS pur suppose que tous les
 * onglets ont la meme largeur. Ici les libelles varient ("CV" contre
 * "Experience"), ils changent avec la langue, et la barre passe sur
 * deux rangees des que l'ecran est etroit. Aucune regle statique ne
 * peut suivre ca.
 *
 * La reponse est de mesurer la geometrie reelle de l'onglet cible et de
 * la publier en variables CSS. L'indicateur est un seul element absolu
 * qui interpole entre deux mesures : une seule pastille pour N onglets,
 * et elle sait sauter d'une rangee a l'autre puisqu'on suit aussi Y.
 *
 * Les mesures sont relatives au conteneur (offsetLeft / offsetTop), pas
 * au viewport : la barre reste juste meme quand la page defile ou qu'un
 * ancetre est transforme.
 */

export interface IndicatorBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const sameBox = (a: IndicatorBox | null, b: IndicatorBox | null): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
};

interface IndicatorState {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  activeBox: IndicatorBox | null;
  hoverBox: IndicatorBox | null;
  /** Vrai apres le montage : arme les transitions du survol. */
  isReady: boolean;
  /**
   * Vrai une frame apres la premiere geometrie active connue. Separe de
   * isReady parce que la pastille active apparait souvent bien apres le
   * montage (au premier `runCommand`) : sans ce second drapeau, elle
   * glisserait depuis le coin 0,0 la premiere fois.
   */
  isIndicatorReady: boolean;
}

/**
 * @param activeId  identifiant de l'element courant
 * @param hoverId   identifiant survole ou focalise, s'il y en a un
 * @param revision  valeur a changer pour forcer une remesure (ex : la langue)
 */
const useTabIndicator = (
  activeId: string | null,
  hoverId: string | null,
  revision?: unknown
): IndicatorState => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeBox, setActiveBox] = useState<IndicatorBox | null>(null);
  const [hoverBox, setHoverBox] = useState<IndicatorBox | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isIndicatorReady, setIsIndicatorReady] = useState(false);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const read = (id: string | null): IndicatorBox | null => {
      if (!id) return null;
      const escaped = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(id) : id;
      const node = container.querySelector<HTMLElement>(`[data-command="${escaped}"]`);
      if (!node) return null;
      return {
        x: node.offsetLeft,
        y: node.offsetTop,
        width: node.offsetWidth,
        height: node.offsetHeight,
      };
    };

    // Comparaison avant setState : un ResizeObserver peut tirer plusieurs
    // fois par frame, et re-rendre pour une geometrie identique est du bruit.
    const nextActive = read(activeId);
    const nextHover = read(hoverId);
    setActiveBox((prev) => (sameBox(prev, nextActive) ? prev : nextActive));
    setHoverBox((prev) => (sameBox(prev, nextHover) ? prev : nextHover));
  }, [activeId, hoverId, revision]);

  // Avant peinture : la pastille est deja au bon endroit a la premiere frame.
  useLayoutEffect(() => {
    measure();
  }, [measure]);

  // Largeur du conteneur, passage sur deux rangees, zoom navigateur.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    let frame = 0;
    const observer = new ResizeObserver(() => {
      // Remesurer dans la frame suivante : mesurer pendant le layout
      // declenche l'avertissement de boucle et aggrave le thrash.
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });

    observer.observe(container);
    for (const child of Array.from(container.children)) observer.observe(child);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [measure]);

  // Les polices web arrivent apres le premier rendu et changent les
  // largeurs : sans cette passe, la pastille reste calee sur le fallback.
  useEffect(() => {
    if (typeof document === "undefined" || !("fonts" in document)) return;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
    };
  }, [measure]);

  // Une frame apres le montage : le survol peut glisser.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Une frame apres la premiere geometrie active : la pastille courante
  // apparait sur place, puis glisse a chaque changement suivant.
  useEffect(() => {
    if (isIndicatorReady || !activeBox) return;
    const frame = requestAnimationFrame(() => setIsIndicatorReady(true));
    return () => cancelAnimationFrame(frame);
  }, [activeBox, isIndicatorReady]);

  return { containerRef, activeBox, hoverBox, isReady, isIndicatorReady };
};

export default useTabIndicator;
