import { useCallback, useEffect, useRef } from "react";
import { useTerminalContext } from "../state/TerminalContext";

// Elements qui doivent pouvoir garder le focus : sans cette liste,
// la refocalisation automatique du terminal rend la navigation
// clavier (Tab) et les boutons de la nav inutilisables.
const INTERACTIVE_SELECTOR =
  'a[href], button, input, select, textarea, summary, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

const isInteractive = (node: EventTarget | null): boolean => {
  if (!(node instanceof Element)) return false;
  return Boolean(node.closest(INTERACTIVE_SELECTOR));
};

// Sur mobile, focaliser l'input au chargement ouvre le clavier virtuel
// qui recouvre la moitie de l'ecran. On laisse l'utilisateur decider.
const prefersManualFocus = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

const TerminalInput = () => {
  const {
    input,
    setInput,
    promptLabel,
    shortPromptLabel,
    handleKeyDown,
    isTyping,
    isAiPopupOpen,
    isPaletteOpen,
    ghostSuggestion,
    lang,
  } = useTerminalContext();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const mirrorRef = useRef<HTMLSpanElement | null>(null);
  const caretRef = useRef<HTMLSpanElement | null>(null);

  const isBlocked = isAiPopupOpen || isPaletteOpen;

  const updateCaret = () => {
    const inputElement = inputRef.current;
    const mirror = mirrorRef.current;
    const caret = caretRef.current;
    if (!inputElement || !mirror || !caret) return;

    const cursorPosition = inputElement.selectionStart ?? inputElement.value.length;
    mirror.textContent = inputElement.value.slice(0, cursorPosition);
    caret.style.left = `${mirror.offsetWidth}px`;
  };

  const focusInput = useCallback(() => {
    const inputElement = inputRef.current;
    if (!inputElement || isTyping || isBlocked) return;
    // Ne pas arracher le focus a un bouton que l'utilisateur vient
    // d'atteindre au clavier (ex : Entree sur un bouton de la nav).
    const active = document.activeElement;
    if (active && active !== inputElement && isInteractive(active)) return;
    if (active !== inputElement) {
      // Le terminal est sous le hero : le focus ne doit jamais faire
      // defiler la page a l'insu du visiteur (revealTerminal s'en charge).
      inputElement.focus({ preventScroll: true });
    }
    const length = inputElement.value.length;
    inputElement.setSelectionRange(length, length);
    updateCaret();
  }, [isBlocked, isTyping]);

  useEffect(() => {
    if (isBlocked || prefersManualFocus()) return;
    focusInput();
  }, [focusInput, isBlocked]);

  useEffect(() => {
    updateCaret();
  }, [input, isTyping]);

  useEffect(() => {
    if (isBlocked) return;

    // Un clic dans le vide ramene le curseur dans le terminal, mais on
    // ne vole jamais le focus d'un element interactif.
    const onPointerDown = (event: PointerEvent) => {
      if (isInteractive(event.target)) return;
      window.setTimeout(() => focusInput(), 0);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [focusInput, isBlocked]);

  return (
    <div className={`input-row${isTyping ? " is-typing" : ""}${isBlocked ? " is-disabled" : ""}`}>
      <span className="prompt" aria-hidden="true">
        <span className="prompt-full">{promptLabel}</span>
        <span className="prompt-short">{shortPromptLabel}</span>
      </span>

      <div className="input-wrap">
        <span ref={mirrorRef} className="input-mirror" aria-hidden="true" />
        <span ref={caretRef} className="input-caret" aria-hidden="true" />

        {/* Suggestion fantome : le reste de la commande en gris,
            validable par la fleche droite. */}
        {ghostSuggestion && !isTyping && (
          <span className="input-ghost" aria-hidden="true">
            <span className="input-ghost-typed">{input}</span>
            <span className="input-ghost-rest">{ghostSuggestion}</span>
          </span>
        )}

        <input
          ref={inputRef}
          id="command-input"
          type="text"
          value={input}
          disabled={isTyping || isBlocked}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={updateCaret}
          onClick={updateCaret}
          onSelect={updateCaret}
          onFocus={updateCaret}
          onBlur={(event) => {
            if (isBlocked) return;
            // Si le focus part vers un element interactif (Tab vers la nav,
            // clic sur un bouton), on le laisse partir.
            if (isInteractive(event.relatedTarget)) return;
            if (prefersManualFocus()) return;
            window.setTimeout(() => focusInput(), 0);
          }}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label={lang === "en" ? "Terminal command" : "Commande du terminal"}
        />
      </div>
    </div>
  );
};

export default TerminalInput;
