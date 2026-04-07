#!/bin/bash

DB_NAME="coupe_du_monde"
SCHEMA_FILE="schema_coupe_du_monde.sql"
DATA_FILE="donnees_test.sql"
REQUETES_FILE="requetes_statistiques.sql"

# Demander le nom d'utilisateur PostgreSQL
read -p "Nom d'utilisateur PostgreSQL : " DB_USER

# Vérifier que le nom d'utilisateur a été fourni
if [ -z "$DB_USER" ]; then
    echo "❌ Erreur : Nom d'utilisateur requis pour continuer."
    exit 1
fi

echo "🔄 Suppression de l'ancienne base de données (si elle existe)..."
dropdb -U "$DB_USER" "$DB_NAME" 2>/dev/null

echo "✅ Création de la base de données..."
createdb -U "$DB_USER" "$DB_NAME"

echo "📐 Chargement du schéma SQL..."
psql -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_FILE"

echo "📦 Insertion des données de test..."
psql -U "$DB_USER" -d "$DB_NAME" -f "$DATA_FILE"

echo "📊 Exécution des requêtes statistiques (facultatif)..."
psql -U "$DB_USER" -d "$DB_NAME" -f "$REQUETES_FILE"

echo "✅ Setup terminé avec succès !"
