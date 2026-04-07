-- Schéma SQL optimisé pour PostgreSQL - Base de données de la Coupe du Monde de football

-- Suppression des tables existantes (si elles existent)
DROP TABLE IF EXISTS SANCTION;
DROP TABLE IF EXISTS PARTICIPATION_JOUEUR_MATCH;
DROP TABLE IF EXISTS ARBITRE_ASSISTANT;
DROP TABLE IF EXISTS RESULTAT_MATCH;
DROP TABLE IF EXISTS MATCH;
DROP TABLE IF EXISTS ENCADREMENT;
DROP TABLE IF EXISTS SELECTION_JOUEUR;
DROP TABLE IF EXISTS PARTICIPATION_EQUIPE;
DROP TABLE IF EXISTS PAYS_HOTE;
DROP TABLE IF EXISTS STAFF_TECHNIQUE;
DROP TABLE IF EXISTS JOUEUR;
DROP TABLE IF EXISTS ARBITRE;
DROP TABLE IF EXISTS STADE;
DROP TABLE IF EXISTS EQUIPE;
DROP TABLE IF EXISTS COUPE_DU_MONDE;

-- Création des tables avec types et contraintes spécifiques à PostgreSQL

-- Table COUPE_DU_MONDE
CREATE TABLE COUPE_DU_MONDE (
    id_coupe SERIAL PRIMARY KEY,
    annee INTEGER NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    nb_equipes INTEGER NOT NULL,
    format VARCHAR(100) NOT NULL,
    slogan VARCHAR(200),
    CONSTRAINT check_annee CHECK (annee > 1930),
    CONSTRAINT check_dates CHECK (date_fin >= date_debut)
);

-- Table EQUIPE
CREATE TABLE EQUIPE (
    id_equipe SERIAL PRIMARY KEY,
    pays VARCHAR(100) NOT NULL,
    confederation VARCHAR(50) NOT NULL,
    classement_fifa INTEGER,
    nb_participations INTEGER DEFAULT 0,
    CONSTRAINT check_confederation CHECK (confederation IN ('UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'))
);

-- Table STADE
CREATE TABLE STADE (
    id_stade SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    ville VARCHAR(100) NOT NULL,
    pays VARCHAR(100) NOT NULL,
    capacite INTEGER NOT NULL,
    annee_construction INTEGER,
    CONSTRAINT check_capacite CHECK (capacite > 0)
);

-- Table ARBITRE
CREATE TABLE ARBITRE (
    id_arbitre SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    nationalite VARCHAR(100) NOT NULL,
    experience_internationale INTEGER DEFAULT 0
);

-- Table JOUEUR
CREATE TABLE JOUEUR (
    id_joueur SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE NOT NULL,
    nationalite VARCHAR(100) NOT NULL,
    poste VARCHAR(50) NOT NULL,
    CONSTRAINT check_poste CHECK (poste IN ('Gardien', 'Défenseur', 'Milieu', 'Attaquant'))
);

-- Table STAFF_TECHNIQUE
CREATE TABLE STAFF_TECHNIQUE (
    id_staff SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    nationalite VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL
);

-- Table PAYS_HOTE
CREATE TABLE PAYS_HOTE (
    id_pays_hote INTEGER,
    id_coupe INTEGER,
    pays VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_pays_hote, id_coupe),
    FOREIGN KEY (id_coupe) REFERENCES COUPE_DU_MONDE(id_coupe) ON DELETE CASCADE
);

-- Table PARTICIPATION_EQUIPE
CREATE TABLE PARTICIPATION_EQUIPE (
    id_equipe INTEGER,
    id_coupe INTEGER,
    resultat_final VARCHAR(50),
    groupe VARCHAR(10),
    PRIMARY KEY (id_equipe, id_coupe),
    FOREIGN KEY (id_equipe) REFERENCES EQUIPE(id_equipe) ON DELETE CASCADE,
    FOREIGN KEY (id_coupe) REFERENCES COUPE_DU_MONDE(id_coupe) ON DELETE CASCADE
);

