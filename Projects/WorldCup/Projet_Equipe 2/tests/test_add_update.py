"""
Tests pour vérifier les ajouts et mises à jour via le modèle.
"""
import os
import sys
import unittest
import getpass
# Ajouter le répertoire parent au chemin de recherche
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.settings import DB_CONFIG
from models.database import DatabaseConnection
from models.add_data import AddDataModel
class TestAddUpdate(unittest.TestCase):
    """Tests d'ajout et de mise à jour des entités principales."""
    @classmethod
    def setUpClass(cls):
        cls.db_config = DB_CONFIG.copy()
        print("Veuillez entrer vos identifiants PostgreSQL pour exécuter les tests d'ajout/mise à jour:")
        cls.db_config["user"] = input("Nom d'utilisateur PostgreSQL: ")
        cls.db_config["password"] = getpass.getpass("Mot de passe PostgreSQL: ")
        DatabaseConnection.initialize_pool(cls.db_config)
    @staticmethod
    def _sync_sequence(table_name, id_column):
        """Aligne la séquence SERIAL sur la valeur max existante."""
        query = (
            f"SELECT setval(pg_get_serial_sequence('{table_name}', '{id_column}'), "
            f"COALESCE((SELECT MAX({id_column}) FROM {table_name}), 0), true)"
        )
        DatabaseConnection.execute_query(query, fetchone=True)
    def test_add_update_coupe(self):
        coupe_id = None
        try:
            self._sync_sequence("coupe_du_monde", "id_coupe")
            result = AddDataModel.add_coupe({
                "annee": 2098,
                "date_debut": "2098-06-01",
                "date_fin": "2098-07-01",
                "nb_equipes": 32,
                "format": "Groupes",
                "slogan": "Test Coupe"
            })
            self.assertIsNotNone(result)
            coupe_id = result[0]
            updated = AddDataModel.update_coupe(coupe_id, {
                "annee": 2098,
                "date_debut": "2098-06-01",
                "date_fin": "2098-07-02",
                "nb_equipes": 48,
                "format": "Groupes + Eliminatoires",
                "slogan": "Test Coupe Update"
            })
            self.assertTrue(updated)
        finally:
            if coupe_id:
                DatabaseConnection.execute_query(
                    "DELETE FROM coupe_du_monde WHERE id_coupe = %s",
                    (coupe_id,),
                    commit=True
                )
    def test_add_update_equipe(self):
        equipe_id = None
        try:
            self._sync_sequence("equipe", "id_equipe")
            result = AddDataModel.add_equipe({
                "confederation": "UEFA",
                "classement_fifa": 200,
                "nb_participations": 0
            })
            self.assertIsNotNone(result)
            equipe_id = result[0]
            updated = AddDataModel.update_equipe(equipe_id, {
                "pays": "Testland",
                "confederation": "UEFA",
                "classement_fifa": 150,
                "nb_participations": 1
            })
            self.assertTrue(updated)
        finally:
            if equipe_id:
                DatabaseConnection.execute_query(
                    "DELETE FROM equipe WHERE id_equipe = %s",
                    (equipe_id,),
                    commit=True
                )
    def test_add_update_joueur(self):
        joueur_id = None
        try:
            self._sync_sequence("joueur", "id_joueur")
            result = AddDataModel.add_joueur({
                "nom": "Test",
                "prenom": "Joueur",
                "date_naissance": "2000-01-01",
                "nationalite": "Testland",
                "poste": "Milieu"
            })
            self.assertIsNotNone(result)
            joueur_id = result[0]
            updated = AddDataModel.update_joueur(joueur_id, {
                "nom": "Test",
                "prenom": "Joueur",
                "date_naissance": "2000-01-01",
                "nationalite": "Testland",
                "poste": "Attaquant"
            })
            self.assertTrue(updated)
        finally:
            if joueur_id:
                DatabaseConnection.execute_query(
                    "DELETE FROM joueur WHERE id_joueur = %s",
                    (joueur_id,),
                    commit=True
                )
    def test_add_update_match(self):
        coupe_id = None
        equipe1_id = None
        equipe2_id = None
        stade_id = None
        arbitre_id = None
        match_id = None
        try:
            self._sync_sequence("coupe_du_monde", "id_coupe")
            self._sync_sequence("equipe", "id_equipe")
            self._sync_sequence("stade", "id_stade")
            self._sync_sequence("arbitre", "id_arbitre")
            self._sync_sequence("match", "id_match")
            coupe_id = AddDataModel.add_coupe({
                "annee": 2099,
                "date_debut": "2099-06-01",
                "date_fin": "2099-07-01",
                "nb_equipes": 2,
                "format": "Test",
                "slogan": "Test"
            })[0]
            equipe1_id = AddDataModel.add_equipe({
                "pays": "Team A",
                "confederation": "UEFA",
                "classement_fifa": 50,
                "nb_participations": 1
            })[0]
            equipe2_id = AddDataModel.add_equipe({
                "pays": "Team B",
                "confederation": "UEFA",
                "classement_fifa": 60,
                "nb_participations": 1
            })[0]
            stade_id = AddDataModel.add_stade({
                "nom": "Stade Test",
                "ville": "Test City",
                "pays": "Testland",
                "capacite": 40000,
                "annee_construction": 2000
            })[0]
            arbitre_id = AddDataModel.add_arbitre({
                "nom": "Arb",
                "prenom": "Test",
                "nationalite": "Testland",
                "experience_internationale": 5
            })[0]
            match_id = AddDataModel.add_match({
                "id_coupe": coupe_id,
                "date": "2099-06-10",
                "heure": "18:00",
                "id_equipe1": equipe1_id,
                "id_equipe2": equipe2_id,
                "id_stade": stade_id,
                "id_arbitre_principal": arbitre_id,
                "phase_competition": "Finale",
                "score_equipe1": 1,
                "score_equipe2": 0,
                "score_mi_temps_equipe1": 1,
                "score_mi_temps_equipe2": 0,
                "prolongation": False,
                "tirs_au_but": False,
                "score_tirs_au_but_equipe1": None,
                "score_tirs_au_but_equipe2": None
            })[0]
            updated = AddDataModel.update_match(match_id, {
                "id_coupe": coupe_id,
                "date": "2099-06-10",
                "heure": "18:00",
                "id_equipe1": equipe1_id,
                "id_equipe2": equipe2_id,
                "id_stade": stade_id,
                "id_arbitre_principal": arbitre_id,
                "phase_competition": "Finale",
                "score_equipe1": 2,
                "score_equipe2": 1,
                "score_mi_temps_equipe1": 1,
                "score_mi_temps_equipe2": 1,
                "prolongation": False,
                "tirs_au_but": False,
                "score_tirs_au_but_equipe1": None,
                "score_tirs_au_but_equipe2": None
            })
            self.assertTrue(updated)
        finally:
            if match_id:
                DatabaseConnection.execute_query("DELETE FROM match WHERE id_match = %s", (match_id,), commit=True)
            if arbitre_id:
                DatabaseConnection.execute_query("DELETE FROM arbitre WHERE id_arbitre = %s", (arbitre_id,), commit=True)
            if stade_id:
                DatabaseConnection.execute_query("DELETE FROM stade WHERE id_stade = %s", (stade_id,), commit=True)
            if equipe1_id:
                DatabaseConnection.execute_query("DELETE FROM equipe WHERE id_equipe = %s", (equipe1_id,), commit=True)
            if equipe2_id:
                DatabaseConnection.execute_query("DELETE FROM equipe WHERE id_equipe = %s", (equipe2_id,), commit=True)
            if coupe_id:
                DatabaseConnection.execute_query("DELETE FROM coupe_du_monde WHERE id_coupe = %s", (coupe_id,), commit=True)
if __name__ == "__main__":
    unittest.main()
