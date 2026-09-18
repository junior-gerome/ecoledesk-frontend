# Audit & correction `label[for]` ↔ `input[id]`

## Résumé

- **Problèmes détectés** : 24 champs de formulaire sans association `label` ↔ champ (labels détachés sans `for`, champs sans `id`, champs sans label).
- **Problèmes corrigés** : 24 / 24.
- **Fichiers modifiés** : 4.
- **Tests exécutés** :
  - `npx tsc --noEmit -p tsconfig.app.json` : PASS
  - `npm run architecture:check` : PASS
  - `npm run test:students` (specs des fichiers étudiants) : 37/37 PASS
  - `npm run test` (suite complète) : partiellement exécutée — 8 échecs **préexistants** dans `daily-attendance.repository.integration.spec.ts` (mock HTTP vers `http://localhost:8080/api/academic-year/active`) + déconnexion Chrome, indépendants de cette mission.
- **Résultat du build** : PASS (`npm run build`, exit code 0).

Note : parmi les `for=` **existants**, aucune incohérence n'a été trouvée — le header (4 labels `for` → 4 ids réels) et les composants partagés `app-input` / `app-select` / `app-textarea` (`[for]='id'` + `[id]='id'` + id auto-généré s'il est absent) étaient déjà cohérents. Les problèmes réels étaient des **labels détachés** (cas B du cahier des charges : champ sans association).

## Problèmes détectés

| Fichier | Composant | Problème | Correction |
| ------- | --------- | -------- | ---------- |
| `src/app/features/pre-enrollments/presentation/pages/pre-enrollment-wizard-page.component.html` | Wizard pré-inscription — Étape 1 (8 champs) | Labels détachés sans `for`, champs sans `id` | `for` + `id` ajoutés : `preFirstName`, `preLastName`, `preBirthDate`, `preGender`, `preBirthPlace`, `preAcademicYear`, `preRequestedLevel` (select ET input de repli), `preRequiredFee` |
| idem | Étape 2 — Responsables (6 champs) | idem | `preGuardianRelationship`, `preGuardianFirstName`, `preGuardianLastName`, `preGuardianPhone`, `preGuardianEmail`, `preGuardianAddress` |
| idem | Étape 3 — Documents (2 champs) | idem | `preDocumentType`, `preDocumentFile` |
| idem | Étape 4 — Frais (4 champs) | idem | `preFeeAmount`, `preFeeDate`, `preFeeReference`, `preFeeReceiptNumber` |
| `src/app/features/pre-enrollments/presentation/pages/pre-enrollment-detail-page.component.html` | Détail dossier — Choix de classe | Label détaché + `<select>` sans `id` | `for="preAffectationClassroom"` + `id="preAffectationClassroom"` |
| idem | Modale motif de décision | `<textarea>` **sans label** | Label `sr-only` + `id="preReasonText"` |
| `src/app/features/pre-enrollments/presentation/pages/pre-enrollment-list-page.component.html` | Liste des dossiers — Recherche | Champ de recherche sans label | Label `sr-only` + `id="preSearch"` |
| `src/app/features/enrollment/students/presentation/pages/student-page.component.html` | Liste élèves — Recherche | Champ de recherche sans label | Label `sr-only` (`studentPage.search` i18n) + `id="studentSearch"` |

Champs contrôlés (vérifiés OK, non modifiés) : header (`header-school-year`, `header-trimestre`, `header-sequence`, `header-global-search`), composants partagés `app-input`/`app-select`/`app-textarea` (forwarding `[id]` confirmé + `ensureId()`), `reset-password` (inline), `teacher-form`, `staff-form`, `student-form`, `preferences`, checkboxes liées implicitement (label qui enveloppe l'input — valide en HTML).

## Fichiers modifiés

1. `src/app/features/pre-enrollments/presentation/pages/pre-enrollment-wizard-page.component.html`
2. `src/app/features/pre-enrollments/presentation/pages/pre-enrollment-detail-page.component.html`
3. `src/app/features/pre-enrollments/presentation/pages/pre-enrollment-list-page.component.html`
4. `src/app/features/enrollment/students/presentation/pages/student-page.component.html`

Aucune logique TS, aucun `FormControl`, aucune API, aucune route n'ont été modifiés.

## Validation

```text
Build Angular : PASS
Tests : PASS (specs étudiantes 37/37) — suite complète : échecs préexistants hors périmètre (attendance integration)
label ↔ id : PASS (script de contrôle : tous les `for=` statiques ont un `id=` correspondant)
IDs uniques : PASS (seule exception volontaire : `preRequestedLevel` dans des branches `@if/@else if/@else` exclusives)
Accessibilité : PASS (tous les champs des pages concernées ont désormais un label accessible ; `aria-*` existants conservés)
```

## Risques / remarques

- `preRequestedLevel` apparaît deux fois dans le template (ligne du `<select>` et de l'`<input>` de repli), mais dans des branches mutuellement exclusives (`@else if (availableLevels().length > 0)` / `@else`) : jamais les deux éléments dans le DOM simultanément.
- Labels « photo » dans `teacher-form`, `staff-form`, `student-form` : `<label>` sans `for` devant `app-photo-upload` (composant dont le contrôle natif est un `<button>` + input fichier caché interne). Ne génère pas d'erreur `for`/`id` ; une association propre nécessiterait une évolution du composant (hors scope, non réalisée).
- Pages pre-enrollment : textes visibles encore en français codé en dur (hors i18n). Préexistant, hors périmètre de cette mission (à traiter dans une mission dédiée SKILL §11).
- Aucune erreur nouvelle introduite : aucun composant partagé ni binding de formulaire modifié.