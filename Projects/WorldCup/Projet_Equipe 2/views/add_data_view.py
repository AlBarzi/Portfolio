"""
Module contenant les composants d'ajout de données pour l'application Coupe du Monde.
"""

import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime

class AddDataDialog(tk.Toplevel):
    """Dialogue de base pour l'ajout de données."""
    
    def __init__(self, parent, title, add_callback=None, submit_text="Ajouter"):
        super().__init__(parent)
        self.parent = parent
        self.add_callback = add_callback
        self.submit_text = submit_text

        # Configurer la fenêtre
        self.title(title)
        self.geometry("500x400")
        self.resizable(False, False)
        self.transient(parent)
        self.grab_set()
        
        # Créer les widgets
        self.create_widgets()
        
        # Centrer la fenêtre
        self.center_window()
    
    def create_widgets(self):
        """Crée les widgets du dialogue."""
        # Frame principal
        main_frame = ttk.Frame(self, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Frame pour les champs
        self.fields_frame = ttk.Frame(main_frame)
        self.fields_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Frame pour les boutons
        buttons_frame = ttk.Frame(main_frame)
        buttons_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # Bouton Ajouter
        add_btn = ttk.Button(buttons_frame, text=self.submit_text, command=self.on_add)
        add_btn.pack(side=tk.RIGHT, padx=5)
        
        # Bouton Annuler
        cancel_btn = ttk.Button(buttons_frame, text="Annuler", command=self.destroy)
        cancel_btn.pack(side=tk.RIGHT, padx=5)
    
    def add_entry_field(self, label_text, row, required=False):
        """Ajoute un champ de saisie."""
        # Label
        label = ttk.Label(self.fields_frame, text=label_text)
        label.grid(row=row, column=0, sticky=tk.W, padx=5, pady=5)
        
        if required:
            req_label = ttk.Label(self.fields_frame, text="*", foreground="red")
            req_label.grid(row=row, column=1, sticky=tk.W)
        
        # Champ de saisie
        entry = ttk.Entry(self.fields_frame, width=30)
        entry.grid(row=row, column=2, sticky=tk.W, padx=5, pady=5)
        
        return entry
    
    def add_combobox_field(self, label_text, row, values, required=False):
        """Ajoute un champ avec liste déroulante."""
        # Label
        label = ttk.Label(self.fields_frame, text=label_text)
        label.grid(row=row, column=0, sticky=tk.W, padx=5, pady=5)
        
        if required:
            req_label = ttk.Label(self.fields_frame, text="*", foreground="red")
            req_label.grid(row=row, column=1, sticky=tk.W)
        
        # Liste déroulante
        combo = ttk.Combobox(self.fields_frame, values=values, width=28)
        combo.grid(row=row, column=2, sticky=tk.W, padx=5, pady=5)
        
        return combo
    
    def add_checkbox_field(self, label_text, row):
        """Ajoute un champ à cocher."""
        # Variable
        var = tk.BooleanVar()
        
        # Case à cocher
        check = ttk.Checkbutton(self.fields_frame, text=label_text, variable=var)
        check.grid(row=row, column=0, columnspan=3, sticky=tk.W, padx=5, pady=5)
        
        return var
    
    def add_spinbox_field(self, label_text, row, from_val, to_val, required=False):
        """Ajoute un champ numérique."""
        # Label
        label = ttk.Label(self.fields_frame, text=label_text)
        label.grid(row=row, column=0, sticky=tk.W, padx=5, pady=5)
        
        if required:
            req_label = ttk.Label(self.fields_frame, text="*", foreground="red")
            req_label.grid(row=row, column=1, sticky=tk.W)
        
        # Spinbox
        spinbox = ttk.Spinbox(self.fields_frame, from_=from_val, to=to_val, width=10)
        spinbox.grid(row=row, column=2, sticky=tk.W, padx=5, pady=5)
        
        return spinbox
    
    def add_date_field(self, label_text, row, required=False):
        """Ajoute un champ de date."""
        # Label
        label = ttk.Label(self.fields_frame, text=label_text)
        label.grid(row=row, column=0, sticky=tk.W, padx=5, pady=5)
        
        if required:
            req_label = ttk.Label(self.fields_frame, text="*", foreground="red")
            req_label.grid(row=row, column=1, sticky=tk.W)
        
        # Frame pour la date
        date_frame = ttk.Frame(self.fields_frame)
        date_frame.grid(row=row, column=2, sticky=tk.W, padx=5, pady=5)
        
        # Jour
        day_spinbox = ttk.Spinbox(date_frame, from_=1, to=31, width=3)
        day_spinbox.pack(side=tk.LEFT, padx=2)
        
        # Mois
        month_spinbox = ttk.Spinbox(date_frame, from_=1, to=12, width=3)
        month_spinbox.pack(side=tk.LEFT, padx=2)
        
        # Année
        year_spinbox = ttk.Spinbox(date_frame, from_=1900, to=2100, width=5)
        year_spinbox.pack(side=tk.LEFT, padx=2)
        
        # Définir l'année courante
        year_spinbox.set(datetime.now().year)
        
        return (day_spinbox, month_spinbox, year_spinbox)
    
    def get_date_value(self, date_field):
        """Récupère la valeur d'un champ de date."""
        day, month, year = date_field
        try:
            day_val = int(day.get())
            month_val = int(month.get())
            year_val = int(year.get())
            return f"{year_val}-{month_val:02d}-{day_val:02d}"
        except ValueError:
            return None

    def set_date_value(self, date_field, date_value):
        """Définit la valeur d'un champ de date à partir d'une chaîne YYYY-MM-DD."""
        if not date_value:
            return
        date_str = str(date_value)
        try:
            year_str, month_str, day_str = date_str.split("-")
        except ValueError:
            return
        day, month, year = date_field
        day.set(day_str)
        month.set(month_str)
        year.set(year_str)

    def on_add(self):
        """Gère l'événement d'ajout."""
        # À implémenter dans les classes enfants
        pass
    
    def center_window(self):
        """Centre la fenêtre par rapport à la fenêtre parente."""
        self.update_idletasks()
        
        # Calculer la position
        parent_x = self.parent.winfo_rootx()
        parent_y = self.parent.winfo_rooty()
        parent_width = self.parent.winfo_width()
        parent_height = self.parent.winfo_height()
        
        width = self.winfo_width()
        height = self.winfo_height()
        
        x = parent_x + (parent_width - width) // 2
        y = parent_y + (parent_height - height) // 2
        
        # Positionner la fenêtre
        self.geometry(f"+{x}+{y}")

class AddCoupeDialog(AddDataDialog):
    """Dialogue pour l'ajout d'une coupe du monde."""

    def __init__(self, parent, title, add_callback=None, initial_data=None, submit_text="Ajouter"):
        self.initial_data = initial_data or {}
        super().__init__(parent, title, add_callback, submit_text=submit_text)
        if self.initial_data:
            self.set_initial_data()

    def create_widgets(self):
        """Crée les widgets du dialogue."""
        super().create_widgets()
        
        # Ajouter les champs spécifiques
        self.annee_field = self.add_spinbox_field("Année", 0, 1900, 2100, True)
        self.date_debut_field = self.add_date_field("Date de début", 1, True)
        self.date_fin_field = self.add_date_field("Date de fin", 2, True)
        self.nb_equipes_field = self.add_spinbox_field("Nombre d'équipes", 3, 1, 100, True)
        self.format_field = self.add_entry_field("Format", 4, True)
        self.slogan_field = self.add_entry_field("Slogan", 5)
        
        # Ajouter un label pour les champs obligatoires
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=6, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)
    
    def set_initial_data(self):
        self.annee_field.set(self.initial_data.get("annee", ""))
        self.set_date_value(self.date_debut_field, self.initial_data.get("date_debut"))
        self.set_date_value(self.date_fin_field, self.initial_data.get("date_fin"))
        self.nb_equipes_field.set(self.initial_data.get("nb_equipes", ""))
        self.format_field.insert(0, self.initial_data.get("format", "") or "")
        self.slogan_field.insert(0, self.initial_data.get("slogan", "") or "")

    def on_add(self):
        """Gère l'événement d'ajout."""
        # Récupérer les valeurs
        try:
            annee = int(self.annee_field.get())
            date_debut = self.get_date_value(self.date_debut_field)
            date_fin = self.get_date_value(self.date_fin_field)
            nb_equipes = int(self.nb_equipes_field.get())
            format_val = self.format_field.get().strip()
            slogan = self.slogan_field.get().strip()
            
            # Vérifier les champs obligatoires
            if not (annee and date_debut and date_fin and nb_equipes and format_val):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            
            # Créer les données
            data = {
                'annee': annee,
                'date_debut': date_debut,
                'date_fin': date_fin,
                'nb_equipes': nb_equipes,
                'format': format_val,
                'slogan': slogan if slogan else None
            }
            
            # Appeler le callback
            if self.add_callback:
                result = self.add_callback(data)
                if result:
                    messagebox.showinfo("Succès", "Coupe du monde ajoutée avec succès.")
                    self.destroy()
                else:
                    messagebox.showerror("Erreur", "Erreur lors de l'ajout de la coupe du monde.")
        
        except ValueError:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class AddEquipeDialog(AddDataDialog):
    """Dialogue pour l'ajout d'une équipe."""

    def __init__(self, parent, title, add_callback=None, initial_data=None, submit_text="Ajouter"):
        self.initial_data = initial_data or {}
        super().__init__(parent, title, add_callback, submit_text=submit_text)
        if self.initial_data:
            self.set_initial_data()

    def create_widgets(self):
        """Crée les widgets du dialogue."""
        super().create_widgets()
        
        # Ajouter les champs spécifiques
        self.pays_field = self.add_entry_field("Pays", 0, True)
        self.confederation_field = self.add_combobox_field("Confédération", 1, 
                                                         ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"], True)
        self.classement_field = self.add_spinbox_field("Classement FIFA", 2, 1, 211, True)
        self.participations_field = self.add_spinbox_field("Nombre de participations", 3, 0, 50, True)
        
        # Ajouter un label pour les champs obligatoires
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=4, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)
    
    def set_initial_data(self):
        self.pays_field.insert(0, self.initial_data.get("pays", "") or "")
        self.confederation_field.set(self.initial_data.get("confederation", "") or "")
        self.classement_field.set(self.initial_data.get("classement_fifa", ""))
        self.participations_field.set(self.initial_data.get("nb_participations", ""))

    def on_add(self):
        """Gère l'événement d'ajout."""
        # Récupérer les valeurs
        try:
            pays = self.pays_field.get().strip()
            confederation = self.confederation_field.get().strip()
            classement = int(self.classement_field.get())
            participations = int(self.participations_field.get())
            
            # Vérifier les champs obligatoires
            if not (pays and confederation):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            
            # Créer les données
            data = {
                'pays': pays,
                'confederation': confederation,
                'classement_fifa': classement,
                'nb_participations': participations
            }
            
            # Appeler le callback
            if self.add_callback:
                result = self.add_callback(data)
                if result:
                    messagebox.showinfo("Succès", "Équipe ajoutée avec succès.")
                    self.destroy()
                else:
                    messagebox.showerror("Erreur", "Erreur lors de l'ajout de l'équipe.")
        
        except ValueError:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class AddJoueurDialog(AddDataDialog):
    """Dialogue pour l'ajout d'un joueur."""

    def __init__(self, parent, title, add_callback=None, initial_data=None, submit_text="Ajouter"):
        self.initial_data = initial_data or {}
        super().__init__(parent, title, add_callback, submit_text=submit_text)
        if self.initial_data:
            self.set_initial_data()

    def create_widgets(self):
        """Crée les widgets du dialogue."""
        super().create_widgets()
        
        # Ajouter les champs spécifiques
        self.nom_field = self.add_entry_field("Nom", 0, True)
        self.prenom_field = self.add_entry_field("Prénom", 1, True)
        self.date_naissance_field = self.add_date_field("Date de naissance", 2, True)
        self.nationalite_field = self.add_entry_field("Nationalité", 3, True)
        self.poste_field = self.add_combobox_field("Poste", 4, 
                                                ["Gardien", "Défenseur", "Milieu", "Attaquant"], True)
        
        # Ajouter un label pour les champs obligatoires
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=5, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)
    
    def set_initial_data(self):
        self.nom_field.insert(0, self.initial_data.get("nom", "") or "")
        self.prenom_field.insert(0, self.initial_data.get("prenom", "") or "")
        self.set_date_value(self.date_naissance_field, self.initial_data.get("date_naissance"))
        self.nationalite_field.insert(0, self.initial_data.get("nationalite", "") or "")
        self.poste_field.set(self.initial_data.get("poste", "") or "")

    def on_add(self):
        """Gère l'événement d'ajout."""
        # Récupérer les valeurs
        try:
            nom = self.nom_field.get().strip()
            prenom = self.prenom_field.get().strip()
            date_naissance = self.get_date_value(self.date_naissance_field)
            nationalite = self.nationalite_field.get().strip()
            poste = self.poste_field.get().strip()
            
            # Vérifier les champs obligatoires
            if not (nom and prenom and date_naissance and nationalite and poste):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            
            # Créer les données
            data = {
                'nom': nom,
                'prenom': prenom,
                'date_naissance': date_naissance,
                'nationalite': nationalite,
                'poste': poste
            }
            
            # Appeler le callback
            if self.add_callback:
                result = self.add_callback(data)
                if result:
                    messagebox.showinfo("Succès", "Joueur ajouté avec succès.")
                    self.destroy()
                else:
                    messagebox.showerror("Erreur", "Erreur lors de l'ajout du joueur.")
        
        except ValueError:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class AddMatchDialog(AddDataDialog):
    """Dialogue pour l'ajout d'un match."""
    
    def __init__(self, parent, title, add_callback=None, controller=None, initial_data=None, submit_text="Ajouter"):
        self.controller = controller
        self.initial_data = initial_data or {}
        super().__init__(parent, title, add_callback, submit_text=submit_text)
        if self.initial_data:
            self.set_initial_data()

    def create_widgets(self):
        """Crée les widgets du dialogue."""
        super().create_widgets()
        
        # Récupérer les données pour les listes déroulantes
        coupes = []
        equipes = []
        stades = []
        arbitres = []
        
        if self.controller:
            from models.add_data import AddDataModel
            
            coupes_data = AddDataModel.get_all_coupes()
            if coupes_data:
                coupes = [f"{c[1]} (ID: {c[0]})" for c in coupes_data]
            
            equipes_data = AddDataModel.get_all_equipes()
            if equipes_data:
                equipes = [f"{e[1]} (ID: {e[0]})" for e in equipes_data]
            
            stades_data = AddDataModel.get_all_stades()
            if stades_data:
                stades = [f"{s[1]}, {s[2]}, {s[3]} (ID: {s[0]})" for s in stades_data]
            
            arbitres_data = AddDataModel.get_all_arbitres()
            if arbitres_data:
                arbitres = [f"{a[1]} {a[2]} ({a[3]}) (ID: {a[0]})" for a in arbitres_data]
        
        # Ajouter les champs spécifiques
        self.coupe_field = self.add_combobox_field("Coupe du Monde", 0, coupes, True)
        self.date_field = self.add_date_field("Date", 1, True)
        self.heure_field = self.add_entry_field("Heure (HH:MM)", 2, True)
        self.equipe1_field = self.add_combobox_field("Équipe 1", 3, equipes, True)
        self.equipe2_field = self.add_combobox_field("Équipe 2", 4, equipes, True)
        self.stade_field = self.add_combobox_field("Stade", 5, stades, True)
        self.arbitre_field = self.add_combobox_field("Arbitre principal", 6, arbitres, True)
        self.phase_field = self.add_combobox_field("Phase", 7, 
                                                ["Groupe", "Huitième de finale", "Quart de finale", 
                                                 "Demi-finale", "Match pour la 3e place", "Finale"], True)
        
        # Résultat
        ttk.Label(self.fields_frame, text="Résultat", font=("Arial", 10, "bold")).grid(
            row=8, column=0, columnspan=3, sticky=tk.W, padx=5, pady=5)
        
        # Score
        score_frame = ttk.Frame(self.fields_frame)
        score_frame.grid(row=9, column=0, columnspan=3, sticky=tk.W, padx=5, pady=5)
        
        ttk.Label(score_frame, text="Score:").pack(side=tk.LEFT, padx=5)
        self.score1_field = ttk.Spinbox(score_frame, from_=0, to=20, width=3)
        self.score1_field.pack(side=tk.LEFT, padx=2)
        
        ttk.Label(score_frame, text="-").pack(side=tk.LEFT, padx=2)
        self.score2_field = ttk.Spinbox(score_frame, from_=0, to=20, width=3)
        self.score2_field.pack(side=tk.LEFT, padx=2)
        
        # Score mi-temps
        mi_temps_frame = ttk.Frame(self.fields_frame)
        mi_temps_frame.grid(row=10, column=0, columnspan=3, sticky=tk.W, padx=5, pady=5)
        
        ttk.Label(mi_temps_frame, text="Score mi-temps:").pack(side=tk.LEFT, padx=5)
        self.mi_temps1_field = ttk.Spinbox(mi_temps_frame, from_=0, to=20, width=3)
        self.mi_temps1_field.pack(side=tk.LEFT, padx=2)
        
        ttk.Label(mi_temps_frame, text="-").pack(side=tk.LEFT, padx=2)
        self.mi_temps2_field = ttk.Spinbox(mi_temps_frame, from_=0, to=20, width=3)
        self.mi_temps2_field.pack(side=tk.LEFT, padx=2)
        
        # Prolongation et tirs au but
        self.prolongation_var = self.add_checkbox_field("Prolongation", 11)
        self.tirs_au_but_var = self.add_checkbox_field("Tirs au but", 12)
        
        # Score tirs au but
        tab_frame = ttk.Frame(self.fields_frame)
        tab_frame.grid(row=13, column=0, columnspan=3, sticky=tk.W, padx=5, pady=5)
        
        ttk.Label(tab_frame, text="Score tirs au but:").pack(side=tk.LEFT, padx=5)
        self.tab1_field = ttk.Spinbox(tab_frame, from_=0, to=20, width=3)
        self.tab1_field.pack(side=tk.LEFT, padx=2)
        
        ttk.Label(tab_frame, text="-").pack(side=tk.LEFT, padx=2)
        self.tab2_field = ttk.Spinbox(tab_frame, from_=0, to=20, width=3)
        self.tab2_field.pack(side=tk.LEFT, padx=2)
        
        # Ajouter un label pour les champs obligatoires
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=14, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)
    
    def _select_by_id(self, combo, id_value):
        if not id_value:
            return
        for val in combo["values"]:
            if f"ID: {id_value}" in val:
                combo.set(val)
                break

    def set_initial_data(self):
        self._select_by_id(self.coupe_field, self.initial_data.get("id_coupe"))
        self.set_date_value(self.date_field, self.initial_data.get("date"))
        heure = str(self.initial_data.get("heure", ""))
        if ":" in heure:
            self.heure_field.insert(0, heure[:5])
        self._select_by_id(self.equipe1_field, self.initial_data.get("id_equipe1"))
        self._select_by_id(self.equipe2_field, self.initial_data.get("id_equipe2"))
        self._select_by_id(self.stade_field, self.initial_data.get("id_stade"))
        self._select_by_id(self.arbitre_field, self.initial_data.get("id_arbitre_principal"))
        self.phase_field.set(self.initial_data.get("phase_competition", "") or "")

        self.score1_field.set(self.initial_data.get("score_equipe1", 0))
        self.score2_field.set(self.initial_data.get("score_equipe2", 0))
        self.mi_temps1_field.set(self.initial_data.get("score_mi_temps_equipe1", 0))
        self.mi_temps2_field.set(self.initial_data.get("score_mi_temps_equipe2", 0))
        self.prolongation_var.set(bool(self.initial_data.get("prolongation", False)))
        self.tirs_au_but_var.set(bool(self.initial_data.get("tirs_au_but", False)))
        if self.initial_data.get("tirs_au_but"):
            self.tab1_field.set(self.initial_data.get("score_tirs_au_but_equipe1", 0))
            self.tab2_field.set(self.initial_data.get("score_tirs_au_but_equipe2", 0))
        else:
            self.tab1_field.set(0)
            self.tab2_field.set(0)

    def on_add(self):
        """Gère l'événement d'ajout."""
        # Récupérer les valeurs
        try:
            # Extraire les IDs des valeurs sélectionnées
            coupe_str = self.coupe_field.get()
            equipe1_str = self.equipe1_field.get()
            equipe2_str = self.equipe2_field.get()
            stade_str = self.stade_field.get()
            arbitre_str = self.arbitre_field.get()
            
            # Extraire les IDs
            import re
            
            id_coupe = int(re.search(r'ID: (\d+)', coupe_str).group(1)) if coupe_str else None
            id_equipe1 = int(re.search(r'ID: (\d+)', equipe1_str).group(1)) if equipe1_str else None
            id_equipe2 = int(re.search(r'ID: (\d+)', equipe2_str).group(1)) if equipe2_str else None
            id_stade = int(re.search(r'ID: (\d+)', stade_str).group(1)) if stade_str else None
            id_arbitre = int(re.search(r'ID: (\d+)', arbitre_str).group(1)) if arbitre_str else None
            
            # Autres valeurs
            date = self.get_date_value(self.date_field)
            heure = self.heure_field.get().strip()
            phase = self.phase_field.get().strip()
            
            # Scores
            score1 = int(self.score1_field.get())
            score2 = int(self.score2_field.get())
            mi_temps1 = int(self.mi_temps1_field.get())
            mi_temps2 = int(self.mi_temps2_field.get())
            
            # Options
            prolongation = self.prolongation_var.get()
            tirs_au_but = self.tirs_au_but_var.get()
            
            # Scores tirs au but
            tab1 = int(self.tab1_field.get()) if tirs_au_but else None
            tab2 = int(self.tab2_field.get()) if tirs_au_but else None
            
            # Vérifier les champs obligatoires
            if not (id_coupe and date and heure and id_equipe1 and id_equipe2 and id_stade and id_arbitre and phase):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            
            # Vérifier que les équipes sont différentes
            if id_equipe1 == id_equipe2:
                messagebox.showerror("Erreur", "Les deux équipes doivent être différentes.")
                return
            
            # Créer les données
            data = {
                'id_coupe': id_coupe,
                'date': date,
                'heure': heure,
                'id_equipe1': id_equipe1,
                'id_equipe2': id_equipe2,
                'id_stade': id_stade,
                'id_arbitre_principal': id_arbitre,
                'phase_competition': phase,
                'score_equipe1': score1,
                'score_equipe2': score2,
                'score_mi_temps_equipe1': mi_temps1,
                'score_mi_temps_equipe2': mi_temps2,
                'prolongation': prolongation,
                'tirs_au_but': tirs_au_but,
                'score_tirs_au_but_equipe1': tab1,
                'score_tirs_au_but_equipe2': tab2
            }
            
            # Appeler le callback
            if self.add_callback:
                result = self.add_callback(data)
                if result:
                    messagebox.showinfo("Succès", "Match ajouté avec succès.")
                    self.destroy()
                else:
                    messagebox.showerror("Erreur", "Erreur lors de l'ajout du match.")
        
        except (ValueError, AttributeError) as e:
            messagebox.showerror("Erreur", f"Veuillez entrer des valeurs valides. {str(e)}")

