import { useTerminalContext } from "../state/TerminalContext";
import { links, profile, skills } from "../data/profile";

const railLinks = links.filter((link) => link.id !== "phone");
const dataStack = skills.find((group) => group.id === "data")?.items.slice(0, 5) ?? [];

/**
 * Pied editorial : disponibilite, stack principale, liens directs.
 * Detache du hero pour vivre en bas de page, juste avant le terminal.
 */
const HeroFoot = () => {
  const { lang } = useTerminalContext();

  return (
    <div className="hero-foot" data-reveal>
      <p className="hero-based">
        {profile.isAvailable && <span className="hero-status-dot" aria-hidden="true" />}
        {lang === "en" ? "based in" : "base a"} {profile.location}.{" "}
        {profile.isAvailable && (
          <span className="hero-availability">{profile.availability[lang]}</span>
        )}
      </p>

      <ul className="hero-stack" aria-label={lang === "en" ? "Core stack" : "Stack principale"}>
        {dataStack.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <ul className="hero-links" aria-label={lang === "en" ? "Direct links" : "Liens directs"}>
        {railLinks.map((link) => (
          <li key={link.id}>
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              <span className="hero-link-label">{link.label}</span>
              <span className="hero-link-arrow" aria-hidden="true">
                &#8599;
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HeroFoot;
