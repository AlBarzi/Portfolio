"""
Module contenant les modèles d'entités pour l'application Coupe du Monde.
"""

from models.database import DatabaseConnection

class CoupeDuMondeModel:
    """Modèle pour les Coupes du Monde."""
    
    @staticmethod
    def get_all():
        """Récupère toutes les coupes du monde."""
        return DatabaseConnection.execute_query(
            "SELECT id_coupe, annee, date_debut, date_fin, nb_equipes, format, slogan FROM coupe_du_monde ORDER BY annee",
            fetchall=True
        )
    
    @staticmethod
    def get_by_id(id_coupe):
        """Récupère une coupe du monde par son ID."""
        return DatabaseConnection.execute_query(
            "SELECT id_coupe, annee, date_debut, date_fin, nb_equipes, format, slogan FROM coupe_du_monde WHERE id_coupe = %s",
            (id_coupe,),
            fetchone=True
        )

class EquipeModel:
    """Modèle pour les équipes."""
    
    @staticmethod
    def get_all():
        """Récupère toutes les équipes."""
        return DatabaseConnection.execute_query(
            "SELECT id_equipe, pays, confederation, classement_fifa, nb_participations FROM equipe ORDER BY pays",
            fetchall=True
        )
    
    @staticmethod
    def get_by_id(id_equipe):
        """Récupère une équipe par son ID."""
        return DatabaseConnection.execute_query(
            "SELECT id_equipe, pays, confederation, classement_fifa, nb_participations FROM equipe WHERE id_equipe = %s",
            (id_equipe,),
            fetchone=True
        )

class JoueurModel:
    """Modèle pour les joueurs."""
    
    @staticmethod
    def get_all():
        """Récupère tous les joueurs."""
        return DatabaseConnection.execute_query(
            "SELECT id_joueur, nom, prenom, date_naissance, nationalite, poste FROM joueur ORDER BY nom, prenom",
            fetchall=True
        )
    
    @staticmethod
    def get_by_id(id_joueur):
        """Récupère un joueur par son ID."""
        return DatabaseConnection.execute_query(
            "SELECT id_joueur, nom, prenom, date_naissance, nationalite, poste FROM joueur WHERE id_joueur = %s",
            (id_joueur,),
            fetchone=True
        )

class MatchModel:
    """Modèle pour les matchs."""
    
    @staticmethod
    def get_all():
        """Récupère tous les matchs."""
        return DatabaseConnection.execute_query(
            """
            SELECT m.id_match, m.id_coupe, cdm.annee, m.date, m.heure, 
                   m.id_equipe1, e1.pays as pays_equipe1, 
                   m.id_equipe2, e2.pays as pays_equipe2, 
                   m.id_stade, s.nom as nom_stade, s.ville, s.pays,
                   m.id_arbitre_principal, a.nom as nom_arbitre, a.prenom as prenom_arbitre,
                   m.phase_competition
            FROM match m
            JOIN coupe_du_monde cdm ON m.id_coupe = cdm.id_coupe
            JOIN equipe e1 ON m.id_equipe1 = e1.id_equipe
            JOIN equipe e2 ON m.id_equipe2 = e2.id_equipe
            JOIN stade s ON m.id_stade = s.id_stade
            JOIN arbitre a ON m.id_arbitre_principal = a.id_arbitre
            ORDER BY m.date DESC, m.heure
            """,
            fetchall=True
        )
    
    @staticmethod
    def get_by_id(id_match):
        """Récupère un match par son ID."""
        return DatabaseConnection.execute_query(
            """
            SELECT m.id_match, m.id_coupe, cdm.annee, m.date, m.heure, 
                   m.id_equipe1, e1.pays as pays_equipe1, 
                   m.id_equipe2, e2.pays as pays_equipe2, 
                   m.id_stade, s.nom as nom_stade, s.ville, s.pays,
                   m.id_arbitre_principal, a.nom as nom_arbitre, a.prenom as prenom_arbitre,
                   m.phase_competition
            FROM match m
            JOIN coupe_du_monde cdm ON m.id_coupe = cdm.id_coupe
            JOIN equipe e1 ON m.id_equipe1 = e1.id_equipe
            JOIN equipe e2 ON m.id_equipe2 = e2.id_equipe
            JOIN stade s ON m.id_stade = s.id_stade
            JOIN arbitre a ON m.id_arbitre_principal = a.id_arbitre
            WHERE m.id_match = %s
            """,
            (id_match,),
            fetchone=True
        )
    
    @staticmethod
    def get_resultat(id_match):
        """Récupère le résultat d'un match."""
        return DatabaseConnection.execute_query(
            """
            SELECT score_equipe1, score_equipe2, score_mi_temps_equipe1, score_mi_temps_equipe2,
                   prolongation, tirs_au_but, score_tirs_au_but_equipe1, score_tirs_au_but_equipe2
            FROM resultat_match
            WHERE id_match = %s
            """,
            (id_match,),
            fetchone=True
        )
    
    @staticmethod
    def get_joueurs_match(id_match):
        """Récupère les joueurs ayant participé à un match."""
        return DatabaseConnection.execute_query(
            """
            SELECT j.id_joueur, j.nom, j.prenom, j.nationalite, j.poste,
                   pjm.titulaire, pjm.minute_entree, pjm.minute_sortie,
                   pjm.buts, pjm.passes_decisives
            FROM participation_joueur_match pjm
            JOIN joueur j ON pjm.id_joueur = j.id_joueur
            WHERE pjm.id_match = %s
            ORDER BY pjm.titulaire DESC, j.poste, j.nom, j.prenom
            """,
            (id_match,),
            fetchall=True
        )
    
    @staticmethod
    def get_sanctions_match(id_match):
        """Récupère les sanctions d'un match."""
        return DatabaseConnection.execute_query(
            """
            SELECT s.id_sanction, s.id_joueur, j.nom, j.prenom, j.nationalite,
                   s.type, s.minute, s.raison
            FROM sanction s
            JOIN joueur j ON s.id_joueur = j.id_joueur
            WHERE s.id_match = %s
            ORDER BY s.minute
            """,
            (id_match,),
            fetchall=True
        )

