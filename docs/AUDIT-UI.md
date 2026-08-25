# Audit UI/UX — Portfolio Terminal

Analyse statique du code (`src/`, `index.html`, `vite.config.ts`, `dist/`) au 5 août 2026.
Classement : **P0** = bloquant, **P1** = important, **P2** = polish.

---

## 1. Responsive — le vrai problème (P0)

Ton intuition est bonne, mais la navbar n'est qu'un symptôme. Le layout entier n'a **aucun point de bascule vers une colonne unique**.

### 1.1 La grille reste en 2 colonnes jusqu'à 320px

`src/styles/index.css:86` et `:787`

```css
.content-grid { grid-template-columns: minmax(0,0.32fr) minmax(0,0.68fr); }
@media (max-width: 640px) {
  .content-grid { grid-template-columns: minmax(0,0.36fr) minmax(0,0.64fr); } /* toujours 2 colonnes */
}
```

Calcul sur un iPhone (375px de large) :

| Élément | Largeur résultante |
|---|---|
| `.app` moins padding 16px | 343px |
| Colonne gauche (`.left-rail`) | **≈ 120px** |
| Colonne droite (`.terminal`) | **≈ 213px** |
| Intérieur du terminal (padding 16px) | **≈ 181px** |

Un terminal de 181px de contenu utile est inutilisable.

**Conséquence directe** : `.prompt` est en `white-space: nowrap` (`:601`). La chaîne `ammouri@portfolio:~$` fait 20 caractères en JetBrains Mono 16px ≈ **192px**. Elle dépasse à elle seule le terminal, et il ne reste **0px** pour le champ de saisie. Sur mobile, on ne peut littéralement pas taper de commande.

**Correctif** : passer en une seule colonne sous ~820px, et raccourcir le prompt sur petit écran.

```css
@media (max-width: 820px) {
  .content-grid { grid-template-columns: 1fr; align-items: start; }
  .left-rail    { height: auto; }
  .terminal     { height: min(70dvh, 520px); }
}
```

Pour le prompt, une variante courte (`~$` ou `ammouri:~$`) via un `useMediaQuery`, ou en CSS avec deux `<span>` dont un masqué.

### 1.2 `.hero h1` déborde et est coupé

`:118` — `white-space: nowrap` avec `font-size: clamp(0.94rem, 2.2vw, 1.2rem)`.
« Ramzy Youcef Ammouri » ≈ 150px à 15px de police, dans une colonne de 120px. Comme `.app` est en `overflow: hidden` (`:50`), le nom est **tronqué sans scroll possible**. Le premier mot que voit un recruteur sur mobile est amputé.

**Correctif** : supprimer `white-space: nowrap`, autoriser le retour à la ligne.

### 1.3 La navbar : scroll horizontal invisible

`:158` — `.nav-button { min-width: 176px }`, 6 boutons + 5 gaps de 10px = **1106px minimum**, plus le padding de `.nav-bar` → **~1134px**.

- En dessous de ~1190px de viewport (donc iPad, fenêtre réduite, laptop 1024), la barre passe déjà en scroll horizontal.
- `.nav-bar` est en `overflow: hidden` alors que le scroll est sur `.nav-group` → **aucun indicateur visuel** que ça défile. L'utilisateur voit « Help / CV / About » et croit que c'est tout.
- Sur mobile, 6 boutons de 160px dans 343px = 3 écrans de défilement latéral, sans affordance.

**Trois options**, par ordre de qualité :

1. **Recommandé** — sur mobile, transformer les boutons en « chips » compactes : label seul (`Help`, `CV`, `About`…), plus de `helper` ni de badge `$command`, `min-width: auto`, `flex-wrap: wrap`. Les 6 tiennent alors sur 2 lignes.
   ```css
   @media (max-width: 820px) {
     .nav-group  { flex-wrap: wrap; overflow-x: visible; }
     .nav-button { min-width: 0; flex: 0 0 auto; padding: 8px 12px; }
     .nav-helper { display: none; }
     .nav-command{ display: none; }
   }
   ```
2. Garder le scroll mais ajouter un dégradé de masque à droite + `scroll-snap-type: x mandatory` pour signaler qu'il y a plus.
3. Menu burger — moins pertinent ici, ça casse l'esthétique terminal.

### 1.4 Aucun scroll possible : le contenu hors écran est perdu

`body { overflow: hidden }` (`:30`) + `.app { height: 100dvh }` (`:44`) + `.terminal { height: clamp(460px, 62vh, 520px) }` (`:769`).

