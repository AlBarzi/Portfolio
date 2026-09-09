"""
Module de gestion de la connexion à la base de données.
"""

import psycopg2
from psycopg2 import pool

class DatabaseConnection:
    """Gestionnaire de connexion à la base de données."""
    
    connection_pool = None
    
    @classmethod
    def initialize_pool(cls, config):
        """Initialise le pool de connexions pour PostgreSQL."""
        try:
            cls.connection_pool = psycopg2.pool.SimpleConnectionPool(
                1, 10,  # min, max connections
                **config
            )
            print("✅ Pool de connexions PostgreSQL initialisé avec succès")
            return True
        except Exception as e:
            print(f"❌ Erreur lors de l'initialisation du pool de connexions PostgreSQL: {e}")
            return False
    
    @classmethod
    def get_connection(cls):
        """Récupère une connexion à la base de données."""
        if cls.connection_pool is None:
            return None
        return cls.connection_pool.getconn()
    
    @classmethod
    def release_connection(cls, connection):
        """Libère une connexion."""
        cls.connection_pool.putconn(connection)
    
    @classmethod
    def execute_query(cls, query, params=None, fetchone=False, fetchall=False, commit=False):
        """Exécute une requête SQL."""
        connection = None
        cursor = None
        result = None
        
        try:
            connection = cls.get_connection()
            if connection is None:
                return None
                
            cursor = connection.cursor()
            
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            if fetchone:
                result = cursor.fetchone()
            elif fetchall:
                result = cursor.fetchall()
            
            if commit:
                connection.commit()
            
            if fetchone or fetchall:
                return result
            return True

        except Exception as e:
            if connection:
                connection.rollback()
            print(f"❌ Erreur lors de l'exécution de la requête: {e}")
            print(f"Requête: {query}")
            print(f"Paramètres: {params}")
            return None
        
        finally:
            if cursor:
                cursor.close()
            if connection:
                cls.release_connection(connection)

    @classmethod
    def execute_transaction(cls, queries):
        """Exécute une liste d'instructions SQL dans une seule transaction.

        Chaque élément de queries est un dict avec: query, params, fetchone, fetchall.
        Retourne une liste des résultats (None si pas de fetch).
        """
        connection = None
        cursor = None
        results = []
        try:
            connection = cls.get_connection()
            if connection is None:
                return None

            cursor = connection.cursor()
            for item in queries:
                query = item.get("query")
                params = item.get("params")
                fetchone = item.get("fetchone", False)
                fetchall = item.get("fetchall", False)

                if params is not None:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)

                if fetchone:
                    results.append(cursor.fetchone())
                elif fetchall:
                    results.append(cursor.fetchall())
                else:
                    results.append(None)

            connection.commit()
            return results
        except Exception as e:
            if connection:
                connection.rollback()
            print(f"❌ Erreur lors de l'exécution de la transaction: {e}")
            for item in queries:
                print(f"Requête: {item.get('query')}")
                print(f"Paramètres: {item.get('params')}")
            return None
        finally:
            if cursor:
                cursor.close()
            if connection:
                cls.release_connection(connection)
