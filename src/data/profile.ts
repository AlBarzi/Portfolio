/**
 * Faits de profil, transcrits depuis le CV.
 *
 * Point d'entree unique : tout ce qui te concerne se modifie ici,
 * jamais dans un composant ou dans la logique du terminal.
 */

export interface ProfileLink {
  id: string;
  label: string;
  href: string;
  handle: string;
}

export const profile = {
  name: "Ramzy Youcef Ammouri",
  shortName: "Ramzy",
  role: {
    en: "Data architecture & full-stack development",
    fr: "Architecture de donnees & developpement full-stack",
  },
  degree: {
    en: "BSc Computer Science — Universite de Montreal",
    fr: "Baccalaureat en informatique — Universite de Montreal",
  },
  graduated: {
    en: "Graduated February 2026",
    fr: "Diplome en fevrier 2026",
  },
  location: "Montreal, QC",
  availability: {
    en: "Open to roles in health tech and engineering",
    fr: "Disponible — secteurs sante et ingenierie",
  },
  isAvailable: true,
  promptHost: "ammouri@portfolio",

  /** Titre d'affiche du hero, en trois lignes. */
  headline: {
    en: { pixel: "Data architect", solid: "& Full-stack", outline: "Developer" },
    fr: { pixel: "Architecte data", solid: "& Full-stack", outline: "Developpeur" },
  },
  intro: {
    en: "Hi, my name is Ramzy and I am a",
    fr: "Salut, je m'appelle Ramzy et je suis",
  },
  /** Partie de l'intro apres la salutation (celle-ci est calculee selon
   *  l'heure dans le hero). */
  introRest: {
    en: "my name is Ramzy and I am a",
    fr: "je me nomme Ramzy et je suis",
  },

  /** Resume du profil, repris du CV. */
  summary: {
    en: "I design data architectures and build the systems around them. My focus is complex databases, advanced analytics and full-stack engineering — from entity-relationship modelling through to the application that queries it. I look for problems where the schema is the hard part.",
    fr: "Je concois des architectures de donnees et je construis les systemes autour. Mon terrain : les bases de donnees complexes, l'analytique avancee et le developpement full-stack — de la modelisation entite-association jusqu'a l'application qui l'interroge. Je cherche les problemes ou le schema est la vraie difficulte.",
  },
} as const;

export const links: ProfileLink[] = [
  {
    id: "email",
    label: "Email",
    href: "mailto:ramzy.youcef.ammouri@umontreal.ca",
    handle: "ramzy.youcef.ammouri@umontreal.ca",
  },
  {
    id: "phone",
    label: "Phone",
    href: "tel:+14387732192",
    handle: "(438) 773-2192",
  },
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/razere",
    handle: "@razere",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ramzy-youcef-ammouri-8016b02a5",
    handle: "in/ramzy-youcef-ammouri",
  },
];

export interface SkillGroup {
  id: string;
  label: { en: string; fr: string };
  items: string[];
}

/** Transcription fidele de la section Competences du CV. */
export const skills: SkillGroup[] = [
  {
    id: "languages",
    label: { en: "Languages", fr: "Langages" },
    items: ["Python", "Java", "JavaScript", "TypeScript", "C++", "SQL", "PHP", "React", "LaTeX"],
  },
  {
    id: "data",
    label: { en: "Tools & DBMS", fr: "Outils & SGBD" },
    items: ["PostgreSQL", "MySQL", "Azure", "Git", "PowerBI", "TensorFlow"],
  },
  {
    id: "methods",
    label: { en: "Methods", fr: "Methodes" },
    items: [
      "CI/CD",
      "MLOps",
      "Supervised & unsupervised learning",
      "Relational modelling (BCNF)",
      "MVC",
    ],
  },
  {
    id: "spoken",
    label: { en: "Spoken", fr: "Langues" },
    items: ["Francais (C2)", "English (C1)", "Arabic (C2)"],
  },
];

export const strengths = {
  en: ["Complex problem solving", "Patience", "Communication", "Reliability", "Proactivity"],
  fr: ["Resolution de problemes complexes", "Patience", "Communication", "Fiabilite", "Proactivite"],
};

export interface Client {
  id: string;
  name: string;
  url: string;
  domain: string;
  tag: { en: string; fr: string };
  year: string;
  /** Capture hebergee dans public/. */
  image: string;
  /** Couleur de marque : sert au repli si la capture ne charge pas. */
  tone: string;
}

