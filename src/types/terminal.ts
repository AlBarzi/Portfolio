export type TerminalTone = "muted" | "accent" | "warning" | "info" | "success";
export type TerminalLineType = "text" | "html";

export type Lang = "en" | "fr";

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
  lang: Lang;
  openLink: (href: string) => void;
  openCv: () => void;
  openAiPopup: () => void;
  setLang: (lang: Lang) => void;
}

export type CommandHandler = (context: CommandContext) => TerminalLine[] | Promise<TerminalLine[]>;
