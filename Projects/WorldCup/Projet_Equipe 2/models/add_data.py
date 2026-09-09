"""
Module contenant les fonctionnalités d'ajout de données pour l'application Coupe du Monde.
"""

from models.database import DatabaseConnection

class AddDataModel:
    """Modèle pour les fonctionnalités d'ajout de données."""
    
    @staticmethod
    def add_coupe(data):
        """Ajoute une nouvelle coupe du monde."""
        query = """
            INSERT INTO coupe_du_monde (annee, date_debut, date_fin, nb_equipes, format, slogan)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id_coupe
        """
        params = (
            data.get('annee'),
            data.get('date_debut'),
            data.get('date_fin'),
            data.get('nb_equipes'),
            data.get('format'),
            data.get('slogan')
        )
        
        return DatabaseConnection.execute_query(query, params, fetchone=True, commit=True)
    
    @staticmethod
    def add_equipe(data):
        """Ajoute une nouvelle équipe."""
        query = """
            INSERT INTO equipe (pays, confederation, classement_fifa, nb_participations)
            VALUES (%s, %s, %s, %s)
            RETURNING id_equipe
        """
        params = (
            data.get('pays'),
            data.get('confederation'),
            data.get('classement_fifa'),
            data.get('nb_participations')
        )
        
        return DatabaseConnection.execute_query(query, params, fetchone=True, commit=True)
    
    @staticmethod
    def add_joueur(data):
        """Ajoute un nouveau joueur."""
        query = """
            INSERT INTO joueur (nom, prenom, date_naissance, nationalite, poste)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id_joueur
        """
        params = (
            data.get('nom'),
            data.get('prenom'),
            data.get('date_naissance'),
            data.get('nationalite'),
            data.get('poste')
        )
        
        return DatabaseConnection.execute_query(query, params, fetchone=True, commit=True)
    
    @staticmethod
    def add_stade(data):
        """Ajoute un nouveau stade."""
        query = """
            INSERT INTO stade (nom, ville, pays, capacite, annee_construction)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id_stade
        """
        params = (
            data.get('nom'),
            data.get('ville'),
            data.get('pays'),
            data.get('capacite'),
            data.get('annee_construction')
        )
        
        return DatabaseConnection.execute_query(query, params, fetchone=True, commit=True)
    
    @staticmethod
    def add_arbitre(data):
        """Ajoute un nouvel arbitre."""
        query = """
            INSERT INTO arbitre (nom, prenom, nationalite, experience_internationale)
            VALUES (%s, %s, %s, %s)
            RETURNING id_arbitre
        """
        params = (
            data.get('nom'),
            data.get('prenom'),
            data.get('nationalite'),
            data.get('experience_internationale')
        )
        
        return DatabaseConnection.execute_query(query, params, fetchone=True, commit=True)
    
    @staticmethod
    def add_match(data):
        """Ajoute un nouveau match."""
        query_match = """
            INSERT INTO match (id_coupe, date, heure, id_equipe1, id_equipe2, id_stade, id_arbitre_principal, phase_competition)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id_match
        """
        params_match = (
            data.get('id_coupe'),
            data.get('date'),
            data.get('heure'),
            data.get('id_equipe1'),
            data.get('id_equipe2'),
            data.get('id_stade'),
            data.get('id_arbitre_principal'),
            data.get('phase_competition')
        )

        query_resultat = """
            INSERT INTO resultat_match (id_match, score_equipe1, score_equipe2, score_mi_temps_equipe1, score_mi_temps_equipe2,
                                       prolongation, tirs_au_but, score_tirs_au_but_equipe1, score_tirs_au_but_equipe2)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        connection = DatabaseConnection.get_connection()
        if connection is None:
            return None
        cursor = None
        try:
            cursor = connection.cursor()
            cursor.execute(query_match, params_match)
            id_match = cursor.fetchone()[0]

            params_resultat = (
                id_match,
                data.get('score_equipe1'),
                data.get('score_equipe2'),
                data.get('score_mi_temps_equipe1'),
                data.get('score_mi_temps_equipe2'),
                data.get('prolongation', False),
                data.get('tirs_au_but', False),
                data.get('score_tirs_au_but_equipe1'),
                data.get('score_tirs_au_but_equipe2')
            )
            cursor.execute(query_resultat, params_resultat)
            connection.commit()
            return (id_match,)
        except Exception as e:
            connection.rollback()
            print(f"❌ Erreur lors de l'ajout du match: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            DatabaseConnection.release_connection(connection)

    @staticmethod
    def update_coupe(id_coupe, data):
        """Met à jour une coupe du monde."""
        query = """
            UPDATE coupe_du_monde
            SET annee = %s,
                date_debut = %s,
                date_fin = %s,
                nb_equipes = %s,
                format = %s,
                slogan = %s
            WHERE id_coupe = %s
        """
        params = (
            data.get('annee'),
            data.get('date_debut'),
            data.get('date_fin'),
            data.get('nb_equipes'),
            data.get('format'),
            data.get('slogan'),
            id_coupe
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def update_equipe(id_equipe, data):
        """Met à jour une équipe."""
        query = """
            UPDATE equipe
            SET pays = %s,
                confederation = %s,
                classement_fifa = %s,
                nb_participations = %s
            WHERE id_equipe = %s
        """
        params = (
            data.get('pays'),
            data.get('confederation'),
            data.get('classement_fifa'),
            data.get('nb_participations'),
            id_equipe
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def update_joueur(id_joueur, data):
        """Met à jour un joueur."""
        query = """
            UPDATE joueur
            SET nom = %s,
                prenom = %s,
                date_naissance = %s,
                nationalite = %s,
                poste = %s
            WHERE id_joueur = %s
        """
        params = (
            data.get('nom'),
            data.get('prenom'),
            data.get('date_naissance'),
            data.get('nationalite'),
            data.get('poste'),
            id_joueur
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def update_match(id_match, data):
        """Met à jour un match et son résultat dans une transaction."""
        query_match = """
            UPDATE match
            SET id_coupe = %s,
                date = %s,
                heure = %s,
                id_equipe1 = %s,
                id_equipe2 = %s,
                id_stade = %s,
                id_arbitre_principal = %s,
                phase_competition = %s
            WHERE id_match = %s
        """
        params_match = (
            data.get('id_coupe'),
            data.get('date'),
            data.get('heure'),
            data.get('id_equipe1'),
            data.get('id_equipe2'),
            data.get('id_stade'),
            data.get('id_arbitre_principal'),
            data.get('phase_competition'),
            id_match
        )

        query_resultat = """
            UPDATE resultat_match
            SET score_equipe1 = %s,
                score_equipe2 = %s,
                score_mi_temps_equipe1 = %s,
                score_mi_temps_equipe2 = %s,
                prolongation = %s,
                tirs_au_but = %s,
                score_tirs_au_but_equipe1 = %s,
                score_tirs_au_but_equipe2 = %s
            WHERE id_match = %s
        """
        params_resultat = (
            data.get('score_equipe1'),
            data.get('score_equipe2'),
            data.get('score_mi_temps_equipe1'),
            data.get('score_mi_temps_equipe2'),
            data.get('prolongation', False),
            data.get('tirs_au_but', False),
            data.get('score_tirs_au_but_equipe1'),
            data.get('score_tirs_au_but_equipe2'),
            id_match
        )

        queries = [
            {"query": query_match, "params": params_match},
            {"query": query_resultat, "params": params_resultat}
        ]

        return DatabaseConnection.execute_transaction(queries)

    @staticmethod
    def update_stade(id_stade, data):
        """Met à jour un stade."""
        query = """
            UPDATE stade
            SET nom = %s,
                ville = %s,
                pays = %s,
                capacite = %s,
                annee_construction = %s
            WHERE id_stade = %s
        """
        params = (
            data.get('nom'),
            data.get('ville'),
            data.get('pays'),
            data.get('capacite'),
            data.get('annee_construction'),
            id_stade
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def update_arbitre(id_arbitre, data):
        """Met à jour un arbitre."""
        query = """
            UPDATE arbitre
            SET nom = %s,
                prenom = %s,
                nationalite = %s,
                experience_internationale = %s
            WHERE id_arbitre = %s
        """
        params = (
            data.get('nom'),
            data.get('prenom'),
            data.get('nationalite'),
            data.get('experience_internationale'),
            id_arbitre
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def update_staff_technique(id_staff, data):
        """Met à jour un membre du staff technique."""
        query = """
            UPDATE staff_technique
            SET nom = %s,
                prenom = %s,
                nationalite = %s,
                role = %s
            WHERE id_staff = %s
        """
        params = (
            data.get('nom'),
            data.get('prenom'),
            data.get('nationalite'),
            data.get('role'),
            id_staff
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def update_pays_hote(id_pays_hote, id_coupe, data):
        """Met à jour un pays hôte pour une coupe."""
        query = """
            UPDATE pays_hote
            SET pays = %s
            WHERE id_pays_hote = %s AND id_coupe = %s
        """
        params = (
            data.get('pays'),
            id_pays_hote,
            id_coupe
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def update_participation_equipe(id_equipe, id_coupe, data):
        """Met à jour la participation d'une équipe à une coupe."""
        query = """
            UPDATE participation_equipe
            SET resultat_final = %s,
                groupe = %s
            WHERE id_equipe = %s AND id_coupe = %s
        """
        params = (
            data.get('resultat_final'),
            data.get('groupe'),
            id_equipe,
            id_coupe
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def update_selection_joueur(id_joueur, id_equipe, id_coupe, data):
        """Met à jour la sélection d'un joueur pour une coupe."""
        query = """
            UPDATE selection_joueur
            SET numero_maillot = %s,
                club = %s
            WHERE id_joueur = %s AND id_equipe = %s AND id_coupe = %s
        """
        params = (
            data.get('numero_maillot'),
            data.get('club'),
            id_joueur,
            id_equipe,
            id_coupe
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def update_participation_joueur_match(id_joueur, id_match, data):
        """Met à jour la participation d'un joueur à un match."""
        query = """
            UPDATE participation_joueur_match
            SET titulaire = %s,
                minute_entree = %s,
                minute_sortie = %s,
                buts = %s,
                passes_decisives = %s
            WHERE id_joueur = %s AND id_match = %s
        """
        params = (
            data.get('titulaire', False),
            data.get('minute_entree'),
            data.get('minute_sortie'),
            data.get('buts', 0),
            data.get('passes_decisives', 0),
            id_joueur,
            id_match
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def update_sanction(id_sanction, data):
        """Met à jour une sanction."""
        query = """
            UPDATE sanction
            SET type = %s,
                minute = %s,
                raison = %s
            WHERE id_sanction = %s
        """
        params = (
            data.get('type'),
            data.get('minute'),
            data.get('raison'),
            id_sanction
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def update_arbitre_assistant(id_match, id_arbitre, data):
        """Met à jour le rôle d'un arbitre assistant pour un match."""
        query = """
            UPDATE arbitre_assistant
            SET role = %s
            WHERE id_match = %s AND id_arbitre = %s
        """
        params = (
            data.get('role'),
            id_match,
            id_arbitre
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def add_participation_equipe(data):
        """Ajoute une participation d'equipe a une coupe."""
        query = """
            INSERT INTO participation_equipe (id_equipe, id_coupe, resultat_final, groupe)
            VALUES (%s, %s, %s, %s)
        """
        params = (
            data.get('id_equipe'),
            data.get('id_coupe'),
            data.get('resultat_final'),
            data.get('groupe')
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def add_selection_joueur(data):
        """Ajoute une selection de joueur pour une coupe."""
        query = """
            INSERT INTO selection_joueur (id_joueur, id_equipe, id_coupe, numero_maillot, club)
            VALUES (%s, %s, %s, %s, %s)
        """
        params = (
            data.get('id_joueur'),
            data.get('id_equipe'),
            data.get('id_coupe'),
            data.get('numero_maillot'),
            data.get('club')
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def add_pays_hote(data):
        """Ajoute un pays hote a une coupe."""
        query = """
            INSERT INTO pays_hote (id_pays_hote, id_coupe, pays)
            VALUES (%s, %s, %s)
        """
        params = (
            data.get('id_pays_hote'),
            data.get('id_coupe'),
            data.get('pays')
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def add_staff_technique(data):
        """Ajoute un membre du staff technique."""
        query = """
            INSERT INTO staff_technique (nom, prenom, nationalite, role)
            VALUES (%s, %s, %s, %s)
        """
        params = (
            data.get('nom'),
            data.get('prenom'),
            data.get('nationalite'),
            data.get('role')
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def add_encadrement(data):
        """Ajoute un encadrement d'equipe."""
        query = """
            INSERT INTO encadrement (id_staff, id_equipe, id_coupe)
            VALUES (%s, %s, %s)
        """
        params = (
            data.get('id_staff'),
            data.get('id_equipe'),
            data.get('id_coupe')
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def add_participation_joueur_match(data):
        """Ajoute une participation d'un joueur a un match."""
        query = """
            INSERT INTO participation_joueur_match (id_joueur, id_match, titulaire, minute_entree, minute_sortie, buts, passes_decisives)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            data.get('id_joueur'),
            data.get('id_match'),
            data.get('titulaire', False),
            data.get('minute_entree'),
            data.get('minute_sortie'),
            data.get('buts', 0),
            data.get('passes_decisives', 0)
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def add_sanction(data):
        """Ajoute une sanction."""
        query = """
            INSERT INTO sanction (id_joueur, id_match, type, minute, raison)
            VALUES (%s, %s, %s, %s, %s)
        """
        params = (
            data.get('id_joueur'),
            data.get('id_match'),
            data.get('type'),
            data.get('minute'),
            data.get('raison')
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def add_arbitre_assistant(data):
        """Ajoute un arbitre assistant a un match."""
        query = """
            INSERT INTO arbitre_assistant (id_match, id_arbitre, role)
            VALUES (%s, %s, %s)
        """
        params = (
            data.get('id_match'),
            data.get('id_arbitre'),
            data.get('role')
        )
        return DatabaseConnection.execute_query(query, params, commit=True)

    @staticmethod
    def get_all_participations_equipes():
        """Récupère les participations équipes-coupes pour les listes déroulantes."""
        return DatabaseConnection.execute_query(
            """
            SELECT pe.id_equipe, pe.id_coupe, e.pays, cdm.annee, pe.resultat_final, pe.groupe
            FROM participation_equipe pe
            JOIN equipe e ON pe.id_equipe = e.id_equipe
            JOIN coupe_du_monde cdm ON pe.id_coupe = cdm.id_coupe
            ORDER BY cdm.annee DESC, e.pays
            """,
            fetchall=True
        )

    @staticmethod
    def get_all_participations_joueur_match():
        """Récupère les participations joueurs-matchs pour les listes déroulantes."""
        return DatabaseConnection.execute_query(
            """
            SELECT pjm.id_joueur, pjm.id_match, j.nom, j.prenom, cdm.annee, m.date, e1.pays, e2.pays
            FROM participation_joueur_match pjm
            JOIN joueur j ON pjm.id_joueur = j.id_joueur
            JOIN match m ON pjm.id_match = m.id_match
            JOIN coupe_du_monde cdm ON m.id_coupe = cdm.id_coupe
            JOIN equipe e1 ON m.id_equipe1 = e1.id_equipe
            JOIN equipe e2 ON m.id_equipe2 = e2.id_equipe
            ORDER BY m.date DESC, j.nom, j.prenom
            """,
            fetchall=True
        )

    @staticmethod
    def get_all_matchs():
        """Récupère tous les matchs pour les listes déroulantes."""
        return DatabaseConnection.execute_query(
            """
            SELECT m.id_match, cdm.annee, e1.pays, e2.pays, m.date, m.heure
            FROM match m
            JOIN coupe_du_monde cdm ON m.id_coupe = cdm.id_coupe
            JOIN equipe e1 ON m.id_equipe1 = e1.id_equipe
            JOIN equipe e2 ON m.id_equipe2 = e2.id_equipe
            ORDER BY m.date DESC, m.heure
            """,
            fetchall=True
        )

    @staticmethod
    def get_all_staff():
        """Récupère tout le staff technique pour les listes déroulantes."""
        return DatabaseConnection.execute_query(
            "SELECT id_staff, nom, prenom, nationalite, role FROM staff_technique ORDER BY nom, prenom",
            fetchall=True
        )

    @staticmethod
    def get_all_equipes():
        """Récupère toutes les équipes pour les listes déroulantes."""
        return DatabaseConnection.execute_query(
            "SELECT id_equipe, pays FROM equipe ORDER BY pays",
            fetchall=True
        )

    @staticmethod
    def get_all_stades():
        """Récupère tous les stades pour les listes déroulantes."""
        return DatabaseConnection.execute_query(
            "SELECT id_stade, nom, ville, pays FROM stade ORDER BY nom",
            fetchall=True
        )

    @staticmethod
    def get_all_arbitres():
        """Récupère tous les arbitres pour les listes déroulantes."""
        return DatabaseConnection.execute_query(
            "SELECT id_arbitre, nom, prenom, nationalite FROM arbitre ORDER BY nom, prenom",
            fetchall=True
        )

    @staticmethod
    def get_all_coupes():
        """Récupère toutes les coupes du monde pour les listes déroulantes."""
        return DatabaseConnection.execute_query(
            "SELECT id_coupe, annee FROM coupe_du_monde ORDER BY annee DESC",
            fetchall=True
        )

    @staticmethod
    def get_all_joueurs():
        """Récupère tous les joueurs pour les listes déroulantes."""
        return DatabaseConnection.execute_query(
            "SELECT id_joueur, nom, prenom FROM joueur ORDER BY nom, prenom",
            fetchall=True
        )
