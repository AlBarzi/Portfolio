# Normalisation du schéma relationnel

Ce document présente le processus de normalisation du schéma relationnel de la base de données pour la Coupe du Monde de football. L'objectif est d'identifier les dépendances fonctionnelles pour chaque relation et de s'assurer que les tables sont dans une forme normale appropriée (au moins 3NF).

## Analyse des dépendances fonctionnelles et normalisation

### 1. COUPE_DU_MONDE
**Dépendances fonctionnelles** :
- id_coupe → annee, date_debut, date_fin, nb_equipes, format, slogan

**Analyse** : Cette table est déjà en 3NF car :
- Tous les attributs dépendent de la clé primaire (id_coupe)
- Il n'y a pas de dépendances transitives
- Il n'y a pas de dépendances partielles

### 2. PAYS_HOTE
**Dépendances fonctionnelles** :
- id_pays_hote → pays
- (id_pays_hote, id_coupe) → ∅

**Analyse** : Cette table est déjà en 3NF car :
- Tous les attributs dépendent de la clé primaire composée (id_pays_hote, id_coupe)
- Il n'y a pas de dépendances transitives
- Il n'y a pas de dépendances partielles

### 3. EQUIPE
**Dépendances fonctionnelles** :
- id_equipe → pays, confederation, classement_fifa, nb_participations

**Analyse** : Cette table est déjà en 3NF car :
- Tous les attributs dépendent de la clé primaire (id_equipe)
- Il n'y a pas de dépendances transitives
- Il n'y a pas de dépendances partielles

### 4. PARTICIPATION_EQUIPE
**Dépendances fonctionnelles** :
- (id_equipe, id_coupe) → resultat_final, groupe

**Analyse** : Cette table est déjà en 3NF car :
- Tous les attributs dépendent de la clé primaire composée (id_equipe, id_coupe)
- Il n'y a pas de dépendances transitives
- Il n'y a pas de dépendances partielles

### 5. JOUEUR
**Dépendances fonctionnelles** :
- id_joueur → nom, prenom, date_naissance, nationalite, poste

**Analyse** : Cette table est déjà en 3NF car :
- Tous les attributs dépendent de la clé primaire (id_joueur)
- Il n'y a pas de dépendances transitives
- Il n'y a pas de dépendances partielles

### 6. SELECTION_JOUEUR
**Dépendances fonctionnelles** :
- (id_joueur, id_equipe, id_coupe) → numero_maillot, club

**Analyse** : Cette table est déjà en 3NF car :
- Tous les attributs dépendent de la clé primaire composée (id_joueur, id_equipe, id_coupe)
- Il n'y a pas de dépendances transitives
- Il n'y a pas de dépendances partielles

### 7. STAFF_TECHNIQUE
**Dépendances fonctionnelles** :
- id_staff → nom, prenom, nationalite, role

**Analyse** : Cette table est déjà en 3NF car :
- Tous les attributs dépendent de la clé primaire (id_staff)
- Il n'y a pas de dépendances transitives
- Il n'y a pas de dépendances partielles

### 8. ENCADREMENT
**Dépendances fonctionnelles** :
- (id_staff, id_equipe, id_coupe) → ∅

**Analyse** : Cette table est déjà en 3NF car :
- Il n'y a pas d'attributs non-clés
- La table ne contient que des clés étrangères formant une clé primaire composée

### 9. STADE
**Dépendances fonctionnelles** :
- id_stade → nom, ville, pays, capacite, annee_construction

**Analyse** : Cette table est déjà en 3NF car :
- Tous les attributs dépendent de la clé primaire (id_stade)
- Il n'y a pas de dépendances transitives
- Il n'y a pas de dépendances partielles

### 10. ARBITRE
**Dépendances fonctionnelles** :
- id_arbitre → nom, prenom, nationalite, experience_internationale

**Analyse** : Cette table est déjà en 3NF car :
- Tous les attributs dépendent de la clé primaire (id_arbitre)
- Il n'y a pas de dépendances transitives
- Il n'y a pas de dépendances partielles

### 11. MATCH
**Dépendances fonctionnelles** :
- id_match → id_coupe, id_equipe1, id_equipe2, id_stade, id_arbitre_principal, date, heure, phase_competition, score_equipe1, score_equipe2, score_mi_temps_equipe1, score_mi_temps_equipe2, prolongation, tirs_au_but, score_tirs_au_but_equipe1, score_tirs_au_but_equipe2

**Analyse** : Cette table nécessite une normalisation car :
- Il existe une dépendance fonctionnelle entre id_match et tous les autres attributs
- Cependant, il y a beaucoup d'attributs liés aux scores qui pourraient être regroupés

**Normalisation** :
Séparons les informations de score dans une table distincte :

**MATCH (normalisé)**
- **id_match** : INT (PK)
- **id_coupe** : INT (FK → COUPE_DU_MONDE)
- id_equipe1 : INT (FK → EQUIPE)
- id_equipe2 : INT (FK → EQUIPE)
- id_stade : INT (FK → STADE)
- id_arbitre_principal : INT (FK → ARBITRE)
- date : DATE
- heure : TIME
- phase_competition : VARCHAR(50)

**RESULTAT_MATCH**
- **id_match** : INT (FK → MATCH) (PK)
- score_equipe1 : INT
- score_equipe2 : INT
- score_mi_temps_equipe1 : INT
- score_mi_temps_equipe2 : INT
- prolongation : BOOLEAN
- tirs_au_but : BOOLEAN
- score_tirs_au_but_equipe1 : INT
- score_tirs_au_but_equipe2 : INT

### 12. ARBITRE_ASSISTANT
**Dépendances fonctionnelles** :
- (id_match, id_arbitre) → role

**Analyse** : Cette table est déjà en 3NF car :
- Tous les attributs dépendent de la clé primaire composée (id_match, id_arbitre)
- Il n'y a pas de dépendances transitives
- Il n'y a pas de dépendances partielles

### 13. PARTICIPATION_JOUEUR_MATCH
**Dépendances fonctionnelles** :
- (id_joueur, id_match) → titulaire, minute_entree, minute_sortie, buts, passes_decisives

**Analyse** : Cette table est déjà en 3NF car :
- Tous les attributs dépendent de la clé primaire composée (id_joueur, id_match)
- Il n'y a pas de dépendances transitives
- Il n'y a pas de dépendances partielles

### 14. SANCTION
**Dépendances fonctionnelles** :
- id_sanction → id_joueur, id_match, type, minute, raison

**Analyse** : Cette table nécessite une normalisation car :
- Il existe une dépendance fonctionnelle entre id_sanction et tous les autres attributs
- Mais id_joueur et id_match forment une relation qui pourrait être séparée

**Normalisation** :
Modifions la structure pour éviter les redondances :

**SANCTION (normalisé)**
- **id_sanction** : INT (PK)
- id_joueur : INT (FK → JOUEUR)
- id_match : INT (FK → MATCH)
- type : VARCHAR(20)
- minute : INT
- raison : VARCHAR(200)

## Schéma relationnel normalisé final

Après analyse et normalisation, voici le schéma relationnel final :

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

