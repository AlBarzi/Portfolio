import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useRef } from "react";
import { useTerminalContext } from "../state/TerminalContext";

const AiPopup = () => {
  const {
    isAiPopupOpen,
    aiInput,
    aiMessages,
    coursePlanFiles,
    coursePlanBaseDir,
    isCoursePlansLoading,
    coursePlansError,
    setAiInput,
    askAi,
    closeAiPopup,
    refreshCoursePlans,
  } = useTerminalContext();

  const feedRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isAiPopupOpen) return;
    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [isAiPopupOpen]);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    feed.scrollTop = feed.scrollHeight;
  }, [aiMessages]);

  useEffect(() => {
    if (!isAiPopupOpen) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAiPopup();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeAiPopup, isAiPopupOpen]);

  if (!isAiPopupOpen) return null;

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    askAi();
  };

  return (
    <div className="ai-popup-overlay" role="presentation">
      <div className="ai-popup" role="dialog" aria-modal="true" aria-label="Assistant IA">
        <div className="ai-popup-header">
          <strong>Assistant IA</strong>
          <div className="ai-popup-actions">
            <button type="button" className="ai-refresh" onClick={() => void refreshCoursePlans()}>
              Rafraichir scan
            </button>
            <button type="button" className="ai-close" onClick={closeAiPopup}>
              Fermer
            </button>
          </div>
        </div>

        <div className="ai-upload-row">
          <span className="ai-upload-count">Dossier: {coursePlanBaseDir}</span>
          <span className="ai-upload-count">PDF detectes: {coursePlanFiles.length}</span>
        </div>
        {isCoursePlansLoading && <p className="ai-import-message">Scan des PDF en cours...</p>}
        {coursePlansError && <p className="ai-import-message">Erreur scan: {coursePlansError}</p>}

        <div className="ai-popup-feed" ref={feedRef}>
          {coursePlanFiles.slice(0, 8).map((file) => (
            <div key={file.relativePath} className="ai-message assistant">
              <span className="ai-role">Plan</span>
              <p>{file.name}</p>
            </div>
          ))}
          {aiMessages.map((message) => (
            <div key={message.id} className={`ai-message ${message.role}`}>
              <span className="ai-role">{message.role === "assistant" ? "IA" : "Vous"}</span>
              <p>{message.content}</p>
            </div>
          ))}
        </div>

        <div className="ai-popup-input-row">
          <input
            ref={inputRef}
            type="text"
            value={aiInput}
            onChange={(event) => setAiInput(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Posez une question (mode local)"
            aria-label="Question pour l'assistant IA"
          />
          <button type="button" onClick={askAi} disabled={!aiInput.trim()}>
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiPopup;

