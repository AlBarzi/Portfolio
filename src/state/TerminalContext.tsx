import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import useTerminal from "../hooks/useTerminal";

const TerminalContext = createContext<ReturnType<typeof useTerminal> | null>(null);

export const TerminalProvider = ({ children }: { children: ReactNode }) => {
  const terminal = useTerminal();
  return <TerminalContext.Provider value={terminal}>{children}</TerminalContext.Provider>;
};

export const useTerminalContext = () => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error("useTerminalContext must be used within TerminalProvider");
  }
  return context;
};