/** Sites livres en production. Captures locales dans public/assets/sites. */
export const clients: Client[] = [
  {
    id: "marilyns",
    name: "Marilyn's",
    url: "https://marilyns.club/",
    domain: "marilyns.club",
    tag: { en: "Bar & club", fr: "Bar & club" },
    year: "2025",
    image: "/assets/sites/marilyns.webp",
    tone: "#3a0f1a",
  },
  {
    id: "bloon",
    name: "Bloon One",
    url: "https://bloon-one.app/",
    domain: "bloon-one.app",
    tag: { en: "Web app", fr: "Application web" },
    year: "2025",
    image: "/assets/sites/bloon.webp",
    tone: "#1f4b8f",
  },
  {
    id: "corner",
    name: "The Corner Gym",
    url: "https://gymthecorner.com/",
    domain: "gymthecorner.com",
    tag: { en: "Fitness", fr: "Salle de sport" },
    year: "2024",
    image: "/assets/sites/corner.webp",
    tone: "#1c1c1c",
  },
  {
    id: "mare",
    name: "Mare",
    url: "https://maremtl.ca/",
    domain: "maremtl.ca",
    tag: { en: "Restaurant", fr: "Restaurant" },
    year: "2024",
    image: "/assets/sites/mare.webp",
    tone: "#2f5d4a",
  },
];

export interface Project {
  id: string;
  name: { en: string; fr: string };
  context: { en: string; fr: string };
  period: string;
  stack: string[];
  highlights: { en: string[]; fr: string[] };
  repo?: string;
  command?: string;
  /** Commande qui ouvre la documentation du projet, s'il y en a une. */
  docsCommand?: string;
}

/** Projets substantiels. Les jeux sont ailleurs : ce sont des demos. */
export const projects: Project[] = [
  {
    id: "worldcup",
    name: {
      en: "World Cup Database & Application",
      fr: "Base de donnees et application de la Coupe du Monde",
    },
    context: { en: "Universite de Montreal — academic", fr: "Universite de Montreal — academique" },
    period: "2022 — 2026",
    stack: ["PostgreSQL", "Python", "Tkinter", "SQL"],
    highlights: {
      en: [
        "Designed and implemented a normalised PostgreSQL database in BCNF, from the entity-relationship model through to the relational schema.",
        "Built a Python desktop application on an MVC architecture to keep the codebase robust and extensible.",
        "Wrote complex analytical SQL queries and the algorithms behind them to extract advanced performance statistics.",
      ],
      fr: [
        "Conception et implementation d'une base PostgreSQL normalisee en BCNF, de la modelisation entite-association jusqu'au schema relationnel.",
        "Developpement d'une application de bureau Python sur une architecture MVC, pour garantir un code robuste et evolutif.",
        "Redaction de requetes SQL analytiques complexes et des algorithmes associes, pour extraire des statistiques de performance avancees.",
      ],
    },
    command: "worldcup",
    docsCommand: "docs",
  },
  {
    id: "portfolio",
    name: { en: "Interactive Personal Portfolio", fr: "Portfolio personnel interactif" },
    context: { en: "Personal — in progress", fr: "Personnel — en cours" },
    period: "2025 — " + new Date().getFullYear(),
    stack: ["React", "TypeScript", "Node.js", "Vite"],
    highlights: {
      en: [
        "Full-stack development of a web platform to expose my data analytics and software engineering work.",
        "Command-driven interface with a real parser, fuzzy command palette and shell-style completion.",
        "Canvas rendering pipeline: pre-rendered static layer plus a cursor-local flow field, so only ~150 points redraw per frame.",
      ],
      fr: [
        "Developpement full-stack d'une plateforme web exposant mes travaux en analytique de donnees et en ingenierie logicielle.",
        "Interface pilotee a la commande, avec un vrai parseur, une palette floue et une completion facon shell.",
        "Pipeline de rendu canvas : couche statique pre-rendue plus un flow field local au curseur, soit ~150 points redessines par frame.",
      ],
    },
    repo: "https://github.com/razere/Portfolio",
  },
];

export interface DocSection {
  id: string;
  label: { en: string; fr: string };
  summary: { en: string; fr: string };
}

/**
 * Rapport academique du projet Coupe du Monde.
 *
 * Le PDF vit dans public/docs/worldcup/ : Vite ne copie que public/ vers
 * dist/, un fichier laisse ailleurs renverrait un 404 en production.
 */
