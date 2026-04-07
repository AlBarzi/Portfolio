"""
Suite de tests complète pour l'application Coupe du Monde.
Ce script exécute tous les tests nécessaires pour valider l'intégrité de l'application.
"""

import unittest
import os
import sys

# Ajouter le répertoire parent au chemin de recherche Python
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importer les modules de test
from test_database_completeness import TestDonneesCoupeDuMonde

def run_all_tests():
    """Exécute tous les tests de l'application."""
    # Créer une suite de tests
    test_suite = unittest.TestSuite()
    
    # Ajouter les tests de complétude de la base de données
    # Utiliser la méthode recommandée au lieu de unittest.makeSuite()
    loader = unittest.TestLoader()
    test_suite.addTest(loader.loadTestsFromTestCase(TestDonneesCoupeDuMonde))
    
    # Exécuter les tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Afficher un résumé
    print("\n=== Résumé des tests ===")
    print(f"Tests exécutés: {result.testsRun}")
    print(f"Réussites: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Échecs: {len(result.failures)}")
    print(f"Erreurs: {len(result.errors)}")
    
    # Retourner True si tous les tests ont réussi
    return len(result.failures) == 0 and len(result.errors) == 0

if __name__ == "__main__":
    print("=== Suite de tests complète pour l'application Coupe du Monde ===")
    success = run_all_tests()
    sys.exit(0 if success else 1)
