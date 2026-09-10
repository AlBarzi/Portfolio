import "./styles/index.css";
import { useRef } from "react";
import { TerminalProvider, useTerminalContext } from "./state/TerminalContext";
import Hero from "./components/Hero";
import HeroFoot from "./components/HeroFoot";
import NavBar from "./components/NavBar";
import Terminal, { STAGE_ID } from "./components/Terminal";
import ProjectFan from "./components/ProjectFan";
import WebsiteShowcase from "./components/WebsiteShowcase";
import Marquee from "./components/Marquee";
import CommandPalette from "./components/CommandPalette";
import useSaberEffects from "./hooks/useSaberEffects";
import useDotField from "./hooks/useDotField";
import useAmbientMotion from "./hooks/useAmbientMotion";
import useReveal from "./hooks/useReveal";
import useMagnetic from "./hooks/useMagnetic";
import { links, profile } from "./data/profile";

const footerLinks = links.filter((link) => link.id !== "phone");

const copy = {
  terminalKicker: { en: "The terminal", fr: "Le terminal" },
  note: { en: "psst, try typing", fr: "psst, essaie de taper" },
} as const;

const Page = () => {
  const { lang } = useTerminalContext();

  useReveal();
  // Les boutons du hero sont remontes au changement de langue.
  useMagnetic([lang]);

  return (
    <div className="app-shell">
      <NavBar />

      <main className="page">
        {/* Le hero reste epingle ; la feuille de contenu remonte par-dessus. */}
        <Hero />

        <div className="sheet">
          <ProjectFan />

          <div className="zigzag" aria-hidden="true" />

          <HeroFoot />
          <Marquee />

          <section className="stage" id={STAGE_ID} aria-label={copy.terminalKicker[lang]} data-reveal>
            <div className="stage-head">
              <span className="section-index">{copy.terminalKicker[lang]}</span>
              <span className="section-rule" aria-hidden="true" />
              <span className="section-count">{profile.promptHost}</span>
            </div>

            <div className="stage-frame">
              <p className="stage-note" aria-hidden="true">
                <span className="stage-note-text">
                  {copy.note[lang]} <code>help</code>
                </span>
                <svg className="stage-note-arrow" viewBox="0 0 80 60" fill="none">
                  <path
                    d="M4 6 C 30 4, 58 14, 66 46"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M56 40 L 66 47 L 72 36"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </p>
              <div className="device">
                <Terminal />
              </div>
            </div>
          </section>

          <WebsiteShowcase />
        </div>
      </main>

      <footer className="footer" data-reveal>
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} {profile.name}. {profile.location}.
        </p>
        <ul className="footer-links">
          {footerLinks.map((link) => (
            <li key={link.id}>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
};

const App = () => {
  const { saberRef } = useSaberEffects();
  const fieldRef = useRef<HTMLCanvasElement | null>(null);

  useDotField(fieldRef);
  useAmbientMotion();

  return (
    <TerminalProvider>
      <div className="app">
        <div className="progress" aria-hidden="true" />
        <canvas ref={fieldRef} className="bg-field" aria-hidden="true" />

        <Page />

        <CommandPalette />
        <div id="mouse-saber" ref={saberRef} aria-hidden="true" />
      </div>
    </TerminalProvider>
  );
};

export default App;
