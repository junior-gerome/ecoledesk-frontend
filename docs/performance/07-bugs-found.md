# 07 — Bugs trouves

## BUG-001 (CORRIGE) — Dossier de preinscription en DRAFT :
les champs identite (naissance, genre), le niveau/annee et les pieces justificatives
disparaissaient apres une decision workflow (DTO de decision leger ecrasait le dossier).
- impact : affichage incomplet, compteur approbations a zero, pas de soumission depuis DRAFT
- cause : preEnrollment.set(updated) sur un DTO sans documents/identite
- correction : eload() qui re-fetch le dossier complet apres CHAQUE decision
- fichier : pre-enrollment-detail-page.component.ts (+ html)
- verification : build prod Exit 0 ; workflow present dans le source reel
- statut : RESOLU

## (suite a completer lors des profils A/B/C/D)
