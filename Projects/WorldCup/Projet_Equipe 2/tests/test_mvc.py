"""
Module de test pour l'application Coupe du Monde restructurée en MVC.
"""

import unittest
import os
import sys
import tkinter as tk
from tkinter import ttk
import getpass

# Ajouter le répertoire parent au chemin de recherche
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import DB_CONFIG
from models.database import DatabaseConnection
from models.initializer import DatabaseInitializer
from controllers.app_controller import ViewController, CoupeDuMondeApp
from views.basic_views import CoupeView, EquipeView, JoueurView
from views.match_views import MatchView
from views.stats_view import StatistiquesView

class TestMVCStructure(unittest.TestCase):
    """Tests pour vérifier la structure MVC."""
    
    def test_directory_structure(self):
        """Teste la structure des répertoires."""
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Vérifier l'existence des répertoires principaux
        self.assertTrue(os.path.isdir(os.path.join(base_dir, 'config')), "Le répertoire config n'existe pas")
        self.assertTrue(os.path.isdir(os.path.join(base_dir, 'controllers')), "Le répertoire controllers n'existe pas")
        self.assertTrue(os.path.isdir(os.path.join(base_dir, 'models')), "Le répertoire models n'existe pas")
        self.assertTrue(os.path.isdir(os.path.join(base_dir, 'views')), "Le répertoire views n'existe pas")
        self.assertTrue(os.path.isdir(os.path.join(base_dir, 'resources')), "Le répertoire resources n'existe pas")
        
        # Vérifier l'existence des fichiers principaux
        self.assertTrue(os.path.isfile(os.path.join(base_dir, 'main.py')), "Le fichier main.py n'existe pas")
        self.assertTrue(os.path.isfile(os.path.join(base_dir, 'config', 'settings.py')), "Le fichier settings.py n'existe pas")
        self.assertTrue(os.path.isfile(os.path.join(base_dir, 'controllers', 'app_controller.py')), "Le fichier app_controller.py n'existe pas")
        self.assertTrue(os.path.isfile(os.path.join(base_dir, 'models', 'database.py')), "Le fichier database.py n'existe pas")
        self.assertTrue(os.path.isfile(os.path.join(base_dir, 'models', 'initializer.py')), "Le fichier initializer.py n'existe pas")
        self.assertTrue(os.path.isfile(os.path.join(base_dir, 'models', 'entities.py')), "Le fichier entities.py n'existe pas")
        self.assertTrue(os.path.isfile(os.path.join(base_dir, 'views', 'basic_views.py')), "Le fichier basic_views.py n'existe pas")
        self.assertTrue(os.path.isfile(os.path.join(base_dir, 'views', 'match_views.py')), "Le fichier match_views.py n'existe pas")
        self.assertTrue(os.path.isfile(os.path.join(base_dir, 'views', 'stats_view.py')), "Le fichier stats_view.py n'existe pas")

class TestModels(unittest.TestCase):
    """Tests pour les modèles."""
    
    @classmethod
    def setUpClass(cls):
        """Configuration avant les tests."""
        # Configurer la base de données de test en demandant les identifiants à l'utilisateur
        cls.db_config = DB_CONFIG.copy()
        
        print("Veuillez entrer vos identifiants PostgreSQL pour exécuter les tests MVC:")
        cls.db_config["user"] = input("Nom d'utilisateur PostgreSQL: ")
        cls.db_config["password"] = getpass.getpass("Mot de passe PostgreSQL: ")
        
        print(f"Utilisation des informations de connexion: user={cls.db_config['user']}")
        
        # Initialiser la connexion à la base de données
        DatabaseConnection.initialize_pool(cls.db_config)
    
    def test_database_connection(self):
        """Teste la connexion à la base de données."""
        connection = DatabaseConnection.get_connection()
        self.assertIsNotNone(connection, "La connexion à la base de données a échoué")
        DatabaseConnection.release_connection(connection)
    
    def test_execute_query(self):
        """Teste l'exécution d'une requête."""
        result = DatabaseConnection.execute_query("SELECT 1", fetchone=True)
        self.assertIsNotNone(result, "L'exécution de la requête a échoué")
        self.assertEqual(result[0], 1, "Le résultat de la requête est incorrect")

