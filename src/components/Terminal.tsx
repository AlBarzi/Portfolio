import TerminalInput from "./TerminalInput";
import TerminalOutput from "./TerminalOutput";
import AiPopup from "./AiPopup";

export const TERMINAL_ID = "terminal";
export const STAGE_ID = "stage";

/**
 * Le terminal vit maintenant sous le hero. Toute commande lancee depuis
 * la page (nav, cartes, boutons) doit y amener le regard, sinon l'action
 * semble n'avoir rien fait. On vise la section (titre inclus), avec une
 * marge pour la nav collante (scroll-margin-top en CSS).
 */
export const revealTerminal = () => {
  const node = document.getElementById(STAGE_ID) ?? document.getElementById(TERMINAL_ID);
  if (!node) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  node.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
};

const Terminal = () => {
  return (
    <section className="terminal" id={TERMINAL_ID} aria-label="Interactive terminal">
      <div className="terminal-header">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <span className="title">ammouri@portfolio</span>
      </div>
      <div className="terminal-body">
        <TerminalOutput />
        <TerminalInput />
      </div>
      <AiPopup />
    </section>
  );
};

export default Terminal;

