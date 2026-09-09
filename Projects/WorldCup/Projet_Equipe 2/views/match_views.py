"""
Module contenant les vues pour les matchs.
"""

import tkinter as tk
from tkinter import ttk

from views.search_view import MatchSearchFrame
from views.add_data_view import AddMatchDialog
from models.add_data import AddDataModel

class MatchView(ttk.Frame):
    """Vue pour la gestion des matchs."""
    
    def __init__(self, parent, controller=None):
        super().__init__(parent)
        self.parent = parent
        self.controller = controller
        self.selected_match = None
        self.create_widgets()
        self.load_data()
    
    def create_widgets(self):
        """Crée les widgets de la vue."""
        # Créer un frame principal
        main_frame = ttk.Frame(self)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Créer un frame pour la liste des matchs (à gauche)
        list_frame = ttk.LabelFrame(main_frame, text="Liste des matchs")
        list_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Créer un frame pour les détails du match (à droite)
        self.details_frame = ttk.LabelFrame(main_frame, text="Détails du match")
        self.details_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Frame pour les contrôles
        control_frame = ttk.Frame(list_frame)
        control_frame.pack(fill=tk.X, padx=5, pady=5)
        
        # Bouton pour rafraîchir les données
        refresh_btn = ttk.Button(control_frame, text="Rafraîchir", command=self.load_data)
        refresh_btn.pack(side=tk.LEFT, padx=5)
        
        # Bouton pour ajouter un match
        add_btn = ttk.Button(control_frame, text="Ajouter un match", command=self.on_add_match)
        add_btn.pack(side=tk.LEFT, padx=5)

        # Bouton pour modifier un match
        update_btn = ttk.Button(control_frame, text="Modifier le match", command=self.on_update_match)
        update_btn.pack(side=tk.LEFT, padx=5)

        # Ajouter le cadre de recherche
        self.search_frame = MatchSearchFrame(list_frame, self.on_search)
        self.search_frame.pack(fill=tk.X, padx=5, pady=5)
        
        # Treeview pour afficher la liste des matchs
        columns = ("id", "coupe", "annee", "date", "equipe1", "equipe2", "stade", "phase")
        self.tree = ttk.Treeview(list_frame, columns=columns, show="headings")
        
        # Définir les en-têtes de colonnes
        self.tree.heading("id", text="ID")
        self.tree.heading("coupe", text="Coupe")
        self.tree.heading("annee", text="Année")
        self.tree.heading("date", text="Date")
        self.tree.heading("equipe1", text="Équipe 1")
        self.tree.heading("equipe2", text="Équipe 2")
        self.tree.heading("stade", text="Stade")
        self.tree.heading("phase", text="Phase")
        
        # Définir la largeur des colonnes
        self.tree.column("id", width=50)
        self.tree.column("coupe", width=50)
        self.tree.column("annee", width=60)
        self.tree.column("date", width=80)
        self.tree.column("equipe1", width=100)
        self.tree.column("equipe2", width=100)
        self.tree.column("stade", width=100)
        self.tree.column("phase", width=100)
        
        # Ajouter une scrollbar
        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        # Placer le treeview et la scrollbar
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Configurer l'événement de sélection
        self.tree.bind("<<TreeviewSelect>>", self.on_match_select)
        
        # Créer les widgets pour les détails du match
        self._create_details_widgets()
    
    def _create_details_widgets(self):
        """Crée les widgets pour afficher les détails d'un match."""
        # Frame pour les informations générales
        info_frame = ttk.LabelFrame(self.details_frame, text="Informations générales")
        info_frame.pack(fill=tk.X, padx=10, pady=5)
        
        # Grille pour les informations
        info_grid = ttk.Frame(info_frame)
        info_grid.pack(fill=tk.X, padx=10, pady=10)
        
        # Labels pour les informations
        ttk.Label(info_grid, text="Coupe du Monde:").grid(row=0, column=0, sticky=tk.W, padx=5, pady=2)
        self.lbl_coupe = ttk.Label(info_grid, text="")
        self.lbl_coupe.grid(row=0, column=1, sticky=tk.W, padx=5, pady=2)
        
        ttk.Label(info_grid, text="Date et heure:").grid(row=1, column=0, sticky=tk.W, padx=5, pady=2)
        self.lbl_date = ttk.Label(info_grid, text="")
        self.lbl_date.grid(row=1, column=1, sticky=tk.W, padx=5, pady=2)
        
        ttk.Label(info_grid, text="Stade:").grid(row=2, column=0, sticky=tk.W, padx=5, pady=2)
        self.lbl_stade = ttk.Label(info_grid, text="")
        self.lbl_stade.grid(row=2, column=1, sticky=tk.W, padx=5, pady=2)
        
        ttk.Label(info_grid, text="Phase:").grid(row=3, column=0, sticky=tk.W, padx=5, pady=2)
        self.lbl_phase = ttk.Label(info_grid, text="")
        self.lbl_phase.grid(row=3, column=1, sticky=tk.W, padx=5, pady=2)
        
        ttk.Label(info_grid, text="Arbitre:").grid(row=4, column=0, sticky=tk.W, padx=5, pady=2)
        self.lbl_arbitre = ttk.Label(info_grid, text="")
        self.lbl_arbitre.grid(row=4, column=1, sticky=tk.W, padx=5, pady=2)
        
        # Frame pour le résultat
        resultat_frame = ttk.LabelFrame(self.details_frame, text="Résultat")
        resultat_frame.pack(fill=tk.X, padx=10, pady=5)
        
        # Frame pour les équipes et le score
        score_frame = ttk.Frame(resultat_frame)
        score_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # Équipe 1
        self.lbl_equipe1 = ttk.Label(score_frame, text="", font=("Arial", 12, "bold"))
        self.lbl_equipe1.grid(row=0, column=0, padx=10)
        
        # Score
        self.lbl_score = ttk.Label(score_frame, text="", font=("Arial", 14, "bold"))
        self.lbl_score.grid(row=0, column=1, padx=20)
        
        # Équipe 2
        self.lbl_equipe2 = ttk.Label(score_frame, text="", font=("Arial", 12, "bold"))
        self.lbl_equipe2.grid(row=0, column=2, padx=10)
        
        # Score à la mi-temps
        ttk.Label(score_frame, text="Score à la mi-temps:").grid(row=1, column=0, columnspan=3, sticky=tk.W, padx=5, pady=5)
        self.lbl_mi_temps = ttk.Label(score_frame, text="")
        self.lbl_mi_temps.grid(row=1, column=1, padx=5, pady=5)
        
        # Prolongation et tirs au but
        self.lbl_prolongation = ttk.Label(score_frame, text="")
        self.lbl_prolongation.grid(row=2, column=0, columnspan=3, sticky=tk.W, padx=5, pady=2)
        
        self.lbl_tirs_au_but = ttk.Label(score_frame, text="")
        self.lbl_tirs_au_but.grid(row=3, column=0, columnspan=3, sticky=tk.W, padx=5, pady=2)
        
        # Frame pour les joueurs
        joueurs_frame = ttk.LabelFrame(self.details_frame, text="Joueurs")
        joueurs_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # Treeview pour les joueurs
        columns = ("id", "nom", "prenom", "poste", "titulaire", "entree", "sortie", "buts", "passes")
        self.joueurs_tree = ttk.Treeview(joueurs_frame, columns=columns, show="headings", height=10)
        
        # Définir les en-têtes de colonnes
        self.joueurs_tree.heading("id", text="ID")
        self.joueurs_tree.heading("nom", text="Nom")
        self.joueurs_tree.heading("prenom", text="Prénom")
        self.joueurs_tree.heading("poste", text="Poste")
        self.joueurs_tree.heading("titulaire", text="Titulaire")
        self.joueurs_tree.heading("entree", text="Entrée")
        self.joueurs_tree.heading("sortie", text="Sortie")
        self.joueurs_tree.heading("buts", text="Buts")
        self.joueurs_tree.heading("passes", text="Passes D.")
        
        # Définir la largeur des colonnes
        self.joueurs_tree.column("id", width=40)
        self.joueurs_tree.column("nom", width=100)
        self.joueurs_tree.column("prenom", width=100)
        self.joueurs_tree.column("poste", width=80)
        self.joueurs_tree.column("titulaire", width=60)
        self.joueurs_tree.column("entree", width=60)
        self.joueurs_tree.column("sortie", width=60)
        self.joueurs_tree.column("buts", width=50)
        self.joueurs_tree.column("passes", width=60)
        
        # Ajouter une scrollbar
        joueurs_scrollbar = ttk.Scrollbar(joueurs_frame, orient=tk.VERTICAL, command=self.joueurs_tree.yview)
        self.joueurs_tree.configure(yscrollcommand=joueurs_scrollbar.set)
        
        # Placer le treeview et la scrollbar
        self.joueurs_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        joueurs_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Frame pour les sanctions
        sanctions_frame = ttk.LabelFrame(self.details_frame, text="Sanctions")
        sanctions_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # Treeview pour les sanctions
        columns = ("id", "joueur", "type", "minute", "raison")
        self.sanctions_tree = ttk.Treeview(sanctions_frame, columns=columns, show="headings", height=5)
        
        # Définir les en-têtes de colonnes
        self.sanctions_tree.heading("id", text="ID")
        self.sanctions_tree.heading("joueur", text="Joueur")
        self.sanctions_tree.heading("type", text="Type")
        self.sanctions_tree.heading("minute", text="Minute")
        self.sanctions_tree.heading("raison", text="Raison")
        
        # Définir la largeur des colonnes
        self.sanctions_tree.column("id", width=40)
        self.sanctions_tree.column("joueur", width=150)
        self.sanctions_tree.column("type", width=80)
        self.sanctions_tree.column("minute", width=60)
        self.sanctions_tree.column("raison", width=200)
        
        # Ajouter une scrollbar
        sanctions_scrollbar = ttk.Scrollbar(sanctions_frame, orient=tk.VERTICAL, command=self.sanctions_tree.yview)
        self.sanctions_tree.configure(yscrollcommand=sanctions_scrollbar.set)
        
        # Placer le treeview et la scrollbar
        self.sanctions_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        sanctions_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
    
    def load_data(self):
        """Charge les données depuis le contrôleur."""
        # Effacer les données existantes
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Récupérer les données via le contrôleur
        if self.controller:
            matchs = self.controller.get_matchs()
            
            # Ajouter les données au treeview
            if matchs:
                for match in matchs:
                    self.tree.insert("", tk.END, values=(
                        match[0],  # id_match
                        match[1],  # id_coupe
                        match[2],  # annee
                        f"{match[3]} {match[4]}",  # date et heure
                        match[6],  # pays_equipe1
                        match[8],  # pays_equipe2
                        match[10],  # nom_stade
                        match[16]  # phase_competition
                    ))
    
    def on_search(self, criteria):
        """Gère l'événement de recherche."""
        # Effacer les données existantes
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Récupérer les données via le contrôleur
        if self.controller:
            if criteria:
                matchs = self.controller.search_matchs(criteria)
            else:
                matchs = self.controller.get_matchs()
            
            # Ajouter les données au treeview
            if matchs:
                for match in matchs:
                    self.tree.insert("", tk.END, values=(
                        match[0],  # id_match
                        match[1],  # id_coupe
                        match[2],  # annee
                        f"{match[3]} {match[4]}",  # date et heure
                        match[6],  # pays_equipe1
                        match[8],  # pays_equipe2
                        match[10],  # nom_stade
                        match[16]  # phase_competition
                    ))
    
    def on_match_select(self, event):
        """Gère l'événement de sélection d'un match."""
        # Récupérer l'élément sélectionné
        selection = self.tree.selection()
        if not selection:
            return
        
        # Récupérer l'ID du match sélectionné
        item = self.tree.item(selection[0])
        id_match = item["values"][0]
        
        # Récupérer les détails du match
        if self.controller:
            details = self.controller.get_match_details(id_match)
            if details:
                self._display_match_details(details)
    
    def on_add_match(self):
        """Gère l'événement d'ajout d'un match."""
        dialog = AddMatchDialog(self, "Ajouter un match", self.add_match, self.controller)
        self.wait_window(dialog)

    def on_update_match(self):
        """Gère l'événement de modification d'un match."""
        selection = self.tree.selection()
        if not selection:
            return
        item = self.tree.item(selection[0])
        id_match = item["values"][0]
        if not id_match:
            return

        if not self.controller:
            return

        details = self.controller.get_match_details(id_match)
        if not details:
            return

        match = details.get('match')
        resultat = details.get('resultat')
        if not match:
            return

        initial_data = {
            "id_match": match[0],
            "id_coupe": match[1],
            "date": match[3],
            "heure": match[4],
            "id_equipe1": match[5],
            "id_equipe2": match[7],
            "id_stade": match[9],
            "id_arbitre_principal": match[13],
            "phase_competition": match[16]
        }
        if resultat:
            initial_data.update({
                "score_equipe1": resultat[0],
                "score_equipe2": resultat[1],
                "score_mi_temps_equipe1": resultat[2],
                "score_mi_temps_equipe2": resultat[3],
                "prolongation": resultat[4],
                "tirs_au_but": resultat[5],
                "score_tirs_au_but_equipe1": resultat[6],
                "score_tirs_au_but_equipe2": resultat[7]
            })

        dialog = AddMatchDialog(
            self,
            "Modifier un match",
            lambda data: self.update_match(id_match, data),
            self.controller,
            initial_data=initial_data,
            submit_text="Mettre à jour"
        )
        self.wait_window(dialog)

    def add_match(self, data):
        """Ajoute un match."""
        result = AddDataModel.add_match(data)
        if result:
            self.load_data()
            return True
        return False

    def update_match(self, id_match, data):
        """Met a jour un match."""
        result = AddDataModel.update_match(id_match, data)
        if result:
            self.load_data()
            return True
        return False

    def _display_match_details(self, details):
        """Affiche les détails d'un match."""
        match = details.get('match')
        resultat = details.get('resultat')
        joueurs = details.get('joueurs')
        sanctions = details.get('sanctions')
        
        if not match:
            return
        
        # Afficher les informations générales
        self.lbl_coupe.config(text=f"{match[2]} ({match[1]})")
        self.lbl_date.config(text=f"{match[3]} {match[4]}")
        self.lbl_stade.config(text=f"{match[10]} ({match[11]}, {match[12]})")
        self.lbl_phase.config(text=match[16])
        self.lbl_arbitre.config(text=f"{match[14]} {match[13]}")
        
        # Afficher les équipes
        self.lbl_equipe1.config(text=match[6])
        self.lbl_equipe2.config(text=match[8])
        
        # Afficher le résultat
        if resultat:
            self.lbl_score.config(text=f"{resultat[0]} - {resultat[1]}")
            self.lbl_mi_temps.config(text=f"{resultat[2]} - {resultat[3]}")
            
            # Prolongation
            if resultat[4]:
                self.lbl_prolongation.config(text="Prolongation: Oui")
            else:
                self.lbl_prolongation.config(text="Prolongation: Non")
            
            # Tirs au but
            if resultat[5]:
                self.lbl_tirs_au_but.config(text=f"Tirs au but: {resultat[6]} - {resultat[7]}")
            else:
                self.lbl_tirs_au_but.config(text="Tirs au but: Non")
        else:
            self.lbl_score.config(text="")
            self.lbl_mi_temps.config(text="")
            self.lbl_prolongation.config(text="")
            self.lbl_tirs_au_but.config(text="")
        
        # Afficher les joueurs
        for item in self.joueurs_tree.get_children():
            self.joueurs_tree.delete(item)
        
        if joueurs:
            for joueur in joueurs:
                titulaire = "Oui" if joueur[5] else "Non"
                entree = joueur[6] if joueur[6] is not None else ""
                sortie = joueur[7] if joueur[7] is not None else ""
                
                self.joueurs_tree.insert("", tk.END, values=(
                    joueur[0],  # id_joueur
                    joueur[1],  # nom
                    joueur[2],  # prenom
                    joueur[4],  # poste
                    titulaire,
                    entree,
                    sortie,
                    joueur[8],  # buts
                    joueur[9]   # passes_decisives
                ))
        
        # Afficher les sanctions
        for item in self.sanctions_tree.get_children():
            self.sanctions_tree.delete(item)
        
        if sanctions:
            for sanction in sanctions:
                joueur_nom = f"{sanction[3]} {sanction[2]}"
                
                self.sanctions_tree.insert("", tk.END, values=(
                    sanction[0],  # id_sanction
                    joueur_nom,
                    sanction[5],  # type
                    sanction[6],  # minute
                    sanction[7]   # raison
                ))
