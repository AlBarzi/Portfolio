import { useState } from "react";
import type { CSSProperties } from "react";
import { clients } from "../data/profile";
import { useTerminalContext } from "../state/TerminalContext";

const copy = {
  kicker: { en: "Live websites", fr: "Sites en ligne" },
  heading: { en: "Websites in production", fr: "Sites en production" },
  visit: { en: "Visit site", fr: "Voir le site" },
} as const;

const WebsiteCard = ({
  client,
  index,
  lang,
}: {
  client: (typeof clients)[number];
  index: number;
  lang: "en" | "fr";
}) => {
  const [failed, setFailed] = useState(false);

  return (
    <li
      className="site-slot"
      data-reveal
      style={{ "--stagger": index, "--site-tone": client.tone } as CSSProperties}
    >
      <a className="site-card" href={client.url} target="_blank" rel="noopener noreferrer">
        <span className="site-chrome" aria-hidden="true">
          <span className="site-dots">
            <span />
            <span />
            <span />
          </span>
          <span className="site-url">{client.domain}</span>
        </span>

        <span className="site-shot">
          {failed ? (
            <span className="site-fallback" aria-hidden="true">
              {client.domain}
            </span>
          ) : (
            <img
              src={client.image}
              alt={`${client.name} website`}
              loading="lazy"
              onError={() => setFailed(true)}
            />
          )}
          <span className="site-open">{copy.visit[lang]} &#8599;</span>
        </span>

        <span className="site-meta">
          <span className="site-name">{client.name}</span>
          <span className="site-tag">
            {client.tag[lang]}
            <span className="site-dot" aria-hidden="true" />
            {client.year}
          </span>
        </span>
      </a>
    </li>
  );
};

const WebsiteShowcase = () => {
  const { lang } = useTerminalContext();

  return (
    <section className="sites" aria-label={copy.heading[lang]}>
      <div className="sites-head" data-reveal>
        <span className="section-index">{copy.kicker[lang]}</span>
        <span className="section-rule" aria-hidden="true" />
        <span className="section-count">{String(clients.length).padStart(2, "0")}</span>
      </div>

      <ul className="sites-grid">
        {clients.map((client, index) => (
          <WebsiteCard key={client.id} client={client} index={index} lang={lang} />
        ))}
      </ul>
    </section>
  );
};

export default WebsiteShowcase;