En **paysage mobile** (667×375) : hauteur disponible = 375 − 32 = 343px, mais le terminal impose un minimum de **460px**. Il déborde de 117px, et comme rien ne scrolle, la barre de saisie est purement invisible. Le site est mort en paysage.

**Correctif** : sous 820px, `body { overflow: auto }`, `.app { min-height: 100dvh; height: auto }`, et remplacer le `clamp(460px, …)` par une valeur relative sans plancher rigide.

### 1.5 Le clavier virtuel

`TerminalInput.tsx:56-59` force le focus sur l'input via des listeners globaux `pointerdown` / `keydown` / `focus`. Sur mobile, cela **ouvre le clavier dès le chargement**, qui recouvre 40% de l'écran — sur un layout déjà en `overflow: hidden`. Il faut désactiver l'auto-focus quand `(pointer: coarse)`.

---

## 2. Accessibilité (P0–P1)

### 2.1 Le piège à focus clavier (P0)

`TerminalInput.tsx:56-67` :

```ts
window.addEventListener("pointerdown", scheduleFocus);
window.addEventListener("keydown", scheduleFocus);
```

Plus un `onBlur` qui refocalise (`:89-94`). Résultat : **la navigation au clavier est cassée**. Un appui sur `Tab` déplace le focus, puis le handler `keydown` le ramène immédiatement sur l'input. Impossible d'atteindre les boutons de la navbar au clavier, impossible de sortir du composant. C'est un blocage total pour un utilisateur de lecteur d'écran ou de navigation clavier.

**Correctif** : ne refocaliser que sur `pointerdown` dont la cible n'est ni un `button`, ni un `a`, ni un `input` ; retirer le listener `keydown` global (ou l'ignorer pour `Tab`, `Shift+Tab`, `Escape`).

### 2.2 Curseur invisible (P1)

`:690-693` :

```css
@media (hover: hover) and (pointer: fine) {
  body, body * { cursor: none; }
}
```

