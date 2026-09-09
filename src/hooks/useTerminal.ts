import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { CommandHandler, CommandContext, Lang, TerminalLine } from "../types/terminal";
import useCommandHistory from "./useCommandHistory";
import { fetchCoursePlans, type CoursePlanFile } from "../services/coursePlansApi";
import {
  demos,
  education,
  experience,
  links,
  profile,
  projects,
  skills,
  strengths,
  worldCupDoc,
} from "../data/profile";
import {
  commonPrefix,
  completionCandidates,
  groupLabels,
  resolveCommand,
  suggestCommand,
  visibleCommands,
  type CommandGroup,
} from "../data/commands";

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

/**
 * Une commande citee dans la sortie devient un bouton reel.
 *
 * Sans ca, lire `worldcup` dans la liste des projets ne menait nulle part :
 * il fallait deviner qu'on pouvait la retaper. Le clic est capte par
 * delegation dans TerminalOutput, ce qui evite d'attacher un listener a
 * chaque ligne rendue en HTML.
 */
const cmdButton = (id: string, label?: string) =>
  `<button type="button" class="cmd-link" data-run="${id}">${escapeHtml(label ?? id)}</button>`;

const promptLabel = `${profile.promptHost}:~$`;
const shortPromptLabel = "~$";
// Deux variantes rendues cote a cote : le CSS bascule sur la version
// courte sous 820px, ou le prompt complet ne tient pas dans le terminal.
const promptMarkup =
  `<span class="prompt">` +
  `<span class="prompt-full">${promptLabel}</span>` +
  `<span class="prompt-short">${shortPromptLabel}</span>` +
  `</span>`;

const cvPath = "/cv.pdf";
const docsPath = worldCupDoc.href;
const fallbackWorldCupPath = "/games/worldcup/index.html";
const configuredWorldCupUrl = (import.meta.env.VITE_WORLDCUP_URL ?? "").trim();
const gamePaths = {
  sudoku: "/games/sudoku/index.html",
  snake: "/games/snake/index.html",
  minesweeper: "/games/minesweeper/index.html",
  worldcup: configuredWorldCupUrl || fallbackWorldCupPath,
} as const;

const LANG_STORAGE_KEY = "portfolio.lang";

const readStoredLang = (): Lang => {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
  if (stored === "en" || stored === "fr") return stored;
  return navigator.language?.toLowerCase().startsWith("fr") ? "fr" : "en";
};

/** Petit dictionnaire pour les chaines d'interface du terminal. */
const ui = {
  bootTitle: {
    en: "Welcome. This portfolio is driven by commands.",
    fr: "Bienvenue. Ce portfolio se pilote a la commande.",
  },
  bootHint: {
    en: "Click any command in the output to run it, press <span class=\"kbd\">Tab</span> to complete, or hit <span class=\"kbd\">\u2318K</span> for the palette.",
    fr: "Cliquez une commande dans la sortie pour l'executer, <span class=\"kbd\">Tab</span> complete, <span class=\"kbd\">\u2318K</span> ouvre la palette.",
  },
  unknown: {
    en: (cmd: string) => `Unknown command: ${cmd}`,
    fr: (cmd: string) => `Commande inconnue : ${cmd}`,
  },
  didYouMean: {
    en: (cmd: string) => `Did you mean '${cmd}'? Type 'help' for the full list.`,
    fr: (cmd: string) => `Vouliez-vous dire '${cmd}' ? Tapez 'help' pour la liste complete.`,
  },
  noMatch: {
    en: "Type 'help' to see every available command.",
    fr: "Tapez 'help' pour voir toutes les commandes.",
  },
  openingCv: { en: "Opening resume PDF...", fr: "Ouverture du CV en PDF..." },
  launching: { en: "Launching", fr: "Lancement de" },
  blockedHint: {
    en: "If the redirect is blocked, use this link:",
    fr: "Si la redirection est bloquee, utilisez ce lien :",
  },
  langSwitched: {
    en: "Language set to English.",
    fr: "Langue definie sur le francais.",
  },
  availability: { en: "Availability", fr: "Disponibilite" },
  location: { en: "Location", fr: "Localisation" },
  strengthsLabel: { en: "Strengths", fr: "Forces" },
  stackLabel: { en: "Stack", fr: "Stack" },
  helpIntro: {
    en: "Commands are grouped by intent. Tab completes, arrows browse history.",
    fr: "Les commandes sont groupees par intention. Tab complete, les fleches parcourent l'historique.",
  },
} as const;

