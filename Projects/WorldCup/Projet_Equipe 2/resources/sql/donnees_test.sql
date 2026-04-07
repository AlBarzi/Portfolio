-- Données de test optimisées pour PostgreSQL - Base de données de la Coupe du Monde de football

-- Insertion des données dans la table COUPE_DU_MONDE
INSERT INTO coupe_du_monde(id_coupe, annee, date_debut, date_fin, nb_equipes, format, slogan)
VALUES
    (1, 1990, '1990-06-08', '1990-07-08', 24, 'Phase de groupes suivie de phases à élimination directe', 'Un mois de fête'),
    (2, 1994, '1994-06-17', '1994-07-17', 24, 'Phase de groupes suivie de phases à élimination directe', 'Celebrate the Game'),
    (3, 1998, '1998-06-10', '1998-07-12', 32, 'Phase de groupes suivie de phases à élimination directe', 'En jeu le monde'),
    (4, 2002, '2002-05-31', '2002-06-30', 32, 'Phase de groupes suivie de phases à élimination directe', 'Football Together Now'),
    (5, 2006, '2006-06-09', '2006-07-09', 32, 'Phase de groupes suivie de phases à élimination directe', 'A time to make friends'),
    (6, 2010, '2010-06-11', '2010-07-11', 32, 'Phase de groupes suivie de phases à élimination directe', 'Ke Nako'),
    (7, 2014, '2014-06-12', '2014-07-13', 32, 'Phase de groupes suivie de phases à élimination directe', 'All in one rhythm'),
    (8, 2018, '2018-06-14', '2018-07-15', 32, 'Phase de groupes suivie de phases à élimination directe', 'Ready to open'),
    (9, 2022, '2022-11-20', '2022-12-18', 32, 'Phase de groupes suivie de phases à élimination directe', 'Now is All'),
    (10, 2026, '2026-06-11', '2026-07-19', 48, 'Phase de groupes suivie de phases à élimination directe', 'We Are 26')
ON CONFLICT (id_coupe) DO NOTHING;

-- Insertion des données dans la table EQUIPE
INSERT INTO EQUIPE (id_equipe, pays, confederation, classement_fifa, nb_participations) VALUES
(1, 'France', 'UEFA', 2, 16),
(2, 'Brésil', 'CONMEBOL', 3, 22),
(3, 'Argentine', 'CONMEBOL', 1, 18),
(4, 'Espagne', 'UEFA', 8, 16),
(5, 'Allemagne', 'UEFA', 14, 20),
(6, 'Angleterre', 'UEFA', 4, 16),
(7, 'Portugal', 'UEFA', 9, 8),
(8, 'Belgique', 'UEFA', 5, 14),
(9, 'Pays-Bas', 'UEFA', 6, 11),
(10, 'Italie', 'UEFA', 7, 18),
(11, 'Croatie', 'UEFA', 10, 6),
(12, 'Maroc', 'CAF', 11, 6),
(13, 'États-Unis', 'CONCACAF', 13, 11),
(14, 'Mexique', 'CONCACAF', 15, 17),
(15, 'Uruguay', 'CONMEBOL', 16, 14),
(16, 'Colombie', 'CONMEBOL', 12, 6);

