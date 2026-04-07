import { useEffect, useMemo, useRef, useState } from "react";

interface TypewriterOptions {
  speed?: number;
  delay?: number;
  disabled?: boolean;
  onComplete?: () => void;
}

const useTypewriter = (text: string, options?: TypewriterOptions) => {
  const speed = options?.speed ?? 32;
  const delay = options?.delay ?? 0;
  const disabled = options?.disabled ?? false;
  const onComplete = options?.onComplete;

  const chunks = useMemo(() => text.split(/(\s+)/).filter((part) => part.length > 0), [text]);
  const [index, setIndex] = useState(disabled ? chunks.length : 0);
  const completionSentRef = useRef(false);

  const fullText = useMemo(() => text, [text]);

  useEffect(() => {
    if (disabled) {
      setIndex(chunks.length);
      return;
    }

    if (!chunks.length) {
      setIndex(0);
      return;
    }

    setIndex(0);
    completionSentRef.current = false;

    let rafId = 0;
    let start = 0;
    const safeStep = Math.max(10, speed);

    const tick = (timestamp: number) => {
      if (start === 0) start = timestamp;
      const elapsed = timestamp - start;

      if (elapsed < delay) {
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      const progressed = elapsed - delay;
      const nextIndex = Math.min(chunks.length, Math.floor(progressed / safeStep) + 1);
      setIndex((prev) => (prev === nextIndex ? prev : nextIndex));

      if (nextIndex < chunks.length) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [chunks.length, delay, disabled, speed]);

  useEffect(() => {
    if (index >= chunks.length && onComplete && !completionSentRef.current) {
      completionSentRef.current = true;
      onComplete();
    }
  }, [chunks.length, index, onComplete]);

  const renderedText = chunks.length ? chunks.slice(0, index).join("") : fullText;
  const isComplete = index >= chunks.length;

  return {
    text: renderedText,
    isComplete,
  };
};

export default useTypewriter;