class TestViews(unittest.TestCase):
    """Tests pour les vues."""
    
    @classmethod
    def setUpClass(cls):
        """Configuration avant les tests."""
        # Créer la fenêtre principale
        cls.root = tk.Tk()
        cls.root.withdraw()  # Cacher la fenêtre
        
        # Créer le contrôleur mock
        cls.controller = MockViewController()
    
    @classmethod
    def tearDownClass(cls):
        """Nettoyage après les tests."""
        cls.root.destroy()
    
    def test_coupe_view(self):
        """Teste la vue CoupeView."""
        view = CoupeView(self.root, self.controller)
        self.assertIsInstance(view, ttk.Frame, "CoupeView n'est pas une instance de ttk.Frame")
        self.assertTrue(hasattr(view, 'tree'), "CoupeView n'a pas d'attribut tree")
        self.assertTrue(hasattr(view, 'load_data'), "CoupeView n'a pas de méthode load_data")
    
    def test_equipe_view(self):
        """Teste la vue EquipeView."""
        view = EquipeView(self.root, self.controller)
        self.assertIsInstance(view, ttk.Frame, "EquipeView n'est pas une instance de ttk.Frame")
        self.assertTrue(hasattr(view, 'tree'), "EquipeView n'a pas d'attribut tree")
        self.assertTrue(hasattr(view, 'load_data'), "EquipeView n'a pas de méthode load_data")
    
    def test_joueur_view(self):
        """Teste la vue JoueurView."""
        view = JoueurView(self.root, self.controller)
        self.assertIsInstance(view, ttk.Frame, "JoueurView n'est pas une instance de ttk.Frame")
        self.assertTrue(hasattr(view, 'tree'), "JoueurView n'a pas d'attribut tree")
        self.assertTrue(hasattr(view, 'load_data'), "JoueurView n'a pas de méthode load_data")
    
    def test_match_view(self):
        """Teste la vue MatchView."""
        view = MatchView(self.root, self.controller)
        self.assertIsInstance(view, ttk.Frame, "MatchView n'est pas une instance de ttk.Frame")
        self.assertTrue(hasattr(view, 'tree'), "MatchView n'a pas d'attribut tree")
        self.assertTrue(hasattr(view, 'load_data'), "MatchView n'a pas de méthode load_data")
    
    def test_stats_view(self):
        """Teste la vue StatistiquesView."""
        view = StatistiquesView(self.root, self.controller)
        self.assertIsInstance(view, ttk.Frame, "StatistiquesView n'est pas une instance de ttk.Frame")
        self.assertTrue(hasattr(view, 'results_tree'), "StatistiquesView n'a pas d'attribut results_tree")
        self.assertTrue(hasattr(view, 'show_top_scorers'), "StatistiquesView n'a pas de méthode show_top_scorers")

