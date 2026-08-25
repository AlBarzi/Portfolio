import "./styles/index.css";
import { useRef } from "react";
import { TerminalProvider } from "./state/TerminalContext";
import Hero from "./components/Hero";
import NavBar from "./components/NavBar";
import Terminal from "./components/Terminal";
import CommandPalette from "./components/CommandPalette";
import useSaberEffects from "./hooks/useSaberEffects";
import useDotField from "./hooks/useDotField";

const App = () => {
  const { saberRef } = useSaberEffects();
  const fieldRef = useRef<HTMLCanvasElement | null>(null);

  useDotField(fieldRef);

  return (
    <TerminalProvider>
      <div className="app">
        <div className="aurora" aria-hidden="true" />
        <canvas ref={fieldRef} className="bg-field" aria-hidden="true" />
        <div className="vignette" aria-hidden="true" />

        <div className="app-shell">
          <NavBar />
          <div className="content-grid">
            <aside className="left-rail">
              <Hero />
            </aside>
            <section className="right-rail">
              <Terminal />
            </section>
          </div>
        </div>

        <CommandPalette />
        <div id="mouse-saber" ref={saberRef} aria-hidden="true" />
      </div>
    </TerminalProvider>
  );
};

export default App;
