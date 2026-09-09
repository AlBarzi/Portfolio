"""
Module contenant les fonctionnalités de recherche pour l'application Coupe du Monde.
"""

from models.database import DatabaseConnection

class SearchModel:
    """Modèle pour les fonctionnalités de recherche."""
    
    @staticmethod
    def search_coupes(criteria):
        """Recherche des coupes du monde selon les critères spécifiés."""
        query = """
            SELECT id_coupe, annee, date_debut, date_fin, nb_equipes, format, slogan 
            FROM coupe_du_monde 
            WHERE 1=1
        """
        params = []
        
        if criteria.get('annee'):
            query += " AND CAST(annee AS TEXT) LIKE %s"
            params.append(f"%{criteria['annee']}%")
        
        if criteria.get('pays_hote'):
            query += " AND id_coupe IN (SELECT DISTINCT id_coupe FROM stade WHERE pays ILIKE %s)"
            params.append(f"%{criteria['pays_hote']}%")
            
        if criteria.get('format'):
            query += " AND format ILIKE %s"
            params.append(f"%{criteria['format']}%")
            
        query += " ORDER BY annee"
        
        return DatabaseConnection.execute_query(query, params, fetchall=True)
    
    @staticmethod
    def search_equipes(criteria):
        """Recherche des équipes selon les critères spécifiés."""
        query = """
            SELECT id_equipe, pays, confederation, classement_fifa, nb_participations 
            FROM equipe 
            WHERE 1=1
        """
        params = []
        
        if criteria.get('pays'):
            query += " AND pays ILIKE %s"
            params.append(f"%{criteria['pays']}%")
        
        if criteria.get('confederation'):
            query += " AND confederation ILIKE %s"
            params.append(f"%{criteria['confederation']}%")
            
        if criteria.get('min_participations'):
            try:
                min_part = int(criteria['min_participations'])
                query += " AND nb_participations >= %s"
                params.append(min_part)
            except ValueError:
                pass
            
        query += " ORDER BY pays"
        
        return DatabaseConnection.execute_query(query, params, fetchall=True)
    
    @staticmethod
    def search_joueurs(criteria):
        """Recherche des joueurs selon les critères spécifiés."""
        query = """
            SELECT id_joueur, nom, prenom, date_naissance, nationalite, poste 
            FROM joueur 
            WHERE 1=1
        """
        params = []
        
        if criteria.get('nom'):
            query += " AND (nom ILIKE %s OR prenom ILIKE %s)"
            params.append(f"%{criteria['nom']}%")
            params.append(f"%{criteria['nom']}%")
        
        if criteria.get('nationalite'):
            query += " AND nationalite ILIKE %s"
            params.append(f"%{criteria['nationalite']}%")
            
        if criteria.get('poste'):
            query += " AND poste ILIKE %s"
            params.append(f"%{criteria['poste']}%")
            
        query += " ORDER BY nom, prenom"
        
        return DatabaseConnection.execute_query(query, params, fetchall=True)
    
    @staticmethod
    def search_matchs(criteria):
        """Recherche des matchs selon les critères spécifiés."""
        query = """
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
            WHERE 1=1
        """
        params = []
        
        if criteria.get('annee'):
            query += " AND CAST(cdm.annee AS TEXT) LIKE %s"
            params.append(f"%{criteria['annee']}%")
        
        if criteria.get('equipe'):
            query += " AND (e1.pays ILIKE %s OR e2.pays ILIKE %s)"
            params.append(f"%{criteria['equipe']}%")
            params.append(f"%{criteria['equipe']}%")
            
        if criteria.get('phase'):
            query += " AND m.phase_competition ILIKE %s"
            params.append(f"%{criteria['phase']}%")
            
        if criteria.get('stade'):
            query += " AND (s.nom ILIKE %s OR s.ville ILIKE %s OR s.pays ILIKE %s)"
            params.append(f"%{criteria['stade']}%")
            params.append(f"%{criteria['stade']}%")
            params.append(f"%{criteria['stade']}%")
            
        query += " ORDER BY m.date DESC, m.heure"
        
        return DatabaseConnection.execute_query(query, params, fetchall=True)
