#!/usr/bin/env python3
"""
Script pour supprimer la base de données 'coupe_du_monde' si elle existe.
"""
import sys
import getpass
import psycopg2

def drop_database():
    """Supprime la base de données 'coupe_du_monde' si elle existe."""
    print("\n===== SUPPRESSION DE LA BASE DE DONNÉES =====")
    
    # Demander les informations de connexion
    user = input("Nom d'utilisateur PostgreSQL : ")
    password = getpass.getpass("Mot de passe PostgreSQL : ")
    
    # Configuration pour se connecter à la base postgres par défaut
    conn_params = {
        "dbname": "postgres",
        "user": user,
        "password": password,
        "host": "localhost"
    }
    
    try:
        # Se connecter à la base postgres
        conn = psycopg2.connect(**conn_params)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Vérifier si la base de données existe
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'coupe_du_monde'")
        exists = cursor.fetchone() is not None
        
        if not exists:
            print("La base de données 'coupe_du_monde' n'existe pas.")
            cursor.close()
            conn.close()
            return
        
        # Fermer toutes les connexions à la base de données
        cursor.execute("""
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'coupe_du_monde'
            AND pid <> pg_backend_pid()
        """)
        
        # Supprimer la base de données
        cursor.execute("DROP DATABASE coupe_du_monde")
        
        cursor.close()
        conn.close()
        
        print("✅ Base de données 'coupe_du_monde' supprimée avec succès")
        
    except Exception as e:
        print(f"❌ Erreur lors de la suppression de la base de données: {e}")
        return

if __name__ == "__main__":
    drop_database()