# --- Dialogues avancés ---

class AddStadeDialog(AddDataDialog):
    """Dialogue pour l'ajout d'un stade."""

    def create_widgets(self):
        super().create_widgets()
        self.nom_field = self.add_entry_field("Nom", 0, True)
        self.ville_field = self.add_entry_field("Ville", 1, True)
        self.pays_field = self.add_entry_field("Pays", 2, True)
        self.capacite_field = self.add_spinbox_field("Capacité", 3, 1, 200000, True)
        self.annee_field = self.add_spinbox_field("Année de construction", 4, 1800, 2100, False)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=5, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        try:
            data = {
                "nom": self.nom_field.get().strip(),
                "ville": self.ville_field.get().strip(),
                "pays": self.pays_field.get().strip(),
                "capacite": int(self.capacite_field.get()),
                "annee_construction": int(self.annee_field.get()) if self.annee_field.get() else None
            }
            if not (data["nom"] and data["ville"] and data["pays"] and data["capacite"]):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Stade ajouté avec succès.")
                self.destroy()
        except ValueError:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class AddArbitreDialog(AddDataDialog):
    """Dialogue pour l'ajout d'un arbitre."""

    def create_widgets(self):
        super().create_widgets()
        self.nom_field = self.add_entry_field("Nom", 0, True)
        self.prenom_field = self.add_entry_field("Prénom", 1, True)
        self.nationalite_field = self.add_entry_field("Nationalité", 2, True)
        self.experience_field = self.add_spinbox_field("Exp. internationale", 3, 0, 60, False)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=4, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        try:
            data = {
                "nom": self.nom_field.get().strip(),
                "prenom": self.prenom_field.get().strip(),
                "nationalite": self.nationalite_field.get().strip(),
                "experience_internationale": int(self.experience_field.get()) if self.experience_field.get() else None
            }
            if not (data["nom"] and data["prenom"] and data["nationalite"]):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Arbitre ajouté avec succès.")
                self.destroy()
        except ValueError:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class AddParticipationEquipeDialog(AddDataDialog):
    """Dialogue pour l'ajout d'une participation d'equipe."""

    def __init__(self, parent, title, add_callback=None):
        super().__init__(parent, title, add_callback)
        from models.add_data import AddDataModel
        self.equipes = AddDataModel.get_all_equipes() or []
        self.coupes = AddDataModel.get_all_coupes() or []

    def create_widgets(self):
        super().create_widgets()
        equipes_vals = [f"{e[1]} (ID: {e[0]})" for e in self.equipes]
        coupes_vals = [f"{c[1]} (ID: {c[0]})" for c in self.coupes]
        self.equipe_field = self.add_combobox_field("Équipe", 0, equipes_vals, True)
        self.coupe_field = self.add_combobox_field("Coupe", 1, coupes_vals, True)
        self.resultat_field = self.add_entry_field("Résultat final", 2, False)
        self.groupe_field = self.add_entry_field("Groupe", 3, False)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=4, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        import re
        try:
            equipe_str = self.equipe_field.get().strip()
            coupe_str = self.coupe_field.get().strip()
            match_equipe = re.search(r'ID: (\d+)', equipe_str) if equipe_str else None
            match_coupe = re.search(r'ID: (\d+)', coupe_str) if coupe_str else None
            id_equipe = int(match_equipe.group(1)) if match_equipe else (int(equipe_str) if equipe_str.isdigit() else None)
            id_coupe = int(match_coupe.group(1)) if match_coupe else (int(coupe_str) if coupe_str.isdigit() else None)
            data = {
                "id_equipe": id_equipe,
                "id_coupe": id_coupe,
                "resultat_final": self.resultat_field.get().strip() or None,
                "groupe": self.groupe_field.get().strip() or None
            }
            if not (id_equipe and id_coupe):
                messagebox.showerror("Erreur", "Veuillez entrer un ID d'équipe et un ID de coupe valides.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Participation ajoutée avec succès.")
                self.destroy()
        except Exception:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class AddSelectionJoueurDialog(AddDataDialog):
    """Dialogue pour l'ajout d'une sélection de joueur."""

    def __init__(self, parent, title, add_callback=None):
        super().__init__(parent, title, add_callback)
        from models.add_data import AddDataModel
        self.joueurs = AddDataModel.get_all_joueurs() or []
        self.participations = AddDataModel.get_all_participations_equipes() or []

    def create_widgets(self):
        super().create_widgets()
        joueurs_vals = [f"{j[1]} {j[2]} (ID: {j[0]})" for j in self.joueurs]
        participation_vals = [f"{p[2]} - {p[3]} (E{p[0]}/C{p[1]})" for p in self.participations]
        self.joueur_field = self.add_combobox_field("Joueur", 0, joueurs_vals, True)
        self.participation_field = self.add_combobox_field("Équipe/Coupe", 1, participation_vals, True)
        self.maillot_field = self.add_spinbox_field("Numéro maillot", 2, 1, 99, True)
        self.club_field = self.add_entry_field("Club", 3, True)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=4, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        import re
        try:
            joueur_str = self.joueur_field.get().strip()
            participation_str = self.participation_field.get().strip()
            match_joueur = re.search(r'ID: (\d+)', joueur_str) if joueur_str else None
            id_joueur = int(match_joueur.group(1)) if match_joueur else (int(joueur_str) if joueur_str.isdigit() else None)

            match_participation = re.search(r'E(\d+)/C(\d+)', participation_str) if participation_str else None
            if match_participation:
                id_equipe = int(match_participation.group(1))
                id_coupe = int(match_participation.group(2))
            else:
                parts = [p for p in re.split(r'[\s,;/]+', participation_str) if p] if participation_str else []
                id_equipe = int(parts[0]) if len(parts) >= 2 and parts[0].isdigit() else None
                id_coupe = int(parts[1]) if len(parts) >= 2 and parts[1].isdigit() else None

            data = {
                "id_joueur": id_joueur,
                "id_equipe": id_equipe,
                "id_coupe": id_coupe,
                "numero_maillot": int(self.maillot_field.get()),
                "club": self.club_field.get().strip()
            }
            if not (id_joueur and id_equipe and id_coupe and data["club"]):
                messagebox.showerror("Erreur", "Veuillez entrer les IDs et le club correctement.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Sélection ajoutée avec succès.")
                self.destroy()
        except Exception:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class AddParticipationJoueurMatchDialog(AddDataDialog):
    """Dialogue pour l'ajout d'une participation joueur-match."""

    def __init__(self, parent, title, add_callback=None):
        super().__init__(parent, title, add_callback)
        from models.add_data import AddDataModel
        self.joueurs = AddDataModel.get_all_joueurs() or []
        self.matchs = AddDataModel.get_all_matchs() or []

    def create_widgets(self):
        super().create_widgets()
        joueurs_vals = [f"{j[1]} {j[2]} (ID: {j[0]})" for j in self.joueurs]
        matchs_vals = [f"{m[1]} {m[2]} vs {m[3]} ({m[4]}) (ID: {m[0]})" for m in self.matchs]
        self.joueur_field = self.add_combobox_field("Joueur", 0, joueurs_vals, True)
        self.match_field = self.add_combobox_field("Match", 1, matchs_vals, True)
        self.titulaire_var = self.add_checkbox_field("Titulaire", 2)
        self.entree_field = self.add_spinbox_field("Minute entrée", 3, 0, 120, False)
        self.sortie_field = self.add_spinbox_field("Minute sortie", 4, 0, 120, False)
        self.buts_field = self.add_spinbox_field("Buts", 5, 0, 20, False)
        self.passes_field = self.add_spinbox_field("Passes décisives", 6, 0, 20, False)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=7, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        import re
        try:
            joueur_str = self.joueur_field.get()
            match_str = self.match_field.get()
            id_joueur = int(re.search(r'ID: (\d+)', joueur_str).group(1)) if joueur_str else None
            id_match = int(re.search(r'ID: (\d+)', match_str).group(1)) if match_str else None
            data = {
                "id_joueur": id_joueur,
                "id_match": id_match,
                "titulaire": self.titulaire_var.get(),
                "minute_entree": int(self.entree_field.get()) if self.entree_field.get() else None,
                "minute_sortie": int(self.sortie_field.get()) if self.sortie_field.get() else None,
                "buts": int(self.buts_field.get()) if self.buts_field.get() else 0,
                "passes_decisives": int(self.passes_field.get()) if self.passes_field.get() else 0
            }
            if not (id_joueur and id_match):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Participation ajoutée avec succès.")
                self.destroy()
        except Exception:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class AddSanctionDialog(AddDataDialog):
    """Dialogue pour l'ajout d'une sanction."""

    def __init__(self, parent, title, add_callback=None):
        super().__init__(parent, title, add_callback)
        from models.add_data import AddDataModel
        self.participations = AddDataModel.get_all_participations_joueur_match() or []

    def create_widgets(self):
        super().create_widgets()
        participation_vals = [
            f"{p[2]} {p[3]} - {p[6]} vs {p[7]} ({p[5]}) (J{p[0]}/M{p[1]})"
            for p in self.participations
        ]
        self.participation_field = self.add_combobox_field("Joueur/Match", 0, participation_vals, True)
        self.type_field = self.add_combobox_field("Type", 1, ["Carton jaune", "Carton rouge"], True)
        self.minute_field = self.add_spinbox_field("Minute", 2, 0, 120, True)
        self.raison_field = self.add_entry_field("Raison", 3, False)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=4, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        import re
        try:
            participation_str = self.participation_field.get()
            match = re.search(r'J(\d+)/M(\d+)', participation_str) if participation_str else None
            id_joueur = int(match.group(1)) if match else None
            id_match = int(match.group(2)) if match else None
            data = {
                "id_joueur": id_joueur,
                "id_match": id_match,
                "type": self.type_field.get().strip(),
                "minute": int(self.minute_field.get()),
                "raison": self.raison_field.get().strip() or None
            }
            if not (id_joueur and id_match and data["type"]):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Sanction ajoutée avec succès.")
                self.destroy()
        except Exception:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class AddStaffTechniqueDialog(AddDataDialog):
    """Dialogue pour l'ajout d'un membre du staff technique."""

    def create_widgets(self):
        super().create_widgets()
        self.nom_field = self.add_entry_field("Nom", 0, True)
        self.prenom_field = self.add_entry_field("Prénom", 1, True)
        self.nationalite_field = self.add_entry_field("Nationalité", 2, True)
        self.role_field = self.add_entry_field("Rôle", 3, True)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=4, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        data = {
            "nom": self.nom_field.get().strip(),
            "prenom": self.prenom_field.get().strip(),
            "nationalite": self.nationalite_field.get().strip(),
            "role": self.role_field.get().strip()
        }
        if not (data["nom"] and data["prenom"] and data["nationalite"] and data["role"]):
            messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
            return
        if self.add_callback and self.add_callback(data):
            messagebox.showinfo("Succès", "Staff ajouté avec succès.")
            self.destroy()