class StatistiquesModel:
    """Modèle pour les statistiques."""
    
    @staticmethod
    def get_meilleurs_buteurs():
        """Récupère les meilleurs buteurs."""
        return DatabaseConnection.execute_query(
            """
            SELECT j.id_joueur, j.nom, j.prenom, j.nationalite, e.pays, SUM(pjm.buts) AS total_buts
            FROM joueur j
            JOIN participation_joueur_match pjm ON j.id_joueur = pjm.id_joueur
            JOIN equipe e ON j.nationalite = e.pays
            GROUP BY j.id_joueur, j.nom, j.prenom, j.nationalite, e.pays
            HAVING SUM(pjm.buts) > 0
            ORDER BY total_buts DESC
            LIMIT 20
            """,
            fetchall=True
        )
    
    @staticmethod
    def get_meilleurs_buteurs_coupe(id_coupe):
        """Récupère les meilleurs buteurs d'une coupe du monde spécifique."""
        return DatabaseConnection.execute_query(
            """
            SELECT j.id_joueur, j.nom, j.prenom, j.nationalite, e.pays, SUM(pjm.buts) AS total_buts
            FROM joueur j
            JOIN participation_joueur_match pjm ON j.id_joueur = pjm.id_joueur
            JOIN match m ON pjm.id_match = m.id_match
            JOIN equipe e ON j.nationalite = e.pays
            WHERE m.id_coupe = %s
            GROUP BY j.id_joueur, j.nom, j.prenom, j.nationalite, e.pays
            HAVING SUM(pjm.buts) > 0
            ORDER BY total_buts DESC
            LIMIT 20
            """,
            (id_coupe,),
            fetchall=True
        )
    
    @staticmethod
    def get_equipes_par_participations():
        """Récupère les équipes par nombre de participations."""
        return DatabaseConnection.execute_query(
            """
            SELECT e.id_equipe, e.pays, e.confederation, e.nb_participations
            FROM equipe e
            ORDER BY e.nb_participations DESC
            """,
            fetchall=True
        )
    
    @staticmethod
    def get_palmares_equipes():
        """Récupère le palmarès des équipes."""
        return DatabaseConnection.execute_query(
            """
            SELECT e.id_equipe, e.pays, e.confederation, 
                   SUM(CASE WHEN pe.resultat_final = 'Vainqueur' THEN 1 ELSE 0 END) AS titres,
                   SUM(CASE WHEN pe.resultat_final = 'Finaliste' THEN 1 ELSE 0 END) AS finales,
                   SUM(CASE WHEN pe.resultat_final = 'Demi-finale' THEN 1 ELSE 0 END) AS demi_finales,
                   COUNT(pe.id_equipe) AS participations
            FROM equipe e
            LEFT JOIN participation_equipe pe ON e.id_equipe = pe.id_equipe
            GROUP BY e.id_equipe, e.pays, e.confederation
            ORDER BY titres DESC, finales DESC, demi_finales DESC
            """,
            fetchall=True
        )
    
    @staticmethod
    def get_buts_par_coupe():
        """Récupère le nombre de buts par Coupe du Monde."""
        return DatabaseConnection.execute_query(
            """
            SELECT cdm.id_coupe, cdm.annee, SUM(rm.score_equipe1 + rm.score_equipe2) AS total_buts,
                   COUNT(m.id_match) AS nb_matchs,
                   ROUND(CAST(SUM(rm.score_equipe1 + rm.score_equipe2) AS NUMERIC) / COUNT(m.id_match), 2) AS moyenne_buts_par_match
            FROM match m
            JOIN resultat_match rm ON m.id_match = rm.id_match
            JOIN coupe_du_monde cdm ON m.id_coupe = cdm.id_coupe
            GROUP BY cdm.id_coupe, cdm.annee
            ORDER BY cdm.annee
            """,
            fetchall=True
        )
    
    @staticmethod
    def get_joueurs_plusieurs_coupes():
        """Récupère les joueurs ayant participé à plusieurs Coupes du Monde."""
        return DatabaseConnection.execute_query(
            """
            SELECT j.id_joueur, j.nom, j.prenom, j.nationalite, COUNT(DISTINCT sj.id_coupe) AS nb_coupes_monde,
                   STRING_AGG(CAST(cdm.annee AS TEXT), ', ' ORDER BY cdm.annee) AS annees_participation
            FROM joueur j
            JOIN selection_joueur sj ON j.id_joueur = sj.id_joueur
            JOIN coupe_du_monde cdm ON sj.id_coupe = cdm.id_coupe
            GROUP BY j.id_joueur, j.nom, j.prenom, j.nationalite
            HAVING COUNT(DISTINCT sj.id_coupe) > 1
            ORDER BY nb_coupes_monde DESC, j.nom, j.prenom
            """,
            fetchall=True
        )