-- Table SELECTION_JOUEUR
CREATE TABLE SELECTION_JOUEUR (
    id_joueur INTEGER,
    id_equipe INTEGER,
    id_coupe INTEGER,
    numero_maillot INTEGER NOT NULL,
    club VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_joueur, id_equipe, id_coupe),
    FOREIGN KEY (id_joueur) REFERENCES JOUEUR(id_joueur) ON DELETE CASCADE,
    FOREIGN KEY (id_equipe, id_coupe) REFERENCES PARTICIPATION_EQUIPE(id_equipe, id_coupe) ON DELETE CASCADE,
    CONSTRAINT check_numero_maillot CHECK (numero_maillot BETWEEN 1 AND 99)
);

-- Table ENCADREMENT
CREATE TABLE ENCADREMENT (
    id_staff INTEGER,
    id_equipe INTEGER,
    id_coupe INTEGER,
    PRIMARY KEY (id_staff, id_equipe, id_coupe),
    FOREIGN KEY (id_staff) REFERENCES STAFF_TECHNIQUE(id_staff) ON DELETE CASCADE,
    FOREIGN KEY (id_equipe, id_coupe) REFERENCES PARTICIPATION_EQUIPE(id_equipe, id_coupe) ON DELETE CASCADE
);

-- Table MATCH
CREATE TABLE MATCH (
    id_match SERIAL PRIMARY KEY,
    id_coupe INTEGER NOT NULL,
    id_equipe1 INTEGER NOT NULL,
    id_equipe2 INTEGER NOT NULL,
    id_stade INTEGER NOT NULL,
    id_arbitre_principal INTEGER NOT NULL,
    date DATE NOT NULL,
    heure TIME NOT NULL,
    phase_competition VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_coupe) REFERENCES COUPE_DU_MONDE(id_coupe) ON DELETE CASCADE,
    FOREIGN KEY (id_equipe1) REFERENCES EQUIPE(id_equipe) ON DELETE CASCADE,
    FOREIGN KEY (id_equipe2) REFERENCES EQUIPE(id_equipe) ON DELETE CASCADE,
    FOREIGN KEY (id_stade) REFERENCES STADE(id_stade) ON DELETE CASCADE,
    FOREIGN KEY (id_arbitre_principal) REFERENCES ARBITRE(id_arbitre) ON DELETE CASCADE,
    CONSTRAINT check_equipes_differentes CHECK (id_equipe1 <> id_equipe2)
);

-- Table RESULTAT_MATCH
CREATE TABLE RESULTAT_MATCH (
    id_match INTEGER PRIMARY KEY,
    score_equipe1 INTEGER NOT NULL DEFAULT 0,
    score_equipe2 INTEGER NOT NULL DEFAULT 0,
    score_mi_temps_equipe1 INTEGER NOT NULL DEFAULT 0,
    score_mi_temps_equipe2 INTEGER NOT NULL DEFAULT 0,
    prolongation BOOLEAN NOT NULL DEFAULT FALSE,
    tirs_au_but BOOLEAN NOT NULL DEFAULT FALSE,
    score_tirs_au_but_equipe1 INTEGER DEFAULT NULL,
    score_tirs_au_but_equipe2 INTEGER DEFAULT NULL,
    FOREIGN KEY (id_match) REFERENCES MATCH(id_match) ON DELETE CASCADE,
    CONSTRAINT check_scores CHECK (score_equipe1 >= 0 AND score_equipe2 >= 0),
    CONSTRAINT check_scores_mi_temps CHECK (score_mi_temps_equipe1 >= 0 AND score_mi_temps_equipe2 >= 0),
    CONSTRAINT check_tirs_au_but CHECK (
        (tirs_au_but = FALSE AND score_tirs_au_but_equipe1 IS NULL AND score_tirs_au_but_equipe2 IS NULL) OR
        (tirs_au_but = TRUE AND score_tirs_au_but_equipe1 IS NOT NULL AND score_tirs_au_but_equipe2 IS NOT NULL)
    )
);

-- Table ARBITRE_ASSISTANT
CREATE TABLE ARBITRE_ASSISTANT (
    id_match INTEGER,
    id_arbitre INTEGER,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_match, id_arbitre),
    FOREIGN KEY (id_match) REFERENCES MATCH(id_match) ON DELETE CASCADE,
    FOREIGN KEY (id_arbitre) REFERENCES ARBITRE(id_arbitre) ON DELETE CASCADE,
    CONSTRAINT check_role CHECK (role IN ('Assistant 1', 'Assistant 2', 'Quatrième arbitre', 'VAR'))
);

