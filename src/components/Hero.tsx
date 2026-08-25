import { useTerminalContext } from "../state/TerminalContext";
import { links, profile, skills } from "../data/profile";

const railLinks = links.filter((link) => link.id !== "phone");
const dataStack = skills.find((group) => group.id === "data")?.items.slice(0, 5) ?? [];

/**
 * Rail gauche : identite, disponibilite, stack donnees, liens directs.
 */
const Hero = () => {
  const { lang, runCommand } = useTerminalContext();

  return (
    <header className="hero">
      <div className="hero-identity">
        <p className="hero-eyebrow">{profile.role[lang]}</p>
        <h1 className="hero-name">{profile.name}</h1>
        <p className="hero-degree">{profile.degree[lang]}</p>
        <p className="hero-graduated">{profile.graduated[lang]}</p>
      </div>

      {profile.isAvailable && (
        <p className="hero-status">
          <span className="hero-status-dot" aria-hidden="true" />
          {profile.availability[lang]}
        </p>
      )}

      <ul className="hero-stack" aria-label={lang === "en" ? "Core stack" : "Stack principale"}>
        {dataStack.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="hero-links">
        {railLinks.map((link) => (
          <a key={link.id} href={link.href} target="_blank" rel="noopener noreferrer">
            <span className="hero-link-label">{link.label}</span>
            <span className="hero-link-handle">{link.handle}</span>
            <span className="hero-link-arrow" aria-hidden="true">
              &#8599;
            </span>
          </a>
        ))}
      </div>

      <button
        type="button"
        className="hero-cta"
        onClick={() => void runCommand("cv", { simulateTyping: true })}
      >
        {lang === "en" ? "Open resume" : "Ouvrir le CV"}
      </button>
    </header>
  );
};

export default Hero;
