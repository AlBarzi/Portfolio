---
title: WorldCup Manager
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# WorldCup Manager

Interface Tkinter d'origine (Gestion de la Coupe du Monde) exposee dans le
navigateur via noVNC. Le conteneur embarque PostgreSQL et reconstruit la base
depuis les fichiers SQL a chaque demarrage.

Ouvrir directement :
`/vnc.html?autoconnect=true&resize=scale`

Definir le secret `WORLDCUP_VNC_PASSWORD` dans les reglages du Space pour
proteger l'acces, puis l'ajouter a l'URL : `&password=...`.
