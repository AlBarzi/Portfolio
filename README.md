# Portfolio Terminal

Portfolio React + TypeScript au style terminal premium avec navigation rapide.

## Demarrage rapide

```bash
npm install
npm run dev
```

## Structure

- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `src/components/*`
- `src/hooks/*`
- `src/styles/index.css`
- `src/state/TerminalContext.tsx`
- `cv.pdf`
- `games/*`

## Commandes principales

- `help`
- `about`
- `projects`
- `games`
- `ai`
- `cv`
- `clear`

## Assistant IA (popup terminal)

- La commande `ai` ouvre une popup IA locale.
- Cette etape ne contacte pas encore OpenAI: elle valide l'interface + le scan local des PDF.
- Les plans de cours sont lus depuis `docs/plans-de-cours/` via un serveur local.

### Lancer le scan local des PDF

Dans un premier terminal:

```bash
npm run ai:server
```

Dans un second terminal:

```bash
npm run dev
```

Puis ajoutez vos fichiers `.pdf` dans `docs/plans-de-cours/` et cliquez `Rafraichir scan` dans la popup IA.

## CV

Place ton CV en PDF a la racine du projet sous le nom `cv.pdf`.
La commande `cv` ouvrira ce fichier dans un nouvel onglet.

## Jeux

Les jeux restent dans `games/` et seront integres dans le meme onglet plus tard.

## WorldCup Tkinter (interface identique en web)

La version Tkinter originale peut etre exposee en web via noVNC:

```bash
npm run worldcup:tk:web:up
```

Puis configure l'URL cible pour la commande `worldcup` dans `.env.local`:

```bash
VITE_WORLDCUP_URL=http://localhost:6080/vnc.html?autoconnect=true&resize=scale
```

Consulte `deploy/worldcup-novnc/README.md` pour les details de deploiement.

## Notes

- Les styles et effets sont centralises dans `src/styles/index.css`.
- Les commandes sont definies dans `src/hooks/useTerminal.ts`.
