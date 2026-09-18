# 06 — Analyse Redis

## Principes
- NE PAS tout mettre en cache. Chaque cache doit avoir : cle + TTL + invalidation + raison.
- Candidats raisonnables : annee scolaire active (school:active-year), parametres systeme,
  referentiels rarement modifies, permissions.
- Garantir coherence MySQL <-> Redis <-> API <-> Angular (invalidation a la mutation).

## Etat actuel
- Aucun cache Redis ajoute dans cette session (aucune mesure ne le justifie encore).
- A mesurer d'abord : coût reel des endpoints (voir checklist #16 - mesures AVANT).
