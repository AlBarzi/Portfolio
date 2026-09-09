# Rapport du Projet - Base de Données de la Coupe du Monde de Football

## Introduction

Ce rapport présente le développement d'une base de données complète pour la Coupe du Monde de football, réalisé dans le cadre du cours IFT2935 - Base de données. Le projet couvre toutes les étapes du développement, de la modélisation initiale à l'implémentation finale, en passant par la normalisation et la création de requêtes statistiques.

Le sujet choisi est le sujet 5 : "La coupe du monde des nations du football", qui vise à créer une base de données des coupes du monde depuis la création de cette compétition, permettant d'obtenir diverses statistiques sur la participation des joueurs, des équipes et des arbitres.

## 1. Modélisation Entité-Association

### 1.1 Identification des entités

Après analyse du sujet et recherche d'informations complémentaires sur la structure des coupes du monde, nous avons identifié les entités principales suivantes :

1. **Coupe du Monde** : Représente chaque édition de la compétition
2. **Équipe nationale** : Représente les pays participants
3. **Joueur** : Représente les footballeurs participant à la compétition
4. **Staff technique** : Représente les entraîneurs et leurs collaborateurs
5. **Match** : Représente les rencontres entre équipes
6. **Stade** : Représente les lieux où se déroulent les matchs
7. **Arbitre** : Représente les officiels qui gèrent les matchs
8. **Sanction** : Représente les cartons jaunes et rouges reçus par les joueurs

### 1.2 Attributs des entités

Pour chaque entité, nous avons défini des attributs pertinents et réalistes :

**Coupe du Monde** :
- ID (clé primaire)
- Année
- Dates (début et fin)
- Nombre d'équipes participantes
- Format de compétition
- Slogan/Thème
- Pays hôte(s)

**Équipe nationale** :
- ID (clé primaire)
- Pays
- Confédération (UEFA, CONMEBOL, etc.)
- Classement FIFA
- Nombre de participations
- Palmarès

**Joueur** :
- ID (clé primaire)
- Nom, prénom
- Date de naissance
- Nationalité
- Poste
- Numéro de maillot
- Club actuel

**Staff technique** :
- ID (clé primaire)
- Nom, prénom
- Nationalité
- Rôle

**Match** :
- ID (clé primaire)
- Date et heure
- Stade
- Phase de compétition
- Équipes participantes
- Score final
- Prolongation/Tirs au but

**Stade** :
- ID (clé primaire)
- Nom
- Ville, pays
- Capacité
- Année de construction

**Arbitre** :
- ID (clé primaire)
- Nom, prénom
- Nationalité
- Rôle
- Expérience internationale

**Sanction** :
- ID (clé primaire)
- Type (carton jaune/rouge)
- Minute
- Raison

### 1.3 Relations entre les entités

Nous avons identifié les relations suivantes entre les entités :

1. **Organise** : Une Coupe du Monde est organisée dans un ou plusieurs pays hôtes.
2. **Participe** : Une Équipe participe à une ou plusieurs Coupes du Monde.
3. **Compose** : Un Joueur compose une Équipe pour une Coupe du Monde spécifique.
4. **Dirige** : Un Staff technique dirige une Équipe pour une Coupe du Monde spécifique.
5. **Affronte** : Une Équipe affronte une autre Équipe lors d'un Match.
6. **Joue_dans** : Un Match se joue dans un Stade.
7. **Arbitre** : Un Arbitre principal et des Arbitres assistants gèrent un Match.
8. **Reçoit** : Un Joueur peut recevoir une Sanction lors d'un Match.
9. **Participe_à** : Un Joueur participe à un Match.

### 1.4 Justification des choix de modélisation

- **Pays hôtes multiples** : Nous avons modélisé la possibilité d'avoir plusieurs pays hôtes pour une même Coupe du Monde (ex: Corée/Japon 2002, USA/Canada/Mexique 2026).
- **Sélection des joueurs** : Un joueur peut théoriquement représenter différentes équipes nationales au cours de sa carrière (cas rares mais possibles), d'où une relation ternaire entre Joueur, Équipe et Coupe du Monde.
- **Staff technique** : Nous avons séparé le staff technique des joueurs car ils ont des rôles et attributs différents.
- **Sanctions** : Les sanctions (cartons) sont modélisées comme une entité distincte pour faciliter les statistiques sur la discipline.
- **Arbitres assistants** : Nous avons distingué l'arbitre principal des arbitres assistants pour refléter la réalité des matchs.

## 2. Transformation vers le modèle relationnel

### 2.1 Application des règles de transformation

Nous avons appliqué les règles standard de transformation du modèle E/A vers le modèle relationnel :

