==================================================
CHECKLIST AUDIT PERFORMANCE - ecoledesk
==================================================

[ ] 01 Audit initial (mesures AVANT)
[ ] 02 Profils de charge (normal / 10k / 50k / concurrency)
[ ] 03 Environnement de test (donnees separees, seed/reset/cleanup)
[ ] 04 Frontend - appels HTTP
[ ] 05 Frontend - debounce / recherche serveur
[ ] 06 Frontend - pagination / virtual scroll
[ ] 07 Frontend - ChangeDetection / signals / track
[ ] 08 Backend - migration N+1 (JOIN FETCH / EntityGraph)
[ ] 09 Backend - pagination PagedModel / Pageable
[ ] 10 Backend - DTO vs entites JPA du retour API
[ ] 11 API - taille reponses (payload)
[ ] 12 API - latence (p95/p99) par endpoint
[ ] 13 SQL - EXPLAIN ANALYZE sur requetes hot
[ ] 14 SQL - index justifies (WHERE/JOIN/ORDER BY)
[ ] 15 Base - count(*) volumetrie (eleves, paiements, inscriptions, notes, presences)
[ ] 16 Redis - cache avec cle/TTL/invalidation/documentation
[ ] 17 Threads - Tomcat + HikariCP (justifie par mesure)
[ ] 18 Memoire - collections / cache illimite / fuites
[ ] 19 Observable - logs / temps requetes / erreurs / SQL lent
[ ] 20 Tests perf - scenario realiste multi-utilisateurs
[ ] 21 Seuils - p95 < 500ms API standard
[ ] 22 Regression - CRUD / auth / JWT / RBAC / bulletins
[ ] 23 Build frontend (npm run build)
[ ] 24 Build backend (gradle build)
[ ] 25 Raport final AVANT/APRES avec metriques
