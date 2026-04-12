import { useState } from "react";
import { useTerminalContext } from "../state/TerminalContext";

const navItems = [
  { label: "Help", command: "help", helper: "Quick guide" },
  { label: "CV", command: "cv", helper: "PDF resume" },
  { label: "About", command: "about", helper: "Profile" },
  { label: "Projects", command: "projects", helper: "Portfolio work" },
  { label: "Games", command: "games", helper: "Interactive demos" },
  { label: "AI", command: "ai", helper: "Experiments" },
];

const gameItems = [
  { label: "Sudoku", command: "sudoku" },
  { label: "Snake", command: "snake" },
  { label: "Minesweeper", command: "minesweeper" },
  { label: "WorldCup", command: "worldcup" },
];

const NavBar = () => {
  const { runCommand, isTyping } = useTerminalContext();
  const [isGamesMenuOpen, setIsGamesMenuOpen] = useState(false);

  const handleMainAction = (command: string) => {
    if (command === "games") {
      void runCommand("games", { simulateTyping: true });
      setIsGamesMenuOpen((prev) => !prev);
      return;
    }

    setIsGamesMenuOpen(false);
    void runCommand(command, { simulateTyping: true });
  };

  const handleGameAction = (command: string) => {
    setIsGamesMenuOpen(false);
    void runCommand(command, { simulateTyping: true });
  };

  return (
    <nav className="nav-wrapper" aria-label="Quick command navigation">
      <div className="nav-hint">One click simulates typing and runs the command in the terminal.</div>
      <div className="nav-bar">
        <div className="nav-group">
          {navItems.map((item) => (
            <button
              key={item.command}
              type="button"
              className="nav-button"
              onClick={() => handleMainAction(item.command)}
              disabled={isTyping}
              aria-expanded={item.command === "games" ? isGamesMenuOpen : undefined}
            >
              <span className="nav-copy">
                <span className="nav-label">{item.label}</span>
                <span className="nav-helper">{item.helper}</span>
              </span>
              <span className="nav-command">${item.command}</span>
            </button>
          ))}
        </div>
      </div>
      {isGamesMenuOpen && (
        <div className="games-menu" role="menu" aria-label="Game commands">
          {gameItems.map((game) => (
            <button
              key={game.command}
              type="button"
              className="game-option"
              onClick={() => handleGameAction(game.command)}
              disabled={isTyping}
            >
              {game.label}
              <span className="game-option-command">${game.command}</span>
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavBar;

