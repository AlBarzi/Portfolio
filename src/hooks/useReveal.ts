import { useEffect } from "react";

/**
 * Revelation au defilement.
 *
 * Chaque element portant [data-reveal] recoit [data-inview] la premiere
 * fois qu'il entre dans le viewport ; le CSS fait le reste. En mouvement
 * reduit (ou sans IntersectionObserver), tout est revele d'un coup :
 * un contenu ne doit jamais dependre d'une animation pour apparaitre.
 */
const useReveal = (deps: unknown[] = []) => {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      nodes.forEach((node) => node.setAttribute("data-inview", ""));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-inview", "");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );

    nodes.forEach((node) => {
      if (node.hasAttribute("data-inview")) return;
      observer.observe(node);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useReveal;
