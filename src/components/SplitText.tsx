import type { CSSProperties } from "react";

interface SplitTextProps {
  text: string;
  className?: string;
  /** Decale l'index de depart : enchaine plusieurs lignes sans trou. */
  offset?: number;
}

/**
 * Decoupe un texte en caracteres animables. Chaque lettre recoit son
 * index en variable CSS (--i) ; le stagger est calcule en CSS.
 * Le texte complet reste lisible par les lecteurs d'ecran via aria-label.
 */
const SplitText = ({ text, className, offset = 0 }: SplitTextProps) => (
  <span className={className}>
    <span className="sr-only">{text}</span>
    {Array.from(text).map((char, index) => (
      <span
        key={`${index}-${char}`}
        className="char"
        aria-hidden="true"
        style={{ "--i": index + offset } as CSSProperties}
      >
        {char === " " ? "\u00a0" : char}
      </span>
    ))}
  </span>
);

export default SplitText;
