# 08 — Resultats des optimisations

## AVANT (BUG-001)
- apres chaque decision admin : documents + identite + compteur absents de l'ecran
  jusqu'a refresh manuel (F5) ; aucune action possible depuis DRAFT.

## APRES
- reload systematique : donnees completes a l'ecran immediatement apres chaque
  mutation (submit / startReview / reviewDocument / approve / reject)
- suppression d'une classe de bug « ecran incomplet / charge au refresh »
- build prod : PASS (Exit 0, bundle initial 642.60 kB raw)

Note : temps d'endpoint / SQL / p95 / p99 non encore mesurés — a executer via
les scripts de charge avant de declarer toute autre amelioration.
