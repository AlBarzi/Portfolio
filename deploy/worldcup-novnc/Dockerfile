FROM python:3.12-slim

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    DISPLAY=:1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        gcc \
        libpq-dev \
        novnc \
        openbox \
        tk \
        websockify \
        x11vnc \
        xvfb \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY ["Projects/WorldCup/Projet_Equipe 2", "/workspace/Projects/WorldCup/Projet_Equipe 2"]
COPY ["deploy/worldcup-novnc/scripts", "/opt/worldcup/scripts"]

RUN python -m pip install --no-cache-dir --upgrade pip \
    && python -m pip install --no-cache-dir Pillow psycopg2-binary \
    && chmod +x /opt/worldcup/scripts/entrypoint.sh /opt/worldcup/scripts/healthcheck.sh

EXPOSE 6080

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=6 \
  CMD /opt/worldcup/scripts/healthcheck.sh

ENTRYPOINT ["/opt/worldcup/scripts/entrypoint.sh"]

