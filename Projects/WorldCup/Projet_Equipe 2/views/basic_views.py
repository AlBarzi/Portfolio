"""
Module contenant les vues de base pour l'application Coupe du Monde.
"""

import tkinter as tk
from tkinter import ttk

from views.search_view import CoupeSearchFrame, EquipeSearchFrame, JoueurSearchFrame
from views.add_data_view import (
    AddCoupeDialog,
    AddEquipeDialog,
    AddJoueurDialog,
    AddStadeDialog,
    AddArbitreDialog,
    AddArbitreAssistantDialog,
    AddStaffTechniqueDialog,
    AddParticipationEquipeDialog,
    AddSelectionJoueurDialog,
    AddParticipationJoueurMatchDialog,
    AddSanctionDialog,
    UpdateStadeDialog,
    UpdateArbitreDialog,
    UpdateStaffTechniqueDialog,
    UpdateParticipationEquipeDialog,
    UpdateSelectionJoueurDialog,
    UpdateParticipationJoueurMatchDialog,
    UpdateSanctionDialog,
    UpdateArbitreAssistantDialog,
)
from models.add_data import AddDataModel

class BaseView(ttk.Frame):
    """Vue de base dont héritent toutes les autres vues."""
    
    def __init__(self, parent, controller=None):
        super().__init__(parent)
        self.parent = parent
        self.controller = controller
        self.create_widgets()
        
    def create_widgets(self):
        """Méthode à implémenter dans les classes enfants."""
        pass
        
    def load_data(self):
        """Méthode à implémenter dans les classes enfants."""
        pass
    
    def create_toolbar(self):
        """Crée une barre d'outils standard."""
        toolbar = ttk.Frame(self)
        toolbar.pack(fill=tk.X, padx=10, pady=10)
        return toolbar

    def create_actions_menu(self, parent, label, actions):
        """Crée un menu déroulant d'actions rapides."""
        btn = ttk.Menubutton(parent, text=label)
        menu = tk.Menu(btn, tearoff=0)
        for text, command in actions:
            menu.add_command(label=text, command=command)
        btn["menu"] = menu
        btn.pack(side=tk.LEFT, padx=5)
        return btn