-- Insertion des données dans la table STADE
INSERT INTO STADE (id_stade, nom, ville, pays, capacite, annee_construction) VALUES
(1, 'Stade Loujniki', 'Moscou', 'Russie', 78011, 1956),
(2, 'Stade Krestovski', 'Saint-Pétersbourg', 'Russie', 68134, 2017),
(3, 'Stade Lusail', 'Lusail', 'Qatar', 88966, 2021),
(4, 'Stade 974', 'Doha', 'Qatar', 40000, 2021),
(5, 'Stade Al Bayt', 'Al Khor', 'Qatar', 60000, 2021),
(6, 'MetLife Stadium', 'East Rutherford', 'États-Unis', 82500, 2010),
(7, 'SoFi Stadium', 'Inglewood', 'États-Unis', 70240, 2020),
(8, 'Azteca Stadium', 'Mexico', 'Mexique', 87523, 1966),
(9, 'BMO Field', 'Toronto', 'Canada', 30000, 2007),
(10, 'Stade Olympique', 'Rome', 'Italie', 72698, 1953),
(11, 'Stade Giuseppe-Meazza', 'Milan', 'Italie', 80018, 1926),
(12, 'Stade Maracanã', 'Rio de Janeiro', 'Brésil', 78838, 1950),
(13, 'Rose Bowl', 'Pasadena', 'États-Unis', 92542, 1922),
(14, 'Stade de France', 'Saint-Denis', 'France', 80698, 1998),
(15, 'International Stadium', 'Yokohama', 'Japon', 72327, 1998),
(16, 'Olympiastadion', 'Berlin', 'Allemagne', 74475, 1936),
(17, 'Soccer City', 'Johannesburg', 'Afrique du Sud', 94736, 1989);

-- Insertion des données dans la table ARBITRE
INSERT INTO ARBITRE (id_arbitre, nom, prenom, nationalite, experience_internationale) VALUES
(1, 'Pitana', 'Nestor', 'Argentine', 10),
(2, 'Kuipers', 'Bjorn', 'Pays-Bas', 12),
(3, 'Faghani', 'Alireza', 'Iran', 8),
(4, 'Marciniak', 'Szymon', 'Pologne', 9),
(5, 'Lahoz', 'Antonio', 'Espagne', 11),
(6, 'Turpin', 'Clement', 'France', 7),
(7, 'Orsato', 'Daniele', 'Italie', 10),
(8, 'Makkelie', 'Danny', 'Pays-Bas', 8),
(9, 'Collina', 'Pierluigi', 'Italie', 15),
(10, 'Webb', 'Howard', 'Angleterre', 12),
(11, 'Velasco Carballo', 'Carlos', 'Espagne', 10),
(12, 'Irmatov', 'Ravshan', 'Ouzbékistan', 14);

-- Insertion des données dans la table JOUEUR
INSERT INTO JOUEUR (id_joueur, nom, prenom, date_naissance, nationalite, poste) VALUES
(1, 'Mbappé', 'Kylian', '1998-12-20', 'France', 'Attaquant'),
(2, 'Griezmann', 'Antoine', '1991-03-21', 'France', 'Attaquant'),
(3, 'Neymar', 'Junior', '1992-02-05', 'Brésil', 'Attaquant'),
(4, 'Messi', 'Lionel', '1987-06-24', 'Argentine', 'Attaquant'),
(5, 'Ronaldo', 'Cristiano', '1985-02-05', 'Portugal', 'Attaquant'),
(6, 'De Bruyne', 'Kevin', '1991-06-28', 'Belgique', 'Milieu'),
(7, 'Modric', 'Luka', '1985-09-09', 'Croatie', 'Milieu'),
(8, 'Ramos', 'Sergio', '1986-03-30', 'Espagne', 'Défenseur'),
(9, 'Neuer', 'Manuel', '1986-03-27', 'Allemagne', 'Gardien'),
(10, 'Kane', 'Harry', '1993-07-28', 'Angleterre', 'Attaquant'),
(11, 'Van Dijk', 'Virgil', '1991-07-08', 'Pays-Bas', 'Défenseur'),
(12, 'Hakimi', 'Achraf', '1998-11-04', 'Maroc', 'Défenseur'),
(13, 'Pulisic', 'Christian', '1998-09-18', 'États-Unis', 'Attaquant'),
(14, 'Lozano', 'Hirving', '1995-07-30', 'Mexique', 'Attaquant'),
(15, 'Suárez', 'Luis', '1987-01-24', 'Uruguay', 'Attaquant'),
(16, 'James', 'Rodríguez', '1991-07-12', 'Colombie', 'Milieu'),
(17, 'Zidane', 'Zinedine', '1972-06-23', 'France', 'Milieu'),
(18, 'Ronaldo', 'Nazário', '1976-09-18', 'Brésil', 'Attaquant'),
(19, 'Baggio', 'Roberto', '1967-02-18', 'Italie', 'Attaquant'),
(20, 'Matthäus', 'Lothar', '1961-03-21', 'Allemagne', 'Milieu'),
(21, 'Batistuta', 'Gabriel', '1969-02-01', 'Argentine', 'Attaquant'),
(22, 'Beckham', 'David', '1975-05-02', 'Angleterre', 'Milieu'),
(23, 'Figo', 'Luis', '1972-11-04', 'Portugal', 'Milieu'),
(24, 'Kluivert', 'Patrick', '1976-07-01', 'Pays-Bas', 'Attaquant');

