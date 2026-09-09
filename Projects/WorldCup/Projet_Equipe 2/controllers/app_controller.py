"""
Module contenant les contrôleurs pour l'application Coupe du Monde.
"""

import os
import sys
import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
from PIL import Image, ImageTk

from config.settings import DB_CONFIG, LOGO_FILE
from models.database import DatabaseConnection
from models.initializer import DatabaseInitializer
from models.entities import CoupeDuMondeModel, EquipeModel, JoueurModel, MatchModel, StatistiquesModel
from models.stats_joueurs_coupes import StatistiquesJoueursCoupeModel
from models.search import SearchModel
from views.basic_views import CoupeView, EquipeView, JoueurView
from views.match_views import MatchView
from views.stats_view import StatistiquesView

class TabNavigation(ttk.Notebook):
    """Navigation par onglets."""
    
    def __init__(self, parent):
        super().__init__(parent)
        self.tab_frames = {}
        self.on_tab_change = None
        
        # Créer les onglets
        self._create_tabs()
        
        # Configurer l'événement de changement d'onglet
        self.bind("<<NotebookTabChanged>>", self._tab_changed)
    
    def _create_tabs(self):
        """Crée les onglets."""
        tabs = [
            ("coupes", "Coupes du Monde"),
            ("equipes", "Équipes"),
            ("joueurs", "Joueurs"),
            ("matchs", "Matchs"),
            ("stats", "Statistiques")
        ]
        
        for tab_id, tab_text in tabs:
            frame = ttk.Frame(self)
            self.add(frame, text=tab_text)
            self.tab_frames[tab_id] = frame
    
    def get_tab_frame(self, tab_id):
        """Récupère le frame d'un onglet."""
        return self.tab_frames.get(tab_id)
    
    def _tab_changed(self, event):
        """Gère l'événement de changement d'onglet."""
        if self.on_tab_change:
            tab_id = list(self.tab_frames.keys())[self.index("current")]
            self.on_tab_change(tab_id)

class ViewController:
    """Contrôleur pour les vues."""
    
    def get_coupes(self):
        """Récupère les coupes du monde."""
        return CoupeDuMondeModel.get_all()
    
    def search_coupes(self, criteria):
        """Recherche des coupes du monde selon les critères spécifiés."""
        return SearchModel.search_coupes(criteria)
    
    def get_equipes(self):
        """Récupère les équipes."""
        return EquipeModel.get_all()
    
    def search_equipes(self, criteria):
        """Recherche des équipes selon les critères spécifiés."""
        return SearchModel.search_equipes(criteria)
    
    def get_joueurs(self):
        """Récupère les joueurs."""
        return JoueurModel.get_all()
    
    def search_joueurs(self, criteria):
        """Recherche des joueurs selon les critères spécifiés."""
        return SearchModel.search_joueurs(criteria)
    
    def get_matchs(self):
        """Récupère les matchs."""
        return MatchModel.get_all()
    
    def search_matchs(self, criteria):
        """Recherche des matchs selon les critères spécifiés."""
        return SearchModel.search_matchs(criteria)
    
    def get_match_details(self, id_match):
        """Récupère les détails d'un match."""
        match = MatchModel.get_by_id(id_match)
        resultat = MatchModel.get_resultat(id_match)
        joueurs = MatchModel.get_joueurs_match(id_match)
        sanctions = MatchModel.get_sanctions_match(id_match)
        
        return {
            'match': match,
            'resultat': resultat,
            'joueurs': joueurs,
            'sanctions': sanctions
        }
    
    def get_meilleurs_buteurs(self):
        """Récupère les meilleurs buteurs."""
        return StatistiquesModel.get_meilleurs_buteurs()
    
    def get_meilleurs_buteurs_coupe(self, id_coupe):
        """Récupère les meilleurs buteurs d'une coupe du monde spécifique."""
        return StatistiquesModel.get_meilleurs_buteurs_coupe(id_coupe)
    
    def get_equipes_par_participations(self):
        """Récupère les équipes par nombre de participations."""
        return StatistiquesModel.get_equipes_par_participations()
    
    def get_palmares_equipes(self):
        """Récupère le palmarès des équipes."""
        return StatistiquesModel.get_palmares_equipes()
    
    def get_buts_par_coupe(self):
        """Récupère le nombre de buts par Coupe du Monde."""
        return StatistiquesModel.get_buts_par_coupe()
    
    def get_joueurs_plusieurs_coupes(self):
        """Récupère les joueurs ayant participé à plusieurs Coupes du Monde."""
        return StatistiquesModel.get_joueurs_plusieurs_coupes()
    
    def get_joueurs_plus_coupes_gagnees(self):
        """Récupère les joueurs ayant gagné le plus de Coupes du Monde."""
        return StatistiquesJoueursCoupeModel.get_joueurs_plus_coupes_gagnees()
    
    def get_statistiques(self):
        """Récupère toutes les statistiques."""
        return {
            'meilleurs_buteurs': self.get_meilleurs_buteurs(),
            'equipes_par_participations': self.get_equipes_par_participations(),
            'palmares': self.get_palmares_equipes(),
            'buts_par_coupe': self.get_buts_par_coupe(),
            'joueurs_plusieurs_coupes': self.get_joueurs_plusieurs_coupes(),
            'joueurs_plus_coupes_gagnees': self.get_joueurs_plus_coupes_gagnees()
        }

