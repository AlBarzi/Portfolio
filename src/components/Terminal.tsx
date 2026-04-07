import TerminalInput from "./TerminalInput";
import TerminalOutput from "./TerminalOutput";
import AiPopup from "./AiPopup";

const Terminal = () => {
  return (
    <section className="terminal" aria-label="Interactive terminal">
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

