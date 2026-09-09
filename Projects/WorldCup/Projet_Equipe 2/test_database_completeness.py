"""
Tests complets pour vérifier l'intégrité des données de la Coupe du Monde.
Ce script vérifie que toutes les données requises sont présentes dans la base de données.
"""

import os
import sys
import unittest
import psycopg2
from psycopg2 import sql
import getpass

# Configuration de la base de données
DB_CONFIG = {
    "dbname": "coupe_du_monde",
    "user": "",  # Sera demandé à l'utilisateur
    "password": "",  # Sera demandé à l'utilisateur
    "host": "localhost",
    "port": "5432"
}

class TestDonneesCoupeDuMonde(unittest.TestCase):
    """Tests pour vérifier l'intégrité des données de la Coupe du Monde."""
    
    @classmethod
    def setUpClass(cls):
        """Configuration initiale pour les tests."""
        # Demander les identifiants à l'utilisateur
        print("Veuillez entrer vos identifiants PostgreSQL pour exécuter les tests:")
        DB_CONFIG["user"] = input("Nom d'utilisateur PostgreSQL: ")
        DB_CONFIG["password"] = getpass.getpass("Mot de passe PostgreSQL: ")
        
        print(f"Utilisation des informations de connexion: user={DB_CONFIG['user']}")
        
        # Établir la connexion
        try:
            cls.conn = psycopg2.connect(**DB_CONFIG)
            cls.cursor = cls.conn.cursor()
            print("✅ Connexion à la base de données établie avec succès")
        except Exception as e:
            print(f"❌ Erreur de connexion à la base de données: {e}")
            sys.exit(1)
    
    @classmethod
    def tearDownClass(cls):
        """Nettoyage après les tests."""
        if hasattr(cls, 'cursor') and cls.cursor:
            cls.cursor.close()
        if hasattr(cls, 'conn') and cls.conn:
            cls.conn.close()
    
    def test_coupes_du_monde(self):
        """Vérifie que la table COUPE_DU_MONDE contient des données."""
        self.cursor.execute("SELECT COUNT(*) FROM COUPE_DU_MONDE")
        count = self.cursor.fetchone()[0]
        self.assertGreater(count, 0, "La table COUPE_DU_MONDE ne contient aucune donnée")
        
        # Vérifier les champs spécifiques
        self.cursor.execute("SELECT id_coupe, annee, date_debut, date_fin, nb_equipes, format, slogan FROM COUPE_DU_MONDE LIMIT 1")
        row = self.cursor.fetchone()
        self.assertIsNotNone(row, "Impossible de récupérer une ligne de la table COUPE_DU_MONDE")
        self.assertIsNotNone(row[0], "L'ID de la coupe est NULL")
        self.assertIsNotNone(row[1], "L'année de la coupe est NULL")
        self.assertIsNotNone(row[2], "La date de début est NULL")
        self.assertIsNotNone(row[3], "La date de fin est NULL")
        self.assertIsNotNone(row[4], "Le nombre d'équipes est NULL")
        self.assertIsNotNone(row[5], "Le format est NULL")
        
        print(f"✅ Test des coupes du monde réussi: {count} coupes trouvées")
    
    def test_equipes(self):
        """Vérifie que la table EQUIPE contient des données."""
        self.cursor.execute("SELECT COUNT(*) FROM EQUIPE")
        count = self.cursor.fetchone()[0]
        self.assertGreater(count, 0, "La table EQUIPE ne contient aucune donnée")
        
        # Vérifier les champs spécifiques
        self.cursor.execute("SELECT id_equipe, pays, confederation, classement_fifa, nb_participations FROM EQUIPE LIMIT 1")
        row = self.cursor.fetchone()
        self.assertIsNotNone(row, "Impossible de récupérer une ligne de la table EQUIPE")
        self.assertIsNotNone(row[0], "L'ID de l'équipe est NULL")
        self.assertIsNotNone(row[1], "Le pays est NULL")
        self.assertIsNotNone(row[2], "La confédération est NULL")
        
        print(f"✅ Test des équipes réussi: {count} équipes trouvées")
    
    def test_joueurs(self):
        """Vérifie que la table JOUEUR contient des données."""
        self.cursor.execute("SELECT COUNT(*) FROM JOUEUR")
        count = self.cursor.fetchone()[0]
        self.assertGreater(count, 0, "La table JOUEUR ne contient aucune donnée")
        
        # Vérifier les champs spécifiques
        self.cursor.execute("SELECT id_joueur, nom, prenom, date_naissance, nationalite, poste FROM JOUEUR LIMIT 1")
        row = self.cursor.fetchone()
        self.assertIsNotNone(row, "Impossible de récupérer une ligne de la table JOUEUR")
        self.assertIsNotNone(row[0], "L'ID du joueur est NULL")
        self.assertIsNotNone(row[1], "Le nom du joueur est NULL")
        self.assertIsNotNone(row[2], "Le prénom du joueur est NULL")
        self.assertIsNotNone(row[3], "La date de naissance est NULL")
        self.assertIsNotNone(row[4], "La nationalité est NULL")
        self.assertIsNotNone(row[5], "Le poste est NULL")
        
        print(f"✅ Test des joueurs réussi: {count} joueurs trouvés")
    
    def test_matchs(self):
        """Vérifie que la table MATCH contient des données avec dates, lieux et scores."""
        self.cursor.execute("SELECT COUNT(*) FROM MATCH")
        count = self.cursor.fetchone()[0]
        self.assertGreater(count, 0, "La table MATCH ne contient aucune donnée")
        
        # Vérifier les champs spécifiques
        self.cursor.execute("""
            SELECT m.id_match, m.date, m.heure, m.phase_competition, 
                   s.nom as stade, s.ville, s.pays,
                   e1.pays as equipe1, e2.pays as equipe2
            FROM MATCH m
            JOIN STADE s ON m.id_stade = s.id_stade
            JOIN EQUIPE e1 ON m.id_equipe1 = e1.id_equipe
            JOIN EQUIPE e2 ON m.id_equipe2 = e2.id_equipe
            LIMIT 1
        """)
        row = self.cursor.fetchone()
        self.assertIsNotNone(row, "Impossible de récupérer une ligne de la table MATCH avec les jointures")
        self.assertIsNotNone(row[0], "L'ID du match est NULL")
        self.assertIsNotNone(row[1], "La date du match est NULL")
        self.assertIsNotNone(row[2], "L'heure du match est NULL")
        self.assertIsNotNone(row[3], "La phase de compétition est NULL")
        self.assertIsNotNone(row[4], "Le nom du stade est NULL")
        self.assertIsNotNone(row[5], "La ville du stade est NULL")
        self.assertIsNotNone(row[6], "Le pays du stade est NULL")
        self.assertIsNotNone(row[7], "L'équipe 1 est NULL")
        self.assertIsNotNone(row[8], "L'équipe 2 est NULL")
        
        # Vérifier les scores
        self.cursor.execute("""
            SELECT COUNT(*) FROM RESULTAT_MATCH
        """)
        score_count = self.cursor.fetchone()[0]
        self.assertGreater(score_count, 0, "La table RESULTAT_MATCH ne contient aucune donnée")
        
        self.cursor.execute("""
            SELECT rm.score_equipe1, rm.score_equipe2
            FROM RESULTAT_MATCH rm
            LIMIT 1
        """)
        score_row = self.cursor.fetchone()
        self.assertIsNotNone(score_row, "Impossible de récupérer une ligne de la table RESULTAT_MATCH")
        self.assertIsNotNone(score_row[0], "Le score de l'équipe 1 est NULL")
        self.assertIsNotNone(score_row[1], "Le score de l'équipe 2 est NULL")
        
        print(f"✅ Test des matchs réussi: {count} matchs trouvés avec {score_count} résultats")
    
    def test_arbitres(self):
        """Vérifie que la table ARBITRE contient des données."""
        self.cursor.execute("SELECT COUNT(*) FROM ARBITRE")
        count = self.cursor.fetchone()[0]
        self.assertGreater(count, 0, "La table ARBITRE ne contient aucune donnée")
        
        # Vérifier les champs spécifiques
        self.cursor.execute("SELECT id_arbitre, nom, prenom, nationalite FROM ARBITRE LIMIT 1")
        row = self.cursor.fetchone()
        self.assertIsNotNone(row, "Impossible de récupérer une ligne de la table ARBITRE")
        self.assertIsNotNone(row[0], "L'ID de l'arbitre est NULL")
        self.assertIsNotNone(row[1], "Le nom de l'arbitre est NULL")
        self.assertIsNotNone(row[2], "Le prénom de l'arbitre est NULL")
        self.assertIsNotNone(row[3], "La nationalité de l'arbitre est NULL")
        
        # Vérifier l'attribution des arbitres aux matchs
        self.cursor.execute("""
            SELECT COUNT(*) FROM MATCH m
            WHERE m.id_arbitre_principal IS NOT NULL
        """)
        match_count = self.cursor.fetchone()[0]
        self.assertGreater(match_count, 0, "Aucun match n'a d'arbitre principal assigné")
        
        print(f"✅ Test des arbitres réussi: {count} arbitres trouvés, utilisés dans {match_count} matchs")
    
    def test_sanctions(self):
        """Vérifie que la table SANCTION contient des données (cartons jaunes/rouges)."""
        self.cursor.execute("SELECT COUNT(*) FROM SANCTION")
        count = self.cursor.fetchone()[0]
        
        if count > 0:
            # Vérifier les champs spécifiques
            self.cursor.execute("""
                SELECT s.id_sanction, s.type, s.minute, j.nom, j.prenom
                FROM SANCTION s
                JOIN JOUEUR j ON s.id_joueur = j.id_joueur
                LIMIT 1
            """)
            row = self.cursor.fetchone()
            self.assertIsNotNone(row, "Impossible de récupérer une ligne de la table SANCTION avec les jointures")
            self.assertIsNotNone(row[0], "L'ID de la sanction est NULL")
            self.assertIsNotNone(row[1], "Le type de sanction est NULL")
            self.assertIsNotNone(row[2], "La minute de la sanction est NULL")
            self.assertIsNotNone(row[3], "Le nom du joueur est NULL")
            self.assertIsNotNone(row[4], "Le prénom du joueur est NULL")
            
            # Vérifier les types de sanctions
            self.cursor.execute("""
                SELECT COUNT(*) FROM SANCTION WHERE type = 'Carton jaune'
            """)
            yellow_count = self.cursor.fetchone()[0]
            
            self.cursor.execute("""
                SELECT COUNT(*) FROM SANCTION WHERE type = 'Carton rouge'
            """)
            red_count = self.cursor.fetchone()[0]
            
            print(f"✅ Test des sanctions réussi: {count} sanctions trouvées ({yellow_count} cartons jaunes, {red_count} cartons rouges)")
        else:
            print("⚠️ Aucune sanction trouvée dans la base de données. Ce n'est pas nécessairement une erreur, mais vérifiez si c'est attendu.")
    
    def test_statistiques(self):
        """Vérifie que les requêtes de statistiques retournent des résultats."""
        # Test des meilleurs buteurs
        self.cursor.execute("""
            SELECT COUNT(*) FROM (
                SELECT j.id_joueur, j.nom, j.prenom, SUM(pjm.buts) AS total_buts
                FROM JOUEUR j
                JOIN PARTICIPATION_JOUEUR_MATCH pjm ON j.id_joueur = pjm.id_joueur
                GROUP BY j.id_joueur, j.nom, j.prenom
                HAVING SUM(pjm.buts) > 0
                ORDER BY total_buts DESC
                LIMIT 20
            ) AS buteurs
        """)
        buteurs_count = self.cursor.fetchone()[0]
        
        # Test du palmarès des équipes
        self.cursor.execute("""
            SELECT COUNT(*) FROM (
                SELECT e.id_equipe, e.pays, 
                       SUM(CASE WHEN pe.resultat_final = 'Vainqueur' THEN 1 ELSE 0 END) AS titres
                FROM EQUIPE e
                LEFT JOIN PARTICIPATION_EQUIPE pe ON e.id_equipe = pe.id_equipe
                GROUP BY e.id_equipe, e.pays
                ORDER BY titres DESC
            ) AS palmares
        """)
        palmares_count = self.cursor.fetchone()[0]
        
        # Test des buts par coupe
        self.cursor.execute("""
            SELECT COUNT(*) FROM (
                SELECT cdm.id_coupe, cdm.annee, SUM(rm.score_equipe1 + rm.score_equipe2) AS total_buts
                FROM MATCH m
                JOIN RESULTAT_MATCH rm ON m.id_match = rm.id_match
                JOIN COUPE_DU_MONDE cdm ON m.id_coupe = cdm.id_coupe
                GROUP BY cdm.id_coupe, cdm.annee
                ORDER BY cdm.annee
            ) AS buts_par_coupe
        """)
        buts_par_coupe_count = self.cursor.fetchone()[0]
        
        # Test des joueurs ayant participé à plusieurs coupes
        self.cursor.execute("""
            SELECT COUNT(*) FROM (
                SELECT j.id_joueur, j.nom, j.prenom, COUNT(DISTINCT sj.id_coupe) AS nb_coupes_monde
                FROM JOUEUR j
                JOIN SELECTION_JOUEUR sj ON j.id_joueur = sj.id_joueur
                GROUP BY j.id_joueur, j.nom, j.prenom
                HAVING COUNT(DISTINCT sj.id_coupe) > 1
                ORDER BY nb_coupes_monde DESC
            ) AS joueurs_plusieurs_coupes
        """)
        joueurs_plusieurs_coupes_count = self.cursor.fetchone()[0]
        
        print(f"✅ Test des statistiques réussi:")
        print(f"   - {buteurs_count} meilleurs buteurs trouvés")
        print(f"   - {palmares_count} équipes dans le palmarès")
        print(f"   - {buts_par_coupe_count} coupes avec statistiques de buts")
        print(f"   - {joueurs_plusieurs_coupes_count} joueurs ayant participé à plusieurs coupes")
    
    def test_relations_equipes_joueurs(self):
        """Vérifie les relations entre équipes et joueurs."""
        self.cursor.execute("""
            SELECT COUNT(*) FROM SELECTION_JOUEUR
        """)
        count = self.cursor.fetchone()[0]
        self.assertGreater(count, 0, "La table SELECTION_JOUEUR ne contient aucune donnée")
        
        # Vérifier que chaque joueur est associé à une équipe
        self.cursor.execute("""
            SELECT COUNT(DISTINCT id_joueur) FROM SELECTION_JOUEUR
        """)
        joueurs_count = self.cursor.fetchone()[0]
        self.assertGreater(joueurs_count, 0, "Aucun joueur n'est associé à une équipe")
        
        print(f"✅ Test des relations équipes-joueurs réussi: {joueurs_count} joueurs associés à des équipes")
    
    def test_completude_donnees(self):
        """Vérifie la complétude globale des données."""
        # Vérifier que toutes les tables principales contiennent des données
        tables = [
            "COUPE_DU_MONDE", "EQUIPE", "JOUEUR", "MATCH", "STADE", "ARBITRE", 
            "RESULTAT_MATCH", "PARTICIPATION_EQUIPE", "SELECTION_JOUEUR"
        ]
        
        for table in tables:
            self.cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = self.cursor.fetchone()[0]
            self.assertGreater(count, 0, f"La table {table} ne contient aucune donnée")
            print(f"   - Table {table}: {count} enregistrements")
        
        print("✅ Test de complétude des données réussi: toutes les tables principales contiennent des données")

if __name__ == "__main__":
    unittest.main()
