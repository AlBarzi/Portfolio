import { useEffect, useRef } from "react";
import useTypewriter from "../hooks/useTypewriter";
import type { TerminalLine as TerminalLineType } from "../types/terminal";

interface TerminalLineProps {
  line: TerminalLineType;
  isActive: boolean;
  onComplete: (id: string) => void;
}

const TerminalLine = ({ line, isActive, onComplete }: TerminalLineProps) => {
  const doneRef = useRef(false);

  const { text, isComplete } = useTypewriter(line.content, {
    disabled: !isActive || !line.typed || line.type === "html",
    speed: 26,
    onComplete: () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onComplete(line.id);
    },
  });

  useEffect(() => {
    if (!isActive && !line.typed && !doneRef.current) {
      doneRef.current = true;
      onComplete(line.id);
    }
  }, [isActive, line.id, line.typed, onComplete]);

  useEffect(() => {
    if (line.type === "html" && !doneRef.current) {
      doneRef.current = true;
      onComplete(line.id);
    }
  }, [line.id, line.type, onComplete]);

  useEffect(() => {
    if (isActive && isComplete && !doneRef.current) {
      doneRef.current = true;
      onComplete(line.id);
    }
  }, [isActive, isComplete, line.id, onComplete]);

  if (line.type === "html") {
    return (
      <div
        className={`line${line.tone ? ` ${line.tone}` : ""}`}
        dangerouslySetInnerHTML={{ __html: line.content }}
      />
    );
  }

  return <div className={`line${line.tone ? ` ${line.tone}` : ""}`}>{text}</div>;
};

export default TerminalLine;