-- Insertion des données dans la table STAFF_TECHNIQUE
INSERT INTO STAFF_TECHNIQUE (id_staff, nom, prenom, nationalite, role) VALUES
(1, 'Deschamps', 'Didier', 'France', 'Entraîneur principal'),
(2, 'Tite', 'Adenor', 'Brésil', 'Entraîneur principal'),
(3, 'Scaloni', 'Lionel', 'Argentine', 'Entraîneur principal'),
(4, 'Luis Enrique', 'Martinez', 'Espagne', 'Entraîneur principal'),
(5, 'Flick', 'Hansi', 'Allemagne', 'Entraîneur principal'),
(6, 'Southgate', 'Gareth', 'Angleterre', 'Entraîneur principal'),
(7, 'Santos', 'Fernando', 'Portugal', 'Entraîneur principal'),
(8, 'Martinez', 'Roberto', 'Belgique', 'Entraîneur principal'),
(9, 'Jacquet', 'Aimé', 'France', 'Entraîneur principal'),
(10, 'Scolari', 'Luiz Felipe', 'Brésil', 'Entraîneur principal'),
(11, 'Del Bosque', 'Vicente', 'Espagne', 'Entraîneur principal'),
(12, 'Löw', 'Joachim', 'Allemagne', 'Entraîneur principal');

-- Insertion des données dans la table PAYS_HOTE
INSERT INTO PAYS_HOTE (id_pays_hote, id_coupe, pays) VALUES
(1, 1, 'Italie'),
(1, 2, 'États-Unis'),
(1, 3, 'France'),
(1, 4, 'Japon'),
(2, 4, 'Corée du Sud'),
(1, 5, 'Allemagne'),
(1, 6, 'Afrique du Sud'),
(1, 7, 'Brésil'),
(1, 8, 'Russie'),
(1, 9, 'Qatar'),
(1, 10, 'États-Unis'),
(2, 10, 'Canada'),
(3, 10, 'Mexique');

-- Insertion des données dans la table PARTICIPATION_EQUIPE
INSERT INTO PARTICIPATION_EQUIPE (id_equipe, id_coupe, resultat_final, groupe) VALUES
-- Coupe du Monde 1990
(5, 1, 'Vainqueur', 'D'),
(3, 1, 'Finaliste', 'B'),
(10, 1, 'Demi-finale', 'A'),
(6, 1, 'Demi-finale', 'F'),
(2, 1, 'Huitième de finale', 'C'),

-- Coupe du Monde 1994
(2, 2, 'Vainqueur', 'B'),
(10, 2, 'Finaliste', 'E'),
(15, 2, 'Demi-finale', 'A'),
(4, 2, 'Quart de finale', 'C'),
(5, 2, 'Quart de finale', 'C'),
(3, 2, 'Huitième de finale', 'D'), -- Ajout de l'Argentine à la Coupe du Monde 1994

-- Coupe du Monde 1998
(1, 3, 'Vainqueur', 'C'),
(2, 3, 'Finaliste', 'A'),
(11, 3, 'Demi-finale', 'B'),
(9, 3, 'Demi-finale', 'E'),
(3, 3, 'Quart de finale', 'H'),
(5, 3, 'Quart de finale', 'F'),

