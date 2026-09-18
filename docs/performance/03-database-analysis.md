# 03 — Analyse base de donnees (a completer avec mesures)

## Tables & volumetrie cible (enregistrements)
eleves 10 000+ | paiements 10 000+ | inscriptions 10 000+ | notes 10 000+
presences 10 000+ | utilisateurs 10 000+ | plusieurs annees scolaires / classes / enseignants / matieres

## Regles d'index (uniquement justifies)
- indexer les colonnes de WHERE/JOIN/ORDER BY/GROUP BY/LIKE prefixe
- index composite (academic_year_id + status) pour le filtre de dossiers preinscriptions
- NE PAS creer des dizaines d'index sans analyse; documenter chaque index et sa justification
- mesurer via EXPLAIN / EXPLAIN ANALYZE avant d'ajouter

## Anti-patterns a auditer
- findAll() massifs (max- des paginer)
- LIKE '%xxx%' (convertir en prefixe + index)
- N+1 / lazy loading involontaire / EAGER inutile / JOIN FETCH manquants
