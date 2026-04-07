export type TerminalTone = "muted" | "accent" | "warning" | "info";
export type TerminalLineType = "text" | "html";

export interface TerminalLine {
  id: string;
  type: TerminalLineType;
  content: string;
  tone?: TerminalTone;
  typed?: boolean;
}

export interface CommandHistoryEntry {
  id: string;
  input: string;
  timestamp: number;
}

export interface CommandContext {
  openLink: (href: string) => void;
  openCv: () => void;
  openAiPopup: () => void;
}

export type CommandHandler = (context: CommandContext) => TerminalLine[] | Promise<TerminalLine[]>;