export const worldCupDoc = {
  title: {
    en: "World Cup Manager — database report",
    fr: "World Cup Manager — rapport de base de donnees",
  },
  course: "IFT 2935 — Bases de donnees, Universite de Montreal",
  date: { en: "April 2025", fr: "Avril 2025" },
  pages: 16,
  /** Projet realise seul, de A a Z. */
  authors: ["Ramzy Youcef Ammouri"],
  href: "/docs/worldcup/rapport-ift2935.pdf",
  sections: [
    {
      id: "modele",
      label: { en: "Entity-relationship model", fr: "Modelisation entite-association" },
      summary: {
        en: "Eight entities, their attributes and every cardinality, drawn as a full E/A diagram.",
        fr: "Huit entites, leurs attributs et toutes les cardinalites, en diagramme E/A complet.",
      },
    },
    {
      id: "transformation",
      label: { en: "Relational transformation", fr: "Transformation relationnelle" },
      summary: {
        en: "Thirteen relations derived from the model, with the passage rules applied to each association type.",
        fr: "Treize relations derivees du modele, avec les regles de passage appliquees a chaque type d'association.",
      },
    },
    {
      id: "normalisation",
      label: { en: "Normalisation to BCNF", fr: "Normalisation en BCNF" },
      summary: {
        en: "Functional dependencies listed relation by relation, then a 1NF to BCNF proof for each one.",
        fr: "Dependances fonctionnelles listees relation par relation, puis preuve 1NF a BCNF pour chacune.",
      },
    },
    {
      id: "implementation",
      label: { en: "Implementation", fr: "Implementation" },
      summary: {
        en: "PostgreSQL schema: types, keys, referential constraints and test data.",
        fr: "Schema PostgreSQL : types, cles, contraintes referentielles et jeu de donnees de test.",
      },
    },
    {
      id: "requetes",
      label: { en: "Statistical queries", fr: "Requetes statistiques" },
      summary: {
        en: "Four analytical questions and their SQL: all-time top scorers, per-edition team stats, honours, multi-tournament players.",
        fr: "Quatre questions analytiques et leur SQL : meilleurs buteurs de tous les temps, statistiques par edition, palmares, joueurs multi-coupes.",
      },
    },
    {
      id: "application",
      label: { en: "Application", fr: "Application" },
      summary: {
        en: "Python desktop client on an MVC architecture, connected to the database.",
        fr: "Client de bureau Python sur architecture MVC, branche sur la base.",
      },
    },
  ] as DocSection[],
} as const;

export interface Demo {
  id: string;
  name: string;
  stack: string[];
  summary: { en: string; fr: string };
}

/**
 * Petites realisations : elles montrent l'algorithmique, pas
 * l'architecture. World Cup n'est volontairement pas ici : c'est un
 * projet de base de donnees, il se lit sous `projects` et `docs`, et sa
 * version navigateur se lance avec `worldcup`.
 */
export const demos: Demo[] = [
  {
    id: "snake",
    name: "Snake 3310",
    stack: ["React", "Vite"],
    summary: {
      en: "Nokia 3310 Snake, including the monochrome LCD look and grid-step movement.",
      fr: "Le Snake du Nokia 3310, rendu LCD monochrome et deplacement case par case compris.",
    },
  },
  {
    id: "sudoku",
    name: "Sudoku",
    stack: ["JavaScript"],
    summary: {
      en: "Generator and backtracking solver with several difficulty levels.",
      fr: "Generateur et solveur par retour sur trace, avec plusieurs niveaux.",
    },
  },
  {
    id: "minesweeper",
    name: "Minesweeper",
    stack: ["JavaScript"],
    summary: {
      en: "Recursive flood-fill reveal with first-click safety.",
      fr: "Revelation recursive par flood-fill, premier clic toujours sur.",
    },
  },
];

export interface TimelineEntry {
  period: string;
  title: { en: string; fr: string };
  org: string;
  place: string;
  detail: { en: string[]; fr: string[] };
}

export const education: TimelineEntry[] = [
  {
    period: "2022 — 2026",
    title: { en: "BSc Computer Science", fr: "Baccalaureat en informatique" },
    org: "Universite de Montreal",
    place: "Montreal, QC",
    detail: {
      en: [
        "Relevant coursework: algorithms, database architecture, artificial intelligence, software engineering.",
        "Curriculum focused on solving complex computing problems and system optimisation.",
      ],
      fr: [
        "Cours pertinents : algorithmique, architecture de bases de donnees, intelligence artificielle, genie logiciel.",
        "Cursus axe sur la resolution de problemes informatiques complexes et l'optimisation de systemes.",
      ],
    },
  },
  {
    period: "2021",
    title: {
      en: "Preparatory year, natural and formal sciences",
      fr: "Annee preparatoire en sciences naturelles et formelles",
    },
    org: "Universite de Montreal",
    place: "Montreal, QC",
    detail: { en: [], fr: [] },
  },
];

export const experience: TimelineEntry[] = [
  {
    period: "2021",
    title: { en: "Customer service agent", fr: "Agent service a la clientele" },
    org: "IO Solutions Contact Center",
    place: "Montreal, QC",
    detail: {
      en: [
        "Built strong communication, stress management and real-time problem solving skills with customers.",
      ],
      fr: [
        "Developpement de fortes competences en communication, gestion du stress et resolution de problemes en temps reel aupres de la clientele.",
      ],
    },
  },
];