-- Table PARTICIPATION_JOUEUR_MATCH
CREATE TABLE PARTICIPATION_JOUEUR_MATCH (
    id_joueur INTEGER,
    id_match INTEGER,
    titulaire BOOLEAN NOT NULL DEFAULT FALSE,
    minute_entree INTEGER,
    minute_sortie INTEGER,
    buts INTEGER NOT NULL DEFAULT 0,
    passes_decisives INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (id_joueur, id_match),
    FOREIGN KEY (id_joueur) REFERENCES JOUEUR(id_joueur) ON DELETE CASCADE,
    FOREIGN KEY (id_match) REFERENCES MATCH(id_match) ON DELETE CASCADE,
    CONSTRAINT check_minutes CHECK (
        (minute_entree IS NULL AND minute_sortie IS NULL) OR
        (minute_entree >= 0 AND (minute_sortie IS NULL OR (minute_sortie > minute_entree)))
    ),
    CONSTRAINT check_stats CHECK (buts >= 0 AND passes_decisives >= 0)
);

-- Table SANCTION
CREATE TABLE SANCTION (
    id_sanction SERIAL PRIMARY KEY,
    id_joueur INTEGER NOT NULL,
    id_match INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL,
    minute INTEGER NOT NULL,
    raison VARCHAR(200),
    FOREIGN KEY (id_joueur) REFERENCES JOUEUR(id_joueur) ON DELETE CASCADE,
    FOREIGN KEY (id_match) REFERENCES MATCH(id_match) ON DELETE CASCADE,
    FOREIGN KEY (id_joueur, id_match) REFERENCES PARTICIPATION_JOUEUR_MATCH(id_joueur, id_match) ON DELETE CASCADE,
    CONSTRAINT check_type CHECK (type IN ('Carton jaune', 'Carton rouge')),
    CONSTRAINT check_minute CHECK (minute >= 0)
);

-- Création des index pour optimiser les requêtes
CREATE INDEX idx_pays_hote_coupe ON PAYS_HOTE(id_coupe);
CREATE INDEX idx_participation_equipe_coupe ON PARTICIPATION_EQUIPE(id_coupe);
CREATE INDEX idx_participation_equipe_equipe ON PARTICIPATION_EQUIPE(id_equipe);
CREATE INDEX idx_selection_joueur_joueur ON SELECTION_JOUEUR(id_joueur);
CREATE INDEX idx_selection_joueur_equipe_coupe ON SELECTION_JOUEUR(id_equipe, id_coupe);
CREATE INDEX idx_encadrement_staff ON ENCADREMENT(id_staff);
CREATE INDEX idx_encadrement_equipe_coupe ON ENCADREMENT(id_equipe, id_coupe);
CREATE INDEX idx_match_coupe ON MATCH(id_coupe);
CREATE INDEX idx_match_equipes ON MATCH(id_equipe1, id_equipe2);
CREATE INDEX idx_match_stade ON MATCH(id_stade);
CREATE INDEX idx_match_arbitre ON MATCH(id_arbitre_principal);
CREATE INDEX idx_arbitre_assistant_match ON ARBITRE_ASSISTANT(id_match);
CREATE INDEX idx_arbitre_assistant_arbitre ON ARBITRE_ASSISTANT(id_arbitre);
CREATE INDEX idx_participation_joueur_match_joueur ON PARTICIPATION_JOUEUR_MATCH(id_joueur);
CREATE INDEX idx_participation_joueur_match_match ON PARTICIPATION_JOUEUR_MATCH(id_match);
CREATE INDEX idx_sanction_joueur ON SANCTION(id_joueur);
CREATE INDEX idx_sanction_match ON SANCTION(id_match);

-- Index pour les recherches fréquentes
CREATE INDEX idx_joueur_nationalite ON JOUEUR(nationalite);
CREATE INDEX idx_match_date ON MATCH(date);
CREATE INDEX idx_match_phase ON MATCH(phase_competition);
CREATE INDEX idx_equipe_pays ON EQUIPE(pays);
CREATE INDEX idx_coupe_annee ON COUPE_DU_MONDE(annee);