class CoupeView(BaseView):
    """Vue pour la gestion des Coupes du Monde."""
    
    def create_widgets(self):
        """Crée les widgets de la vue."""
        # Frame pour les contrôles
        control_frame = self.create_toolbar()
        
        # Bouton pour rafraîchir les données
        refresh_btn = ttk.Button(control_frame, text="Rafraîchir", command=self.load_data)
        refresh_btn.pack(side=tk.LEFT, padx=5)
        
        # Bouton pour ajouter une coupe
        add_btn = ttk.Button(control_frame, text="Ajouter une coupe", command=self.on_add_coupe)
        add_btn.pack(side=tk.LEFT, padx=5)

        # Bouton pour modifier une coupe
        update_btn = ttk.Button(control_frame, text="Modifier la coupe", command=self.on_update_coupe)
        update_btn.pack(side=tk.LEFT, padx=5)

        # Actions avancées
        self.create_actions_menu(control_frame, "Ajouter...", [
            ("Stade", self.on_add_stade),
            ("Arbitre", self.on_add_arbitre),
            ("Arbitre assistant", self.on_add_arbitre_assistant),
            ("Staff technique", self.on_add_staff),
            ("Participation équipe", self.on_add_participation_equipe),
            ("Sélection joueur", self.on_add_selection_joueur)
        ])

        self.create_actions_menu(control_frame, "Modifier...", [
            ("Stade", self.on_update_stade),
            ("Arbitre", self.on_update_arbitre),
            ("Staff technique", self.on_update_staff),
            ("Participation équipe", self.on_update_participation_equipe),
            ("Sélection joueur", self.on_update_selection_joueur),
            ("Participation joueur/match", self.on_update_participation_joueur_match),
            ("Sanction", self.on_update_sanction),
            ("Arbitre assistant", self.on_update_arbitre_assistant)
        ])

        # Ajouter le cadre de recherche
        self.search_frame = CoupeSearchFrame(self, self.on_search)
        self.search_frame.pack(fill=tk.X, padx=10, pady=5)
        
        # Treeview pour afficher les données
        columns = ("id", "annee", "date_debut", "date_fin", "nb_equipes", "format", "slogan")
        self.tree = ttk.Treeview(self, columns=columns, show="headings")
        
        # Définir les en-têtes de colonnes
        self.tree.heading("id", text="ID")
        self.tree.heading("annee", text="Année")
        self.tree.heading("date_debut", text="Date de début")
        self.tree.heading("date_fin", text="Date de fin")
        self.tree.heading("nb_equipes", text="Nb équipes")
        self.tree.heading("format", text="Format")
        self.tree.heading("slogan", text="Slogan")
        
        # Définir la largeur des colonnes
        self.tree.column("id", width=50)
        self.tree.column("annee", width=80)
        self.tree.column("date_debut", width=100)
        self.tree.column("date_fin", width=100)
        self.tree.column("nb_equipes", width=80)
        self.tree.column("format", width=200)
        self.tree.column("slogan", width=200)
        
        # Ajouter une scrollbar
        scrollbar = ttk.Scrollbar(self, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        # Placer le treeview et la scrollbar
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
    
    def load_data(self):
        """Charge les données depuis le contrôleur."""
        # Effacer les données existantes
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Récupérer les données via le contrôleur
        if self.controller:
            coupes = self.controller.get_coupes()
            
            # Ajouter les données au treeview
            if coupes:
                for coupe in coupes:
                    self.tree.insert("", tk.END, values=coupe)
    
    def on_search(self, criteria):
        """Gère l'événement de recherche."""
        # Effacer les données existantes
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Récupérer les données via le contrôleur
        if self.controller:
            if criteria:
                coupes = self.controller.search_coupes(criteria)
            else:
                coupes = self.controller.get_coupes()
            
            # Ajouter les données au treeview
            if coupes:
                for coupe in coupes:
                    self.tree.insert("", tk.END, values=coupe)
    
    def on_add_coupe(self):
        """Gère l'événement d'ajout d'une coupe."""
        dialog = AddCoupeDialog(self, "Ajouter une coupe du monde", self.add_coupe)
        self.wait_window(dialog)

    def on_add_stade(self):
        dialog = AddStadeDialog(self, "Ajouter un stade", self.add_stade)
        self.wait_window(dialog)

    def on_add_arbitre(self):
        dialog = AddArbitreDialog(self, "Ajouter un arbitre", self.add_arbitre)
        self.wait_window(dialog)

    def on_add_arbitre_assistant(self):
        dialog = AddArbitreAssistantDialog(self, "Ajouter un arbitre assistant", self.add_arbitre_assistant)
        self.wait_window(dialog)

    def on_add_staff(self):
        dialog = AddStaffTechniqueDialog(self, "Ajouter un staff technique", self.add_staff)
        self.wait_window(dialog)

    def on_add_participation_equipe(self):
        dialog = AddParticipationEquipeDialog(self, "Ajouter une participation d'équipe", self.add_participation_equipe)
        self.wait_window(dialog)

    def on_add_selection_joueur(self):
        dialog = AddSelectionJoueurDialog(self, "Ajouter une sélection de joueur", self.add_selection_joueur)
        self.wait_window(dialog)

    def on_add_pays_hote(self):
        dialog = AddPaysHoteDialog(self, "Ajouter un pays hôte", self.add_pays_hote)
        self.wait_window(dialog)

    def on_add_encadrement(self):
        dialog = AddEncadrementDialog(self, "Ajouter un encadrement", self.add_encadrement)
        self.wait_window(dialog)

    def add_coupe(self, data):
        """Ajoute une coupe du monde."""
        result = AddDataModel.add_coupe(data)
        if result:
            self.load_data()
            return True
        return False

    def add_stade(self, data):
        return bool(AddDataModel.add_stade(data))

    def add_arbitre(self, data):
        return bool(AddDataModel.add_arbitre(data))

    def add_arbitre_assistant(self, data):
        return bool(AddDataModel.add_arbitre_assistant(data))

    def add_pays_hote(self, data):
        return bool(AddDataModel.add_pays_hote(data))

    def add_staff(self, data):
        return bool(AddDataModel.add_staff_technique(data))

    def add_encadrement(self, data):
        return bool(AddDataModel.add_encadrement(data))

    def add_participation_equipe(self, data):
        return bool(AddDataModel.add_participation_equipe(data))

    def add_selection_joueur(self, data):
        return bool(AddDataModel.add_selection_joueur(data))

    def on_update_coupe(self):
        """Gère l'événement de modification d'une coupe."""
        selection = self.tree.selection()
        if not selection:
            return
        item = self.tree.item(selection[0])
        values = item.get("values", [])
        if not values:
            return
        initial_data = {
            "annee": values[1],
            "date_debut": values[2],
            "date_fin": values[3],
            "nb_equipes": values[4],
            "format": values[5],
            "slogan": values[6] if len(values) > 6 else None
        }
        id_coupe = values[0]
        dialog = AddCoupeDialog(
            self,
            "Modifier une coupe du monde",
            lambda data: self.update_coupe(id_coupe, data),
            initial_data=initial_data,
            submit_text="Mettre à jour"
        )
        self.wait_window(dialog)

    def update_coupe(self, id_coupe, data):
        """Met à jour une coupe du monde."""
        result = AddDataModel.update_coupe(id_coupe, data)
        if result:
            self.load_data()
            return True
        return False

    def on_update_stade(self):
        dialog = UpdateStadeDialog(self, "Modifier un stade", self.update_stade)
        self.wait_window(dialog)

    def on_update_arbitre(self):
        dialog = UpdateArbitreDialog(self, "Modifier un arbitre", self.update_arbitre)
        self.wait_window(dialog)

    def on_update_staff(self):
        dialog = UpdateStaffTechniqueDialog(self, "Modifier un staff technique", self.update_staff)
        self.wait_window(dialog)

    def on_update_participation_equipe(self):
        dialog = UpdateParticipationEquipeDialog(self, "Modifier participation équipe", self.update_participation_equipe)
        self.wait_window(dialog)

    def on_update_selection_joueur(self):
        dialog = UpdateSelectionJoueurDialog(self, "Modifier sélection joueur", self.update_selection_joueur)
        self.wait_window(dialog)

    def on_update_participation_joueur_match(self):
        dialog = UpdateParticipationJoueurMatchDialog(self, "Modifier participation joueur/match", self.update_participation_joueur_match)
        self.wait_window(dialog)

    def on_update_sanction(self):
        dialog = UpdateSanctionDialog(self, "Modifier une sanction", self.update_sanction)
        self.wait_window(dialog)

    def on_update_arbitre_assistant(self):
        dialog = UpdateArbitreAssistantDialog(self, "Modifier un arbitre assistant", self.update_arbitre_assistant)
        self.wait_window(dialog)

    def update_stade(self, data):
        return bool(AddDataModel.update_stade(data["id_stade"], data))

    def update_arbitre(self, data):
        return bool(AddDataModel.update_arbitre(data["id_arbitre"], data))

    def update_staff(self, data):
        return bool(AddDataModel.update_staff_technique(data["id_staff"], data))

    def update_participation_equipe(self, data):
        return bool(AddDataModel.update_participation_equipe(data["id_equipe"], data["id_coupe"], data))

    def update_selection_joueur(self, data):
        return bool(AddDataModel.update_selection_joueur(data["id_joueur"], data["id_equipe"], data["id_coupe"], data))

    def update_participation_joueur_match(self, data):
        return bool(AddDataModel.update_participation_joueur_match(data["id_joueur"], data["id_match"], data))

    def update_sanction(self, data):
        return bool(AddDataModel.update_sanction(data["id_sanction"], data))

    def update_arbitre_assistant(self, data):
        return bool(AddDataModel.update_arbitre_assistant(data["id_match"], data["id_arbitre"], data))

class EquipeView(BaseView):
    """Vue pour la gestion des équipes."""

    def create_widgets(self):
        """Crée les widgets de la vue."""
        control_frame = self.create_toolbar()
        refresh_btn = ttk.Button(control_frame, text="Rafraîchir", command=self.load_data)
        refresh_btn.pack(side=tk.LEFT, padx=5)
        add_btn = ttk.Button(control_frame, text="Ajouter une équipe", command=self.on_add_equipe)
        add_btn.pack(side=tk.LEFT, padx=5)
        update_btn = ttk.Button(control_frame, text="Modifier l'équipe", command=self.on_update_equipe)
        update_btn.pack(side=tk.LEFT, padx=5)

        self.create_actions_menu(control_frame, "Ajouter...", [
            ("Joueur", self.on_add_joueur),
            ("Participation équipe", self.on_add_participation_equipe),
            ("Sélection joueur", self.on_add_selection_joueur),
            ("Staff technique", self.on_add_staff),
            ("Encadrement", self.on_add_encadrement)
        ])

        self.search_frame = EquipeSearchFrame(self, self.on_search)
        self.search_frame.pack(fill=tk.X, padx=10, pady=5)

        columns = ("id", "pays", "confederation", "classement_fifa", "nb_participations")
        self.tree = ttk.Treeview(self, columns=columns, show="headings")
        self.tree.heading("id", text="ID")
        self.tree.heading("pays", text="Pays")
        self.tree.heading("confederation", text="Confédération")
        self.tree.heading("classement_fifa", text="Classement FIFA")
        self.tree.heading("nb_participations", text="Nb participations")
        self.tree.column("id", width=50)
        self.tree.column("pays", width=150)
        self.tree.column("confederation", width=100)
        self.tree.column("classement_fifa", width=100)
        self.tree.column("nb_participations", width=100)

        scrollbar = ttk.Scrollbar(self, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

    def load_data(self):
        for item in self.tree.get_children():
            self.tree.delete(item)
        if self.controller:
            equipes = self.controller.get_equipes()
            if equipes:
                for equipe in equipes:
                    self.tree.insert("", tk.END, values=equipe)

    def on_search(self, criteria):
        for item in self.tree.get_children():
            self.tree.delete(item)
        if self.controller:
            equipes = self.controller.search_equipes(criteria) if criteria else self.controller.get_equipes()
            if equipes:
                for equipe in equipes:
                    self.tree.insert("", tk.END, values=equipe)

    def on_add_equipe(self):
        dialog = AddEquipeDialog(self, "Ajouter une équipe", self.add_equipe)
        self.wait_window(dialog)

    def on_add_joueur(self):
        dialog = AddJoueurDialog(self, "Ajouter un joueur", self.add_joueur)
        self.wait_window(dialog)

    def on_add_participation_equipe(self):
        dialog = AddParticipationEquipeDialog(self, "Ajouter une participation d'équipe", self.add_participation_equipe)
        self.wait_window(dialog)

    def on_add_selection_joueur(self):
        dialog = AddSelectionJoueurDialog(self, "Ajouter une sélection de joueur", self.add_selection_joueur)
        self.wait_window(dialog)

    def on_add_staff(self):
        dialog = AddStaffTechniqueDialog(self, "Ajouter un staff technique", self.add_staff)
        self.wait_window(dialog)

    def on_add_encadrement(self):
        dialog = AddEncadrementDialog(self, "Ajouter un encadrement", self.add_encadrement)
        self.wait_window(dialog)

    def on_update_equipe(self):
        selection = self.tree.selection()
        if not selection:
            return
        item = self.tree.item(selection[0])
        values = item.get("values", [])
        if not values:
            return
        initial_data = {
            "pays": values[1],
            "confederation": values[2],
            "classement_fifa": values[3],
            "nb_participations": values[4]
        }
        id_equipe = values[0]
        dialog = AddEquipeDialog(
            self,
            "Modifier une équipe",
            lambda data: self.update_equipe(id_equipe, data),
            initial_data=initial_data,
            submit_text="Mettre à jour"
        )
        self.wait_window(dialog)

    def add_equipe(self, data):
        result = AddDataModel.add_equipe(data)
        if result:
            self.load_data()
            return True
        return False

    def add_joueur(self, data):
        return bool(AddDataModel.add_joueur(data))

    def add_participation_equipe(self, data):
        return bool(AddDataModel.add_participation_equipe(data))

    def add_selection_joueur(self, data):
        return bool(AddDataModel.add_selection_joueur(data))

    def add_staff(self, data):
        return bool(AddDataModel.add_staff_technique(data))

    def add_encadrement(self, data):
        return bool(AddDataModel.add_encadrement(data))

    def update_equipe(self, id_equipe, data):
        result = AddDataModel.update_equipe(id_equipe, data)
        if result:
            self.load_data()
            return True
        return False

class JoueurView(BaseView):
    """Vue pour la gestion des joueurs."""

    def create_widgets(self):
        """Crée les widgets de la vue."""
        control_frame = self.create_toolbar()
        refresh_btn = ttk.Button(control_frame, text="Rafraîchir", command=self.load_data)
        refresh_btn.pack(side=tk.LEFT, padx=5)
        add_btn = ttk.Button(control_frame, text="Ajouter un joueur", command=self.on_add_joueur)
        add_btn.pack(side=tk.LEFT, padx=5)
        update_btn = ttk.Button(control_frame, text="Modifier le joueur", command=self.on_update_joueur)
        update_btn.pack(side=tk.LEFT, padx=5)

        self.search_frame = JoueurSearchFrame(self, self.on_search)
        self.search_frame.pack(fill=tk.X, padx=10, pady=5)

        columns = ("id", "nom", "prenom", "date_naissance", "nationalite", "poste")
        self.tree = ttk.Treeview(self, columns=columns, show="headings")
        self.tree.heading("id", text="ID")
        self.tree.heading("nom", text="Nom")
        self.tree.heading("prenom", text="Prénom")
        self.tree.heading("date_naissance", text="Date de naissance")
        self.tree.heading("nationalite", text="Nationalité")
        self.tree.heading("poste", text="Poste")
        self.tree.column("id", width=50)
        self.tree.column("nom", width=150)
        self.tree.column("prenom", width=150)
        self.tree.column("date_naissance", width=100)
        self.tree.column("nationalite", width=100)
        self.tree.column("poste", width=100)

        scrollbar = ttk.Scrollbar(self, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

    def load_data(self):
        for item in self.tree.get_children():
            self.tree.delete(item)
        if self.controller:
            joueurs = self.controller.get_joueurs()
            if joueurs:
                for joueur in joueurs:
                    self.tree.insert("", tk.END, values=joueur)

    def on_search(self, criteria):
        for item in self.tree.get_children():
            self.tree.delete(item)
        if self.controller:
            joueurs = self.controller.search_joueurs(criteria) if criteria else self.controller.get_joueurs()
            if joueurs:
                for joueur in joueurs:
                    self.tree.insert("", tk.END, values=joueur)

    def on_add_joueur(self):
        dialog = AddJoueurDialog(self, "Ajouter un joueur", self.add_joueur)
        self.wait_window(dialog)

    def on_update_joueur(self):
        selection = self.tree.selection()
        if not selection:
            return
        item = self.tree.item(selection[0])
        values = item.get("values", [])
        if not values:
            return
        initial_data = {
            "nom": values[1],
            "prenom": values[2],
            "date_naissance": values[3],
            "nationalite": values[4],
            "poste": values[5]
        }
        id_joueur = values[0]
        dialog = AddJoueurDialog(
            self,
            "Modifier un joueur",
            lambda data: self.update_joueur(id_joueur, data),
            initial_data=initial_data,
            submit_text="Mettre à jour"
        )
        self.wait_window(dialog)

    def add_joueur(self, data):
        result = AddDataModel.add_joueur(data)
        if result:
            self.load_data()
            return True
        return False

    def update_joueur(self, id_joueur, data):
        result = AddDataModel.update_joueur(id_joueur, data)
        if result:
            self.load_data()
            return True
        return False
