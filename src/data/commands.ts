/**
 * Registre de commandes.
 *
 * Source unique alimentant :
 *   - la navbar segmentee
 *   - la command palette (Cmd+K)
 *   - l'autocompletion par Tab
 *   - la suggestion sur commande inconnue
 *   - la sortie de `help`
 *
 * Ajouter une commande ici la rend disponible partout d'un coup.
 */

export type CommandGroup = "navigation" | "games" | "links" | "system";

export interface CommandMeta {
  id: string;
  label: { en: string; fr: string };
  helper: { en: string; fr: string };
  group: CommandGroup;
  /** Mots-cles supplementaires pour la recherche floue. */
  keywords?: string[];
  /** Affiche dans la navbar segmentee. */
  inNav?: boolean;
  /** Masque de la palette et de `help` (alias techniques). */
  hidden?: boolean;
}

export const groupLabels: Record<CommandGroup, { en: string; fr: string }> = {
  navigation: { en: "Navigation", fr: "Navigation" },
  games: { en: "Games", fr: "Jeux" },
  links: { en: "Links", fr: "Liens" },
  system: { en: "System", fr: "Systeme" },
};

export const commandRegistry: CommandMeta[] = [
  {
    id: "about",
    label: { en: "About", fr: "Profil" },
    helper: { en: "Who I am", fr: "Qui je suis" },
    group: "navigation",
    keywords: ["bio", "profile", "intro", "presentation"],
    inNav: true,
  },
  {
    id: "projects",
    label: { en: "Projects", fr: "Projets" },
    helper: { en: "Database and full-stack work", fr: "Travaux base de donnees et full-stack" },
    group: "navigation",
    keywords: ["work", "portfolio", "case study", "realisations", "postgresql", "database"],
    inNav: true,
  },
  {
    id: "websites",
    label: { en: "Websites", fr: "Sites web" },
    helper: { en: "Live client sites shipped", fr: "Sites clients en production" },
    group: "navigation",
    keywords: ["sites", "clients", "web", "marilyns", "bloon", "mare", "gym", "production"],
    inNav: true,
  },
  {
    id: "skills",
    label: { en: "Skills", fr: "Competences" },
    helper: { en: "Languages, DBMS, methods", fr: "Langages, SGBD, methodes" },
    group: "navigation",
    keywords: ["stack", "tech", "tools", "technologies", "sql", "python"],
    inNav: true,
  },
  {
    id: "experience",
    label: { en: "Experience", fr: "Parcours" },
    helper: { en: "Education and roles", fr: "Formation et postes" },
    group: "navigation",
    keywords: ["timeline", "education", "school", "parcours", "cv"],
    inNav: true,
  },
  {
    id: "contact",
    label: { en: "Contact", fr: "Contact" },
    helper: { en: "How to reach me", fr: "Comment me joindre" },
    group: "navigation",
    keywords: ["email", "hire", "reach", "mail", "embauche"],
    inNav: true,
  },
  {
    id: "cv",
    label: { en: "Resume", fr: "CV" },
    helper: { en: "Open the PDF", fr: "Ouvrir le PDF" },
    group: "navigation",
    keywords: ["resume", "pdf", "download"],
    inNav: true,
  },
  {
    id: "docs",
    label: { en: "Docs", fr: "Docs" },
    helper: {
      en: "World Cup report: model, BCNF, SQL",
      fr: "Rapport World Cup : modele, BCNF, SQL",
    },
    group: "navigation",
    inNav: true,
    keywords: [
      "documentation",
      "rapport",
      "report",
      "pdf",
      "worldcup",
      "bcnf",
      "schema",
      "modele",
      "ift2935",
    ],
  },
  {
    id: "worldcup",
    label: { en: "World Cup Manager", fr: "World Cup Manager" },
    helper: {
      en: "Launch the browser build of the project",
      fr: "Lancer la version navigateur du projet",
    },
    group: "navigation",
    keywords: ["football", "soccer", "python", "pygbag", "coupe", "postgresql", "bcnf", "wasm"],
  },

  {
    id: "games",
    label: { en: "Games", fr: "Jeux" },
    helper: { en: "Playable builds and demos", fr: "Realisations jouables et demos" },
    group: "games",
    keywords: ["play", "demos", "jeux", "demo", "jouer", "arcade"],
    inNav: true,
  },
  {
    id: "snake",
    label: { en: "Snake 3310", fr: "Snake 3310" },
    helper: { en: "Nokia recreation", fr: "Recreation Nokia" },
    group: "games",
    keywords: ["nokia", "retro"],
  },
  {
    id: "sudoku",
    label: { en: "Sudoku", fr: "Sudoku" },
    helper: { en: "Generator and solver", fr: "Generateur et solveur" },
    group: "games",
    keywords: ["puzzle", "grid"],
  },
  {
    id: "minesweeper",
    label: { en: "Minesweeper", fr: "Demineur" },
    helper: { en: "Classic flood fill", fr: "Flood fill classique" },
    group: "games",
    keywords: ["mines", "demineur"],
  },

  {
    id: "github",
    label: { en: "GitHub", fr: "GitHub" },
    helper: { en: "Open my repositories", fr: "Ouvrir mes depots" },
    group: "links",
    keywords: ["code", "repo", "source"],
  },
  {
    id: "linkedin",
    label: { en: "LinkedIn", fr: "LinkedIn" },
    helper: { en: "Open my profile", fr: "Ouvrir mon profil" },
    group: "links",
    keywords: ["network", "professional"],
  },
  {
    id: "email",
    label: { en: "Email", fr: "Courriel" },
    helper: { en: "Compose a message", fr: "Ecrire un message" },
    group: "links",
    keywords: ["mail", "write", "contact"],
  },

  {
    id: "help",
    label: { en: "Help", fr: "Aide" },
    helper: { en: "List every command", fr: "Lister les commandes" },
    group: "system",
    keywords: ["commands", "man", "?", "aide"],
  },
  {
    id: "lang",
    label: { en: "Language", fr: "Langue" },
    helper: { en: "Switch EN / FR", fr: "Basculer EN / FR" },
    group: "system",
    keywords: ["language", "francais", "english", "traduction"],
  },
  {
    id: "whoami",
    label: { en: "whoami", fr: "whoami" },
    helper: { en: "One-line identity", fr: "Identite en une ligne" },
    group: "system",
    keywords: ["identity", "user"],
  },
  {
    id: "neofetch",
    label: { en: "neofetch", fr: "neofetch" },
    helper: { en: "System summary card", fr: "Fiche systeme" },
    group: "system",
    keywords: ["fetch", "ascii", "system", "info"],
  },
  {
    id: "ai",
    label: { en: "AI assistant", fr: "Assistant IA" },
    helper: { en: "Local document scanner", fr: "Scan local de documents" },
    group: "system",
    keywords: ["assistant", "rag", "pdf", "openai"],
  },
  {
    id: "clear",
    label: { en: "Clear", fr: "Effacer" },
    helper: { en: "Empty the terminal", fr: "Vider le terminal" },
    group: "system",
    keywords: ["cls", "reset", "wipe"],
  },
];