1. **Entités fortes** : Chaque entité forte devient une table avec tous ses attributs.
2. **Relations 1:N** : La clé primaire de l'entité du côté "1" est ajoutée comme clé étrangère dans la table du côté "N".
3. **Relations N:M** : Création d'une table d'association avec les clés primaires des deux entités comme clés étrangères.
4. **Relations ternaires** : Création d'une table d'association avec les clés primaires des trois entités impliquées.

### 2.2 Schéma relationnel résultant

Le schéma relationnel obtenu comprend 15 tables :

1. **COUPE_DU_MONDE** (id_coupe, annee, date_debut, date_fin, nb_equipes, format, slogan)
2. **PAYS_HOTE** (id_pays_hote, id_coupe, pays)
3. **EQUIPE** (id_equipe, pays, confederation, classement_fifa, nb_participations)
4. **PARTICIPATION_EQUIPE** (id_equipe, id_coupe, resultat_final, groupe)
5. **JOUEUR** (id_joueur, nom, prenom, date_naissance, nationalite, poste)
6. **SELECTION_JOUEUR** (id_joueur, id_equipe, id_coupe, numero_maillot, club)
7. **STAFF_TECHNIQUE** (id_staff, nom, prenom, nationalite, role)
8. **ENCADREMENT** (id_staff, id_equipe, id_coupe)
9. **STADE** (id_stade, nom, ville, pays, capacite, annee_construction)
10. **ARBITRE** (id_arbitre, nom, prenom, nationalite, experience_internationale)
11. **MATCH** (id_match, id_coupe, id_equipe1, id_equipe2, id_stade, id_arbitre_principal, date, heure, phase_competition)
12. **RESULTAT_MATCH** (id_match, score_equipe1, score_equipe2, score_mi_temps_equipe1, score_mi_temps_equipe2, prolongation, tirs_au_but, score_tirs_au_but_equipe1, score_tirs_au_but_equipe2)
13. **ARBITRE_ASSISTANT** (id_match, id_arbitre, role)
14. **PARTICIPATION_JOUEUR_MATCH** (id_joueur, id_match, titulaire, minute_entree, minute_sortie, buts, passes_decisives)
15. **SANCTION** (id_sanction, id_joueur, id_match, type, minute, raison)

### 2.3 Explication des choix de transformation

- **Tables séparées pour les pays hôtes** : Une table PAYS_HOTE a été créée pour gérer le cas où plusieurs pays organisent une même Coupe du Monde.
- **Gestion des participations** : La relation N:M entre EQUIPE et COUPE_DU_MONDE est transformée en table d'association PARTICIPATION_EQUIPE.
- **Sélection des joueurs** : La table SELECTION_JOUEUR représente la relation ternaire entre JOUEUR, EQUIPE et COUPE_DU_MONDE.
- **Structure des matchs** : La table MATCH contient des références aux deux équipes qui s'affrontent ainsi qu'au stade et à l'arbitre principal.
- **Résultats des matchs** : Les informations de score ont été séparées dans une table RESULTAT_MATCH pour faciliter les requêtes statistiques.

## 3. Normalisation du schéma relationnel

### 3.1 Analyse des dépendances fonctionnelles

Pour chaque relation du schéma, nous avons identifié les dépendances fonctionnelles et vérifié si la table était en 3NF (troisième forme normale).

Exemple pour la table MATCH :
- id_match → id_coupe, id_equipe1, id_equipe2, id_stade, id_arbitre_principal, date, heure, phase_competition

### 3.2 Normalisation effectuée

La principale modification apportée lors de la normalisation a été la séparation des informations de résultat des matchs dans une table distincte RESULTAT_MATCH. Cette séparation permet d'éviter les redondances et facilite les requêtes statistiques.

Avant normalisation :
- MATCH (id_match, id_coupe, id_equipe1, id_equipe2, id_stade, id_arbitre_principal, date, heure, phase_competition, score_equipe1, score_equipe2, score_mi_temps_equipe1, score_mi_temps_equipe2, prolongation, tirs_au_but, score_tirs_au_but_equipe1, score_tirs_au_but_equipe2)

Après normalisation :
- MATCH (id_match, id_coupe, id_equipe1, id_equipe2, id_stade, id_arbitre_principal, date, heure, phase_competition)
- RESULTAT_MATCH (id_match, score_equipe1, score_equipe2, score_mi_temps_equipe1, score_mi_temps_equipe2, prolongation, tirs_au_but, score_tirs_au_but_equipe1, score_tirs_au_but_equipe2)

### 3.3 Justification du processus de normalisation

Toutes les tables du schéma relationnel sont au moins en 3NF car :
- Tous les attributs dépendent de la clé primaire (1NF)
- Il n'y a pas de dépendances partielles (2NF)
- Il n'y a pas de dépendances transitives (3NF)

