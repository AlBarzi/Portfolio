# Identification des entités pour le modèle E/A de la Coupe du Monde

## Entités principales

### 1. Coupe du Monde (WorldCup)
- **Attributs** :
  - ID (clé primaire)
  - Année
  - Pays hôte(s)
  - Dates (début et fin)
  - Nombre d'équipes participantes
  - Format de compétition
  - Slogan/Thème

### 2. Équipe nationale (Team)
- **Attributs** :
  - ID (clé primaire)
  - Pays
  - Confédération (UEFA, CONMEBOL, etc.)
  - Classement FIFA
  - Nombre de participations
  - Palmarès (titres, finaliste, etc.)

### 3. Joueur (Player)
- **Attributs** :
  - ID (clé primaire)
  - Nom
  - Prénom
  - Date de naissance
  - Nationalité
  - Poste
  - Numéro de maillot
  - Club actuel

### 4. Staff technique (Staff)
- **Attributs** :
  - ID (clé primaire)
  - Nom
  - Prénom
  - Nationalité
  - Rôle (entraîneur principal, adjoint, etc.)

### 5. Match (Match)
- **Attributs** :
  - ID (clé primaire)
  - Date
  - Heure
  - Stade
  - Phase de compétition (groupe, huitième de finale, etc.)
  - Score final
  - Score à la mi-temps
  - Prolongation (oui/non)
  - Tirs au but (oui/non)
  - Score des tirs au but

### 6. Stade (Stadium)
- **Attributs** :
  - ID (clé primaire)
  - Nom
  - Ville
  - Pays
  - Capacité
  - Année de construction/rénovation

### 7. Arbitre (Referee)
- **Attributs** :
  - ID (clé primaire)
  - Nom
  - Prénom
  - Nationalité
  - Rôle (principal, assistant, quatrième arbitre)
  - Expérience internationale

### 8. Sanction (Sanction)
- **Attributs** :
  - ID (clé primaire)
  - Type (carton jaune, carton rouge)
  - Minute
  - Raison

## Relations entre les entités

1. **Organise** : Une Coupe du Monde est organisée dans un ou plusieurs pays hôtes.
2. **Participe** : Une Équipe participe à une ou plusieurs Coupes du Monde.
3. **Compose** : Un Joueur compose une Équipe pour une Coupe du Monde spécifique.
4. **Dirige** : Un Staff technique dirige une Équipe pour une Coupe du Monde spécifique.
5. **Affronte** : Une Équipe affronte une autre Équipe lors d'un Match.
6. **Joue_dans** : Un Match se joue dans un Stade.
7. **Arbitre** : Un Arbitre principal et des Arbitres assistants gèrent un Match.
8. **Reçoit** : Un Joueur peut recevoir une Sanction lors d'un Match.
9. **Participe_à** : Un Joueur participe à un Match (avec statistiques comme minutes jouées, buts, passes décisives).

## Contraintes et règles métier

1. Une Coupe du Monde a lieu généralement tous les 4 ans.
2. Une Équipe est composée d'un nombre fixe de Joueurs (généralement 23).
3. Un Match oppose exactement deux Équipes.
4. Un Match est arbitré par un arbitre principal et plusieurs arbitres assistants.
5. Un Joueur peut recevoir au maximum 2 cartons jaunes dans un Match (le second entraînant un carton rouge).
6. Un Joueur ayant reçu un carton rouge est suspendu pour le match suivant.
7. Un Joueur ayant accumulé un certain nombre de cartons jaunes sur plusieurs matchs peut être suspendu.