class AddEncadrementDialog(AddDataDialog):
    """Dialogue pour l'ajout d'un encadrement d'équipe."""

    def __init__(self, parent, title, add_callback=None):
        super().__init__(parent, title, add_callback)
        from models.add_data import AddDataModel
        self.staff = AddDataModel.get_all_staff() or []
        self.participations = AddDataModel.get_all_participations_equipes() or []

    def create_widgets(self):
        super().create_widgets()
        staff_vals = [f"{s[1]} {s[2]} ({s[4]}) (ID: {s[0]})" for s in self.staff]
        participation_vals = [f"{p[2]} - {p[3]} (E{p[0]}/C{p[1]})" for p in self.participations]
        self.staff_field = self.add_combobox_field("Staff", 0, staff_vals, True)
        self.participation_field = self.add_combobox_field("Équipe/Coupe", 1, participation_vals, True)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=2, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        import re
        try:
            staff_str = self.staff_field.get()
            participation_str = self.participation_field.get()
            id_staff = int(re.search(r'ID: (\d+)', staff_str).group(1)) if staff_str else None
            match = re.search(r'E(\d+)/C(\d+)', participation_str) if participation_str else None
            id_equipe = int(match.group(1)) if match else None
            id_coupe = int(match.group(2)) if match else None
            data = {"id_staff": id_staff, "id_equipe": id_equipe, "id_coupe": id_coupe}
            if not (id_staff and id_equipe and id_coupe):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Encadrement ajouté avec succès.")
                self.destroy()
        except Exception:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class AddArbitreAssistantDialog(AddDataDialog):
    """Dialogue pour l'ajout d'un arbitre assistant."""

    def __init__(self, parent, title, add_callback=None):
        super().__init__(parent, title, add_callback)
        from models.add_data import AddDataModel
        self.matchs = AddDataModel.get_all_matchs() or []
        self.arbitres = AddDataModel.get_all_arbitres() or []

    def create_widgets(self):
        super().create_widgets()
        matchs_vals = [f"{m[1]} {m[2]} vs {m[3]} ({m[4]}) (ID: {m[0]})" for m in self.matchs]
        arbitres_vals = [f"{a[1]} {a[2]} ({a[3]}) (ID: {a[0]})" for a in self.arbitres]
        self.match_field = self.add_combobox_field("Match", 0, matchs_vals, True)
        self.arbitre_field = self.add_combobox_field("Arbitre", 1, arbitres_vals, True)
        self.role_field = self.add_combobox_field("Rôle", 2, ["Assistant 1", "Assistant 2", "Quatrième arbitre", "VAR"], True)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=3, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        import re
        try:
            match_str = self.match_field.get().strip()
            arbitre_str = self.arbitre_field.get().strip()
            match_match = re.search(r'ID: (\d+)', match_str) if match_str else None
            match_arbitre = re.search(r'ID: (\d+)', arbitre_str) if arbitre_str else None
            id_match = int(match_match.group(1)) if match_match else (int(match_str) if match_str.isdigit() else None)
            id_arbitre = int(match_arbitre.group(1)) if match_arbitre else (int(arbitre_str) if arbitreStr.isdigit() else None)
            data = {"id_match": id_match, "id_arbitre": id_arbitre, "role": self.role_field.get().strip()}
            if not (id_match and id_arbitre and data["role"]):
                messagebox.showerror("Erreur", "Veuillez entrer un ID de match et d'arbitre valides.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Arbitre assistant ajouté avec succès.")
                self.destroy()
        except Exception:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class AddPaysHoteDialog(AddDataDialog):
    """Dialogue pour l'ajout d'un pays hôte."""

    def __init__(self, parent, title, add_callback=None):
        super().__init__(parent, title, add_callback)
        from models.add_data import AddDataModel
        self.coupes = AddDataModel.get_all_coupes() or []

    def create_widgets(self):
        super().create_widgets()
        coupes_vals = [f"{c[1]} (ID: {c[0]})" for c in self.coupes]
        self.coupe_field = self.add_combobox_field("Coupe", 0, coupes_vals, True)
        self.pays_field = self.add_entry_field("Pays", 1, True)
        self.id_pays_field = self.add_spinbox_field("ID pays hôte", 2, 1, 50, True)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=3, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        import re
        try:
            coupe_str = self.coupe_field.get()
            id_coupe = int(re.search(r'ID: (\d+)', coupe_str).group(1)) if coupe_str else None
            data = {
                "id_pays_hote": int(self.id_pays_field.get()),
                "id_coupe": id_coupe,
                "pays": self.pays_field.get().strip()
            }
            if not (id_coupe and data["pays"] and data["id_pays_hote"]):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Pays hôte ajouté avec succès.")
                self.destroy()
        except Exception:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

