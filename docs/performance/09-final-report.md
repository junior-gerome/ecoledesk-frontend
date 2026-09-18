# 09 — Rapport final (etat des lieux)

## Ce qui est FAIT et VERIFIE
- Build production Angular : PASS (Exit 0)
- Workflow detail preinscription complet (DRAFT->SUBMITTED->UNDER_REVIEW->APPROVED/REJECTED)
  avec reload systematique : identite + documents + compteur corrects apres chaque decision,
  sans refresh manuel
- Bouton de soumission accessible depuis le statut DRAFT

## Ce qui N'EST PAS encore fait (a realiser avec mesures)
- Profils de charge A/B/C/D (voir 02-load-test.md)
- Pagination serveur + debounce recherches
- Index SQL justifies (EXPLAIN)
- Cache Redis (cle+TTL+invalidation)
- Tests perf / regression / build backend (backend NON restartee — en cours dans IntelliJ)
- Metriques AVANT/APRES chiffrees pour chaque endpoint

## Regle d'or respectee
Aucune optimisation ne sera declaree « amelioration » sans une mesure realisable
et reproductible. 10 000 enregistrements != 10 000 utilisateurs simultanes.