class CoupeDuMondeApp:
    """Application principale Coupe du Monde."""
    
    def __init__(self):
        """Initialise l'application."""
        self.root = None
        self.tab_nav = None
        self.views = {}
        self.controller = None
        self.db_config = DB_CONFIG.copy()
    
    def run(self):
        """Lance l'application."""
        # Demander les informations de connexion PostgreSQL
        if not self._get_db_credentials():
            sys.exit(1)
        
        # Initialiser la base de données
        if not self._initialize_database():
            sys.exit(1)
        
        # Créer l'interface utilisateur
        self._create_ui()
        
        # Lancer la boucle principale
        self.root.mainloop()
    
    def _get_db_credentials(self):
        """Demande les informations de connexion à la base de données."""
        # Créer une fenêtre temporaire pour les dialogues
        temp_root = tk.Tk()
        temp_root.withdraw()
        
        # Demander le nom d'utilisateur PostgreSQL
        username = simpledialog.askstring("Connexion PostgreSQL", 
                                         "Entrez votre nom d'utilisateur PostgreSQL :")
        if not username:
            messagebox.showerror("Erreur", "Nom d'utilisateur requis pour la connexion à PostgreSQL.")
            temp_root.destroy()
            return False
        
        self.db_config["user"] = username
        
        # Demander le mot de passe PostgreSQL
        password = simpledialog.askstring("Connexion PostgreSQL", 
                                         "Entrez votre mot de passe PostgreSQL :", 
                                         show='*')
        if not password:
            messagebox.showerror("Erreur", "Mot de passe requis pour la connexion à PostgreSQL.")
            temp_root.destroy()
            return False
        
        self.db_config["password"] = password
        
        # Détruire la fenêtre temporaire
        temp_root.destroy()
        return True
    
    def _initialize_database(self):
        """Initialise la connexion à la base de données."""
        # Initialiser la connexion à la base de données
        if not DatabaseConnection.initialize_pool(self.db_config):
            messagebox.showerror("Erreur de connexion", 
                                "Impossible de se connecter à la base de données PostgreSQL.\n"
                                "Vérifiez vos paramètres de connexion.")
            return False
        
        # Vérifier si la base de données existe
        if not DatabaseInitializer.check_database_exists(self.db_config):
            # Créer la base de données
            if not DatabaseInitializer.create_database(self.db_config):
                messagebox.showerror("Erreur", 
                                    "Impossible de créer la base de données.\n"
                                    "Vérifiez vos droits d'accès PostgreSQL.")
                return False
            
            # Réinitialiser la connexion avec la nouvelle base de données
            if not DatabaseConnection.initialize_pool(self.db_config):
                messagebox.showerror("Erreur de connexion", 
                                    "Impossible de se connecter à la nouvelle base de données.\n"
                                    "Vérifiez vos paramètres de connexion.")
                return False
        
        # Vérifier et initialiser la base de données si nécessaire
        # Cette étape est cruciale et doit être exécutée même si la base de données existe déjà
        print("Initialisation de la base de données...")
        if not DatabaseInitializer.check_and_initialize_database():
            messagebox.showerror("Erreur", 
                                "Impossible d'initialiser la base de données.\n"
                                "Vérifiez que les fichiers SQL sont présents.")
            return False
        
        # Vérifier que les données ont bien été chargées
        try:
            result = DatabaseConnection.execute_query(
                "SELECT COUNT(*) FROM coupe_du_monde",
                fetchone=True
            )
            if not result or result[0] == 0:
                messagebox.showerror("Erreur", 
                                    "La base de données a été initialisée mais aucune donnée n'a été trouvée.\n"
                                    "Vérifiez le fichier de données SQL.")
                return False
            
            print(f"✅ Base de données initialisée avec succès. {result[0]} coupes du monde trouvées.")
        except Exception as e:
            messagebox.showerror("Erreur", 
                                f"Erreur lors de la vérification des données: {e}\n"
                                "La base de données n'a peut-être pas été correctement initialisée.")
            return False
        
        return True
    
    def _create_ui(self):
        """Crée l'interface utilisateur."""
        # Créer la fenêtre principale
        self.root = tk.Tk()
        self.root.title("Gestion de la Coupe du Monde de Football")
        self.root.geometry("1200x800")
        
        # Créer le contrôleur
        self.controller = ViewController()
        
        # Charger le logo
        self._load_logo()
        
        # Créer le menu
        self._create_menu()
        
        # Créer la navigation par onglets
        self.tab_nav = TabNavigation(self.root)
        self.tab_nav.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Créer la barre de statut
        self.status_bar = ttk.Label(self.root, text="Prêt", relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X)
        
        # Initialiser les vues
        self._init_views()
        
        # Configurer les gestionnaires d'événements
        self._setup_event_handlers()
    
    def _load_logo(self):
        """Charge et affiche le logo."""
        try:
            # Créer un frame pour le logo
            logo_frame = ttk.Frame(self.root)
            logo_frame.pack(fill=tk.X, padx=10, pady=10)
            
            # Charger l'image
            logo_img = Image.open(LOGO_FILE)
            logo_img = logo_img.resize((150, 150), Image.LANCZOS)  # Redimensionner l'image
            self.logo_photo = ImageTk.PhotoImage(logo_img)
            
            # Afficher l'image
            logo_label = ttk.Label(logo_frame, image=self.logo_photo)
            logo_label.pack(side=tk.LEFT, padx=10)
            
            # Ajouter un titre
            title_label = ttk.Label(logo_frame, text="Base de Données de la Coupe du Monde", 
                                   font=("Arial", 20, "bold"))
            title_label.pack(side=tk.LEFT, padx=20)
        except Exception as e:
            print(f"❌ Erreur lors du chargement du logo: {e}")
    
    def _create_menu(self):
        """Crée le menu de l'application."""
        menu_bar = tk.Menu(self.root)
        
        # Menu Fichier
        file_menu = tk.Menu(menu_bar, tearoff=0)
        file_menu.add_command(label="Quitter", command=self.root.quit)
        menu_bar.add_cascade(label="Fichier", menu=file_menu)
        
        # Menu Base de données
        db_menu = tk.Menu(menu_bar, tearoff=0)
        db_menu.add_command(label="Réinitialiser", command=self._reset_database)
        menu_bar.add_cascade(label="Base de données", menu=db_menu)
        
        # Menu Aide
        help_menu = tk.Menu(menu_bar, tearoff=0)
        help_menu.add_command(label="À propos", command=self._show_about)
        menu_bar.add_cascade(label="Aide", menu=help_menu)
        
        self.root.config(menu=menu_bar)
    
    def _init_views(self):
        """Initialise les vues."""
        # Créer les vues
        self.views = {
            "coupes": CoupeView(self.tab_nav.get_tab_frame("coupes"), self.controller),
            "equipes": EquipeView(self.tab_nav.get_tab_frame("equipes"), self.controller),
            "joueurs": JoueurView(self.tab_nav.get_tab_frame("joueurs"), self.controller),
            "matchs": MatchView(self.tab_nav.get_tab_frame("matchs"), self.controller),
            "stats": StatistiquesView(self.tab_nav.get_tab_frame("stats"), self.controller)
        }
        
        # Placer les vues dans leurs onglets respectifs
        for tab_id, view in self.views.items():
            view.pack(fill=tk.BOTH, expand=True)
    
    def _setup_event_handlers(self):
        """Configure les gestionnaires d'événements."""
        # Configurer le gestionnaire de changement d'onglet
        self.tab_nav.on_tab_change = self._on_tab_change
    
    def _on_tab_change(self, tab_id):
        """Gère le changement d'onglet."""
        # Mettre à jour la barre de statut
        self.status_bar.config(text=f"Onglet actif : {tab_id}")
    
    def _reset_database(self):
        """Réinitialise la base de données."""
        if messagebox.askyesno("Réinitialiser la base de données", 
                              "Êtes-vous sûr de vouloir réinitialiser la base de données ? Toutes les données seront perdues."):
            # Réinitialiser la base de données
            if DatabaseInitializer.check_and_initialize_database():
                messagebox.showinfo("Succès", "Base de données réinitialisée avec succès.")
                # Rafraîchir les vues
                for view in self.views.values():
                    view.load_data()
            else:
                messagebox.showerror("Erreur", "Erreur lors de la réinitialisation de la base de données.")
    
    def _show_about(self):
        """Affiche la boîte de dialogue À propos."""
        messagebox.showinfo("À propos", 
                           "Gestion de la Coupe du Monde de Football\n\n"
                           "Application développée dans le cadre du projet IFT2935\n"
                           "Base de données sur la Coupe du Monde de football\n\n"
                           "© 2025")
