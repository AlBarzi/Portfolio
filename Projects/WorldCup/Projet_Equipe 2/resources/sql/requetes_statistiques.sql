-- Requêtes statistiques optimisées pour PostgreSQL - Base de données de la Coupe du Monde de football

-- 1. Classement des meilleurs buteurs de tous les temps en Coupe du Monde
SELECT j.nom, j.prenom, j.nationalite, COALESCE(SUM(pjm.buts), 0) AS total_buts
FROM JOUEUR j
LEFT JOIN PARTICIPATION_JOUEUR_MATCH pjm ON j.id_joueur = pjm.id_joueur
GROUP BY j.id_joueur, j.nom, j.prenom, j.nationalite
HAVING COALESCE(SUM(pjm.buts), 0) > 0
ORDER BY total_buts DESC;

-- 2. Classement des équipes par nombre de participations en Coupe du Monde
SELECT e.pays, e.confederation, e.nb_participations
FROM EQUIPE e
ORDER BY e.nb_participations DESC;

-- 3. Nombre de matchs arbitrés par chaque arbitre principal
SELECT a.nom, a.prenom, a.nationalite, COUNT(m.id_match) AS nb_matchs_arbitres
FROM ARBITRE a
LEFT JOIN MATCH m ON a.id_arbitre = m.id_arbitre_principal
GROUP BY a.id_arbitre, a.nom, a.prenom, a.nationalite
ORDER BY nb_matchs_arbitres DESC;

-- 4. Statistiques des équipes pour une Coupe du Monde spécifique (exemple: 2018)
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

-- 5. Nombre de cartons jaunes et rouges par équipe et par Coupe du Monde
SELECT cdm.annee, e.pays, 
       SUM(CASE WHEN s.type = 'Carton jaune' THEN 1 ELSE 0 END) AS cartons_jaunes,
       SUM(CASE WHEN s.type = 'Carton rouge' THEN 1 ELSE 0 END) AS cartons_rouges
FROM SANCTION s
JOIN JOUEUR j ON s.id_joueur = j.id_joueur
JOIN MATCH m ON s.id_match = m.id_match
JOIN COUPE_DU_MONDE cdm ON m.id_coupe = cdm.id_coupe
JOIN SELECTION_JOUEUR sj ON j.id_joueur = sj.id_joueur AND cdm.id_coupe = sj.id_coupe
JOIN EQUIPE e ON sj.id_equipe = e.id_equipe
GROUP BY cdm.annee, e.pays
ORDER BY cdm.annee, cartons_rouges DESC, cartons_jaunes DESC;

-- 6. Joueurs ayant participé à plusieurs Coupes du Monde
SELECT j.nom, j.prenom, j.nationalite, COUNT(DISTINCT sj.id_coupe) AS nb_coupes_monde,
       STRING_AGG(CAST(cdm.annee AS TEXT), ', ' ORDER BY cdm.annee) AS annees_participation
FROM JOUEUR j
LEFT JOIN SELECTION_JOUEUR sj ON j.id_joueur = sj.id_joueur
LEFT JOIN COUPE_DU_MONDE cdm ON sj.id_coupe = cdm.id_coupe
GROUP BY j.id_joueur, j.nom, j.prenom, j.nationalite
HAVING COUNT(DISTINCT sj.id_coupe) > 1
ORDER BY nb_coupes_monde DESC, j.nom, j.prenom;

-- 7. Statistiques des matchs par phase de compétition
SELECT cdm.annee, m.phase_competition, 
       COUNT(m.id_match) AS nb_matchs,
       AVG(rm.score_equipe1 + rm.score_equipe2) AS moyenne_buts_par_match,
       SUM(CASE WHEN rm.prolongation = TRUE THEN 1 ELSE 0 END) AS nb_prolongations,
       SUM(CASE WHEN rm.tirs_au_but = TRUE THEN 1 ELSE 0 END) AS nb_tirs_au_but