-- Coupe du Monde 2002
(2, 4, 'Vainqueur', 'C'),
(5, 4, 'Finaliste', 'E'),
(15, 4, 'Demi-finale', 'D'),
(10, 4, 'Huitième de finale', 'G'),
(4, 4, 'Quart de finale', 'B'),
(6, 4, 'Quart de finale', 'F'),

-- Coupe du Monde 2006
(10, 5, 'Vainqueur', 'E'),
(1, 5, 'Finaliste', 'G'),
(5, 5, 'Demi-finale', 'A'),
(7, 5, 'Demi-finale', 'D'),
(2, 5, 'Quart de finale', 'F'),
(3, 5, 'Quart de finale', 'C'),
(6, 5, 'Quart de finale', 'B'),

-- Coupe du Monde 2010
(4, 6, 'Vainqueur', 'H'),
(9, 6, 'Finaliste', 'E'),
(5, 6, 'Demi-finale', 'D'),
(15, 6, 'Demi-finale', 'A'),
(2, 6, 'Quart de finale', 'G'),
(3, 6, 'Quart de finale', 'B'),
(6, 6, 'Huitième de finale', 'C'), -- Ajout de l'Angleterre à la Coupe du Monde 2010
(7, 6, 'Huitième de finale', 'G'), -- Correction: Ajout du Portugal à la Coupe du Monde 2010

-- Coupe du Monde 2014
(5, 7, 'Vainqueur', 'G'),
(3, 7, 'Finaliste', 'F'),
(9, 7, 'Demi-finale', 'B'),
(2, 7, 'Demi-finale', 'A'),
(1, 7, 'Quart de finale', 'E'),
(16, 7, 'Quart de finale', 'C'),
(8, 7, 'Quart de finale', 'H'),
(7, 7, 'Phase de groupes', 'G'), -- Ajout de Portugal à la Coupe du Monde 2014

-- Coupe du Monde 2018
(1, 8, 'Vainqueur', 'C'),
(11, 8, 'Finaliste', 'D'),
(8, 8, 'Demi-finale', 'G'),
(6, 8, 'Demi-finale', 'G'),
(2, 8, 'Quart de finale', 'E'),
(3, 8, 'Huitième de finale', 'D'),
(4, 8, 'Huitième de finale', 'B'),
(7, 8, 'Huitième de finale', 'B'),
(5, 8, 'Phase de groupes', 'F'),

-- Coupe du Monde 2022
(3, 9, 'Vainqueur', 'C'),
(1, 9, 'Finaliste', 'D'),
(11, 9, 'Demi-finale', 'F'),
(12, 9, 'Demi-finale', 'F'),
(2, 9, 'Quart de finale', 'G'),
(6, 9, 'Quart de finale', 'B'),
(7, 9, 'Quart de finale', 'H'),
(4, 9, 'Huitième de finale', 'E'),
(5, 9, 'Phase de groupes', 'E'),
(8, 9, 'Phase de groupes', 'F'),

-- Coupe du Monde 2026 (prévisions)
(2, 10, 'Vainqueur', 'C'),
(1, 10, 'Finaliste', 'H'),
(3, 10, 'Demi-finale', 'B'),
(6, 10, 'Demi-finale', 'D'),
(4, 10, 'Quart de finale', 'F'),
(5, 10, 'Quart de finale', 'E'),
(8, 10, 'Quart de finale', 'A'),
(9, 10, 'Quart de finale', 'G');

-- Insertion des données dans la table MATCH
INSERT INTO MATCH (id_match, id_coupe, id_equipe1, id_equipe2, id_stade, id_arbitre_principal, date, heure, phase_competition) VALUES
-- Matchs de la Coupe du Monde 1990
(101, 1, 5, 3, 10, 9, '1990-07-08', '20:00:00', 'Finale'),
(102, 1, 10, 6, 11, 9, '1990-07-07', '20:00:00', 'Match pour la 3e place'),

