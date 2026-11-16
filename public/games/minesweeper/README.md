# Demineur

Demineur jouable dans le navigateur, en JavaScript sans dependance ni etape
de build. Page servie telle quelle depuis `public/games/minesweeper/`.

## Fichiers

- `index.html` : la page
- `minesweeper.css` : le style (memes jetons que le portfolio, palette sable)
- `minesweeper-core.js` : la logique pure, sans DOM (plateau, cascade, drapeaux, accord)
- `minesweeper.js` : l'interface (gestes, affichage, chrono, records, langue)

## Lancer en local

```bash
npm run dev
```

puis ouvrir `http://localhost:5173/games/minesweeper/index.html`, ou sans
Vite : `python3 -m http.server 8000 --directory public`.

## Tests

La logique se teste sans navigateur :

```bash
npm run test:minesweeper
```

## Commandes

- Souris : clic pour ouvrir, clic droit pour le drapeau, clic sur un chiffre
  dont les drapeaux sont poses pour ouvrir ses voisines (accord)
- Tactile : toucher pour ouvrir, appui long pour le drapeau, ou mode drapeau
- Clavier : fleches, Entree, `F` (drapeau), `R` (rejouer), `1` `2` `3` (niveau)

## Parametres d'adresse

- `?seed=42` : rejoue toujours la meme grille (records desactives)
- `?level=easy|medium|hard` et `?lang=fr|en`

La langue suit celle du portfolio (cle `portfolio.lang` du stockage local).