FROM MATCH m
JOIN RESULTAT_MATCH rm ON m.id_match = rm.id_match
JOIN COUPE_DU_MONDE cdm ON m.id_coupe = cdm.id_coupe
GROUP BY cdm.annee, m.phase_competition
ORDER BY cdm.annee, 
         CASE 
             WHEN m.phase_competition = 'Phase de groupes' THEN 1
             WHEN m.phase_competition = 'Huitième de finale' THEN 2
             WHEN m.phase_competition = 'Quart de finale' THEN 3
             WHEN m.phase_competition = 'Demi-finale' THEN 4
             WHEN m.phase_competition = 'Match pour la 3e place' THEN 5
             WHEN m.phase_competition = 'Finale' THEN 6
         END;

-- 8. Stades ayant accueilli le plus de matchs
SELECT s.nom, s.ville, s.pays, s.capacite, COUNT(m.id_match) AS nb_matchs
FROM STADE s
LEFT JOIN MATCH m ON s.id_stade = m.id_stade
GROUP BY s.id_stade, s.nom, s.ville, s.pays, s.capacite
ORDER BY nb_matchs DESC;

-- 9. Palmarès des équipes (nombre de titres, finales, etc.)
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

-- 10. Statistiques des joueurs pour une Coupe du Monde spécifique (exemple: 2022)
SELECT j.nom, j.prenom, e.pays, 
       COUNT(pjm.id_match) AS matchs_joues,
       SUM(pjm.buts) AS buts,
       SUM(pjm.passes_decisives) AS passes_decisives,
       SUM(CASE WHEN s.type = 'Carton jaune' THEN 1 ELSE 0 END) AS cartons_jaunes,
       SUM(CASE WHEN s.type = 'Carton rouge' THEN 1 ELSE 0 END) AS cartons_rouges
FROM JOUEUR j
JOIN SELECTION_JOUEUR sj ON j.id_joueur = sj.id_joueur
JOIN EQUIPE e ON sj.id_equipe = e.id_equipe
JOIN COUPE_DU_MONDE cdm ON sj.id_coupe = cdm.id_coupe
LEFT JOIN PARTICIPATION_JOUEUR_MATCH pjm ON j.id_joueur = pjm.id_joueur
LEFT JOIN MATCH m ON pjm.id_match = m.id_match AND m.id_coupe = cdm.id_coupe
LEFT JOIN SANCTION s ON j.id_joueur = s.id_joueur AND s.id_match = m.id_match
WHERE cdm.annee = 2022
GROUP BY j.id_joueur, j.nom, j.prenom, e.pays
HAVING COUNT(pjm.id_match) > 0
ORDER BY buts DESC, passes_decisives DESC, j.nom, j.prenom;

-- 11. Confrontations directes entre deux équipes en Coupe du Monde
-- Création d'une vue pour les confrontations (optimisée pour PostgreSQL)
CREATE OR REPLACE VIEW CONFRONTATIONS AS
SELECT 
    cdm.annee,
    e1.pays AS equipe1,
    e2.pays AS equipe2,
    rm.score_equipe1,
    rm.score_equipe2,
    m.phase_competition,
    CASE 
        WHEN rm.score_equipe1 > rm.score_equipe2 THEN e1.pays
        WHEN rm.score_equipe1 < rm.score_equipe2 THEN e2.pays
        WHEN rm.tirs_au_but = TRUE AND rm.score_tirs_au_but_equipe1 > rm.score_tirs_au_but_equipe2 THEN e1.pays
        WHEN rm.tirs_au_but = TRUE AND rm.score_tirs_au_but_equipe1 < rm.score_tirs_au_but_equipe2 THEN e2.pays
        ELSE 'Match nul'
    END AS vainqueur
FROM MATCH m
JOIN RESULTAT_MATCH rm ON m.id_match = rm.id_match
JOIN COUPE_DU_MONDE cdm ON m.id_coupe = cdm.id_coupe
JOIN EQUIPE e1 ON m.id_equipe1 = e1.id_equipe
JOIN EQUIPE e2 ON m.id_equipe2 = e2.id_equipe;

