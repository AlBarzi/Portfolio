import { useCallback, useState } from "react";
import type { CommandHistoryEntry } from "../types/terminal";

let historyId = 0;

const createHistoryEntry = (input: string): CommandHistoryEntry => ({
  id: `history-${historyId++}`,
  input,
  timestamp: Date.now(),
});

const useCommandHistory = () => {
  const [entries, setEntries] = useState<CommandHistoryEntry[]>([]);
  const [cursor, setCursor] = useState<number>(-1);

  const addEntry = useCallback((input: string) => {
    setEntries((prev) => [...prev, createHistoryEntry(input)]);
    setCursor(-1);
  }, []);

  const getPrevious = useCallback(() => {
    if (!entries.length) return null;
    const nextIndex = cursor === -1 ? entries.length - 1 : Math.max(0, cursor - 1);
    setCursor(nextIndex);
    return entries[nextIndex]?.input ?? null;
  }, [cursor, entries]);

  const getNext = useCallback(() => {
    if (!entries.length) return null;
    if (cursor === -1) return "";
    const nextIndex = cursor + 1;
    if (nextIndex >= entries.length) {
      setCursor(-1);
      return "";
    }
    setCursor(nextIndex);
    return entries[nextIndex]?.input ?? "";
  }, [cursor, entries]);

  return {
    entries,
    cursor,
    addEntry,
    getPrevious,
    getNext,
  };
};

export default useCommandHistory;

