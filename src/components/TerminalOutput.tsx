import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTerminalContext } from "../state/TerminalContext";
import TerminalLine from "./TerminalLine";

const TerminalOutput = () => {
  const { output } = useTerminalContext();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const completedIdsRef = useRef<Set<string>>(new Set());
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (output.length === 0) {
      completedIdsRef.current.clear();
      setRevealedCount(0);
      return;
    }

    setRevealedCount((prev) => {
      if (prev === 0) return 1;
      const clamped = Math.min(prev, output.length);
      const visible = output.slice(0, clamped);
      const allVisibleDone = visible.every((line) => completedIdsRef.current.has(line.id));

      if (clamped < output.length && allVisibleDone) {
        return clamped + 1;
      }

      return clamped;
    });
  }, [output.length]);

  const handleLineComplete = useCallback((lineId: string) => {
    if (completedIdsRef.current.has(lineId)) return;
    completedIdsRef.current.add(lineId);
    setRevealedCount((prev) => Math.min(output.length, prev + 1));
  }, [output.length]);

  const visibleLines = useMemo(() => output.slice(0, revealedCount), [output, revealedCount]);
  const activeLineId = useMemo(
    () => visibleLines.find((line) => !completedIdsRef.current.has(line.id))?.id,
    [visibleLines]
  );

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [output]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new MutationObserver(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: "auto" });
    });

    observer.observe(container, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="output" ref={scrollRef} role="log" aria-live="polite">
      {visibleLines.map((line) => (
        <TerminalLine
          key={line.id}
          line={line}
          isActive={!completedIdsRef.current.has(line.id) && line.id === activeLineId}
          onComplete={handleLineComplete}
        />
      ))}
    </div>
  );
};

export default TerminalOutput;

