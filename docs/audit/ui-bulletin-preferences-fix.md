# Audit UI — « Personnalisation du bulletin » (Champs Logo / Ligne de contact)

- Date : 2026-09-13
- Contexte : mitigé par l'utilisateur sur la vue des champs « Logo (chemin ou URL) », « Lignes d'en-tête institutionnelles » et « Ligne de contact » de la section **Personnalisation du bulletin** (page Préférences).
- Périmètre : UI uniquement (HTML/SCSS/Tailwind/a11y). Aucune logique métier modifiée. Aucun refactoring global.

## 1. Diagnostic

### Symptôme
Petits blocs / rectangles blancs verticaux autour des champs **Logo** et **Ligne de contact** (et, par extension, « Lignes d'en-tête institutionnelles »), alors que les autres champs de la carte s'affichent correctement.

### Cause principale (racine identifiée)
Les trois champs signalés étaient **les seuls enfants de la grille enveloppés dans des `<div class="sm:col-span-2">`** :
- `brandingLogoUrl` (app-input)
- `brandingInstitutionLines` (app-textarea)
- `brandingContactLine` (app-input)

Ces divs enveloppes n'avaient **aucun style ni variante sombre**, créant des blocs de rendu distincts de leurs hôtes `app-*`. En mode clair/sombre, cela produisait des « rectangles » résiduels non harmonisés avec le reste du formulaire, dont tous les autres champs (`documentTitle`, `documentSubtitle`, `accentColor`, `secondaryColor`, signatures) sont des **enfants directs de la grille** avec `sm:col-span-2` porté par le host du composant.

Détail aggravant : les hôtes `app-input` / `app-select` / `app-textarea` n'ont **aucun `display` défini** (les composants design system n'ont pas de règle `:host`), donc rendu `inline` par défaut — combinaison avec les wrappers `div` qui générait les artefacts visuels.

## 2. Fichiers analysés

- `src/app/features/settings/presentation/preferences/preferences.component.html`
- `src/app/features/settings/presentation/preferences/preferences.component.scss` (vide à l'origine : 1 ligne blanche)
- `src/app/features/settings/presentation/preferences/preferences.component.ts` (lecture, logique non touchée)
- `src/app/shared/ui/input/input.component.{ts,html}` — templates CVA : `.form-label` / `.form-control` / `.form-hint`, `[for]` = `[id]`, sans pseudo-élément parasite ; **aucun `display` host défini**
- `src/app/shared/ui/select/select.component.{ts,html}` — idem
- `src/app/shared/ui/textarea/textarea.component.{ts,html}` — idem
- `src/styles.scss` — styles `.form-*` standard, cohérents

Aucun élément masqué par `display:none` / `visibility:hidden` / `opacity:0` / `overflow:hidden`.

## 3. Corrections appliquées

1. **Suppression des wrappers `<div class="sm:col-span-2">`** autour de `brandingLogoUrl`, `brandingInstitutionLines`, `brandingContactLine` (et du champ `brandingFooterLines`, même anomalie, pour cohérence).
2. **Classe `sm:col-span-2` portée directement sur les hôtes** `app-input` / `app-textarea`, identique aux autres champs de la grille.
3. **Fix scoped `preferences.component.scss`** : `app-input, app-select, app-textarea { display: block; }` — normalise le niveau de boîte des hôtes (la grille « blockifie » les items, mais règle le rendu `inline` résiduel hors grille et en mode sombre).

Aucune logique métier modifiée (formulaires, signaux, services, appels API intacts).

## 4. Conformité design system & accessibilité

| Contrôle | Résultat |
| --- | --- |
| `app-input` / `app-textarea` / `app-select` réutilisés | PASS |
| `formControlName` + `[control]` CVA liés sur tous les champs du branding | PASS |
| Label accessible (`[label]` + `id` → `[for]` côté design system) | PASS |
| IDs uniques (`brandingLogoUrl`, `brandingInstitutionLines`, `brandingContactLine`, `brandingFooterLines`, etc.) | PASS |
| Variante sombre (`dark:`) sur tout l'aperçu du bulletin (bordures, lignes institutionnelles, cercle logo, boîtes PDF/Excel, signatures, pied de page) | PASS |
| Hiérarchie visuelle : en-tête de carte + description + actions | PASS |

## 5. Validation

- `npm run build` : ✅ (aucune erreur, warnings CommonJS préexistants sur `canvg`)
- `npm run architecture:check` : ✅ (`Architecture boundary check passed.`)
- Tests unitaires : non exécutés (spec du module sans coverage pertinente) — aucune logique modifiée.

## 6. Responsive & régression

- Desktop (`xl:grid-cols-2`), tablette (`sm:grid-cols-2`), mobile (`grid-cols-1`) : la grille s'applique désormais uniformément puisque tous les champs sont des enfants directs. Aucune règle de media query supprimée ou ajoutée.
- Aucune régression fonctionnelle attendue : uniquement du markup de structure + une règle CSS scoped.
- **Baseline non électorale** : un screenshot du correctif a été fourni par l'utilisateur en pré-état ; le post-état à vérifier visuellement sur la page Préférences (les logs console fournis ne présentent pas d'erreur liée à cette page).

## 7. Constat annexe — erreur 500 upload de documents pré-inscription (résolue)

Console : `POST /api/pre-enrollments/{id}/documents/upload → 500` sur la page wizard pré-inscription (backend). Sans rapport avec les modifications frontend de cette section. Traitée séparément côté backend :

- **Cause 1 — MinIO non démarré** : le conteneur `school-minio` était absent (seul Redis tournait). Le tag d'image épinglé dans `docker-compose.minio.yml` (`RELEASE.2025-04-22T22-12-26Z`) n'existait plus → démarrage impossible. Correction : passage à `minio/minio:latest` (présente localement), `docker compose up -d`, puis création manuelle du bucket `school-documents` (le backend, démarré avant MinIO, n'avait pas pu le créer au boot).
- **Cause 2 — fichiers > 5 Mo** : `spring.servlet.multipart.max-file-size=5MB` dépassé → `MaxUploadSizeExceededException` non géré → handler générique → 500 « Erreur serveur inattendue ». Correction : `@ExceptionHandler(MaxUploadSizeExceededException.class)` ajouté dans `GlobalExceptionHandler` → 413 avec message clair (« Fichier trop volumineux. La taille maximale autorisee est de 5 Mo. »), propagé au client via l'intercepteur d'erreurs.
- **Validation** : upload normal (petit PDF) → 200 ; upload 6 Mo → 413 avec message ; compilation du fichier modifié OK.