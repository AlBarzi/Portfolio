import "./styles/index.css";
import { useRef } from "react";
import { TerminalProvider } from "./state/TerminalContext";
import Hero from "./components/Hero";
import NavBar from "./components/NavBar";
import Terminal from "./components/Terminal";
import useSaberEffects from "./hooks/useSaberEffects";
import useGridTrail from "./hooks/useGridTrail";

const App = () => {
  const { saberRef } = useSaberEffects();
  const gridRef = useRef<HTMLDivElement | null>(null);

  useGridTrail(gridRef);

  return (
    <TerminalProvider>
      <div className="app">
        <div ref={gridRef} className="background-grid" aria-hidden="true" />
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
        <div id="mouse-saber" ref={saberRef} aria-hidden="true" />
      </div>
    </TerminalProvider>
  );
};

export default App;

