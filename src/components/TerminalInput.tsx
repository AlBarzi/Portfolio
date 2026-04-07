import { useCallback, useEffect, useRef } from "react";
import { useTerminalContext } from "../state/TerminalContext";

const TerminalInput = () => {
  const { input, setInput, promptLabel, handleKeyDown, isTyping, isAiPopupOpen } = useTerminalContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mirrorRef = useRef<HTMLSpanElement | null>(null);
  const caretRef = useRef<HTMLSpanElement | null>(null);

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
    if (!inputElement || isTyping || isAiPopupOpen) return;
    if (document.activeElement !== inputElement) {
      inputElement.focus();
    }
    const length = inputElement.value.length;
    inputElement.setSelectionRange(length, length);
    updateCaret();
  }, [isAiPopupOpen, isTyping]);

  useEffect(() => {
    if (isAiPopupOpen) return;
    focusInput();
  }, [focusInput, isAiPopupOpen]);

  useEffect(() => {
    updateCaret();
  }, [input, isTyping]);

  useEffect(() => {
    if (isAiPopupOpen) return;

    const scheduleFocus = () => {
      window.setTimeout(() => {
        focusInput();
      }, 0);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        scheduleFocus();
      }
    };

    window.addEventListener("pointerdown", scheduleFocus);
    window.addEventListener("keydown", scheduleFocus);
    window.addEventListener("focus", scheduleFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("pointerdown", scheduleFocus);
      window.removeEventListener("keydown", scheduleFocus);
      window.removeEventListener("focus", scheduleFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [focusInput, isAiPopupOpen]);

  return (
    <div className={`input-row${isTyping ? " is-typing" : ""}${isAiPopupOpen ? " is-disabled" : ""}`}>
      <span className="prompt" aria-hidden="true">
        {promptLabel}
      </span>
      <div className="input-wrap">
        <span ref={mirrorRef} className="input-mirror" aria-hidden="true" />
        <span ref={caretRef} className="input-caret" aria-hidden="true" />
        <input
          ref={inputRef}
          id="command-input"
          type="text"
          value={input}
          disabled={isTyping || isAiPopupOpen}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={updateCaret}
          onClick={updateCaret}
          onSelect={updateCaret}
          onFocus={updateCaret}
          onBlur={() => {
            if (isAiPopupOpen) return;
            window.setTimeout(() => {
              focusInput();
            }, 0);
          }}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Terminal command"
        />
      </div>
    </div>
  );
};

export default TerminalInput;