-- Matchs de la Coupe du Monde 1994
(201, 2, 2, 10, 13, 9, '1994-07-17', '15:30:00', 'Finale'),
(202, 2, 15, 4, 13, 9, '1994-07-16', '15:30:00', 'Match pour la 3e place'),

-- Matchs de la Coupe du Monde 1998
(301, 3, 1, 2, 14, 9, '1998-07-12', '21:00:00', 'Finale'),
(302, 3, 11, 9, 14, 9, '1998-07-11', '21:00:00', 'Match pour la 3e place'),

-- Matchs de la Coupe du Monde 2002
(401, 4, 2, 5, 15, 10, '2002-06-30', '20:00:00', 'Finale'),
(402, 4, 15, 10, 15, 10, '2002-06-29', '20:00:00', 'Match pour la 3e place'),

-- Matchs de la Coupe du Monde 2006
(501, 5, 10, 1, 16, 10, '2006-07-09', '20:00:00', 'Finale'),
(502, 5, 5, 7, 16, 10, '2006-07-08', '20:00:00', 'Match pour la 3e place'),

-- Matchs de la Coupe du Monde 2010
(601, 6, 4, 9, 17, 11, '2010-07-11', '20:30:00', 'Finale'),
(602, 6, 5, 15, 17, 11, '2010-07-10', '20:30:00', 'Match pour la 3e place'),

-- Matchs de la Coupe du Monde 2014
(701, 7, 5, 3, 12, 12, '2014-07-13', '16:00:00', 'Finale'),
(702, 7, 9, 2, 12, 12, '2014-07-12', '17:00:00', 'Match pour la 3e place'),

-- Matchs de la Coupe du Monde 2018
(801, 8, 1, 11, 1, 1, '2018-07-15', '16:00:00', 'Finale'),
(802, 8, 8, 6, 1, 3, '2018-07-14', '14:00:00', 'Match pour la 3e place'),
(803, 8, 1, 8, 1, 1, '2018-07-10', '19:00:00', 'Demi-finale'),
(804, 8, 6, 11, 2, 2, '2018-07-11', '19:00:00', 'Demi-finale'),

-- Matchs de la Coupe du Monde 2022
(901, 9, 3, 1, 3, 4, '2022-12-18', '15:00:00', 'Finale'),
(902, 9, 11, 12, 5, 5, '2022-12-17', '15:00:00', 'Match pour la 3e place'),
(903, 9, 3, 11, 3, 6, '2022-12-13', '19:00:00', 'Demi-finale'),
(904, 9, 1, 12, 5, 7, '2022-12-14', '19:00:00', 'Demi-finale');

-- Insertion des données dans la table RESULTAT_MATCH
INSERT INTO RESULTAT_MATCH (id_match, score_equipe1, score_equipe2, score_mi_temps_equipe1, score_mi_temps_equipe2, prolongation, tirs_au_but, score_tirs_au_but_equipe1, score_tirs_au_but_equipe2) VALUES
-- Résultats de la Coupe du Monde 1990
(101, 1, 0, 0, 0, FALSE, FALSE, NULL, NULL),
(102, 2, 1, 1, 0, FALSE, FALSE, NULL, NULL),

-- Résultats de la Coupe du Monde 1994
(201, 0, 0, 0, 0, TRUE, TRUE, 3, 2),
(202, 2, 1, 1, 0, FALSE, FALSE, NULL, NULL),

-- Résultats de la Coupe du Monde 1998
(301, 3, 0, 2, 0, FALSE, FALSE, NULL, NULL),
(302, 2, 1, 1, 0, FALSE, FALSE, NULL, NULL),

-- Résultats de la Coupe du Monde 2002
(401, 2, 0, 0, 0, FALSE, FALSE, NULL, NULL),
(402, 3, 2, 2, 1, FALSE, FALSE, NULL, NULL),

