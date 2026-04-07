from models.database import DatabaseConnection
from models.stats_joueurs_coupes import StatistiquesJoueursCoupeModel

class StatistiquesView:
    """Vue pour les statistiques."""
    
    @staticmethod
    def afficher_meilleurs_buteurs():
        """Affiche les meilleurs buteurs."""
        meilleurs_buteurs = StatistiquesModel.get_meilleurs_buteurs()
        
        print("\n=== MEILLEURS BUTEURS DE TOUS LES TEMPS ===")
        print(f"{'NOM':<15} {'PRÉNOM':<15} {'PAYS':<15} {'BUTS':<5}")
        print("-" * 50)
        
        for joueur in meilleurs_buteurs:
            print(f"{joueur[1]:<15} {joueur[2]:<15} {joueur[3]:<15} {joueur[5]:<5}")
    
    @staticmethod
    def afficher_meilleurs_buteurs_coupe(id_coupe, annee):
        """Affiche les meilleurs buteurs d'une coupe du monde spécifique."""
        meilleurs_buteurs = StatistiquesModel.get_meilleurs_buteurs_coupe(id_coupe)
        
        print(f"\n=== MEILLEURS BUTEURS DE LA COUPE DU MONDE {annee} ===")
        print(f"{'NOM':<15} {'PRÉNOM':<15} {'PAYS':<15} {'BUTS':<5}")
        print("-" * 50)
        
        for joueur in meilleurs_buteurs:
            print(f"{joueur[1]:<15} {joueur[2]:<15} {joueur[3]:<15} {joueur[5]:<5}")
    
    @staticmethod
    def afficher_equipes_par_participations():
        """Affiche les équipes par nombre de participations."""
        equipes = StatistiquesModel.get_equipes_par_participations()
        
        print("\n=== ÉQUIPES PAR NOMBRE DE PARTICIPATIONS ===")
        print(f"{'PAYS':<20} {'CONFÉDÉRATION':<15} {'PARTICIPATIONS':<15}")
        print("-" * 50)
        
        for equipe in equipes:
            print(f"{equipe[1]:<20} {equipe[2]:<15} {equipe[3]:<15}")
    
    @staticmethod
    def afficher_palmares_equipes():
        """Affiche le palmarès des équipes."""
        palmares = StatistiquesModel.get_palmares_equipes()
        
        print("\n=== PALMARÈS DES ÉQUIPES ===")
        print(f"{'PAYS':<20} {'TITRES':<8} {'FINALES':<8} {'DEMI-FINALES':<12} {'PARTICIPATIONS':<15}")
        print("-" * 65)
        
        for equipe in palmares:
            print(f"{equipe[1]:<20} {equipe[3]:<8} {equipe[4]:<8} {equipe[5]:<12} {equipe[6]:<15}")
    
    @staticmethod
    def afficher_buts_par_coupe():
        """Affiche le nombre de buts par Coupe du Monde."""
        buts_par_coupe = StatistiquesModel.get_buts_par_coupe()
        
        print("\n=== BUTS PAR COUPE DU MONDE ===")
        print(f"{'ANNÉE':<8} {'TOTAL BUTS':<12} {'MATCHS':<8} {'MOYENNE/MATCH':<15}")
        print("-" * 45)
        
        for coupe in buts_par_coupe:
            print(f"{coupe[1]:<8} {coupe[2]:<12} {coupe[3]:<8} {coupe[4]:<15}")
    
    @staticmethod
    def afficher_joueurs_plusieurs_coupes():
        """Affiche les joueurs ayant participé à plusieurs Coupes du Monde."""
        joueurs = StatistiquesModel.get_joueurs_plusieurs_coupes()
        
        print("\n=== JOUEURS AVEC PLUSIEURS PARTICIPATIONS EN COUPE DU MONDE ===")
        print(f"{'NOM':<15} {'PRÉNOM':<15} {'PAYS':<15} {'PARTICIPATIONS':<15} {'ANNÉES':<30}")
        print("-" * 90)
        
        for joueur in joueurs:
            print(f"{joueur[1]:<15} {joueur[2]:<15} {joueur[3]:<15} {joueur[4]:<15} {joueur[5]:<30}")
    
    @staticmethod
    def afficher_joueurs_plus_coupes_gagnees():
        """Affiche les joueurs ayant gagné le plus de Coupes du Monde."""
        joueurs = StatistiquesJoueursCoupeModel.get_joueurs_plus_coupes_gagnees()
        
        print("\n=== JOUEURS AVEC LE PLUS DE COUPES DU MONDE GAGNÉES ===")
        print(f"{'NOM':<15} {'PRÉNOM':<15} {'PAYS':<15} {'COUPES GAGNÉES':<15} {'ANNÉES':<30}")
        print("-" * 90)
        
        for joueur in joueurs:
            print(f"{joueur[1]:<15} {joueur[2]:<15} {joueur[3]:<15} {joueur[4]:<15} {joueur[5]:<30}")