# --- Dialogues de modification avancés ---

class UpdateStadeDialog(AddDataDialog):
    """Dialogue pour la modification d'un stade."""

    def create_widgets(self):
        super().create_widgets()
        self.id_field = self.add_spinbox_field("ID stade", 0, 1, 999999, True)
        self.nom_field = self.add_entry_field("Nom", 1, True)
        self.ville_field = self.add_entry_field("Ville", 2, True)
        self.pays_field = self.add_entry_field("Pays", 3, True)
        self.capacite_field = self.add_spinbox_field("Capacité", 4, 1, 200000, True)
        self.annee_field = self.add_spinbox_field("Année de construction", 5, 1800, 2100, False)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=6, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        try:
            data = {
                "id_stade": int(self.id_field.get()),
                "nom": self.nom_field.get().strip(),
                "ville": self.ville_field.get().strip(),
                "pays": self.pays_field.get().strip(),
                "capacite": int(self.capacite_field.get()),
                "annee_construction": int(self.annee_field.get()) if self.annee_field.get() else None
            }
            if not (data["id_stade"] and data["nom"] and data["ville"] and data["pays"] and data["capacite"]):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Stade modifié avec succès.")
                self.destroy()
        except ValueError:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class UpdateArbitreDialog(AddDataDialog):
    """Dialogue pour la modification d'un arbitre."""

    def create_widgets(self):
        super().create_widgets()
        self.id_field = self.add_spinbox_field("ID arbitre", 0, 1, 999999, True)
        self.nom_field = self.add_entry_field("Nom", 1, True)
        self.prenom_field = self.add_entry_field("Prénom", 2, True)
        self.nationalite_field = self.add_entry_field("Nationalité", 3, True)
        self.experience_field = self.add_spinbox_field("Exp. internationale", 4, 0, 60, False)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=5, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        try:
            data = {
                "id_arbitre": int(self.id_field.get()),
                "nom": self.nom_field.get().strip(),
                "prenom": self.prenom_field.get().strip(),
                "nationalite": self.nationalite_field.get().strip(),
                "experience_internationale": int(self.experience_field.get()) if self.experience_field.get() else None
            }
            if not (data["id_arbitre"] and data["nom"] and data["prenom"] and data["nationalite"]):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Arbitre modifié avec succès.")
                self.destroy()
        except ValueError:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class UpdateStaffTechniqueDialog(AddDataDialog):
    """Dialogue pour la modification d'un staff technique."""

    def create_widgets(self):
        super().create_widgets()
        self.id_field = self.add_spinbox_field("ID staff", 0, 1, 999999, True)
        self.nom_field = self.add_entry_field("Nom", 1, True)
        self.prenom_field = self.add_entry_field("Prénom", 2, True)
        self.nationalite_field = self.add_entry_field("Nationalité", 3, True)
        self.role_field = self.add_entry_field("Rôle", 4, True)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=5, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        try:
            data = {
                "id_staff": int(self.id_field.get()),
                "nom": self.nom_field.get().strip(),
                "prenom": self.prenom_field.get().strip(),
                "nationalite": self.nationalite_field.get().strip(),
                "role": self.role_field.get().strip()
            }
            if not (data["id_staff"] and data["nom"] and data["prenom"] and data["nationalite"] and data["role"]):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Staff modifié avec succès.")
                self.destroy()
        except ValueError:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class UpdatePaysHoteDialog(AddDataDialog):
    """Dialogue pour la modification d'un pays hôte."""

    def create_widgets(self):
        super().create_widgets()
        self.id_pays_field = self.add_spinbox_field("ID pays hôte", 0, 1, 999999, True)
        self.id_coupe_field = self.add_spinbox_field("ID coupe", 1, 1, 999999, True)
        self.pays_field = self.add_entry_field("Pays", 2, True)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=3, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        try:
            data = {
                "id_pays_hote": int(self.id_pays_field.get()),
                "id_coupe": int(self.id_coupe_field.get()),
                "pays": self.pays_field.get().strip()
            }
            if not (data["id_pays_hote"] and data["id_coupe"] and data["pays"]):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Pays hôte modifié avec succès.")
                self.destroy()
        except ValueError:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class UpdateParticipationEquipeDialog(AddDataDialog):
    """Dialogue pour la modification d'une participation équipe."""

    def create_widgets(self):
        super().create_widgets()
        self.id_equipe_field = self.add_spinbox_field("ID équipe", 0, 1, 999999, True)
        self.id_coupe_field = self.add_spinbox_field("ID coupe", 1, 1, 999999, True)
        self.resultat_field = self.add_entry_field("Résultat final", 2, False)
        self.groupe_field = self.add_entry_field("Groupe", 3, False)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=4, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        try:
            data = {
                "id_equipe": int(self.id_equipe_field.get()),
                "id_coupe": int(self.id_coupe_field.get()),
                "resultat_final": self.resultat_field.get().strip() or None,
                "groupe": self.groupe_field.get().strip() or None
            }
            if not (data["id_equipe"] and data["id_coupe"]):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Participation modifiée avec succès.")
                self.destroy()
        except ValueError:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class UpdateSelectionJoueurDialog(AddDataDialog):
    """Dialogue pour la modification d'une sélection joueur."""

    def create_widgets(self):
        super().create_widgets()
        self.id_joueur_field = self.add_spinbox_field("ID joueur", 0, 1, 999999, True)
        self.id_equipe_field = self.add_spinbox_field("ID équipe", 1, 1, 999999, True)
        self.id_coupe_field = self.add_spinbox_field("ID coupe", 2, 1, 999999, True)
        self.maillot_field = self.add_spinbox_field("Numéro maillot", 3, 1, 99, True)
        self.club_field = self.add_entry_field("Club", 4, True)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=5, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        try:
            data = {
                "id_joueur": int(self.id_joueur_field.get()),
                "id_equipe": int(self.id_equipe_field.get()),
                "id_coupe": int(self.id_coupe_field.get()),
                "numero_maillot": int(self.maillot_field.get()),
                "club": self.club_field.get().strip()
            }
            if not (data["id_joueur"] and data["id_equipe"] and data["id_coupe"] and data["club"]):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Sélection modifiée avec succès.")
                self.destroy()
        except ValueError:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class UpdateParticipationJoueurMatchDialog(AddDataDialog):
    """Dialogue pour la modification d'une participation joueur-match."""

    def create_widgets(self):
        super().create_widgets()
        self.id_joueur_field = self.add_spinbox_field("ID joueur", 0, 1, 999999, True)
        self.id_match_field = self.add_spinbox_field("ID match", 1, 1, 999999, True)
        self.titulaire_var = self.add_checkbox_field("Titulaire", 2)
        self.entree_field = self.add_spinbox_field("Minute entrée", 3, 0, 120, False)
        self.sortie_field = self.add_spinbox_field("Minute sortie", 4, 0, 120, False)
        self.buts_field = self.add_spinbox_field("Buts", 5, 0, 20, False)
        self.passes_field = self.add_spinbox_field("Passes décisives", 6, 0, 20, False)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=7, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        try:
            data = {
                "id_joueur": int(self.id_joueur_field.get()),
                "id_match": int(self.id_match_field.get()),
                "titulaire": self.titulaire_var.get(),
                "minute_entree": int(self.entree_field.get()) if self.entree_field.get() else None,
                "minute_sortie": int(self.sortie_field.get()) if self.sortie_field.get() else None,
                "buts": int(self.buts_field.get()) if self.buts_field.get() else 0,
                "passes_decisives": int(self.passes_field.get()) if self.passes_field.get() else 0
            }
            if not (data["id_joueur"] and data["id_match"]):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Participation modifiée avec succès.")
                self.destroy()
        except ValueError:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class UpdateSanctionDialog(AddDataDialog):
    """Dialogue pour la modification d'une sanction."""

    def create_widgets(self):
        super().create_widgets()
        self.id_sanction_field = self.add_spinbox_field("ID sanction", 0, 1, 999999, True)
        self.type_field = self.add_combobox_field("Type", 1, ["Carton jaune", "Carton rouge"], True)
        self.minute_field = self.add_spinbox_field("Minute", 2, 0, 120, True)
        self.raison_field = self.add_entry_field("Raison", 3, False)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=4, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        try:
            data = {
                "id_sanction": int(self.id_sanction_field.get()),
                "type": self.type_field.get().strip(),
                "minute": int(self.minute_field.get()),
                "raison": self.raison_field.get().strip() or None
            }
            if not (data["id_sanction"] and data["type"]):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Sanction modifiée avec succès.")
                self.destroy()
        except ValueError:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")