Le curseur système est supprimé et remplacé par une image **hébergée sur un CDN externe** (`assets.codepen.io`, `:709`). Si ce CDN est bloqué (bloqueur de pub, réseau d'entreprise, panne), l'utilisateur se retrouve **sans aucun curseur**. Le site devient inutilisable.

**Correctifs** : héberger le SVG en local dans `public/assets/`, et n'appliquer `cursor: none` qu'après confirmation que l'image est chargée (classe sur `<body>` posée en JS). Ajouter aussi un toggle « effets » pour le désactiver.

### 2.3 `aria-live` + machine à écrire = spam lecteur d'écran (P1)

`TerminalOutput.tsx` : `role="log" aria-live="polite"` sur un conteneur dont le texte s'écrit mot par mot. Un lecteur d'écran va annoncer chaque incrément. Il faut soit annoncer la ligne complète une seule fois (rendre le texte final dans un nœud `aria-live` séparé), soit mettre `aria-live="off"` pendant l'animation.

### 2.4 Contrastes (P2)

À vérifier au contrastomètre : `--text-muted: #a2b1c9` sur `#0f1520` passe (≈ 8:1), mais `.nav-helper #8ca0bf` à 0.72rem et `.nav-hint #9daece` à 0.78rem sont limites pour du texte de cette taille. `.game-option-command #8fd7ff` à 0.72rem également.

### 2.5 Divers

- Le `<html lang="fr">` alors que 90% du contenu affiché est en anglais (`help`, `about`, `projects`…). À aligner — soit tout en anglais avec `lang="en"`, soit une vraie bascule FR/EN (`lang` command).
- `.games-menu` a `role="menu"` mais ses enfants n'ont pas `role="menuitem"`, et il n'y a pas de navigation aux flèches. Soit compléter, soit retirer le `role`.
- `AiPopup` a bien `aria-modal` et `Escape`, mais **pas de focus trap** : `Tab` sort de la modale vers le contenu derrière.

---

## 3. Bug fonctionnel en production (P0)

`useTerminal.ts:37-42` pointe vers `/games/sudoku/index.html`, `/games/snake/…`, `/games/minesweeper/…`.

Or ces dossiers sont à la **racine du projet**, pas dans `public/`. Vite ne copie que `public/` vers `dist/`. Vérification :

```
dist/games/
└── worldcup/     ← seul jeu présent
```

**En dev ça marche** (Vite sert depuis la racine), **en prod les commandes `sudoku`, `snake` et `minesweeper` renvoient un 404**. Trois des six entrées de la navbar sont cassées une fois déployé.

**Correctif** : déplacer/copier `games/sudoku`, `games/minesweeper` et le `dist/` buildé de `games/snake` dans `public/games/`, ou ajouter une étape de copie au script `build`.

Note annexe : `games/snake/node_modules` pèse 41 Mo. Bien ignoré par git, mais pense à ne pas l'embarquer dans un déploiement.

---

## 4. Performance (P1–P2)

### 4.1 `useGridTrail` — 2 700 nœuds DOM et un reflow par pixel

`useGridTrail.ts:41-51` : `Math.ceil(1920/28) × Math.ceil(1080/28)` = **69 × 39 = 2 691 `<div>`** injectés au chargement.

Trois problèmes :

1. **`setupGrid` est rebranché sur `resize` sans debounce** (`:102`). Un redimensionnement de fenêtre détruit et recrée 2 700 nœuds à chaque événement — des dizaines de fois par seconde. C'est exactement le scénario que tu décris quand tu réduis la fenêtre : ça saccade.
2. **`getComputedStyle` dans la boucle chaude** (`:58`) : `lightGridAt` est appelé jusqu'à `distance/8` fois par `mousemove`, et chaque appel force un recalcul de style synchrone. Il suffit de mettre `cols` en variable de closure.
3. **Créée aussi sur mobile**, où `mousemove` ne se déclenche jamais. 2 700 nœuds inutiles sur un appareil contraint.

**Correctifs** : debouncer `resize` (~150ms), sortir `cols` de la boucle, et court-circuiter le hook si `!matchMedia("(hover: hover)").matches`. Idéalement, remplacer la grille de divs par un seul `<canvas>`.

### 4.2 Polices via `@import` (P1)

`index.css:1` — `@import url("https://fonts.googleapis.com/…")` dans le CSS est le pire cas : le navigateur doit télécharger et parser le CSS **avant** de découvrir la requête de police. Chaîne de requêtes en série.

**Correctif** : `<link rel="preconnect">` + `<link rel="stylesheet">` dans `index.html`, ou mieux, auto-héberger les `.woff2` (2 polices × 3 graisses = beaucoup de poids ; tu n'utilises probablement pas les 6).

### 4.3 Audio préchargé sans consentement (P2)

`useSaberEffects.ts:20-22` : `baseSwingAudio.load()` avec `preload="auto"` au montage, et un son joué à **chaque clic**. Sans toggle mute. Un recruteur qui ouvre ton site au bureau va entendre un sabre laser au premier clic. Ajoute un bouton son (persisté en `localStorage`) et respecte `prefers-reduced-motion` pour l'audio aussi.

### 4.4 `prefers-reduced-motion` incomplet (P2)

`:819-827` ne désactive que la transition des `.nav-button`. Restent actifs : la machine à écrire, le trail de grille, l'animation du sabre, les étincelles, le clignotement du curseur. Il faut étendre la media query.

---

## 5. SEO et partage (P1)

`index.html` est très minimal :

- **Aucune balise Open Graph / Twitter Card** → un lien partagé sur LinkedIn s'affiche sans titre, sans image, sans description. Pour un portfolio, c'est la première impression.
- Pas de `favicon`, pas de `theme-color`.
- `<title>Portfolio - Terminal</title>` — devrait contenir ton nom : `Ramzy Youcef Ammouri — Développeur Front-end`.
- La `<meta name="description">` contient « premium », un mot marketing ; mieux vaut décrire ton profil avec les mots-clés que cherchent les recruteurs.
- **Aucun contenu sans JavaScript.** Le `<noscript>` est une phrase. Les crawlers qui n'exécutent pas JS (LinkedIn, certains bots) ne voient rien. Envisage de mettre dans le `<div id="root">` un fallback statique avec ton nom, ton titre et tes liens — React le remplacera au montage.
- Pas de `sitemap.xml`, pas de `robots.txt`, pas de JSON-LD `Person`.

---

## 6. Contenu et concept (P1)

C'est, à mon avis, le point qui limite le plus l'impact du site — l'exécution technique est bien plus aboutie que ce qu'elle sert.

### 6.1 Le contenu est un placeholder

`useTerminal.ts:174-179` :

```
1) Terminal Portfolio (this website)
2) World Cup Manager (command: worldcup)
3) Additional case studies coming soon
```

Un portfolio dont la section projets dit « coming soon » dessert son auteur. Chaque projet mérite : stack, rôle, problème résolu, lien repo, lien démo. Idem pour `about`, qui tient en 3 lignes génériques (« focused on UX quality and performance »).

### 6.2 Commandes manquantes évidentes

Il n'y a **aucun moyen de te contacter**. Pas de `contact`, pas d'email, pas de LinkedIn, pas de GitHub. Pour un portfolio, c'est l'objectif de conversion numéro un.

Suggestions : `contact`, `skills`, `experience`, `education`, `stack`, `github`, `linkedin`, `lang` (FR/EN), `theme`, `whoami`, `ls`, `sudo` (easter egg), `neofetch` (parfait pour ce style).

### 6.3 Le terminal ne se comporte pas comme un terminal

Tu as l'historique aux flèches (bien), mais il manque les réflexes que tout visiteur technique va essayer :

- **Autocomplétion par `Tab`** — c'est le réflexe numéro un, et son absence casse l'illusion.
- `Ctrl+L` pour clear, `Ctrl+C` pour annuler.
- Suggestion sur commande inconnue (`Unknown command: hlep. Did you mean 'help'?`) — une distance de Levenshtein suffit.
- Le clic sur les liens en sortie ouvre `_blank` sans indication visuelle qu'ils sont cliquables.

### 6.4 Les jeux sont un aller sans retour

`useTerminal.ts:189` utilise `window.location.assign` : le visiteur quitte le portfolio. Vérifie que chaque jeu a un lien « ← retour au portfolio » bien visible, sinon la seule issue est le bouton Précédent. Un `<iframe>` en modale (comme la popup IA) serait plus élégant et garderait le visiteur sur le site.

### 6.5 La colonne gauche est presque vide

`.left-rail` occupe 32% de la largeur et `clamp(480px, 64vh, 560px)` de hauteur pour afficher **un `<h1>` et un `<p>`** (`Hero.tsx`). C'est un tiers de l'écran gaspillé sur desktop. Candidats naturels : photo ou avatar ASCII, liens sociaux, statut de disponibilité, mini-timeline, badges de stack.

### 6.6 La popup IA expose un chantier

Elle affiche « Dossier: docs/plans-de-cours », « PDF détectés: 0 », « Etape 1: interface uniquement (sans API OpenAI) ». C'est un outil interne de scan de plans de cours, sans rapport avec un portfolio, et son état inachevé est visible du visiteur. Soit tu la finis et la présentes comme une démo RAG assumée, soit tu la retires de la navbar publique.

Note sécurité : `server/aiServer.mjs` lit un dossier local. Si tu déploies, assure-toi qu'il ne l'est pas, ou que le chemin scanné est verrouillé (pas de traversée de répertoire depuis une entrée utilisateur).

---

## 7. Qualité de code (P2)

- **Pas d'ESLint, pas de Prettier, pas de tests, pas de CI.** Sur un portfolio de développeur, le repo est aussi visible que le site. Ajouter `eslint` + `eslint-plugin-react-hooks` et un workflow GitHub Actions qui lance `tsc -b && vite build` sur chaque push est un signal fort et coûte 20 minutes.
- **Un seul commit** (`Initial commit`). Un historique granulaire avec des messages clairs vaut mieux qu'un dump, si le repo est destiné à être consulté.
- `index.css` fait 828 lignes en un seul fichier. À découper (`base.css`, `terminal.css`, `nav.css`, `ai-popup.css`) ou passer en CSS Modules.
- `useTerminal.ts` fait 396 lignes et mélange état terminal, définitions de commandes, logique IA et navigation. Extraire les commandes dans `src/commands/` rendrait l'ajout de contenu trivial.
- Le contenu des commandes est codé en dur dans un hook. Le sortir en données (`src/data/content.ts`) permettrait la traduction FR/EN et l'édition sans toucher à la logique.
- `dist/` est présent sur disque bien que `.gitignore` le couvre — vérifie qu'il n'a pas été committé.

---

## Plan d'action suggéré

**Sprint 1 — le site doit marcher partout (½ journée)**

1. Layout une colonne sous 820px + `.hero h1` sans `nowrap` + `overflow: auto` sur mobile
2. Navbar en chips compactes sur mobile
3. Prompt raccourci sur petit écran
4. Copier les jeux dans `public/games/` (bug prod)
5. Corriger le piège à focus clavier

**Sprint 2 — crédibilité (1 journée)**

6. Commande `contact` + liens GitHub/LinkedIn
7. Contenu réel dans `projects` et `about`
8. Balises OG + favicon + `<title>` avec ton nom + fallback statique dans `#root`
9. Autocomplétion `Tab` + suggestion sur commande inconnue

**Sprint 3 — finition**

10. Debounce du resize, `cols` hors boucle, grille désactivée sur mobile
11. SVG du sabre auto-hébergé + toggle son/effets
12. Polices en `<link>` ou auto-hébergées
13. `prefers-reduced-motion` étendu
14. ESLint + GitHub Actions
15. Remplir ou retirer la popup IA
