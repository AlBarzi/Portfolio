"""
Script de détection automatique des noms de tables et d'insertion des données des Coupes du Monde récentes.
"""

import os
import sys
import psycopg2
from psycopg2 import sql

# Configuration de la base de données
DB_CONFIG = {
    "dbname": "coupe_du_monde",
    "user": "",  # À remplir par l'utilisateur
    "password": "",  # À remplir par l'utilisateur
    "host": "localhost",
    "port": "5432"
}

def get_db_credentials():
    DB_CONFIG["user"] = input("Entrez votre nom d'utilisateur PostgreSQL: ")
    DB_CONFIG["password"] = input("Entrez votre mot de passe PostgreSQL: ")
    DB_CONFIG["dbname"] = input("Entrez le nom de votre base de données (par défaut: coupe_du_monde): ") or "coupe_du_monde"

def test_connection():
    print("Test de connexion à la base de données...")
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.close()
        print("✅ Connexion à la base de données réussie")
        return True
    except Exception as e:
        print(f"❌ Erreur de connexion à la base de données: {e}")
        return False

def detect_table_names():
    print("Détection des noms de tables...")
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        tables = [row[0] for row in cursor.fetchall()]
        print(f"Tables détectées: {', '.join(tables)}")
        cursor.close()
        conn.close()
        return tables
    except Exception as e:
        print(f"❌ Erreur lors de la détection des tables: {e}")
        return []

def find_table_by_pattern(tables, patterns):
    for pattern in patterns:
        for table in tables:
            if pattern in table.lower():
                return table
    return None

def map_table_names(tables):
    table_mapping = {}
    table_mapping["world_cups"] = find_table_by_pattern(tables, ["coupe", "world_cup", "mondial"])
    table_mapping["teams"] = find_table_by_pattern(tables, ["equipe", "team", "pays"])
    table_mapping["players"] = find_table_by_pattern(tables, ["joueur", "player"])
    table_mapping["matches"] = find_table_by_pattern(tables, ["match", "rencontre", "game"])

    print("\nCorrespondance des tables:")
    for std_name, real_name in table_mapping.items():
        status = "✅" if real_name else "❌"
        print(f"{status} {std_name} -> {real_name or 'Non trouvée'}")
    if "goals" not in table_mapping:
        print("⚠️ Table 'goals' absente. Utilisez 'participation_joueur_match' pour les buts.")

    return table_mapping

def get_table_columns(table_name):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(f"""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = '{table_name}'
        """)
        columns = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return columns
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des colonnes de {table_name}: {e}")
        return []

def map_column_names(table_mapping):
    column_mapping = {}
    for std_table, real_table in table_mapping.items():
        if not real_table:
            continue
        columns = get_table_columns(real_table)
        column_mapping[std_table] = {}
        if std_table == "world_cups":
            column_mapping[std_table]["world_cup_id"] = find_column_by_pattern(columns, ["id", "coupe_id", "world_cup_id"])
            column_mapping[std_table]["year"] = find_column_by_pattern(columns, ["annee", "year"])
            column_mapping[std_table]["winner_id"] = find_column_by_pattern(columns, ["vainqueur", "winner", "champion"])
        elif std_table == "teams":
            column_mapping[std_table]["team_id"] = find_column_by_pattern(columns, ["id", "equipe_id", "team_id"])
            column_mapping[std_table]["team_name"] = find_column_by_pattern(columns, ["nom", "pays", "name"])
        elif std_table == "matches":
            column_mapping[std_table]["match_id"] = find_column_by_pattern(columns, ["id", "match_id"])
            column_mapping[std_table]["world_cup_id"] = find_column_by_pattern(columns, ["coupe_id", "world_cup_id", "id_coupe"])
            column_mapping[std_table]["match_date"] = find_column_by_pattern(columns, ["date", "date_match"])
            column_mapping[std_table]["stage"] = find_column_by_pattern(columns, ["phase", "stage", "tour"])
            column_mapping[std_table]["home_team_id"] = find_column_by_pattern(columns, ["equipe1", "home_team", "id_equipe1"])
            column_mapping[std_table]["away_team_id"] = find_column_by_pattern(columns, ["equipe2", "away_team", "id_equipe2"])
            column_mapping[std_table]["home_score"] = find_column_by_pattern(columns, ["score1", "home_score", "buts_equipe1"])
            column_mapping[std_table]["away_score"] = find_column_by_pattern(columns, ["score2", "away_score", "buts_equipe2"])
    return column_mapping

def find_column_by_pattern(columns, patterns):
    for pattern in patterns:
        for column in columns:
            if pattern.lower() in column.lower():
                return column
    return None

def generate_insert_queries(table_mapping, column_mapping):
    queries = []
    if not all([table_mapping.get("world_cups"), table_mapping.get("teams"), table_mapping.get("matches")]):
        print("❌ Impossible de générer les requêtes : certaines tables nécessaires n'ont pas été trouvées")
        return queries

    world_cups_table = table_mapping["world_cups"]
    teams_table = table_mapping["teams"]
    matches_table = table_mapping["matches"]
    wc_cols = column_mapping["world_cups"]
    match_cols = column_mapping["matches"]
    team_cols = column_mapping["teams"]

    world_cups_data = [
        (2002, "Brésil"),
        (2006, "Italie"),
        (2010, "Espagne"),
        (2014, "Allemagne"),
        (2018, "France"),
        (2022, "Argentine")
    ]

    for year, winner in world_cups_data:
        check_query = f"""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM {world_cups_table} 
                WHERE {wc_cols["year"]} = {year}
            ) THEN
                INSERT INTO {world_cups_table} ({wc_cols["year"]}, {wc_cols["winner_id"]})
                VALUES (
                    {year}, 
                    (SELECT {team_cols["team_id"]} FROM {teams_table} 
                     WHERE {team_cols["team_name"]} = '{winner}')
                );
            END IF;
        END $$;
        """
        queries.append(check_query)

    return queries

def execute_queries(queries):
    print(f"\nExécution de {len(queries)} requêtes SQL...")
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        for i, query in enumerate(queries, 1):
            try:
                cursor.execute(query)
                conn.commit()
                print(f"✅ Requête {i}/{len(queries)} exécutée avec succès")
            except Exception as e:
                conn.rollback()
                print(f"❌ Erreur requête {i}: {e}\n{query}")
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Erreur globale: {e}")
        return False

def main():
    print("=== Script de correction automatique des erreurs de base de données ===")
    get_db_credentials()
    if not test_connection(): return False
    tables = detect_table_names()
    if not tables: return False
    table_mapping = map_table_names(tables)
    column_mapping = map_column_names(table_mapping)
    queries = generate_insert_queries(table_mapping, column_mapping)
    if not queries: return False
    return execute_queries(queries)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