-- Exemple d'utilisation de la vue pour France vs Argentine
SELECT * FROM CONFRONTATIONS 
WHERE (equipe1 = 'France' AND equipe2 = 'Argentine') 
   OR (equipe1 = 'Argentine' AND equipe2 = 'France')
ORDER BY annee;

-- 12. Évolution du nombre d'équipes participantes par Coupe du Monde
SELECT cdm.annee, cdm.nb_equipes
FROM COUPE_DU_MONDE cdm
ORDER BY cdm.annee;

-- 13. Nombre de buts marqués par Coupe du Monde
SELECT cdm.annee, SUM(rm.score_equipe1 + rm.score_equipe2) AS total_buts,
       COUNT(m.id_match) AS nb_matchs,
       ROUND(CAST(SUM(rm.score_equipe1 + rm.score_equipe2) AS NUMERIC) / COUNT(m.id_match), 2) AS moyenne_buts_par_match
FROM MATCH m
JOIN RESULTAT_MATCH rm ON m.id_match = rm.id_match
JOIN COUPE_DU_MONDE cdm ON m.id_coupe = cdm.id_coupe
GROUP BY cdm.id_coupe, cdm.annee
ORDER BY cdm.annee;

-- 14. Équipes ayant marqué le plus de buts dans l'histoire de la Coupe du Monde
SELECT e.pays, SUM(
    CASE 
        WHEN m.id_equipe1 = e.id_equipe THEN rm.score_equipe1
        WHEN m.id_equipe2 = e.id_equipe THEN rm.score_equipe2
        ELSE 0
    END
) AS total_buts
FROM EQUIPE e
JOIN MATCH m ON e.id_equipe = m.id_equipe1 OR e.id_equipe = m.id_equipe2
JOIN RESULTAT_MATCH rm ON m.id_match = rm.id_match
GROUP BY e.id_equipe, e.pays
ORDER BY total_buts DESC;

-- 15. Statistiques des entraîneurs en Coupe du Monde
SELECT st.nom, st.prenom, st.nationalite, COUNT(DISTINCT e.id_coupe) AS nb_coupes_monde,
       STRING_AGG(CAST(cdm.annee AS TEXT), ', ' ORDER BY cdm.annee) AS annees_participation,
       MAX(pe.resultat_final) AS meilleur_resultat
FROM STAFF_TECHNIQUE st
JOIN ENCADREMENT e ON st.id_staff = e.id_staff
JOIN COUPE_DU_MONDE cdm ON e.id_coupe = cdm.id_coupe
JOIN PARTICIPATION_EQUIPE pe ON e.id_equipe = pe.id_equipe AND e.id_coupe = pe.id_coupe
WHERE st.role = 'Entraîneur principal'
GROUP BY st.id_staff, st.nom, st.prenom, st.nationalite
ORDER BY nb_coupes_monde DESC, st.nom, st.prenom;

-- Requêtes avancées spécifiques à PostgreSQL

-- 16. Utilisation de window functions pour le classement des buteurs par Coupe du Monde
SELECT cdm.annee, j.nom, j.prenom, e.pays, COALESCE(SUM(pjm.buts), 0) AS buts,
       RANK() OVER (PARTITION BY cdm.id_coupe ORDER BY COALESCE(SUM(pjm.buts), 0) DESC) AS classement
FROM JOUEUR j
LEFT JOIN PARTICIPATION_JOUEUR_MATCH pjm ON j.id_joueur = pjm.id_joueur
LEFT JOIN MATCH m ON pjm.id_match = m.id_match
LEFT JOIN COUPE_DU_MONDE cdm ON m.id_coupe = cdm.id_coupe
LEFT JOIN SELECTION_JOUEUR sj ON j.id_joueur = sj.id_joueur AND cdm.id_coupe = sj.id_coupe
LEFT JOIN EQUIPE e ON sj.id_equipe = e.id_equipe
WHERE pjm.buts IS NOT NULL AND pjm.buts > 0
GROUP BY cdm.id_coupe, cdm.annee, j.id_joueur, j.nom, j.prenom, e.pays
ORDER BY cdm.annee, buts DESC;