La séparation des informations de résultat des matchs améliore la structure de la base de données en :
- Réduisant la redondance des données
- Facilitant les mises à jour (par exemple, si un score est modifié après révision)
- Améliorant la performance des requêtes statistiques

## 4. Implémentation SQL

### 4.1 Création du schéma

Le schéma de la base de données a été implémenté en SQL avec toutes les tables, contraintes et index nécessaires. Voici un extrait du script de création :

```sql
CREATE TABLE COUPE_DU_MONDE (
    id_coupe INT PRIMARY KEY,
    annee INT NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    nb_equipes INT NOT NULL,
    format VARCHAR(100) NOT NULL,
    slogan VARCHAR(200),
    CONSTRAINT check_annee CHECK (annee > 1930),
    CONSTRAINT check_dates CHECK (date_fin >= date_debut)
);

CREATE TABLE EQUIPE (
    id_equipe INT PRIMARY KEY,
    pays VARCHAR(100) NOT NULL,
    confederation VARCHAR(50) NOT NULL,
    classement_fifa INT,
    nb_participations INT DEFAULT 0,
    CONSTRAINT check_confederation CHECK (confederation IN ('UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'))
);
```

### 4.2 Contraintes d'intégrité

Plusieurs contraintes d'intégrité ont été implémentées pour garantir la cohérence des données :

- **Contraintes de clé primaire et étrangère** : Pour assurer l'intégrité référentielle
- **Contraintes de vérification** : Pour garantir la validité des données (ex: dates, scores, confédérations)
- **Contraintes de domaine** : Pour limiter les valeurs possibles (ex: types de cartons, postes des joueurs)

### 4.3 Index

Des index ont été créés pour optimiser les performances des requêtes fréquentes :

```sql
CREATE INDEX idx_match_date ON MATCH(date);
CREATE INDEX idx_match_phase ON MATCH(phase_competition);
CREATE INDEX idx_equipe_pays ON EQUIPE(pays);
CREATE INDEX idx_coupe_annee ON COUPE_DU_MONDE(annee);
```

### 4.4 Données de test

Des données de test réalistes ont été insérées dans la base de données pour permettre de tester les requêtes statistiques. Ces données couvrent trois Coupes du Monde (2018, 2022, 2026), 16 équipes nationales, plusieurs joueurs célèbres, des matchs et des sanctions.

## 5. Requêtes statistiques

Nous avons développé 15 requêtes statistiques pour analyser les données de la Coupe du Monde :

1. **Classement des meilleurs buteurs**
```sql
SELECT j.nom, j.prenom, j.nationalite, SUM(pjm.buts) AS total_buts
FROM JOUEUR j
JOIN PARTICIPATION_JOUEUR_MATCH pjm ON j.id_joueur = pjm.id_joueur
GROUP BY j.id_joueur, j.nom, j.prenom, j.nationalite
HAVING SUM(pjm.buts) > 0
ORDER BY total_buts DESC;
```

2. **Statistiques des équipes pour une Coupe du Monde spécifique**
```sql
SELECT e.pays, 
       COUNT(m.id_match) AS matchs_joues,
       SUM(CASE WHEN (m.id_equipe1 = e.id_equipe AND rm.score_equipe1 > rm.score_equipe2) OR 
                     (m.id_equipe2 = e.id_equipe AND rm.score_equipe2 > rm.score_equipe1) THEN 1 ELSE 0 END) AS victoires,
       SUM(CASE WHEN rm.score_equipe1 = rm.score_equipe2 THEN 1 ELSE 0 END) AS nuls,
       SUM(CASE WHEN (m.id_equipe1 = e.id_equipe AND rm.score_equipe1 < rm.score_equipe2) OR 
                     (m.id_equipe2 = e.id_equipe AND rm.score_equipe2 < rm.score_equipe1) THEN 1 ELSE 0 END) AS defaites,
       SUM(CASE WHEN m.id_equipe1 = e.id_equipe THEN rm.score_equipe1 ELSE rm.score_equipe2 END) AS buts_marques,
       SUM(CASE WHEN m.id_equipe1 = e.id_equipe THEN rm.score_equipe2 ELSE rm.score_equipe1 END) AS buts_encaisses,
       pe.resultat_final
FROM EQUIPE e
JOIN PARTICIPATION_EQUIPE pe ON e.id_equipe = pe.id_equipe
JOIN MATCH m ON (m.id_equipe1 = e.id_equipe OR m.id_equipe2 = e.id_equipe)
JOIN RESULTAT_MATCH rm ON m.id_match = rm.id_match
JOIN COUPE_DU_MONDE cdm ON m.id_coupe = cdm.id_coupe
WHERE cdm.annee = 2018
GROUP BY e.id_equipe, e.pays, pe.resultat_final
ORDER BY victoires DESC, nuls DESC, buts_marques DESC;
```

