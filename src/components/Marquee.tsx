import { skills, strengths } from "../data/profile";
import { useTerminalContext } from "../state/TerminalContext";

/**
 * Bandeau defilant : la stack et les forces, en boucle. Deux copies de
 * la meme liste, et une translation de -50% : la boucle est invisible.
 */
const Marquee = () => {
  const { lang } = useTerminalContext();

  const items = [
    ...skills.filter((group) => group.id !== "spoken").flatMap((group) => group.items),
    ...strengths[lang],
  ];

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((copy) =>
          items.map((item) => (
            <span key={`${copy}-${item}`} className="marquee-item">
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default Marquee;
