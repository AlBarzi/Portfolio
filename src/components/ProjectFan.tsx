import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { commandRegistry } from "../data/commands";
import { useTerminalContext } from "../state/TerminalContext";
import { revealTerminal } from "./Terminal";

/**
 * Eventail de cartes : une par realisation ouvrable depuis le terminal.
 * Chaque carte est un bouton qui lance la commande correspondante ; la
 * couleur est purement editoriale (palette neutre, un rouge brique).
 */
const FAN: Array<{ id: string; tone: string; ink: "light" | "dark"; index: string }> = [
  { id: "worldcup", tone: "#1c1c1c", ink: "light", index: "01" },
  { id: "docs", tone: "#e8e6e0", ink: "dark", index: "02" },
  { id: "projects", tone: "#b83a24", ink: "light", index: "03" },
  { id: "snake", tone: "#4f5b34", ink: "light", index: "04" },
  { id: "sudoku", tone: "#33465a", ink: "light", index: "05" },
  { id: "minesweeper", tone: "#d9c7a3", ink: "dark", index: "06" },
];

const copy = {
  label: { en: "Open in the terminal", fr: "Ouvrir dans le terminal" },
  heading: { en: "Things you can open", fr: "Ce que vous pouvez ouvrir" },
  kicker: { en: "Selected work", fr: "Travaux choisis" },
} as const;

const ProjectFan = () => {
  const { lang, runCommand } = useTerminalContext();

  const cards = FAN.map((entry) => ({
    ...entry,
    meta: commandRegistry.find((command) => command.id === entry.id),
  })).filter((entry) => entry.meta);

  const run = (id: string) => {
    void runCommand(id, { simulateTyping: true });
    revealTerminal();
  };

  // Inclinaison 3D : la carte suit le curseur, le reflet aussi.
  const onTilt = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const node = event.currentTarget;
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    node.style.setProperty("--tilt-x", `${((py - 0.5) * -14).toFixed(2)}deg`);
    node.style.setProperty("--tilt-y", `${((px - 0.5) * 14).toFixed(2)}deg`);
    node.style.setProperty("--shine-x", `${(px * 100).toFixed(1)}%`);
    node.style.setProperty("--shine-y", `${(py * 100).toFixed(1)}%`);
  };

  const onTiltEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const node = event.currentTarget;
    node.style.setProperty("--tilt-x", "0deg");
    node.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <section className="fan" aria-label={copy.heading[lang]} data-reveal>
      <div className="fan-head">
        <span className="section-index">{copy.kicker[lang]}</span>
        <span className="section-rule" aria-hidden="true" />
        <span className="section-count">{String(cards.length).padStart(2, "0")}</span>
      </div>

      <ul className="fan-deck" style={{ "--fan-count": cards.length } as CSSProperties}>
        {cards.map((card, position) => (
          <li
            key={card.id}
            className="fan-slot"
            style={
              {
                "--fan-i": position,
                "--fan-tone": card.tone,
              } as CSSProperties
            }
          >
            <button
              type="button"
              className="fan-card"
              data-ink={card.ink}
              onClick={() => run(card.id)}
              onPointerMove={onTilt}
              onPointerLeave={onTiltEnd}
              aria-label={`${card.meta!.label[lang]}: ${copy.label[lang]}`}
            >
              <span className="fan-card-shine" aria-hidden="true" />
              <span className="fan-card-index">{card.index}</span>
              <span className="fan-card-body">
                <span className="fan-card-title">{card.meta!.label[lang]}</span>
                <span className="fan-card-helper">{card.meta!.helper[lang]}</span>
              </span>
              <span className="fan-card-cmd">$ {card.id}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ProjectFan;
