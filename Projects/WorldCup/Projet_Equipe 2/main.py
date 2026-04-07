"""
Point d'entrée principal de l'application Coupe du Monde de Football.
"""

import os
import sys

# Ajouter le répertoire courant au chemin de recherche Python
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config.settings import SCHEMA_FILE, DATA_FILE, LOGO_FILE
from controllers.app_controller import CoupeDuMondeApp

def check_required_files():
    """Vérifie la présence des fichiers requis (SQL, logo)."""
    missing = False

    if not os.path.exists(SCHEMA_FILE):
        print(f"❌ Fichier de schéma non trouvé : {SCHEMA_FILE}")
        missing = True

    if not os.path.exists(DATA_FILE):
        print(f"❌ Fichier de données non trouvé : {DATA_FILE}")
        missing = True

    if not os.path.exists(LOGO_FILE):
        print(f"⚠️ Logo non trouvé : {LOGO_FILE} (l'application fonctionnera sans logo)")

    if missing:
        print("🛑 Veuillez corriger les erreurs avant de relancer l'application.")
        sys.exit(1)

if __name__ == "__main__":
    check_required_files()
    app = CoupeDuMondeApp()
    app.run()
