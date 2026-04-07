# Projet Coupe du Monde de Football - IFT2935

Ce projet est une application de gestion de base de données pour la Coupe du Monde de football. Il permet de consulter, rechercher et ajouter des données sur les coupes du monde, équipes, joueurs et matchs.

## Prérequis

- Python 3.8 ou supérieur
- PostgreSQL 12 ou supérieur
- Bibliothèques Python : psycopg2, Pillow, tkinter

## Installation

1. Assurez-vous que PostgreSQL est installé et en cours d'exécution sur votre système.
2. Clonez ou téléchargez ce dépôt.
3. Installez les dépendances Python requises :

```bash
pip install psycopg2-binary Pillow
```

## Configuration

L'application vous demandera vos identifiants PostgreSQL au démarrage :
- Nom d'utilisateur PostgreSQL
- Mot de passe PostgreSQL

Ces informations ne sont pas stockées dans des fichiers et sont uniquement utilisées pour la session en cours.

**Important** : Toutes les connexions à PostgreSQL dans cette application nécessitent une authentification explicite. Aucun identifiant par défaut n'est utilisé, que ce soit dans l'application principale ou dans les tests.

## Initialisation manuelle de la base de données

Pour initialiser manuellement la base de données avec les scripts SQL fournis, suivez ces étapes :

1. Accédez au répertoire `resources/sql` du projet
2. Utilisez le script shell interactif fourni :

```bash
# Donner les droits d'exécution au script
chmod +x setup_projet.sh

# Exécuter le script
./setup_projet.sh
```

Le script vous guidera à travers les étapes suivantes :
- **Demande de votre nom d'utilisateur PostgreSQL** (le script vous invite à saisir votre nom d'utilisateur)
- Suppression de l'ancienne base de données (si elle existe)
- Création de la nouvelle base de données
- Chargement du schéma SQL
- Insertion des données de test
- Exécution des requêtes statistiques (facultatif)

**Note importante** : Le script a été conçu pour être utilisé par n'importe quel utilisateur PostgreSQL. Il ne contient aucun identifiant codé en dur et demande explicitement le nom d'utilisateur au démarrage.

Si vous préférez exécuter les commandes manuellement, voici comment procéder (le système vous demandera votre mot de passe à chaque commande) :

```bash
# Suppression de l'ancienne base de données (si elle existe)
# Le système vous demandera votre mot de passe
dropdb -U <votre_nom_utilisateur> coupe_du_monde

# Création de la base de données
# Le système vous demandera votre mot de passe
createdb -U <votre_nom_utilisateur> coupe_du_monde

# Chargement du schéma SQL
# Le système vous demandera votre mot de passe
psql -U <votre_nom_utilisateur> -d coupe_du_monde -f schema_coupe_du_monde.sql

# Insertion des données de test
# Le système vous demandera votre mot de passe
psql -U <votre_nom_utilisateur> -d coupe_du_monde -f donnees_test.sql

# Exécution des requêtes statistiques (facultatif)
# Le système vous demandera votre mot de passe
psql -U <votre_nom_utilisateur> -d coupe_du_monde -f requetes_statistiques.sql
```

**Important** : Le script SQL `donnees_test.sql` contient toutes les données nécessaires pour les tests et doit être utilisé pour initialiser la base de données avec un jeu de données complet.

## Démarrage de l'application

Pour lancer l'application, exécutez le script principal :

```bash
python main.py
```

Lors du démarrage, l'application :
1. Vous demande vos identifiants PostgreSQL
2. Se connecte à PostgreSQL avec les identifiants fournis
3. Crée la base de données `coupe_du_monde` si elle n'existe pas
4. Initialise les tables et charge les données de test

## Fonctionnalités

L'application offre les fonctionnalités suivantes :

1. **Consultation des données** :
   - Coupes du Monde (10 éditions de 1990 à 2026)
   - Équipes
   - Joueurs
   - Matchs
   - Statistiques

2. **Recherche** :
   - Filtrage des coupes du monde par année, nombre d'équipes, etc.
   - Filtrage des équipes par pays, confédération, etc.
   - Filtrage des joueurs par nom, nationalité, poste, etc.
   - Filtrage des matchs par coupe, équipe, phase, etc.

3. **Ajout de données** :
   - Ajout de nouvelles coupes du monde
   - Ajout de nouvelles équipes
   - Ajout de nouveaux joueurs
   - Ajout de nouveaux matchs

## Tests

Pour exécuter les tests de la base de données :

```bash
python test_database_completeness.py
```

Note : Les tests vous demanderont également vos identifiants PostgreSQL. Aucun identifiant par défaut n'est utilisé.

Pour exécuter les tests MVC :

```bash
python -m unittest tests.test_mvc
```

Note : Les tests MVC vous demanderont également vos identifiants PostgreSQL.

## Structure du projet

Le projet suit l'architecture MVC (Modèle-Vue-Contrôleur) :

- **config/** : Configuration de l'application
- **controllers/** : Contrôleurs pour la logique de l'application
- **models/** : Modèles pour l'accès aux données
- **views/** : Vues pour l'interface utilisateur
- **resources/** : Ressources (images, fichiers SQL)
  - **resources/sql/** : Scripts SQL pour l'initialisation de la base de données
    - **schema_coupe_du_monde.sql** : Définition du schéma de la base de données
    - **donnees_test.sql** : Données de test complètes
    - **requetes_statistiques.sql** : Requêtes pour générer des statistiques
    - **setup_projet.sh** : Script shell interactif pour automatiser l'initialisation
- **tests/** : Tests unitaires

## Sécurité des identifiants

Cette application suit les meilleures pratiques en matière de sécurité des identifiants :

1. **Aucun identifiant par défaut** : Toutes les connexions à PostgreSQL nécessitent une authentification explicite.
2. **Aucun stockage d'identifiants** : Les identifiants ne sont jamais stockés dans des fichiers de configuration ou dans le code.
3. **Demande explicite** : L'application demande explicitement les identifiants à chaque démarrage.
4. **Session unique** : Les identifiants ne sont utilisés que pour la session en cours.
5. **Scripts interactifs** : Les scripts d'initialisation demandent également les identifiants de manière interactive.

## Dépannage

Si vous rencontrez des problèmes de connexion à la base de données :
1. Vérifiez que PostgreSQL est en cours d'exécution
2. Vérifiez que les identifiants fournis sont corrects
3. Assurez-vous que l'utilisateur PostgreSQL a les droits nécessaires pour créer des bases de données
4. Essayez d'initialiser manuellement la base de données en suivant les instructions ci-dessus
5. Si vous utilisez PGPASS ou des variables d'environnement pour l'authentification PostgreSQL, assurez-vous qu'ils sont correctement configurés

## Données de test

L'application inclut des données de test complètes couvrant 10 Coupes du Monde (de 1990 à 2026) avec :
- Équipes participantes et leurs résultats
- Joueurs célèbres de chaque époque
- Matchs importants (finales, demi-finales, etc.)
- Statistiques (buts, sanctions, etc.)

Ces données permettent de tester toutes les fonctionnalités de l'application avec un jeu de données réaliste et complet.


