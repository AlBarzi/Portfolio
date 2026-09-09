# WorldCup Tkinter over Web (noVNC)

Ce pack expose l'application Tkinter **originale** de `Projects/WorldCup/Projet_Equipe 2` dans un navigateur, sans reimplementation UI.

## Ce que cela fait

- Lance PostgreSQL dans un conteneur.
- Lance l'app Tkinter dans un affichage virtuel X11 (`Xvfb`).
- Expose l'ecran via VNC + noVNC (WebSocket).

## Prerequis

- Docker Desktop (ou Docker Engine + Compose v2).

## Demarrage rapide

Depuis la racine du repo:

```bash
cp deploy/worldcup-novnc/.env.example deploy/worldcup-novnc/.env
npm run worldcup:tk:web:up
```

Puis ouvre:

- `http://localhost:6080/vnc.html?autoconnect=true&resize=scale`

## Arret / logs / validation

```bash
npm run worldcup:tk:web:logs
npm run worldcup:tk:web:validate
npm run worldcup:tk:web:down
```

## Variables utiles

Dans `deploy/worldcup-novnc/.env`:

- `WORLDCUP_WEB_PORT`: port noVNC publie (hote)
- `WORLDCUP_DB_USER`, `WORLDCUP_DB_PASSWORD`: si renseignes, l'ecran de login PostgreSQL est saute
- `WORLDCUP_DB_HOST`, `WORLDCUP_DB_PORT`, `WORLDCUP_DB_NAME`: cible DB de l'app
- `PORTFOLIO_URL`: URL du portfolio pour le bouton "Retour au portfolio" affiche dans noVNC

## Integration portfolio

Le frontend lit `VITE_WORLDCUP_URL`.

Exemple `.env.local` a la racine:

```bash
VITE_WORLDCUP_URL=http://localhost:6080/vnc.html?autoconnect=true&resize=scale
```

La commande terminal `worldcup` ouvrira alors cette URL.

## Notes securite (prod)

- Place noVNC derriere un reverse proxy HTTPS.
- Ajoute une authentification (Basic Auth, SSO ou token court).
- Limite l'acces reseau au strict necessaire.

