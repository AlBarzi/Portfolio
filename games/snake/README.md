# Snake 3310

Le dossier contient:

- une version web React (route utilisee par le terminal du portfolio),
- une version Python Pygame orientee objet dans `snake.py`, compatible Pygbag.

## Version React (Vite)

```bash
npm install
npm run dev
```

## Version Python (desktop)

```bash
python3 -m pip install -r requirements.txt
python3 snake.py
```

## Build web Python avec Pygbag

```bash
python3 -m pip install -r requirements.txt
python3 -m pygbag --build snake.py
```

## Tests de logique Python

```bash
cd games/snake
python3 -m unittest discover -s tests -p "test_*.py"
```

## Controles

- Fleches ou WASD: deplacement
- Space: demarrer / pause (ou restart apres game over)
- R: recommencer
- Esc: quitter
