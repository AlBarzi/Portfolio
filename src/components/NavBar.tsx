import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useTerminalContext } from "../state/TerminalContext";
import { navCommands } from "../data/commands";
import useTabIndicator from "../hooks/useTabIndicator";
import useViewTransition from "../hooks/useViewTransition";

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

const copy = {
  aria: {
    en: "Command shortcuts",
    fr: "Raccourcis de commandes",
  },
  toolbar: {
    en: "Run a command",
    fr: "Lancer une commande",
  },
  idle: {
    en: "Each button runs a command in the terminal.",
    fr: "Chaque bouton lance une commande dans le terminal.",
  },
  busy: {
    en: "running...",
    fr: "execution...",
  },
  palette: {
    en: "Type a command",
    fr: "Tapez une commande",
  },
  paletteShort: {
    en: "Commands",
    fr: "Commandes",
  },
  sigil: {
    en: "shortcuts",
    fr: "raccourcis",
  },
  tipComplete: {
    en: "completes",
    fr: "complete",
  },
  tipHistory: {
    en: "history",
    fr: "historique",
  },
} as const;

/**
 * Barre de commandes.
 *
 * Elle existe pour une raison precise : un recruteur qui ne connait pas
 * le terminal doit pouvoir tout atteindre sans taper une ligne. Trois
 * consequences de design en decoulent :
 *
 *   1. Rien n'est cache. Pas de menu "...", pas de defilement lateral :
 *      si la place manque, la barre passe sur deux rangees et l'ensemble
 *      des sections reste lisible d'un coup d'oeil, telephone compris.
 *   2. Chaque bouton annonce la commande qu'il execute, via la ligne de
 *      statut sous la barre. Le visiteur apprend le terminal en cliquant.
 *   3. Un seul indicateur mesure suit l'onglet courant, y compris quand
 *      il change de rangee.
 */