-- Résultats de la Coupe du Monde 2006
(501, 1, 1, 0, 0, TRUE, TRUE, 5, 3),
(502, 3, 1, 2, 0, FALSE, FALSE, NULL, NULL),

-- Résultats de la Coupe du Monde 2010
(601, 1, 0, 0, 0, TRUE, FALSE, NULL, NULL),
(602, 3, 2, 1, 1, FALSE, FALSE, NULL, NULL),

-- Résultats de la Coupe du Monde 2014
(701, 1, 0, 0, 0, TRUE, FALSE, NULL, NULL),
(702, 3, 0, 2, 0, FALSE, FALSE, NULL, NULL),

-- Résultats de la Coupe du Monde 2018
(801, 4, 2, 2, 1, FALSE, FALSE, NULL, NULL),
(802, 2, 0, 1, 0, FALSE, FALSE, NULL, NULL),
(803, 1, 0, 0, 0, FALSE, FALSE, NULL, NULL),
(804, 1, 2, 0, 0, TRUE, FALSE, NULL, NULL),

-- Résultats de la Coupe du Monde 2022
(901, 3, 3, 2, 2, TRUE, TRUE, 4, 2),
(902, 2, 1, 1, 0, FALSE, FALSE, NULL, NULL),
(903, 3, 0, 2, 0, FALSE, FALSE, NULL, NULL),
(904, 2, 0, 1, 0, FALSE, FALSE, NULL, NULL);

-- Insertion des données dans la table ARBITRE_ASSISTANT
INSERT INTO ARBITRE_ASSISTANT (id_match, id_arbitre, role) VALUES
-- Arbitres assistants pour les finales
(101, 1, 'Assistant 1'),
(101, 2, 'Assistant 2'),
(201, 3, 'Assistant 1'),
(201, 4, 'Assistant 2'),
(301, 5, 'Assistant 1'),
(301, 6, 'Assistant 2'),
(401, 7, 'Assistant 1'),
(401, 8, 'Assistant 2'),
(501, 1, 'Assistant 1'),
(501, 2, 'Assistant 2'),
(601, 3, 'Assistant 1'),
(601, 4, 'Assistant 2'),
(701, 5, 'Assistant 1'),
(701, 6, 'Assistant 2'),
(801, 2, 'Assistant 1'),
(801, 3, 'Assistant 2'),
(801, 5, 'Quatrième arbitre'),
(901, 5, 'Assistant 1'),
(901, 6, 'Assistant 2'),
(901, 8, 'Quatrième arbitre'),
(901, 7, 'VAR');

-- Insertion des données dans la table SELECTION_JOUEUR
-- Assurez-vous que cette section est exécutée correctement
INSERT INTO SELECTION_JOUEUR (id_joueur, id_equipe, id_coupe, numero_maillot, club) VALUES
-- Joueurs pour les Coupes du Monde récentes
(1, 1, 8, 10, 'Paris Saint-Germain'),
(1, 1, 9, 10, 'Paris Saint-Germain'),
(2, 1, 8, 7, 'Atlético Madrid'),
(2, 1, 9, 7, 'Atlético Madrid'),
(3, 2, 8, 10, 'Paris Saint-Germain'),
(3, 2, 9, 10, 'Paris Saint-Germain'),
(4, 3, 7, 10, 'FC Barcelone'),
(4, 3, 8, 10, 'FC Barcelone'),
(4, 3, 9, 10, 'Paris Saint-Germain'),
(5, 7, 7, 7, 'Real Madrid'),
(5, 7, 8, 7, 'Real Madrid'),
(5, 7, 9, 7, 'Manchester United'),
(6, 8, 8, 7, 'Manchester City'),
(6, 8, 9, 7, 'Manchester City'),
(7, 11, 8, 10, 'Real Madrid'),
(7, 11, 9, 10, 'Real Madrid'),
(8, 4, 8, 4, 'Real Madrid'),
(9, 5, 8, 1, 'Bayern Munich'),
(10, 6, 8, 9, 'Tottenham Hotspur'),
(12, 12, 9, 2, 'Paris Saint-Germain'),

