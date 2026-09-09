"""
Module contenant la vue des statistiques pour l'application Coupe du Monde.
"""

import tkinter as tk
from tkinter import ttk
from views.basic_views import BaseView

class StatistiquesView(BaseView):
    """Vue pour les statistiques."""
    
    def create_widgets(self):
        """Crée les widgets de la vue."""
        # Frame pour les contrôles
        control_frame = self.create_toolbar()
        
        # Label pour le titre
        title_label = ttk.Label(control_frame, text="Statistiques disponibles :", font=("Arial", 12, "bold"))
        title_label.pack(side=tk.LEFT, padx=5)
        
        # Frame pour les boutons de statistiques
        stats_frame = ttk.Frame(self)
        stats_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Boutons pour les différentes statistiques
        stats_buttons = [
            ("Meilleurs buteurs", self.show_top_scorers),
            ("Équipes par participations", self.show_teams_by_participations),
            ("Palmarès des équipes", self.show_team_achievements),
            ("Buts par Coupe du Monde", self.show_goals_by_world_cup),
            ("Joueurs avec plusieurs Coupes du Monde", self.show_players_multiple_world_cups),
            ("Joueurs avec le plus de Coupes du Monde gagnées", self.show_players_most_world_cup_wins)
        ]
        
        # Créer les boutons
        for i, (text, command) in enumerate(stats_buttons):
            btn = ttk.Button(stats_frame, text=text, command=command)
            btn.grid(row=i//2, column=i%2, padx=10, pady=10, sticky="ew")
        
        # Configurer le grid
        stats_frame.columnconfigure(0, weight=1)
        stats_frame.columnconfigure(1, weight=1)
        
        # Frame pour afficher les résultats
        self.results_frame = ttk.LabelFrame(self, text="Résultats")
        self.results_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Treeview pour afficher les résultats
        self.results_tree = ttk.Treeview(self.results_frame)
        
        # Ajouter une scrollbar
        scrollbar = ttk.Scrollbar(self.results_frame, orient=tk.VERTICAL, command=self.results_tree.yview)
        self.results_tree.configure(yscrollcommand=scrollbar.set)
        
        # Placer le treeview et la scrollbar
        self.results_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
    
    def configure_results_tree(self, columns, headings, widths):
        """Configure le treeview pour afficher les résultats."""
        # Effacer les données existantes
        for item in self.results_tree.get_children():
            self.results_tree.delete(item)
        
        # Configurer les colonnes
        self.results_tree["columns"] = columns
        self.results_tree["show"] = "headings"
        
        # Définir les en-têtes et largeurs des colonnes
        for col, heading, width in zip(columns, headings, widths):
            self.results_tree.heading(col, text=heading)
            self.results_tree.column(col, width=width)
    
    def show_top_scorers(self):
        """Affiche les meilleurs buteurs."""
        # Configurer le treeview
        columns = ("nom", "prenom", "nationalite", "buts")
        headings = ["Nom", "Prénom", "Nationalité", "Buts"]
        widths = [150, 150, 100, 80]
        self.configure_results_tree(columns, headings, widths)
        
        # Récupérer les données via le contrôleur
        if self.controller:
            buteurs = self.controller.get_meilleurs_buteurs()
            
            # Ajouter les données au treeview
            if buteurs:
                for buteur in buteurs:
                    values = (buteur[1], buteur[2], buteur[3], buteur[5])
                    self.results_tree.insert("", tk.END, values=values)
    
    def show_teams_by_participations(self):
        """Affiche les équipes par nombre de participations."""
        # Configurer le treeview
        columns = ("pays", "confederation", "participations")
        headings = ["Pays", "Confédération", "Participations"]
        widths = [150, 150, 100]
        self.configure_results_tree(columns, headings, widths)
        
        # Récupérer les données via le contrôleur
        if self.controller:
            equipes = self.controller.get_equipes_par_participations()
            
            # Ajouter les données au treeview
            if equipes:
                for equipe in equipes:
                    values = (equipe[1], equipe[2], equipe[3])
                    self.results_tree.insert("", tk.END, values=values)
    
    def show_team_achievements(self):
        """Affiche le palmarès des équipes."""
        # Configurer le treeview
        columns = ("pays", "titres", "finales", "demi_finales", "participations")
        headings = ["Pays", "Titres", "Finales", "Demi-finales", "Participations"]
        widths = [150, 80, 80, 100, 100]
        self.configure_results_tree(columns, headings, widths)
        
        # Récupérer les données via le contrôleur
        if self.controller:
            palmares = self.controller.get_palmares_equipes()
            
            # Ajouter les données au treeview
            if palmares:
                for equipe in palmares:
                    values = (equipe[1], equipe[3], equipe[4], equipe[5], equipe[6])
                    self.results_tree.insert("", tk.END, values=values)
    
    def show_goals_by_world_cup(self):
        """Affiche le nombre de buts par Coupe du Monde."""
        # Configurer le treeview
        columns = ("annee", "buts", "matchs", "moyenne")
        headings = ["Année", "Total buts", "Nb matchs", "Moyenne par match"]
        widths = [80, 100, 100, 150]
        self.configure_results_tree(columns, headings, widths)
        
        # Récupérer les données via le contrôleur
        if self.controller:
            buts = self.controller.get_buts_par_coupe()
            
            # Ajouter les données au treeview
            if buts:
                for coupe in buts:
                    values = (coupe[1], coupe[2], coupe[3], coupe[4])
                    self.results_tree.insert("", tk.END, values=values)
    
    def show_players_multiple_world_cups(self):
        """Affiche les joueurs ayant participé à plusieurs Coupes du Monde."""
        # Configurer le treeview
        columns = ("nom", "prenom", "nationalite", "nb_coupes", "annees")
        headings = ["Nom", "Prénom", "Nationalité", "Nb Coupes", "Années"]
        widths = [150, 150, 100, 80, 200]
        self.configure_results_tree(columns, headings, widths)
        
        # Récupérer les données via le contrôleur
        if self.controller:
            joueurs = self.controller.get_joueurs_plusieurs_coupes()
            
            # Ajouter les données au treeview
            if joueurs:
                for joueur in joueurs:
                    values = (joueur[1], joueur[2], joueur[3], joueur[4], joueur[5])
                    self.results_tree.insert("", tk.END, values=values)
    
    def show_players_most_world_cup_wins(self):
        """Affiche les joueurs ayant gagné le plus de Coupes du Monde."""
        # Configurer le treeview
        columns = ("nom", "prenom", "nationalite", "nb_coupes_gagnees", "annees_victoires")
        headings = ["Nom", "Prénom", "Nationalité", "Coupes gagnées", "Années des victoires"]
        widths = [150, 150, 100, 120, 200]
        self.configure_results_tree(columns, headings, widths)
        
        # Récupérer les données via le contrôleur
        if self.controller:
            joueurs = self.controller.get_joueurs_plus_coupes_gagnees()
            
            # Ajouter les données au treeview
            if joueurs:
                for joueur in joueurs:
                    values = (joueur[1], joueur[2], joueur[3], joueur[4], joueur[5])
                    self.results_tree.insert("", tk.END, values=values)
    
    def load_data(self):
        """Charge les données initiales."""
        # Par défaut, afficher les meilleurs buteurs
        self.show_top_scorers()