const NavBar = () => {
  const { runCommand, isTyping, lastCommand, openPalette, isPaletteOpen, lang, setLang } =
    useTerminalContext();

  // Commande survolee ou focalisee : c'est elle qu'annonce la ligne de statut.
  const [hintId, setHintId] = useState<string | null>(null);
  const [rovingIndex, setRovingIndex] = useState(0);

  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const startViewTransition = useViewTransition();

  const activeId = useMemo(
    () => (navCommands.some((command) => command.id === lastCommand) ? lastCommand : null),
    [lastCommand]
  );

  const { containerRef, activeBox, hoverBox, isReady, isIndicatorReady } = useTabIndicator(
    activeId,
    hintId,
    lang
  );

  // Le focus clavier suit l'onglet courant tant que l'utilisateur n'a pas
  // pris la main avec les fleches.
  useEffect(() => {
    const index = navCommands.findIndex((command) => command.id === activeId);
    if (index >= 0) setRovingIndex(index);
  }, [activeId]);

  // Raccourci global vers la palette.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        startViewTransition(openPalette);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openPalette, startViewTransition]);

  const run = useCallback(
    (id: string) => {
      void runCommand(id, { simulateTyping: true });
    },
    [runCommand]
  );

  /**
   * Motif "toolbar" de WAI-ARIA : un seul arret de tabulation pour toute
   * la barre, les fleches deplacent le focus a l'interieur. Sans ca, un
   * utilisateur clavier doit presser Tab sept fois pour traverser la nav.
   */
  const onToolbarKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const last = navCommands.length - 1;
    let next = rovingIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = rovingIndex + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = rovingIndex - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;

    event.preventDefault();
    if (next < 0) next = last;
    if (next > last) next = 0;
    setRovingIndex(next);
    tabRefs.current[next]?.focus();
  };

  const hinted = navCommands.find((command) => command.id === (hintId ?? activeId)) ?? null;

  const indicatorStyle = activeBox
    ? ({
        "--ind-x": `${activeBox.x}px`,
        "--ind-y": `${activeBox.y}px`,
        "--ind-w": `${activeBox.width}px`,
        "--ind-h": `${activeBox.height}px`,
      } as CSSProperties)
    : undefined;

  const hoverStyle = hoverBox
    ? ({
        "--hov-x": `${hoverBox.x}px`,
        "--hov-y": `${hoverBox.y}px`,
        "--hov-w": `${hoverBox.width}px`,
        "--hov-h": `${hoverBox.height}px`,
      } as CSSProperties)
    : undefined;

  return (
    <nav className="nav" aria-label={copy.aria[lang]} data-busy={isTyping || undefined}>
      <div className="nav-bar">
        {/* Sigle : deux caracteres suffisent a annoncer que ces boutons
            appartiennent au terminal et non a un menu de site classique. */}
        <span className="nav-sigil" aria-hidden="true">
          <span className="nav-sigil-glyph">$</span>
          <span className="nav-sigil-caret" />
          <span className="nav-sigil-label">{copy.sigil[lang]}</span>
        </span>

        <div
          className="nav-tabs"
          ref={containerRef}
          role="toolbar"
          aria-label={copy.toolbar[lang]}
          aria-orientation="horizontal"
          data-ready={isReady || undefined}
          onKeyDown={onToolbarKeyDown}
          onMouseLeave={() => setHintId(null)}
        >
          {/* Deux pastilles absolues pour N onglets : l'une marque la
              commande courante, l'autre suit le survol. */}
          <span
            className="nav-indicator"
            style={indicatorStyle}
            data-visible={activeBox ? true : undefined}
            data-armed={isIndicatorReady || undefined}
            aria-hidden="true"
          />
          <span
            className="nav-hover"
            style={hoverStyle}
            data-visible={hoverBox && hintId !== activeId ? true : undefined}
            aria-hidden="true"
          />

          {navCommands.map((command, index) => (
            <button
              key={command.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              className="nav-tab"
              data-command={command.id}
              data-active={command.id === activeId || undefined}
              aria-current={command.id === activeId ? true : undefined}
              tabIndex={index === rovingIndex ? 0 : -1}
              onClick={() => run(command.id)}
              onMouseEnter={() => setHintId(command.id)}
              onFocus={() => {
                setHintId(command.id);
                setRovingIndex(index);
              }}
              onBlur={() => setHintId(null)}
            >
              {command.label[lang]}
            </button>
          ))}
        </div>

        <div className="nav-actions">
          {/* Bascule a deux etats visibles : un bouton unique portant "FR"
              laissait planer le doute sur la langue courante. */}
          <div className="nav-lang" role="group" aria-label="Language / Langue">
            {(["en", "fr"] as const).map((code) => (
              <button
                key={code}
                type="button"
                className="nav-lang-option"
                data-active={lang === code || undefined}
                aria-pressed={lang === code}
                onClick={() => setLang(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Partage son view-transition-name avec la palette : le
              navigateur morphe l'un dans l'autre. */}
          {!isPaletteOpen && (
            <button
              type="button"
              className="nav-command-bar"
              onClick={() => startViewTransition(openPalette)}
            >
              <span className="nav-command-bar-icon" aria-hidden="true">
                &#8250;
              </span>
              <span className="nav-command-bar-label">{copy.palette[lang]}</span>
              <span className="nav-command-bar-label-short" aria-hidden="true">
                {copy.paletteShort[lang]}
              </span>
              <kbd className="nav-kbd">{isMac ? "⌘" : "Ctrl"}K</kbd>
            </button>
          )}
        </div>

        {/* Ligne de statut : l'element qui rend la barre comprehensible
            sans connaitre le terminal. Elle nomme la commande executee. */}
        <p className="nav-status" aria-live="polite">
          {isTyping ? (
            <>
              <span className="nav-status-dollar" aria-hidden="true">
                $
              </span>
              <span className="nav-status-cmd">{copy.busy[lang]}</span>
            </>
          ) : hinted ? (
            <>
              <span className="nav-status-dollar" aria-hidden="true">
                $
              </span>
              <span className="nav-status-cmd">{hinted.id}</span>
              <span className="nav-status-sep" aria-hidden="true">
                &mdash;
              </span>
              <span className="nav-status-text">{hinted.helper[lang]}</span>
            </>
          ) : (
            <span className="nav-status-idle">{copy.idle[lang]}</span>
          )}

          {/* Les deux reflexes qu'un visiteur technique va essayer. Les
              annoncer ici evite de les cacher dans `help`. */}
          <span className="nav-status-tips" aria-hidden="true">
            <span>
              <b>Tab</b> {copy.tipComplete[lang]}
            </span>
            <span>
              <b>&#8593;</b> {copy.tipHistory[lang]}
            </span>
          </span>
        </p>
      </div>
    </nav>
  );
};

export default NavBar;