-- Joueurs pour les Coupes du Monde plus anciennes
(17, 1, 3, 10, 'Juventus Turin'),
(17, 1, 5, 10, 'Real Madrid'),
(18, 2, 3, 9, 'Inter Milan'),
(18, 2, 4, 9, 'Real Madrid'),
(19, 10, 1, 10, 'Juventus Turin'),
(19, 10, 2, 10, 'Juventus Turin'),
(20, 5, 1, 10, 'Inter Milan'),
(21, 3, 1, 9, 'Fiorentina'),
(21, 3, 2, 9, 'Fiorentina'),
(22, 6, 4, 7, 'Manchester United'),
(22, 6, 5, 7, 'Real Madrid'),
(22, 6, 6, 7, 'Los Angeles Galaxy'),
(23, 7, 5, 7, 'Real Madrid'),
(23, 7, 6, 7, 'Inter Milan'),
(24, 9, 3, 9, 'AC Milan');

-- Insertion des données dans la table ENCADREMENT
INSERT INTO ENCADREMENT (id_staff, id_equipe, id_coupe) VALUES
-- Encadrement pour les Coupes du Monde récentes
(1, 1, 8),
(1, 1, 9),
(2, 2, 8),
(2, 2, 9),
(3, 3, 8),
(3, 3, 9),
(4, 4, 8),
(5, 5, 8),
(6, 6, 8),
(6, 6, 9),
(7, 7, 8),
(7, 7, 9),
(8, 8, 8),
(8, 8, 9),

-- Encadrement pour les Coupes du Monde plus anciennes
(9, 1, 3),
(10, 2, 4),
(11, 4, 6),
(12, 5, 7);

-- Insertion des données dans la table PARTICIPATION_JOUEUR_MATCH
INSERT INTO PARTICIPATION_JOUEUR_MATCH (id_joueur, id_match, titulaire, minute_entree, minute_sortie, buts, passes_decisives) VALUES
-- Participations des joueurs aux matchs récents
(1, 801, TRUE, 0, NULL, 1, 1),
(1, 803, TRUE, 0, NULL, 0, 0),
(1, 901, TRUE, 0, NULL, 3, 0),
(1, 904, TRUE, 0, NULL, 1, 0),
(2, 801, TRUE, 0, NULL, 0, 1),
(2, 803, TRUE, 0, 80, 0, 1),
(2, 901, TRUE, 0, NULL, 0, 1),
(2, 904, TRUE, 0, 75, 0, 1),
(3, 803, FALSE, NULL, NULL, 0, 0),
(4, 901, TRUE, 0, NULL, 2, 1), -- Correction: Ajout de Messi au match 901
(7, 801, TRUE, 0, NULL, 0, 0); -- Ajout de Modric au match 801

-- Insertion des données dans la table SANCTION
INSERT INTO SANCTION (id_sanction, id_match, id_joueur, type, minute, raison) VALUES
(1, 801, 1, 'Carton jaune', 27, 'Jeu dangereux'),
(2, 801, 7, 'Carton jaune', 35, 'Contestation'),
(3, 901, 1, 'Carton jaune', 87, 'Contestation'),
(4, 901, 4, 'Carton jaune', 90, 'Gain de temps');

-- Création et insertion des données dans la table STATISTIQUE_MATCH
-- Cette table n'existe pas dans le schéma, nous la commentons pour éviter l'erreur
-- INSERT INTO STATISTIQUE_MATCH (id_match, possession_equipe1, possession_equipe2, tirs_equipe1, tirs_equipe2, tirs_cadres_equipe1, tirs_cadres_equipe2, corners_equipe1, corners_equipe2, fautes_equipe1, fautes_equipe2) VALUES
-- (801, 65, 35, 14, 6, 8, 3, 6, 2, 14, 13),
-- (901, 55, 45, 12, 10, 6, 5, 5, 3, 18, 19);
