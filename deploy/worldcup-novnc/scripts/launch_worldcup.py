from __future__ import annotations

import os
import sys
from pathlib import Path


PROJECT_DIR = Path(os.environ.get("WORLDCUP_PROJECT_DIR", "/workspace/Projects/WorldCup/Projet_Equipe 2"))
if str(PROJECT_DIR) not in sys.path:
    sys.path.insert(0, str(PROJECT_DIR))

from config.settings import DATA_FILE, DB_CONFIG, LOGO_FILE, SCHEMA_FILE  # noqa: E402
from controllers.app_controller import CoupeDuMondeApp  # noqa: E402


def check_required_files() -> None:
    missing = []
    if not os.path.exists(SCHEMA_FILE):
        missing.append(f"schema file missing: {SCHEMA_FILE}")
    if not os.path.exists(DATA_FILE):
        missing.append(f"data file missing: {DATA_FILE}")
    if not os.path.exists(LOGO_FILE):
        # Logo is optional in the original app.
        print(f"warning: logo not found: {LOGO_FILE}")

    if missing:
        for msg in missing:
            print(msg)
        raise SystemExit(1)


class WebCoupeDuMondeApp(CoupeDuMondeApp):
    def _get_db_credentials(self) -> bool:
        # Host/port/dbname can be injected without changing the Tkinter UI.
        self.db_config["host"] = os.environ.get("WORLDCUP_DB_HOST", self.db_config.get("host", "localhost"))
        self.db_config["port"] = os.environ.get("WORLDCUP_DB_PORT", self.db_config.get("port", "5432"))
        self.db_config["dbname"] = os.environ.get("WORLDCUP_DB_NAME", self.db_config.get("dbname", "coupe_du_monde"))

        user = os.environ.get("WORLDCUP_DB_USER", "").strip()
        password = os.environ.get("WORLDCUP_DB_PASSWORD", "").strip()

        if user and password:
            self.db_config["user"] = user
            self.db_config["password"] = password
            return True

        return super()._get_db_credentials()


if __name__ == "__main__":
    DB_CONFIG["host"] = os.environ.get("WORLDCUP_DB_HOST", DB_CONFIG.get("host", "localhost"))
    DB_CONFIG["port"] = os.environ.get("WORLDCUP_DB_PORT", DB_CONFIG.get("port", "5432"))
    DB_CONFIG["dbname"] = os.environ.get("WORLDCUP_DB_NAME", DB_CONFIG.get("dbname", "coupe_du_monde"))

    check_required_files()
    app = WebCoupeDuMondeApp()
    app.run()