class UpdateArbitreAssistantDialog(AddDataDialog):
    """Dialogue pour la modification d'un arbitre assistant."""

    def create_widgets(self):
        super().create_widgets()
        self.id_match_field = self.add_spinbox_field("ID match", 0, 1, 999999, True)
        self.id_arbitre_field = self.add_spinbox_field("ID arbitre", 1, 1, 999999, True)
        self.role_field = self.add_combobox_field("Rôle", 2, ["Assistant 1", "Assistant 2", "Quatrième arbitre", "VAR"], True)
        ttk.Label(self.fields_frame, text="* Champs obligatoires", foreground="red").grid(
            row=3, column=0, columnspan=3, sticky=tk.W, padx=5, pady=10)

    def on_add(self):
        try:
            data = {
                "id_match": int(self.id_match_field.get()),
                "id_arbitre": int(self.id_arbitre_field.get()),
                "role": self.role_field.get().strip()
            }
            if not (data["id_match"] and data["id_arbitre"] and data["role"]):
                messagebox.showerror("Erreur", "Veuillez remplir tous les champs obligatoires.")
                return
            if self.add_callback and self.add_callback(data):
                messagebox.showinfo("Succès", "Arbitre assistant modifié avec succès.")
                self.destroy()
        except ValueError:
            messagebox.showerror("Erreur", "Veuillez entrer des valeurs valides.")