const useTerminal = () => {
  const [lang, setLangState] = useState<Lang>(readStoredLang);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<TerminalLine[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
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

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(LANG_STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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

  const createAiMessage = useCallback(
    (role: LocalAiMessage["role"], content: string): LocalAiMessage => ({
      id: `ai-line-${aiMessageIdRef.current++}`,
      role,
      content,
    }),
    []
  );

  const refreshCoursePlans = useCallback(async () => {
    setIsCoursePlansLoading(true);
    setCoursePlansError(null);

    try {
      const payload = await fetchCoursePlans();
      setCoursePlanFiles(payload.files);
      if (payload.baseDir) setCoursePlanBaseDir(payload.baseDir);
      if (payload.errors.length) setCoursePlansError(payload.errors.join(", "));
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
          "Assistant local actif. Dossier scanne : docs/plans-de-cours (via serveur local)."
        ),
      ];
    });
  }, [createAiMessage, refreshCoursePlans]);

  const closeAiPopup = useCallback(() => setIsAiPopupOpen(false), []);
  const openPalette = useCallback(() => setIsPaletteOpen(true), []);
  const closePalette = useCallback(() => setIsPaletteOpen(false), []);

  const askAi = useCallback(() => {
    const question = aiInput.trim();
    if (!question) return;

    const total = coursePlanFiles.length;
    const matching = coursePlanFiles.filter((file) =>
      file.name.toLowerCase().includes(question.toLowerCase())
    );

    const answer = matching.length
      ? `J'ai trouve ${matching.length} plan(s) correspondant a votre recherche : ${matching
          .map((file) => file.name)
          .slice(0, 4)
          .join(", ")}.`
      : `J'ai scanne ${total} plan(s) de cours. Aucun nom de PDF ne correspond directement a votre recherche.`;

    setAiInput("");
    setAiMessages((previous) => [
      ...previous,
      createAiMessage("user", question),
      createAiMessage("assistant", answer),
    ]);
  }, [aiInput, coursePlanFiles, createAiMessage]);

  const commandContext = useMemo<CommandContext>(
    () => ({ lang, openLink, openCv, openAiPopup, setLang }),
    [lang, openAiPopup, openCv, openLink, setLang]
  );

  const launchGame = useCallback(
    (key: keyof typeof gamePaths, label: string, activeLang: Lang) => {
      window.setTimeout(() => openInSameTab(gamePaths[key]), 320);
      return [
        createLine(`${ui.launching[activeLang]} ${label}...`, { tone: "accent", typed: true }),
        createLine(
          `${ui.blockedHint[activeLang]} <a href="${gamePaths[key]}">${label}</a>`,
          { type: "html" }
        ),
      ];
    },
    [openInSameTab]
  );

  const commands = useMemo<Record<string, CommandHandler>>(() => {
    const table: Record<string, CommandHandler> = {
      help: (context) => {
        const active = context.lang;
        const lines: TerminalLine[] = [
          createLine(ui.helpIntro[active], { tone: "muted", typed: true }),
          createLine("", {}),
        ];

        const order: CommandGroup[] = ["navigation", "games", "links", "system"];
        for (const group of order) {
          const entries = visibleCommands.filter((command) => command.group === group);
          if (!entries.length) continue;

          lines.push(
            createLine(`<span class="line-heading">${groupLabels[group][active]}</span>`, {
              type: "html",
            })
          );

          for (const entry of entries) {
            lines.push(
              createLine(
                cmdButton(entry.id) +
                  `<span class="line-dash"></span>` +
                  `<span class="line-desc">${entry.helper[active]}</span>`,
                { type: "html" }
              )
            );
          }
          lines.push(createLine("", {}));
        }

        return lines;
      },

      about: (context) => {
        const active = context.lang;
        return [
          createLine(profile.name, { tone: "accent", typed: true }),
          createLine(profile.role[active], { typed: true }),
          createLine(`${profile.degree[active]} — ${profile.graduated[active]}`, { tone: "muted" }),
          createLine("", {}),
          createLine(profile.summary[active], { typed: true }),
          createLine("", {}),
          createLine(
            `<span class="line-cmd">${ui.location[active]}</span>` +
              `<span class="line-dash"></span>` +
              `<span class="line-desc">${profile.location}</span>`,
            { type: "html" }
          ),
          createLine(
            `<span class="line-cmd">${ui.availability[active]}</span>` +
              `<span class="line-dash"></span>` +
              `<span class="line-desc">${profile.availability[active]}</span>`,
            { type: "html" }
          ),
          createLine(
            `<span class="line-cmd">${ui.strengthsLabel[active]}</span>` +
              `<span class="line-dash"></span>` +
              `<span class="line-desc">${strengths[active].join(" · ")}</span>`,
            { type: "html" }
          ),
        ];
      },

      projects: (context) => {
        const active = context.lang;
        const lines: TerminalLine[] = [];

        projects.forEach((project, index) => {
          const anchors: string[] = [];
          if (project.repo) {
            anchors.push(
              `<a href="${project.repo}" target="_blank" rel="noopener noreferrer">source</a>`
            );
          }
          if (project.command) {
            anchors.push(cmdButton(project.command));
          }
          if (project.docsCommand) {
            anchors.push(
              cmdButton(
                project.docsCommand,
                active === "en" ? "documentation" : "documentation"
              )
            );
          }

          lines.push(
            createLine(
              `<span class="project-name">${project.name[active]}</span>` +
                `<span class="project-year">${project.period}</span>`,
              { type: "html" }
            )
          );
          lines.push(createLine(project.context[active], { tone: "muted" }));
          lines.push(createLine("", {}));

          project.highlights[active].forEach((highlight, position) => {
            lines.push(
              createLine(
                `<span class="bullet-mark">&#9656;</span>` +
                  `<span class="bullet-text">${highlight}</span>`,
                { type: "html", typed: index === 0 && position === 0 }
              )
            );
          });

          lines.push(
            createLine(
              `<span class="project-stack">${project.stack.join(" · ")}</span>` +
                (anchors.length ? `<span class="project-links">${anchors.join(" ")}</span>` : ""),
              { type: "html" }
            )
          );
          lines.push(createLine("", {}));
        });

        lines.push(
          createLine(
            (active === "en"
              ? "Smaller playable builds live under "
              : "Les realisations jouables plus courtes sont sous ") + cmdButton("games") + ".",
            { type: "html", tone: "muted" }
          )
        );

        return lines;
      },

      games: (context) => {
        const active = context.lang;
        return [
          createLine(
            active === "en"
              ? `${demos.length} playable builds. Click one to launch it.`
              : `${demos.length} realisations jouables. Cliquez pour lancer.`,
            { tone: "muted", typed: true }
          ),
          createLine("", {}),
          ...demos.flatMap((demo) => [
            createLine(
              cmdButton(demo.id) +
                `<span class="line-dash"></span>` +
                `<span class="line-desc">${demo.summary[active]}</span>`,
              { type: "html" }
            ),
            createLine(
              `<span class="bullet-mark">&#9656;</span>` +
                `<span class="bullet-text"><span class="project-stack">${demo.stack.join(
                  " \u00b7 "
                )}</span></span>`,
              { type: "html" }
            ),
          ]),
          createLine("", {}),
          // World Cup n'est pas une demo, mais sa version navigateur est
          // jouable : on la signale ici plutot que de la classer en jeu.
          createLine(
            (active === "en"
              ? "The World Cup project also has a browser build: "
              : "Le projet World Cup a aussi une version navigateur : ") +
              cmdButton("worldcup"),
            { type: "html", tone: "muted" }
          ),
        ];
      },

      skills: (context) => {
        const active = context.lang;
        return skills.map((group) =>
          createLine(
            `<span class="line-cmd">${group.label[active]}</span>` +
              `<span class="line-dash"></span>` +
              `<span class="line-desc">${group.items.join(" · ")}</span>`,
            { type: "html" }
          )
        );
      },

      experience: (context) => {
        const active = context.lang;
        const section = (label: string, entries: typeof education) => [
          createLine(`<span class="line-heading">${label}</span>`, { type: "html" }),
          ...entries.flatMap((entry) => [
            createLine(
              `<span class="project-name">${entry.title[active]}</span>` +
                `<span class="project-year">${entry.period}</span>`,
              { type: "html" }
            ),
            createLine(`${entry.org} — ${entry.place}`, { tone: "muted" }),
            ...entry.detail[active].map((detail) =>
              createLine(
                `<span class="bullet-mark">&#9656;</span>` +
                  `<span class="bullet-text">${detail}</span>`,
                { type: "html" }
              )
            ),
            createLine("", {}),
          ]),
        ];

        return [
          ...section(active === "en" ? "Education" : "Etudes", education),
          ...section(
            active === "en" ? "Professional experience" : "Experiences professionnelles",
            experience
          ),
        ];
      },

      contact: (context) => {
        const active = context.lang;
        return [
          createLine(
            active === "en"
              ? "The fastest way to reach me is email. I answer within a day."
              : "Le plus rapide est le courriel. Je reponds sous 24 heures.",
            { typed: true }
          ),
          createLine("", {}),
          ...links.map((link) =>
            createLine(
              `<span class="line-cmd">${link.label}</span>` +
                `<span class="line-dash"></span>` +
                `<a href="${link.href}" target="_blank" rel="noopener noreferrer">${link.handle}</a>`,
              { type: "html" }
            )
          ),
        ];
      },

      cv: (context) => {
        context.openCv();
        return [
          createLine(ui.openingCv[context.lang], { typed: true }),
          createLine(
            `<a href="${cvPath}" target="_blank" rel="noopener noreferrer">cv.pdf</a>`,
            { type: "html" }
          ),
        ];
      },

      github: (context) => {
        const target = links.find((link) => link.id === "github");
        if (target) context.openLink(target.href);
        return [createLine("github.com/razere", { tone: "accent", typed: true })];
      },

      linkedin: (context) => {
        const target = links.find((link) => link.id === "linkedin");
        if (target) context.openLink(target.href);
        return [createLine("LinkedIn", { tone: "accent", typed: true })];
      },

      email: (context) => {
        const target = links.find((link) => link.id === "email");
        if (target) context.openLink(target.href);
        return [createLine(target?.handle ?? "", { tone: "accent", typed: true })];
      },

      lang: (context) => {
        const next: Lang = context.lang === "en" ? "fr" : "en";
        context.setLang(next);
        return [createLine(ui.langSwitched[next], { tone: "success", typed: true })];
      },

      whoami: () => [
        createLine(`${profile.shortName.toLowerCase()} — ${profile.role.en.toLowerCase()}`, {
          tone: "accent",
          typed: true,
        }),
      ],

      neofetch: (context) => {
        const active = context.lang;
        const rows = [
          ["host", profile.promptHost],
          ["role", profile.role[active]],
          ["degree", profile.degree[active]],
          ["location", profile.location],
          ["stack", "React · TypeScript · Vite"],
          ["projects", String(projects.length)],
          ["shell", "portfolio-term 2.0"],
        ];

        return [
          createLine(
            `<div class="neofetch">` +
              `<pre class="neofetch-art">   ______\n  / ____ \\\n / /    \\ \\\n| |  ..  | |\n| |  \\/  | |\n \\ \\____/ /\n  \\______/</pre>` +
              `<div class="neofetch-rows">` +
              rows
                .map(
                  ([key, value]) =>
                    `<span class="neofetch-key">${key}</span><span class="neofetch-value">${value}</span>`
                )
                .join("") +
              `</div></div>`,
            { type: "html" }
          ),
        ];
      },

      ai: (context) => {
        context.openAiPopup();
        return [
          createLine(
            context.lang === "en"
              ? "Opening the local document assistant..."
              : "Ouverture de l'assistant local de documents...",
            { tone: "info", typed: true }
          ),
        ];
      },

      docs: (context) => {
        const active = context.lang;
        const openLabel =
          active === "en"
            ? `Open the report (PDF, ${worldCupDoc.pages} pages)`
            : `Ouvrir le rapport (PDF, ${worldCupDoc.pages} pages)`;

        return [
          createLine(worldCupDoc.title[active], { tone: "accent", typed: true }),
          createLine(`${worldCupDoc.course} — ${worldCupDoc.date[active]}`, { tone: "muted" }),
          createLine(
            (active === "en" ? "Team project — " : "Projet d'equipe — ") +
              worldCupDoc.authors.join(", "),
            { tone: "muted" }
          ),
          createLine("", {}),
          createLine(
            `<span class="line-heading">${
              active === "en" ? "Contents" : "Sommaire"
            }</span>`,
            { type: "html" }
          ),
          ...worldCupDoc.sections.flatMap((section, index) => [
            createLine(
              `<span class="doc-index">${index + 1}</span>` +
                `<span class="doc-label">${section.label[active]}</span>`,
              { type: "html" }
            ),
            createLine(
              `<span class="bullet-mark">&#9656;</span>` +
                `<span class="bullet-text">${section.summary[active]}</span>`,
              { type: "html" }
            ),
          ]),
          createLine("", {}),
          createLine(
            `<a href="${docsPath}" target="_blank" rel="noopener noreferrer">${openLabel}</a>` +
              `<span class="project-links">${
                active === "en" ? "run the project: " : "lancer le projet : "
              }${cmdButton("worldcup")}</span>`,
            { type: "html" }
          ),
        ];
      },

      clear: () => {
        setOutput([]);
        return [];
      },
    };

    table.sudoku = (context) => launchGame("sudoku", "Sudoku", context.lang);
    table.snake = (context) => launchGame("snake", "Snake 3310", context.lang);
    table.minesweeper = (context) => launchGame("minesweeper", "Minesweeper", context.lang);
    table.worldcup = (context) => [
      ...launchGame("worldcup", "World Cup Manager", context.lang),
      createLine(
        (context.lang === "en"
          ? "Database report, model and SQL: "
          : "Rapport de base de donnees, modele et SQL : ") + cmdButton("docs"),
        { type: "html", tone: "muted" }
      ),
    ];

    return table;
  }, [launchGame]);

  const appendLines = useCallback((lines: TerminalLine[]) => {
    if (!lines.length) return;
    setOutput((prev) => [...prev, ...lines]);
  }, []);

  const appendEcho = useCallback(
    (value: string) => {
      appendLines([
        createLine(`${promptMarkup} <span class="command-text">${escapeHtml(value)}</span>`, {
          type: "html",
          tone: "muted",
        }),
      ]);
    },
    [appendLines]
  );

  const executeCommand = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      appendEcho(trimmed);
      addEntry(trimmed);

      const [word] = trimmed.split(/\s+/);
      const normalized = resolveCommand(word);
      const handler = commands[normalized];

      if (!handler) {
        const suggestion = suggestCommand(word);
        appendLines([
          createLine(ui.unknown[lang](word), { tone: "warning", typed: true }),
          createLine(
            suggestion ? ui.didYouMean[lang](suggestion) : ui.noMatch[lang],
            { tone: "muted" }
          ),
        ]);
        return;
      }

      setLastCommand(normalized);
      const result = await handler(commandContext);
      appendLines(result);
    },
    [addEntry, appendEcho, appendLines, commandContext, commands, lang]
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
          await sleep(22);
        }
        await sleep(90);
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

  /**
   * Completion facon shell : Tab complete jusqu'au plus long prefixe
   * commun, un second Tab liste les candidats restants.
   */
  const completeInput = useCallback(() => {
    const current = input.trim().toLowerCase();
    if (!current) return;

    const matches = completionCandidates.filter((candidate) => candidate.startsWith(current));
    if (!matches.length) return;

    if (matches.length === 1) {
      setInput(matches[0]);
      return;
    }

    const prefix = commonPrefix(matches);
    if (prefix.length > current.length) {
      setInput(prefix);
      return;
    }

    appendLines([
      createLine(`${promptMarkup} <span class="command-text">${escapeHtml(current)}</span>`, {
        type: "html",
        tone: "muted",
      }),
      createLine(
        matches.map((match) => `<span class="line-cmd">${match}</span>`).join(" "),
        { type: "html" }
      ),
    ]);
  }, [appendLines, input]);

  /** Suggestion fantome affichee en gris derriere la saisie. */
  const ghostSuggestion = useMemo(() => {
    const current = input.toLowerCase();
    if (!current.trim() || current.includes(" ")) return "";
    const match = completionCandidates.find((candidate) => candidate.startsWith(current));
    return match && match !== current ? match.slice(current.length) : "";
  }, [input]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Tab") {
        event.preventDefault();
        completeInput();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        void runCommand(input);
        setInput("");
        return;
      }

      // Ctrl+L : vider, comme dans un vrai shell.
      if (event.key.toLowerCase() === "l" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setOutput([]);
        return;
      }

      // Ctrl+C : abandonner la ligne en cours.
      if (event.key.toLowerCase() === "c" && event.ctrlKey) {
        event.preventDefault();
        appendEcho(`${input}^C`);
        setInput("");
        return;
      }

      if (event.key === "ArrowRight" && ghostSuggestion) {
        const caretAtEnd = event.currentTarget.selectionStart === input.length;
        if (caretAtEnd) {
          event.preventDefault();
          setInput(input + ghostSuggestion);
          return;
        }
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
    [appendEcho, completeInput, getNext, getPrevious, ghostSuggestion, input, runCommand]
  );

  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    setOutput([
      createLine(ui.bootTitle[lang], { typed: true }),
      createLine(ui.bootHint[lang], { type: "html" }),
      createLine("", {}),
      // Quatre portes d'entree cliquables : un visiteur qui ne tape pas
      // de commandes a quand meme un premier geste evident.
      createLine(
        (lang === "en" ? "Start here: " : "Commencez ici : ") +
          [
            cmdButton("about"),
            cmdButton("projects"),
            cmdButton("docs"),
            cmdButton("games"),
            cmdButton("help"),
          ].join('<span class="line-sep">\u00b7</span>'),
        { type: "html" }
      ),
    ]);
  }, [lang]);

  return {
    lang,
    setLang,
    promptLabel,
    shortPromptLabel,
    input,
    output,
    isTyping,
    lastCommand,
    ghostSuggestion,
    isPaletteOpen,
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
    openPalette,
    closePalette,
    closeAiPopup,
    refreshCoursePlans,
  };
};

export default useTerminal;
