import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { CommandHandler, CommandContext, TerminalLine } from "../types/terminal";
import useCommandHistory from "./useCommandHistory";
import { fetchCoursePlans, type CoursePlanFile } from "../services/coursePlansApi";

interface LocalAiMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
}

let lineId = 0;
const createLine = (content: string, options?: Partial<TerminalLine>): TerminalLine => ({
  id: `line-${lineId++}`,
  type: options?.type ?? "text",
  content,
  tone: options?.tone,
  typed: options?.typed ?? false,
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");


const promptLabel = "ammouri@portfolio:~$";
const cvPath = "/cv.pdf";
const fallbackWorldCupPath = "/games/worldcup/index.html";
const configuredWorldCupUrl = (import.meta.env.VITE_WORLDCUP_URL ?? "").trim();
const gamePaths = {
  sudoku: "/games/sudoku/index.html",
  snake: "/games/snake/index.html",
  minesweeper: "/games/minesweeper/index.html",
  worldcup: configuredWorldCupUrl || fallbackWorldCupPath,
} as const;

const useTerminal = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<TerminalLine[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAiPopupOpen, setIsAiPopupOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<LocalAiMessage[]>([]);
  const [coursePlanFiles, setCoursePlanFiles] = useState<CoursePlanFile[]>([]);
  const [coursePlanBaseDir, setCoursePlanBaseDir] = useState("docs/plans-de-cours");
  const [isCoursePlansLoading, setIsCoursePlansLoading] = useState(false);
  const [coursePlansError, setCoursePlansError] = useState<string | null>(null);
  const typingLock = useRef(false);
  const aiMessageIdRef = useRef(0);

  const { addEntry, getPrevious, getNext } = useCommandHistory();

  const openLink = useCallback((href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
  }, []);

  const openCv = useCallback(() => {
    const popup = window.open(cvPath, "_blank", "noopener,noreferrer");
    if (popup) return;
    const fallback = document.createElement("a");
    fallback.href = cvPath;
    fallback.target = "_blank";
    fallback.rel = "noopener noreferrer";
    fallback.click();
  }, []);

  const openInSameTab = useCallback((href: string) => {
    window.location.assign(href);
  }, []);

  const createAiMessage = useCallback((role: LocalAiMessage["role"], content: string): LocalAiMessage => ({
    id: `ai-line-${aiMessageIdRef.current++}`,
    role,
    content,
  }), []);

  const refreshCoursePlans = useCallback(async () => {
    setIsCoursePlansLoading(true);
    setCoursePlansError(null);

    try {
      const payload = await fetchCoursePlans();
      setCoursePlanFiles(payload.files);
      if (payload.baseDir) {
        setCoursePlanBaseDir(payload.baseDir);
      }
      if (payload.errors.length) {
        setCoursePlansError(payload.errors.join(", "));
      }
    } catch {
      setCoursePlansError("scan_unavailable");
      setCoursePlanFiles([]);
    } finally {
      setIsCoursePlansLoading(false);
    }
  }, []);

  const openAiPopup = useCallback(() => {
    setIsAiPopupOpen(true);
    void refreshCoursePlans();
    setAiMessages((previous) => {
      if (previous.length) return previous;
      return [
        createAiMessage(
          "assistant",
          "Assistant IA local actif. Dossier scanne: docs/plans-de-cours (via serveur local)."
        ),
      ];
    });
  }, [createAiMessage, refreshCoursePlans]);

  const closeAiPopup = useCallback(() => {
    setIsAiPopupOpen(false);
  }, []);

  const askAi = useCallback(() => {
    const question = aiInput.trim();
    if (!question) return;

    const total = coursePlanFiles.length;
    const matching = coursePlanFiles.filter((file) =>
      file.name.toLowerCase().includes(question.toLowerCase())
    );

    const answer = matching.length
      ? `J'ai trouve ${matching.length} plan(s) correspondant a votre recherche: ${matching
          .map((file) => file.name)
          .slice(0, 4)
          .join(", ")}.`
      : `J'ai scanne ${total} plan(s) de cours. Aucun nom de PDF ne correspond directement a votre recherche pour l'instant.`;

    setAiInput("");
    setAiMessages((previous) => [
      ...previous,
      createAiMessage("user", question),
      createAiMessage("assistant", answer),
    ]);
  }, [aiInput, coursePlanFiles, createAiMessage]);

  const commandContext = useMemo<CommandContext>(
    () => ({
      openLink,
      openCv,
      openAiPopup,
    }),
    [openAiPopup, openCv, openLink]
  );

  const commands = useMemo<Record<string, CommandHandler>>(
    () => ({
      help: () => [
        createLine("Available commands:", { tone: "info", typed: true }),
        createLine("- help: show this help", { typed: true }),
        createLine("- about: quick introduction", { typed: true }),
        createLine("- projects: list portfolio projects", { typed: true }),
        createLine("- games: list interactive demos", { typed: true }),
        createLine("- worldcup: World Cup Manager demo (coming soon)", { typed: true }),
        createLine("- ai: AI related work", { typed: true }),
        createLine("- cv: open resume PDF", { typed: true }),
        createLine("- clear: clear terminal output", { typed: true }),
      ],
      about: () => [
        createLine("Hi, I am Ramzy Youcef Ammouri.", { tone: "accent", typed: true }),
        createLine("Front-end developer focused on UX quality and performance.", { typed: true }),
        createLine("I build modern interfaces with polished interactions.", { typed: true }),
      ],
      projects: () => [
        createLine("Projects:", { tone: "info", typed: true }),
        createLine("1) Terminal Portfolio (this website)", { typed: true }),
        createLine("2) World Cup Manager (command: worldcup)", { typed: true }),
        createLine("3) Additional case studies coming soon", { typed: true }),
      ],
      games: () => [
        createLine("Games:", { tone: "info", typed: true }),
        createLine("- Sudoku (command: sudoku)", { typed: true }),
        createLine("- Snake (command: snake)", { typed: true }),
        createLine("- Minesweeper (command: minesweeper)", { typed: true }),
        createLine("- World Cup Manager Python WASM (command: worldcup)", { typed: true }),
        createLine("Run one of these commands to open the game in this tab.", { typed: true, tone: "muted" }),
      ],
      sudoku: () => {
        window.setTimeout(() => openInSameTab(gamePaths.sudoku), 320);
        return [
          createLine("Launching Sudoku...", { tone: "accent", typed: true }),
          createLine(
            `If redirect is blocked, use: <a href="${gamePaths.sudoku}">Open Sudoku</a>`,
            { type: "html" }
          ),
        ];
      },
      snake: () => {
        window.setTimeout(() => openInSameTab(gamePaths.snake), 320);
        return [
          createLine("Launching Snake...", { tone: "accent", typed: true }),
          createLine(
            `If redirect is blocked, use: <a href="${gamePaths.snake}">Open Snake</a>`,
            { type: "html" }
          ),
        ];
      },
      minesweeper: () => {
        window.setTimeout(() => openInSameTab(gamePaths.minesweeper), 320);
        return [
          createLine("Launching Minesweeper...", { tone: "accent", typed: true }),
          createLine(
            `If redirect is blocked, use: <a href="${gamePaths.minesweeper}">Open Minesweeper</a>`,
            { type: "html" }
          ),
        ];
      },
      worldcup: () => [
        createLine("World Cup Manager — coming soon.", { tone: "accent", typed: true }),
        createLine("This interactive demo is currently being set up. Check back later.", { typed: true, tone: "muted" }),
      ],
      ai: () => [
        createLine("AI assistant — coming soon.", { tone: "info", typed: true }),
        createLine("This feature is currently under development.", { typed: true, tone: "muted" }),
      ],
      cv: () => {
        openCv();
        return [
          createLine("Opening resume PDF...", { typed: true }),
          createLine(
            `Direct link: <a href="${cvPath}" target="_blank" rel="noopener noreferrer">Open resume</a>`,
            { type: "html", typed: false }
          ),
        ];
      },
      clear: () => {
        setOutput([]);
        return [];
      },
    }),
    [openCv]
  );

  const appendLines = useCallback((lines: TerminalLine[]) => {
    if (!lines.length) return;
    setOutput((prev) => [...prev, ...lines]);
  }, []);

  const appendEcho = useCallback((value: string) => {
    const safeCommand = escapeHtml(value);
    appendLines([
      createLine(
        `<span class="prompt">${promptLabel}</span> <span class="command-text">${safeCommand}</span>`,
        { type: "html", tone: "muted" }
      ),
    ]);
  }, [appendLines]);

  const executeCommand = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      appendEcho(trimmed);
      addEntry(trimmed);

      const [command] = trimmed.split(/\s+/);
      const aliasMap: Record<string, string> = {
        project: "projects",
        game: "games",
        jeux: "games",
        resume: "cv",
        sudokugame: "sudoku",
        mine: "minesweeper",
        wc: "worldcup",
        wordlcup: "worldcup",
        coupe: "worldcup",
        "world-cup": "worldcup",
        cls: "clear",
      };
      const normalizedCommand = aliasMap[command.toLowerCase()] ?? command.toLowerCase();
      const handler = commands[normalizedCommand];

      if (!handler) {
        appendLines([
          createLine(`Unknown command: ${command}. Type 'help' to see available commands.`, {
            tone: "warning",
            typed: true,
          }),
        ]);
        return;
      }

      const result = await handler(commandContext);
      appendLines(result);
    },
    [addEntry, appendEcho, appendLines, commandContext, commands]
  );

  const runCommand = useCallback(
    async (raw: string, options?: { simulateTyping?: boolean }) => {
      if (!raw.trim()) return;

      if (options?.simulateTyping) {
        if (typingLock.current) return;
        typingLock.current = true;
        setIsTyping(true);
        setInput("");

        for (let i = 0; i < raw.length; i += 1) {
          setInput(raw.slice(0, i + 1));
          await sleep(28);
        }
        await sleep(120);
        await executeCommand(raw);
        setInput("");
        setIsTyping(false);
        typingLock.current = false;
        return;
      }

      await executeCommand(raw);
    },
    [executeCommand]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        void runCommand(input);
        setInput("");
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const previous = getPrevious();
        if (previous !== null) setInput(previous);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const next = getNext();
        if (next !== null) setInput(next);
      }
    },
    [getNext, getPrevious, input, runCommand]
  );

  const bootMessage = useMemo(() => [
    createLine("Welcome to my portfolio terminal.", { typed: true }),
    createLine("Type 'help' or use the quick command bar above.", { typed: true }),
  ], []);

  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    setOutput(bootMessage);
  }, [bootMessage]);

  return {
    promptLabel,
    input,
    output,
    isTyping,
    isAiPopupOpen,
    aiInput,
    aiMessages,
    coursePlanFiles,
    coursePlanBaseDir,
    isCoursePlansLoading,
    coursePlansError,
    setInput,
    setAiInput,
    runCommand,
    handleKeyDown,
    askAi,
    closeAiPopup,
    refreshCoursePlans,
  };
};

export default useTerminal;

