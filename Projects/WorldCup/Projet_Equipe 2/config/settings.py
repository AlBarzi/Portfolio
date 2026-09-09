"""
Configuration de l'application Coupe du Monde de Football.
"""

import os

# Répertoire de base de l'application
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Configuration de la base de données
DB_CONFIG = {
    "dbname": "coupe_du_monde",
    "user": "",  # Sera demandé à l'utilisateur
    "password": "",  # Sera demandé à l'utilisateur
    "host": "localhost",
    "port": "5432"
}

# Chemins des fichiers SQL et ressources
RESOURCES_DIR = os.path.join(BASE_DIR, "resources")
SQL_DIR = os.path.join(RESOURCES_DIR, "sql")
IMAGES_DIR = os.path.join(RESOURCES_DIR, "images")

SCHEMA_FILE = os.path.join(SQL_DIR, "schema_coupe_du_monde.sql")
DATA_FILE = os.path.join(SQL_DIR, "donnees_test.sql")
LOGO_FILE = os.path.join(IMAGES_DIR, "logo.png")