# Classe mock pour le contrôleur de vue
class MockViewController:
    """Contrôleur de vue mock pour les tests."""
    
    def get_coupes(self):
        """Récupère les coupes du monde (mock)."""
        return [(1, 2022, '2022-11-20', '2022-12-18', 32, 'Groupes + Élimination directe', 'Qatar 2022')]
    
    def search_coupes(self, criteria):
        """Recherche des coupes du monde (mock)."""
        return self.get_coupes()
    
    def get_equipes(self):
        """Récupère les équipes (mock)."""
        return [(1, 'France', 'UEFA', 1, 16)]
    
    def search_equipes(self, criteria):
        """Recherche des équipes (mock)."""
        return self.get_equipes()
    
    def get_joueurs(self):
        """Récupère les joueurs (mock)."""
        return [(1, 'Mbappé', 'Kylian', '1998-12-20', 'France', 'Attaquant')]
    
    def search_joueurs(self, criteria):
        """Recherche des joueurs (mock)."""
        return self.get_joueurs()
    
    def get_matchs(self):
        """Récupère les matchs (mock)."""
        return [(1, 1, 2022, '2022-12-18', '15:00', 1, 'France', 2, 'Argentine', 1, 'Lusail Stadium', 'Lusail', 'Qatar', 1, 'Marciniak', 'Szymon', 'Finale')]
    
    def search_matchs(self, criteria):
        """Recherche des matchs (mock)."""
        return self.get_matchs()
    
    def get_match_details(self, id_match):
        """Récupère les détails d'un match (mock)."""
        match = self.get_matchs()[0]
        resultat = (2, 3, 0, 0, True, True, 2, 4)
        joueurs = [(1, 'Mbappé', 'Kylian', 'France', 'Attaquant', True, None, 90, 3, 0)]
        sanctions = [(1, 1, 'Mbappé', 'Kylian', 'France', 'Carton jaune', 87, 'Contestation')]
        
        return {
            'match': match,
            'resultat': resultat,
            'joueurs': joueurs,
            'sanctions': sanctions
        }
    
    def get_meilleurs_buteurs(self):
        """Récupère les meilleurs buteurs (mock)."""
        return [(1, 'Mbappé', 'Kylian', 'France', 'France', 8)]
    
    def get_meilleurs_buteurs_coupe(self, id_coupe):
        """Récupère les meilleurs buteurs d'une coupe du monde spécifique (mock)."""
        return self.get_meilleurs_buteurs()
    
    def get_equipes_par_participations(self):
        """Récupère les équipes par nombre de participations (mock)."""
        return self.get_equipes()
    
    def get_palmares_equipes(self):
        """Récupère le palmarès des équipes (mock)."""
        return [(1, 'France', 'UEFA', 2, 1, 2, 16)]
    
    def get_buts_par_coupe(self):
        """Récupère le nombre de buts par Coupe du Monde (mock)."""
        return [(1, 2022, 172, 64, 2.69)]
    
    def get_joueurs_plusieurs_coupes(self):
        """Récupère les joueurs ayant participé à plusieurs Coupes du Monde (mock)."""
        return [(1, 'Mbappé', 'Kylian', 'France', 2, '2018, 2022')]
    
    def get_statistiques(self):
        """Récupère toutes les statistiques (mock)."""
        return {
            'meilleurs_buteurs': self.get_meilleurs_buteurs(),
            'equipes_par_participations': self.get_equipes_par_participations(),
            'palmares': self.get_palmares_equipes(),
            'buts_par_coupe': self.get_buts_par_coupe(),
            'joueurs_plusieurs_coupes': self.get_joueurs_plusieurs_coupes()
        }

class TestControllers(unittest.TestCase):
    """Tests pour les contrôleurs."""
    
    def test_view_controller(self):
        """Teste le contrôleur de vue."""
        controller = ViewController()
        self.assertTrue(hasattr(controller, 'get_coupes'), "ViewController n'a pas de méthode get_coupes")
        self.assertTrue(hasattr(controller, 'get_equipes'), "ViewController n'a pas de méthode get_equipes")
        self.assertTrue(hasattr(controller, 'get_joueurs'), "ViewController n'a pas de méthode get_joueurs")
        self.assertTrue(hasattr(controller, 'get_matchs'), "ViewController n'a pas de méthode get_matchs")
        self.assertTrue(hasattr(controller, 'get_statistiques'), "ViewController n'a pas de méthode get_statistiques")
    
    def test_app_controller(self):
        """Teste le contrôleur d'application."""
        app = CoupeDuMondeApp()
        self.assertTrue(hasattr(app, 'run'), "CoupeDuMondeApp n'a pas de méthode run")
        self.assertTrue(hasattr(app, '_initialize_database'), "CoupeDuMondeApp n'a pas de méthode _initialize_database")
        self.assertTrue(hasattr(app, '_create_ui'), "CoupeDuMondeApp n'a pas de méthode _create_ui")

if __name__ == '__main__':
    unittest.main()
