"""
Module d'initialisation de la base de données.
"""

import os
import psycopg2
from config.settings import DB_CONFIG, SCHEMA_FILE, DATA_FILE
from models.database import DatabaseConnection

class DatabaseInitializer:
    """Classe pour initialiser la base de données avec des données de test."""
    
    @classmethod
    def check_database_exists(cls, config):
        """Vérifie si la base de données existe."""
        conn_params = config.copy()
        conn_params["dbname"] = "postgres"  # Se connecter à la base postgres par défaut
        
        try:
            conn = psycopg2.connect(**conn_params)
            conn.autocommit = True
            cursor = conn.cursor()
            
            # Vérifier si la base de données existe
            cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (config["dbname"],))
            exists = cursor.fetchone() is not None
            
            cursor.close()
            conn.close()
            
            return exists
        except Exception as e:
            print(f"❌ Erreur lors de la vérification de l'existence de la base de données: {e}")
            return False
    
    @classmethod
    def create_database(cls, config):
        """Crée la base de données."""
        conn_params = config.copy()
        conn_params["dbname"] = "postgres"  # Se connecter à la base postgres par défaut
        
        try:
            conn = psycopg2.connect(**conn_params)
            conn.autocommit = True
            cursor = conn.cursor()
            
            # Créer la base de données
            cursor.execute(f"CREATE DATABASE {config['dbname']}")
            
            cursor.close()
            conn.close()
            
            print(f"✅ Base de données {config['dbname']} créée avec succès")
            return True
        except Exception as e:
            print(f"❌ Erreur lors de la création de la base de données: {e}")
            return False
    
    @classmethod
    def execute_sql_file(cls, file_path):
        """Exécute un fichier SQL."""
        if not os.path.exists(file_path):
            print(f"❌ Fichier SQL non trouvé: {file_path}")
            return False
        
        try:
            # Lire le contenu du fichier
            with open(file_path, 'r', encoding='utf-8') as f:
                sql_script = f.read()
            
            # Diviser le script en instructions individuelles
            statements = [stmt.strip() for stmt in sql_script.split(';') if stmt.strip()]
            
            # Exécuter chaque instruction
            connection = DatabaseConnection.get_connection()
            cursor = connection.cursor()
            
            for statement in statements:
                try:
                    cursor.execute(statement)
                except Exception as e:
                    print(f"❌ Erreur lors de l'exécution de l'instruction: {e}")
                    print(f"Instruction: {statement[:100]}...")
            
            # Valider les modifications
            connection.commit()
            
            # Fermer le curseur et libérer la connexion
            cursor.close()
            DatabaseConnection.release_connection(connection)
            
            print(f"✅ Fichier SQL exécuté avec succès: {file_path}")
            return True
            
        except Exception as e:
            print(f"❌ Erreur lors de l'exécution du fichier SQL: {e}")
            return False
    
    @classmethod
    def _sync_sequences(cls):
        """Aligne les séquences SERIAL sur les valeurs max existantes."""
        sequence_targets = [
            ("coupe_du_monde", "id_coupe"),
            ("equipe", "id_equipe"),
            ("joueur", "id_joueur"),
            ("stade", "id_stade"),
            ("arbitre", "id_arbitre"),
            ("match", "id_match"),
            ("staff_technique", "id_staff"),
            ("sanction", "id_sanction"),
        ]
        for table_name, id_column in sequence_targets:
            query = (
                f"SELECT setval(pg_get_serial_sequence('{table_name}', '{id_column}'), "
                f"COALESCE((SELECT MAX({id_column}) FROM {table_name}), 0), true)"
            )
            DatabaseConnection.execute_query(query, fetchone=True)

    @classmethod
    def check_and_initialize_database(cls):
        """Vérifie si la base de données contient des données et les importe si nécessaire."""
        print("Vérification de la base de données...")
        
        # Vérifier si les tables existent en utilisant une requête plus robuste
        try:
            # Essayer d'exécuter une requête simple pour vérifier si le schéma existe
            result = DatabaseConnection.execute_query(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'",
                fetchone=True
            )
            
            # Si aucune table n'existe ou si une erreur s'est produite
            if not result or result[0] == 0:
                print("Aucune table trouvée. Initialisation du schéma...")
                if not cls.execute_sql_file(SCHEMA_FILE):
                    print("❌ Échec de l'initialisation du schéma.")
                    return False
                print("✅ Schéma initialisé avec succès.")
                
                # Après avoir créé le schéma, importer les données de test
                print("Importation des données de test...")
                if not cls.execute_sql_file(DATA_FILE):
                    print("❌ Échec de l'importation des données de test.")
                    return False
                print("✅ Données de test importées avec succès.")
                cls._sync_sequences()
                return True
        except Exception as e:
            print(f"❌ Erreur lors de la vérification des tables: {e}")
            print("Tentative d'initialisation du schéma...")
            if not cls.execute_sql_file(SCHEMA_FILE):
                print("❌ Échec de l'initialisation du schéma.")
                return False
            print("✅ Schéma initialisé avec succès.")
            
            # Après avoir créé le schéma, importer les données de test
            print("Importation des données de test...")
            if not cls.execute_sql_file(DATA_FILE):
                print("❌ Échec de l'importation des données de test.")
                return False
            print("✅ Données de test importées avec succès.")
            cls._sync_sequences()
            return True
        
        # Si les tables existent, vérifier si la table COUPE_DU_MONDE contient des données
        try:
            result = DatabaseConnection.execute_query(
                "SELECT COUNT(*) FROM coupe_du_monde",
                fetchone=True
            )
            
            # Si aucune donnée n'est trouvée, importer les données de test
            if not result or result[0] == 0:
                print("Tables trouvées mais aucune donnée. Importation des données de test...")
                if not cls.execute_sql_file(DATA_FILE):
                    print("❌ Échec de l'importation des données de test.")
                    return False
                print("✅ Données de test importées avec succès.")
                cls._sync_sequences()
            else:
                print(f"✅ Base de données initialisée avec {result[0]} coupes du monde")
                cls._sync_sequences()
        except Exception as e:
            print(f"❌ Erreur lors de la vérification des données: {e}")
            print("La table COUPE_DU_MONDE n'existe peut-être pas. Tentative d'initialisation du schéma...")
            if not cls.execute_sql_file(SCHEMA_FILE):
                print("❌ Échec de l'initialisation du schéma.")
                return False
            print("✅ Schéma initialisé avec succès.")
            
            # Après avoir créé le schéma, importer les données de test
            print("Importation des données de test...")
            if not cls.execute_sql_file(DATA_FILE):
                print("❌ Échec de l'importation des données de test.")
                return False
            print("✅ Données de test importées avec succès.")
            cls._sync_sequences()

        return True
