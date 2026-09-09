# Transformation du modèle E/A vers le modèle relationnel

Ce document présente la transformation du modèle Entité-Association de la Coupe du Monde de football vers le modèle relationnel, en appliquant les règles standard de transformation.

## Règles de transformation appliquées

1. **Entités fortes** : Chaque entité forte devient une table avec tous ses attributs.
2. **Entités faibles** : Chaque entité faible devient une table avec ses attributs et inclut la clé primaire de l'entité forte dont elle dépend.
3. **Relations 1:N** : La clé primaire de l'entité du côté "1" est ajoutée comme clé étrangère dans la table du côté "N".
4. **Relations N:M** : Création d'une table d'association avec les clés primaires des deux entités comme clés étrangères.
5. **Relations 1:1** : La clé primaire d'une des entités est ajoutée comme clé étrangère dans l'autre table.
6. **Attributs multivalués** : Création d'une table séparée pour l'attribut multivalué.

## Schéma relationnel résultant

### 1. COUPE_DU_MONDE (WorldCup)
- **id_coupe** : INT (PK)
- annee : INT
- date_debut : DATE
- date_fin : DATE
- nb_equipes : INT
- format : VARCHAR(100)
- slogan : VARCHAR(200)

### 2. PAYS_HOTE (HostCountry)
- **id_pays_hote** : INT (PK)
- **id_coupe** : INT (FK → COUPE_DU_MONDE)
- pays : VARCHAR(100)

### 3. EQUIPE (Team)
- **id_equipe** : INT (PK)
- pays : VARCHAR(100)
- confederation : VARCHAR(50)
- classement_fifa : INT
- nb_participations : INT

### 4. PARTICIPATION_EQUIPE (TeamParticipation)
- **id_equipe** : INT (FK → EQUIPE) (PK)
- **id_coupe** : INT (FK → COUPE_DU_MONDE) (PK)
- resultat_final : VARCHAR(50)
- groupe : VARCHAR(10)

### 5. JOUEUR (Player)
- **id_joueur** : INT (PK)
- nom : VARCHAR(100)
- prenom : VARCHAR(100)
- date_naissance : DATE
- nationalite : VARCHAR(100)
- poste : VARCHAR(50)

### 6. SELECTION_JOUEUR (PlayerSelection)
- **id_joueur** : INT (FK → JOUEUR) (PK)
- **id_equipe** : INT (FK → EQUIPE) (PK)
- **id_coupe** : INT (FK → COUPE_DU_MONDE) (PK)
- numero_maillot : INT
- club : VARCHAR(100)

### 7. STAFF_TECHNIQUE (Staff)
- **id_staff** : INT (PK)
- nom : VARCHAR(100)
- prenom : VARCHAR(100)
- nationalite : VARCHAR(100)
- role : VARCHAR(100)

### 8. ENCADREMENT (Coaching)
- **id_staff** : INT (FK → STAFF_TECHNIQUE) (PK)
- **id_equipe** : INT (FK → EQUIPE) (PK)
- **id_coupe** : INT (FK → COUPE_DU_MONDE) (PK)

### 9. STADE (Stadium)
- **id_stade** : INT (PK)
- nom : VARCHAR(100)
- ville : VARCHAR(100)
- pays : VARCHAR(100)
- capacite : INT
- annee_construction : INT

### 10. ARBITRE (Referee)
- **id_arbitre** : INT (PK)
- nom : VARCHAR(100)
- prenom : VARCHAR(100)
- nationalite : VARCHAR(100)
- experience_internationale : INT

### 11. MATCH (Match)
- **id_match** : INT (PK)
- **id_coupe** : INT (FK → COUPE_DU_MONDE)
- id_equipe1 : INT (FK → EQUIPE)
- id_equipe2 : INT (FK → EQUIPE)
- id_stade : INT (FK → STADE)
- id_arbitre_principal : INT (FK → ARBITRE)
- date : DATE
- heure : TIME
- phase_competition : VARCHAR(50)
- score_equipe1 : INT
- score_equipe2 : INT
- score_mi_temps_equipe1 : INT
- score_mi_temps_equipe2 : INT
- prolongation : BOOLEAN
- tirs_au_but : BOOLEAN
- score_tirs_au_but_equipe1 : INT
- score_tirs_au_but_equipe2 : INT

### 12. ARBITRE_ASSISTANT (AssistantReferee)
- **id_match** : INT (FK → MATCH) (PK)
- **id_arbitre** : INT (FK → ARBITRE) (PK)
- role : VARCHAR(50)

### 13. PARTICIPATION_JOUEUR_MATCH (PlayerMatchParticipation)
- **id_joueur** : INT (FK → JOUEUR) (PK)
- **id_match** : INT (FK → MATCH) (PK)
- titulaire : BOOLEAN
- minute_entree : INT
- minute_sortie : INT
- buts : INT
- passes_decisives : INT

### 14. SANCTION (Sanction)
- **id_sanction** : INT (PK)
- id_joueur : INT (FK → JOUEUR)
- id_match : INT (FK → MATCH)
- type : VARCHAR(20)
- minute : INT
- raison : VARCHAR(200)

## Explication des choix de transformation

1. **Tables séparées pour les pays hôtes** : Comme une Coupe du Monde peut être organisée par plusieurs pays (ex: 2002 Japon/Corée du Sud, 2026 USA/Canada/Mexique), une table séparée PAYS_HOTE a été créée.

2. **Gestion des participations** : La relation N:M entre EQUIPE et COUPE_DU_MONDE est transformée en table d'association PARTICIPATION_EQUIPE qui contient des informations spécifiques à chaque participation.

3. **Sélection des joueurs** : La table SELECTION_JOUEUR représente la relation ternaire entre JOUEUR, EQUIPE et COUPE_DU_MONDE, car un joueur peut représenter différentes équipes à différentes coupes du monde (cas rares mais possibles).

4. **Structure des matchs** : La table MATCH contient des références aux deux équipes qui s'affrontent (id_equipe1 et id_equipe2) ainsi qu'au stade et à l'arbitre principal.

5. **Arbitres assistants** : La relation N:M entre MATCH et ARBITRE pour les arbitres assistants est gérée par la table ARBITRE_ASSISTANT.

6. **Participation des joueurs aux matchs** : La table PARTICIPATION_JOUEUR_MATCH permet de suivre les statistiques individuelles des joueurs pour chaque match.

7. **Sanctions** : La table SANCTION est liée à la fois à JOUEUR et à MATCH pour enregistrer les cartons jaunes et rouges.
