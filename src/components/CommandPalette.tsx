import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTerminalContext } from "../state/TerminalContext";
import useViewTransition from "../hooks/useViewTransition";
import {
  fuzzyScore,
  groupLabels,
  visibleCommands,
  type CommandGroup,
  type CommandMeta,
} from "../data/commands";

const GROUP_ORDER: CommandGroup[] = ["navigation", "games", "links", "system"];

const CommandPalette = () => {
  const { isPaletteOpen, closePalette, runCommand, lang } = useTerminalContext();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const startViewTransition = useViewTransition();

  /** Resultats tries par score, puis regroupes en conservant l'ordre. */
  const results = useMemo(() => {
    const scored = visibleCommands
      .map((command) => {
        const haystacks = [
          command.id,
          command.label[lang],
          command.helper[lang],
          ...(command.keywords ?? []),
        ];
        const score = Math.max(...haystacks.map((value) => fuzzyScore(query, value)));
        return { command, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    if (query.trim()) {
      return [{ group: null as CommandGroup | null, items: scored.map((entry) => entry.command) }];
    }

    return GROUP_ORDER.map((group) => ({
      group,
      items: scored.filter((entry) => entry.command.group === group).map((entry) => entry.command),
    })).filter((section) => section.items.length > 0);
  }, [lang, query]);

  const flatResults = useMemo(
    () => results.flatMap((section) => section.items),
    [results]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isPaletteOpen) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setActiveIndex(0);
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [isPaletteOpen]);

  const dismiss = useCallback(() => {
    // La palette se replie dans la pilule : meme view-transition-name
    // des deux cotes, le navigateur interpole la geometrie.
    startViewTransition(closePalette);
    window.setTimeout(() => restoreFocusRef.current?.focus(), 0);
  }, [closePalette, startViewTransition]);

  const select = useCallback(
    (command: CommandMeta) => {
      startViewTransition(closePalette);
      void runCommand(command.id, { simulateTyping: true });
    },
    [closePalette, runCommand, startViewTransition]
  );

  // Focus trap : Tab et Shift+Tab bouclent a l'interieur du dialogue.
  useEffect(() => {
    if (!isPaletteOpen) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
        return;
      }

      if (event.key === "Tab") {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'input, button, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % Math.max(flatResults.length, 1));
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex(
          (prev) => (prev - 1 + Math.max(flatResults.length, 1)) % Math.max(flatResults.length, 1)
        );
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const target = flatResults[activeIndex];
        if (target) select(target);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, dismiss, flatResults, isPaletteOpen, select]);

  // Garder l'element actif visible pendant la navigation clavier.
  useEffect(() => {
    if (!isPaletteOpen) return;
    const node = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isPaletteOpen]);

  if (!isPaletteOpen) return null;

  let runningIndex = -1;

  return (
    <div className="palette-overlay" role="presentation" onMouseDown={dismiss}>
      <div
        ref={dialogRef}
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label={lang === "en" ? "Command palette" : "Palette de commandes"}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="palette-search">
          <span className="palette-search-icon" aria-hidden="true">
            &#8250;
          </span>
          <input
            ref={inputRef}
            type="text"
            className="palette-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              lang === "en" ? "Search commands, projects, links..." : "Rechercher une commande..."
            }
            aria-label={lang === "en" ? "Search commands" : "Rechercher une commande"}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="palette-kbd">esc</kbd>
        </div>

        <div className="palette-list" ref={listRef} role="listbox" aria-label="Commands">
          {flatResults.length === 0 && (
            <p className="palette-empty">
              {lang === "en" ? "No matching command." : "Aucune commande correspondante."}
            </p>
          )}

          {results.map((section) => (
            <div className="palette-section" key={section.group ?? "results"}>
              {section.group && (
                <p className="palette-section-label">{groupLabels[section.group][lang]}</p>
              )}
              {section.items.map((command) => {
                runningIndex += 1;
                const index = runningIndex;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={command.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    data-active={isActive}
                    className="palette-item"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => select(command)}
                  >
                    <span className="palette-item-label">{command.label[lang]}</span>
                    <span className="palette-item-helper">{command.helper[lang]}</span>
                    <span className="palette-item-command">{command.id}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="palette-footer">
          <span>
            <kbd className="palette-kbd">&#8593;</kbd>
            <kbd className="palette-kbd">&#8595;</kbd>
            {lang === "en" ? "navigate" : "naviguer"}
          </span>
          <span>
            <kbd className="palette-kbd">&#8629;</kbd>
            {lang === "en" ? "run" : "executer"}
          </span>
          <span>
            <kbd className="palette-kbd">esc</kbd>
            {lang === "en" ? "close" : "fermer"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
