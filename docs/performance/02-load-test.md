# 02 — Plan de test de charge

## Profils (a executer via scripts reproduisibles)
- A — NORMAL : 1000 eleves, 1000 paiements, 1000 inscriptions (verification fonctionnelle)
- B — CHARGE : 10 000+ enregistrements par domaine pertinent
- C — FORTE CHARGE : 50 000+ si techniquement raisonnable
- D — CONCURRENCE : 10 / 25 / 50 / 100 / (200 si l'environnement le permet) utilisateurs

NOTE IMPORTANTE : ne jamais declarer un niveau de charge non reellement execute.
Aucun chiffre ne doit etre annonce sans mesure.

## Scenarii realismes (actions distribuees dans le temps)
1. connexion (JWT)
2. dashboard
3. recherche eleve (debounce) — AVANT une requete par frappe, APRES debounce 300ms
4. consultation liste eleves (pagination)
5. fiche eleve (documents, notes, presences)
6. creation/modification paiement
7. consultation notes / classes / enseignants / inscriptions
8. generation / consultation bulletin
9. notifications

## Rendu attendu
par endpoint : p95/p99, nb requetes SQL, payload, erreurs.