/** Alias : saisies courantes qui doivent resoudre vers une commande reelle. */
export const commandAliases: Record<string, string> = {
  project: "projects",
  work: "projects",
  site: "websites",
  sites: "websites",
  clients: "websites",
  web: "websites",
  game: "games",
  demos: "games",
  jeux: "games",
  demo: "games",
  jouer: "games",
  doc: "docs",
  documentation: "docs",
  rapport: "docs",
  report: "docs",
  resume: "cv",
  competences: "skills",
  stack: "skills",
  parcours: "experience",
  education: "experience",
  mine: "minesweeper",
  demineur: "minesweeper",
  wc: "worldcup",
  coupe: "worldcup",
  "world-cup": "worldcup",
  cls: "clear",
  man: "help",
  aide: "help",
  "?": "help",
  mail: "email",
  courriel: "email",
  langue: "lang",
  me: "about",
  profil: "about",
};

export const visibleCommands = commandRegistry.filter((command) => !command.hidden);

export const navCommands = commandRegistry.filter((command) => command.inNav);

export const commandIds = commandRegistry.map((command) => command.id);

/** Tous les noms saisissables, alias inclus, pour l'autocompletion. */
export const completionCandidates = [
  ...commandIds,
  ...Object.keys(commandAliases),
].sort();

export const resolveCommand = (raw: string): string => {
  const normalized = raw.trim().toLowerCase();
  return commandAliases[normalized] ?? normalized;
};

/**
 * Recherche floue par sous-sequence.
 * "wcm" trouve "World Cup Manager", "prj" trouve "projects".
 * Le score favorise les correspondances contigues et en debut de mot.
 */
export const fuzzyScore = (needle: string, haystack: string): number => {
  const query = needle.toLowerCase();
  const target = haystack.toLowerCase();
  if (!query) return 1;
  if (target.startsWith(query)) return 1000 - target.length;
  if (target.includes(query)) return 600 - target.indexOf(query);

  let score = 0;
  let cursor = 0;
  let streak = 0;

  for (const char of query) {
    const found = target.indexOf(char, cursor);
    if (found === -1) return -1;
    streak = found === cursor ? streak + 1 : 0;
    score += 10 + streak * 6 - Math.min(found - cursor, 8);
    cursor = found + 1;
  }

  return score;
};

/** Distance de Levenshtein bornee, pour le "did you mean". */
export const editDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
    }
    previous = current;
  }

  return previous[b.length];
};

export const suggestCommand = (input: string): string | null => {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return null;

  let best: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of completionCandidates) {
    const distance = editDistance(normalized, candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }

  // Au-dela de 2 corrections, la suggestion devient du bruit.
  return bestDistance <= 2 ? best : null;
};

/** Plus long prefixe commun, pour la completion partielle facon bash. */
export const commonPrefix = (values: string[]): string => {
  if (!values.length) return "";
  let prefix = values[0];
  for (const value of values.slice(1)) {
    while (!value.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return "";
    }
  }
  return prefix;
};
