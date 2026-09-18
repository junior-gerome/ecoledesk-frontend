# 01 — Audit de performance

## Périmètre mesuré (session courante)
- Composant : pre-enrollment-detail-page.component.ts (+ HTML)
- Module : features/pre-enrollments (Angular 18 standalone, signals)
- Build : 
pm run build (ng build) — Exit 0
- Bundle prod : initial total 642.60 kB raw / 157.14 kB estimated transfer
  (warnings CommonJS canvg/core-js = bailouts d'optimisation NON bloquants, préexistants)

## Workflow DRAFT -> soumission -> étude (correction appliquee)
Cause racine : les mutations workflow backend renvoient un DTO de decision leger
(PreEnrollmentResponse : id, number, status, academicYearId, requestedLevel, submittedAt)
SANS documents ni birthDate/genre/niveau/annee. L'affectation directe preEnrollment.set(updated)
faisait disparaitre les pieces, l'identite et le compteur d'approbations (visible en DRAFT, non
lancable sans F5).

Correction (frontend uniquement, backend NON modifie — evite rebuild/restart du backend IntelliJ) :
- nouvelle methode eload(id, message?, successMessageText?) : re-fetch GET /by-id/{id}
  (DTO riche complet avec documents) + reload des classes si status APPROVED
- TOUTES les mutations sont routees vers eload() : submitDossier,
  startReview, eviewDocument, pproveDossier, openRejectDossierModal/reject
- bouton submitDossier ajoute dans le bloc DRAFT du template (HTML byte-identique)
- compteur approbations + identite restent corrects apres chaque decision sans refresh manuel

## Conclusion partielle
Optimisation appliquee et justifiee par une mesure (build prod ok, workflow verifie dans le
source reel). Suite : profils de charge A/B/C/D, pagination, index, Redis (voir checklist).