-- 17. Utilisation de CTE (Common Table Expressions) pour analyser les performances des équipes
WITH stats_equipe AS (
    SELECT 
        cdm.id_coupe,
        cdm.annee,
        e.id_equipe,
        e.pays,
        COUNT(m.id_match) AS matchs_joues,
        SUM(CASE WHEN (m.id_equipe1 = e.id_equipe AND rm.score_equipe1 > rm.score_equipe2) OR 
                      (m.id_equipe2 = e.id_equipe AND rm.score_equipe2 > rm.score_equipe1) THEN 1 ELSE 0 END) AS victoires,
        SUM(CASE WHEN rm.score_equipe1 = rm.score_equipe2 THEN 1 ELSE 0 END) AS nuls,
        SUM(CASE WHEN (m.id_equipe1 = e.id_equipe AND rm.score_equipe1 < rm.score_equipe2) OR 
                      (m.id_equipe2 = e.id_equipe AND rm.score_equipe2 < rm.score_equipe1) THEN 1 ELSE 0 END) AS defaites,
        SUM(CASE WHEN m.id_equipe1 = e.id_equipe THEN rm.score_equipe1 ELSE rm.score_equipe2 END) AS buts_marques,
        SUM(CASE WHEN m.id_equipe1 = e.id_equipe THEN rm.score_equipe2 ELSE rm.score_equipe1 END) AS buts_encaisses
    FROM EQUIPE e
    JOIN MATCH m ON (m.id_equipe1 = e.id_equipe OR m.id_equipe2 = e.id_equipe)
    JOIN RESULTAT_MATCH rm ON m.id_match = rm.id_match
    JOIN COUPE_DU_MONDE cdm ON m.id_coupe = cdm.id_coupe
    GROUP BY cdm.id_coupe, cdm.annee, e.id_equipe, e.pays
)
SELECT 
    annee,
    pays,
    matchs_joues,
    victoires,
    nuls,
    defaites,
    buts_marques,
    buts_encaisses,
    buts_marques - buts_encaisses AS difference_buts,
    ROUND(CAST(victoires * 3 + nuls AS NUMERIC) / NULLIF(matchs_joues * 3, 0) * 100, 2) AS pourcentage_points
FROM stats_equipe
ORDER BY annee, pourcentage_points DESC, difference_buts DESC;

-- 18. Utilisation de LATERAL JOIN pour trouver le meilleur buteur de chaque équipe
SELECT 
    cdm.annee,
    e.pays,
    meilleurs.nom,
    meilleurs.prenom,
    meilleurs.buts
FROM EQUIPE e
JOIN PARTICIPATION_EQUIPE pe ON e.id_equipe = pe.id_equipe
JOIN COUPE_DU_MONDE cdm ON pe.id_coupe = cdm.id_coupe
CROSS JOIN LATERAL (
    SELECT 
        j.nom,
        j.prenom,
        COALESCE(SUM(pjm.buts), 0) AS buts
    FROM JOUEUR j
    JOIN SELECTION_JOUEUR sj ON j.id_joueur = sj.id_joueur AND sj.id_equipe = e.id_equipe AND sj.id_coupe = cdm.id_coupe
    LEFT JOIN PARTICIPATION_JOUEUR_MATCH pjm ON j.id_joueur = pjm.id_joueur
    LEFT JOIN MATCH m ON pjm.id_match = m.id_match AND m.id_coupe = cdm.id_coupe
    GROUP BY j.id_joueur, j.nom, j.prenom
    ORDER BY buts DESC
    LIMIT 1
) AS meilleurs
WHERE meilleurs.buts > 0
ORDER BY cdm.annee, e.pays;
