# Conventions frontend

## Constat

- `src/app/shared/domains` est le dossier canonique ; `shared/domaines/value-objects/basseId.ts` reste un wrapper de compatibilité non supprimé.
- `base-id.ts` est le nom canonique et `basseId.ts` ne doit pas devenir une nouvelle implémentation.
- `subject-create.component.*` et `SubjectCreateComponent` sont désormais les noms canoniques.
- `trimestre.ts` est le nom canonique sensible à la casse.

## Routes de compatibilité

Les anciennes URLs grades (`/grades/new`, `/grades/new-notes`) redirigent vers `/grades/form`. `/montant/montant` redirige vers `/montant` et `/section/section` vers `/section`. Ces redirections sont conservées pour les anciens liens de navigation.

Les routes `/annees` et `/annees/new-annees` sont conservées tant qu’aucun remplacement confirmé n’existe.
