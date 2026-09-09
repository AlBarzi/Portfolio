import type { CSSProperties } from "react";
import { useTerminalContext } from "../state/TerminalContext";
import { profile } from "../data/profile";
import { revealTerminal } from "./Terminal";
import SplitText from "./SplitText";

const stagger = (step: number) => ({ "--d": step } as CSSProperties);

/**
 * Hero d'affiche : intro, titre en trois lignes (pixel, plein, evide),
 * accroche, deux actions. Le pied editorial vit desormais en bas de
 * page (voir HeroFoot) : le hero reste epure et pleine hauteur.
 */
const Hero = () => {
  const { lang, runCommand } = useTerminalContext();
  const headline = profile.headline[lang];

  const run = (id: string) => {
    void runCommand(id, { simulateTyping: true });
    revealTerminal();
  };

  return (
    <header className="hero">
      <p className="hero-intro" style={stagger(0)}>
        <span className="hero-wave" aria-hidden="true">
          &#10035;
        </span>
        {profile.intro[lang]}
      </p>

      {/* key={lang} : le titre rejoue son entree quand la langue change. */}
      <h1 className="hero-title" key={lang}>
        <span className="hero-title-line">
          <SplitText className="hero-title-pixel" text={headline.pixel} />
        </span>
        <span className="hero-title-line">
          <SplitText className="hero-title-solid" text={headline.solid} />
        </span>
        <span className="hero-title-line">
          <SplitText
            className="hero-title-outline"
            text={headline.outline}
            offset={headline.solid.length}
          />
        </span>
      </h1>

      <p className="hero-tagline" style={stagger(1)}>
        {profile.tagline[lang]}
      </p>

      <div className="hero-actions" style={stagger(2)}>
        <button type="button" className="btn btn-solid" data-magnetic onClick={() => run("cv")}>
          <span className="btn-label">{lang === "en" ? "Open resume" : "Ouvrir le CV"}</span>
          <span className="btn-arrow" aria-hidden="true">
            &#8599;
          </span>
        </button>
        <button
          type="button"
          className="btn btn-outline"
          data-magnetic
          onClick={() => run("contact")}
        >
          <span className="btn-label">{lang === "en" ? "Say hello" : "Dire bonjour"}</span>
        </button>
      </div>
    </header>
  );
};

export default Hero;