3. **Palmarès des équipes**
```sql
SELECT e.pays, 
       SUM(CASE WHEN pe.resultat_final = 'Vainqueur' THEN 1 ELSE 0 END) AS titres,
       SUM(CASE WHEN pe.resultat_final = 'Finaliste' THEN 1 ELSE 0 END) AS finales,
       SUM(CASE WHEN pe.resultat_final = 'Demi-finale' THEN 1 ELSE 0 END) AS demi_finales,
       SUM(CASE WHEN pe.resultat_final = 'Quart de finale' THEN 1 ELSE 0 END) AS quart_de_finales,
       COUNT(pe.id_equipe) AS participations
FROM EQUIPE e
JOIN PARTICIPATION_EQUIPE pe ON e.id_equipe = pe.id_equipe
GROUP BY e.id_equipe, e.pays
ORDER BY titres DESC, finales DESC, demi_finales DESC;
```

D'autres requêtes permettent d'analyser les cartons, les confrontations directes entre équipes, les statistiques des joueurs, etc.

## 6. Interface utilisateur et fonctionnalités avancées

### 6.1 Architecture MVC

L'application a été développée selon l'architecture Modèle-Vue-Contrôleur (MVC) pour séparer les préoccupations et faciliter la maintenance :

- **Modèle** : Gère l'accès aux données et la logique métier
- **Vue** : Présente les données à l'utilisateur via une interface graphique
- **Contrôleur** : Coordonne les interactions entre le modèle et la vue

Cette architecture permet une meilleure organisation du code et facilite l'ajout de nouvelles fonctionnalités.

### 6.2 Fonctionnalité de recherche

Une fonctionnalité de recherche avancée a été implémentée pour permettre aux utilisateurs de filtrer les données selon différents critères :

- **Recherche de coupes du monde** : par année, nombre d'équipes, format, etc.
- **Recherche d'équipes** : par pays, confédération, classement FIFA, etc.
- **Recherche de joueurs** : par nom, nationalité, poste, etc.
- **Recherche de matchs** : par équipe, phase de compétition, date, etc.

Cette fonctionnalité améliore considérablement l'expérience utilisateur en permettant d'accéder rapidement aux informations spécifiques recherchées.

### 6.3 Ajout de données

L'application permet également d'ajouter de nouvelles données directement via l'interface graphique :

- **Ajout de coupes du monde** : création d'une nouvelle édition avec toutes ses caractéristiques
- **Ajout d'équipes** : enregistrement de nouvelles équipes nationales
- **Ajout de joueurs** : création de fiches pour de nouveaux joueurs
- **Ajout de matchs** : enregistrement de nouvelles rencontres avec leurs résultats

Cette fonctionnalité facilite la mise à jour de la base de données sans avoir à manipuler directement les requêtes SQL.

### 6.4 Initialisation automatique de la base de données

Pour simplifier l'utilisation de l'application, un système d'initialisation automatique de la base de données a été mis en place :

- Connexion automatique à PostgreSQL avec des identifiants par défaut
- Création de la base de données si elle n'existe pas
- Initialisation des tables et chargement des données de test

L'utilisateur n'a plus besoin de saisir manuellement ses identifiants PostgreSQL, ce qui rend l'application plus accessible et facile à utiliser.

## 7. Conclusion

Ce projet a permis de développer une base de données complète pour la Coupe du Monde de football, en suivant toutes les étapes du processus de conception : modélisation E/A, transformation vers le modèle relationnel, normalisation, implémentation SQL et création de requêtes statistiques.

La base de données permet d'obtenir diverses statistiques sur la participation des joueurs, des équipes et des arbitres dans une ou plusieurs coupes du monde, conformément aux exigences du projet.

Les principales améliorations apportées au projet initial sont :
- L'implémentation d'une interface utilisateur basée sur l'architecture MVC
- L'ajout d'une fonctionnalité de recherche avancée
- L'intégration d'un système d'ajout de données via l'interface
- La mise en place d'une initialisation automatique de la base de données

Ces améliorations rendent l'application plus conviviale, plus puissante et plus facile à utiliser, tout en conservant la rigueur et la qualité de la conception de la base de données sous-jacente.

## 8. Annexes

### 8.1 Scripts SQL complets
- schema_coupe_du_monde.sql : Définition du schéma
- donnees_test.sql : Insertion des données de test
- requetes_statistiques.sql : Requêtes d'analyse

### 8.2 Modèle Entité-Association
Le modèle E/A complet est disponible dans le fichier entites_coupe_du_monde.md.

### 8.3 Schéma relationnel normalisé
Le schéma relationnel normalisé est détaillé dans le fichier normalisation_schema.md.

### 8.4 Guide d'utilisation
Un guide d'utilisation complet est disponible dans le fichier README.md à la racine du projet.
