# Dockerfile pour un Space Hugging Face (SDK: docker). A placer a la RACINE
# du Space. Il recupere le code du jeu + les scripts depuis le repo public,
# donc le Space ne contient que ce Dockerfile et le README.
FROM python:3.12-slim

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    DISPLAY=:1 \
    NOVNC_PORT=7860 \
    VNC_PORT=5900 \
    WORLDCUP_PROJECT_DIR="/workspace/Projects/WorldCup/Projet_Equipe 2" \
    WORLDCUP_DB_NAME=coupe_du_monde \
    POSTGRES_USER=worldcup \
    POSTGRES_PASSWORD=worldcup \
    PORTFOLIO_URL=https://ramzyammouri.com/

RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl gcc git libpq-dev novnc openbox \
      postgresql postgresql-contrib tk websockify x11vnc xvfb \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Code du jeu + scripts depuis le repo public.
RUN git clone --depth 1 https://github.com/razere/Portfolio /tmp/repo \
    && mkdir -p "/workspace/Projects/WorldCup" /opt/worldcup \
    && cp -r "/tmp/repo/Projects/WorldCup/Projet_Equipe 2" "/workspace/Projects/WorldCup/Projet_Equipe 2" \
    && cp -r /tmp/repo/deploy/worldcup-novnc/scripts /opt/worldcup/scripts \
    && rm -rf /tmp/repo \
    && chmod +x /opt/worldcup/scripts/*.sh

RUN python -m pip install --no-cache-dir --upgrade pip \
    && python -m pip install --no-cache-dir Pillow psycopg2-binary

# Repertoires ecrivables que le conteneur tourne en root ou en uid non privilegie.
RUN mkdir -p /var/lib/postgresql/data \
    && chmod -R 777 /var/lib/postgresql /tmp

EXPOSE 7860

ENTRYPOINT ["/opt/worldcup/scripts/entrypoint.fly.sh"]
