"""
Module contenant les fonctionnalités pour obtenir les statistiques des joueurs
ayant gagné le plus de Coupes du Monde.
"""

from models.database import DatabaseConnection

class StatistiquesJoueursCoupeModel:
    """Modèle pour les statistiques des joueurs ayant gagné des Coupes du Monde."""
    
    @staticmethod
    def get_joueurs_plus_coupes_gagnees():
        """Récupère les joueurs ayant gagné le plus de Coupes du Monde."""
        return DatabaseConnection.execute_query(
            """
            SELECT 
                j.id_joueur,
                j.nom, 
                j.prenom, 
                j.nationalite,
                COUNT(DISTINCT pe.id_coupe) AS nombre_coupes_gagnees,
                STRING_AGG(CAST(cdm.annee AS TEXT), ', ' ORDER BY cdm.annee) AS annees_victoires
            FROM 
                JOUEUR j
            JOIN 
                SELECTION_JOUEUR sj ON j.id_joueur = sj.id_joueur
            JOIN 
                PARTICIPATION_EQUIPE pe ON sj.id_equipe = pe.id_equipe AND sj.id_coupe = pe.id_coupe
            JOIN 
                COUPE_DU_MONDE cdm ON pe.id_coupe = cdm.id_coupe
            WHERE 
                pe.resultat_final = 'Vainqueur'
            GROUP BY 
                j.id_joueur, j.nom, j.prenom, j.nationalite
            ORDER BY 
                nombre_coupes_gagnees DESC, j.nom, j.prenom
            """,
            fetchall=True
        )
