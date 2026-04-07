"""
Module contenant les composants de recherche pour l'application Coupe du Monde.
"""

import tkinter as tk
from tkinter import ttk

class SearchFrame(ttk.Frame):
    """Cadre de recherche générique."""
    
    def __init__(self, parent, search_callback=None):
        super().__init__(parent)
        self.parent = parent
        self.search_callback = search_callback
        self.search_fields = {}
        self.create_widgets()
        
    def create_widgets(self):
        """Crée les widgets du cadre de recherche."""
        # Frame pour les contrôles de recherche
        self.controls_frame = ttk.LabelFrame(self, text="Recherche")
        self.controls_frame.pack(fill=tk.X, padx=10, pady=5)
        
        # Bouton de recherche
        self.search_button = ttk.Button(self, text="Rechercher", command=self.on_search)
        self.search_button.pack(side=tk.RIGHT, padx=10, pady=5)
        
        # Bouton de réinitialisation
        self.reset_button = ttk.Button(self, text="Réinitialiser", command=self.on_reset)
        self.reset_button.pack(side=tk.RIGHT, padx=5, pady=5)
    
    def add_search_field(self, name, label, width=15):
        """Ajoute un champ de recherche."""
        # Créer un frame pour le champ
        field_frame = ttk.Frame(self.controls_frame)
        field_frame.pack(side=tk.LEFT, padx=5, pady=5)
        
        # Ajouter un label
        ttk.Label(field_frame, text=label).pack(side=tk.TOP, anchor=tk.W)
        
        # Ajouter un champ de saisie
        entry = ttk.Entry(field_frame, width=width)
        entry.pack(side=tk.TOP)
        
        # Stocker le champ
        self.search_fields[name] = entry
    
    def add_combobox_field(self, name, label, values, width=15):
        """Ajoute un champ de recherche avec liste déroulante."""
        # Créer un frame pour le champ
        field_frame = ttk.Frame(self.controls_frame)
        field_frame.pack(side=tk.LEFT, padx=5, pady=5)
        
        # Ajouter un label
        ttk.Label(field_frame, text=label).pack(side=tk.TOP, anchor=tk.W)
        
        # Ajouter une liste déroulante
        combo = ttk.Combobox(field_frame, values=values, width=width)
        combo.pack(side=tk.TOP)
        
        # Stocker le champ
        self.search_fields[name] = combo
    
    def get_search_criteria(self):
        """Récupère les critères de recherche."""
        criteria = {}
        for name, field in self.search_fields.items():
            value = field.get().strip()
            if value:
                criteria[name] = value
        return criteria
    
    def on_search(self):
        """Gère l'événement de recherche."""
        if self.search_callback:
            criteria = self.get_search_criteria()
            self.search_callback(criteria)
    
    def on_reset(self):
        """Réinitialise les champs de recherche."""
        for field in self.search_fields.values():
            field.delete(0, tk.END)
        
        # Déclencher une recherche sans critères pour afficher toutes les données
        if self.search_callback:
            self.search_callback({})

class CoupeSearchFrame(SearchFrame):
    """Cadre de recherche pour les coupes du monde."""
    
    def create_widgets(self):
        """Crée les widgets du cadre de recherche."""
        super().create_widgets()
        
        # Ajouter les champs de recherche spécifiques
        self.add_search_field("annee", "Année")
        self.add_search_field("pays_hote", "Pays hôte")
        self.add_search_field("format", "Format")

class EquipeSearchFrame(SearchFrame):
    """Cadre de recherche pour les équipes."""
    
    def create_widgets(self):
        """Crée les widgets du cadre de recherche."""
        super().create_widgets()
        
        # Ajouter les champs de recherche spécifiques
        self.add_search_field("pays", "Pays")
        self.add_combobox_field("confederation", "Confédération", 
                               ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"])
        self.add_search_field("min_participations", "Min. participations")

class JoueurSearchFrame(SearchFrame):
    """Cadre de recherche pour les joueurs."""
    
    def create_widgets(self):
        """Crée les widgets du cadre de recherche."""
        super().create_widgets()
        
        # Ajouter les champs de recherche spécifiques
        self.add_search_field("nom", "Nom/Prénom")
        self.add_search_field("nationalite", "Nationalité")
        self.add_combobox_field("poste", "Poste", 
                               ["Gardien", "Défenseur", "Milieu", "Attaquant"])

class MatchSearchFrame(SearchFrame):
    """Cadre de recherche pour les matchs."""
    
    def create_widgets(self):
        """Crée les widgets du cadre de recherche."""
        super().create_widgets()
        
        # Ajouter les champs de recherche spécifiques
        self.add_search_field("annee", "Année")
        self.add_search_field("equipe", "Équipe")
        self.add_combobox_field("phase", "Phase", 
                               ["Groupe", "Huitième de finale", "Quart de finale", 
                                "Demi-finale", "Match pour la 3e place", "Finale"])
        self.add_search_field("stade", "Stade/Ville/Pays")
