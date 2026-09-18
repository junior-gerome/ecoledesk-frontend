# Audit AppInput Dark Mode + Suppression de l'enveloppe host

## Cause racine

Le plugin `@tailwindcss/forms` (v0.5.10) genere en `@layer base` des regles CSS avec des selecteurs a attribut nu :

```css
[type='text'], [type='email'], [type='number'], [type='date'],
[type='password'], [type='tel'], [type='url'], [type='search'], ...
{
  appearance: none;
  background-color: #fff;
  border-color: gray-500;
  border-width: 1px;
  border-radius: 0px;
  padding: 0.5rem 0.75rem;
  ...
}
```

Ces selecteurs `[type='...']` matchent **tout** element portant un attribut `type`, y compris les hostes Angular custom elements `<app-input type="...">` (les attributs statiques `type="..."` des templates sont copies sur le host).

Deux problemes lies :

1. **Dark mode (mission 1)** : l'host `<app-input>` etait peint en blanc (`background-color:#fff`) meme en mode sombre, entrainant des « zones blanches » autour des champs.
2. **Enveloppe parasite (mission 2)** : la meme regle imposait sur l'host `background-color:#fff` **et** `padding: 0.5rem 0.75rem` avec `border-radius:0`. L'hote formaient une boite (fond + bourrage) englobant le label ET le champ : `CARD > LABEL > INPUT` au lieu de `LABEL > INPUT`. La bordure visible etait celle de l'input interne ; la « bordure extérieure » etait la limite de ce rectangle blanc/padding de l'host.

## Point cle : le CSS compile est aplati (pas de @layer)

Sur ce projet, le CSS servi par Angular ne contient **aucune at-rule `@layer`** : tout est aplati dans un meme contexte. La priorit entre `app-input` et `[type='...']` se joue donc sur la **specificite**, pas sur l'ordre des layers. Une regle `app-input { ... }` (specificite 0,0,1) perd face a `[type='...']` (0,1,0). C'etait le piege : la premiere tentative (regle simple `app-input`) n'effacait ni le fond ni le padding.

## Fichiers analyses

- `tailwind.config.js` : plugins `@tailwindcss/forms` (strategie base/class par defaut)
- `src/styles.scss` : `@tailwind base/components/utilities` + classes design-system
- `node_modules/@tailwindcss/forms/src/index.js` : regles `[type='text']`, etc.
- `src/app/shared/ui/input/input.component.ts` : host binding `[attr.id]: 'null'`, `@Input() type = 'text'`, getter `inputClasses`
- `src/app/shared/ui/input/input.component.html` : template avec label + `<input class='form-control'>`
- `src/app/shared/ui/select/select.component.ts` : non affecte (pas de `type` sur `<app-select>`)
- `src/app/shared/ui/textarea/textarea.component.ts` : non affecte
- `src/app/features/payments/presentation/form/payment-form.component.html` : page signalee (Montant, Date paiement, Date echeance, Numero de recu)
- `src/app/core/services/theme/theme.service.ts` : ajoute `.dark` sur `<html>`

## Fichiers modifies

### `src/styles.scss` (2 ajouts)

1. **Neutralisation des hostes `<app-input>`**

   ```scss
   app-input {
     display: block;
   }

   app-input[type] {
     border: 0;
     border-radius: 0;
     background: transparent;
     padding: 0;
     box-shadow: none;
   }
   ```

   - `app-input[type]` (specificite 0,1,1) bat `[type='...']` (0,1,0) dans le CSS aplati.
   - Le host devient neutre (layout uniquement) : pas de bordure, pas de fond, pas de padding, pas d'ombre, en light **et** dark.
   - Le champ `<input>` interne conserve integralement son style via `.form-control` (bordure, fond, focus, error, disabled, readonly, dark mode).

2. **`color-scheme: dark` pour les controles natifs**

   ```scss
   .dark .form-control { color-scheme: dark; }
   ```

   Force Chrome a rendre date picker, number spinners et password toggle en mode sombre. (Applique sur l'`<input>` interne qui porte `.form-control`.)

Note historique : une premiere version utilisait `app-input { @apply dark:bg-gray-800; }` (regle `.dark app-input` de specificite 0,1,1 qui fonctionnait pour le dark). Elle a ete remplacee par la neutralisation complete du host, conforme a l'objectif : SUPPRIMER la deuxieme enveloppe, pas la recolorer.

## Tests

| Test | Resultat | Source |
|------|----------|--------|
| Build Angular | PASS (exit 0) | `npm run build` |
| TypeScript | PASS (exit 0) | `npx tsc --noEmit` |
| /payments/new - Montant, Date paiement, Date echeance, Numero de recu | PASS | CDP headless |
| 2 autres pages (`/settings/preferences` x18 champs, `/staff/new` x16 champs) | PASS | CDP headless |
| Light Mode - host | PASS | border 0, bg transparent, padding 0, box-shadow none |
| Light Mode - input | PASS | border 1px solid gray-300, bg white, radius 6px |
| Dark Mode - host | PASS | border 0, bg transparent, padding 0, box-shadow none |
| Dark Mode - input | PASS | border 1px solid gray-600, bg gray-800, texte blanc |
| Champs date (native) | PASS | border 1px, color-scheme dark, endoscopie cal e = blanc elimine |
| Erreur de validation | PASS | aria-invalid=true, .form-error rouge visible, bordure input red-500, host border 0 |
| Disabled | PASS | bg gray-100 (rgb 243,244,246), cursor not-allowed |
| Readonly | PASS | fond + bordure conserves |
| Focus | PASS | ring + border appliques via .form-control |
| Border du veritable `<input>` | PASS | 1px solid present sur tous les champs (light + dark) |
| Aucune bordure parasite | PASS | host 0px, wrappers app-form-body / app-page-form-body / .flex : 0px, box-shadow none (tous themes) |

## Analyse pixel (CDP headless + System.Drawing)

### Avant correction (host region, dark)
```
host 'amount'      -> #FFFFFF=50%, #1F2937=40%   <- BLANC DOMINANT
```

### Apres neutralisation host (dark)
```
host 'amount'      -> #1F2937=89%, #FFFFFF=0%     <- BLANC ELIMINE
```
(le host transparent laisse voir le fond de la card page-form-body, sans rectangle supplementaire)

## Regression

- `app-select`, `app-textarea` : non affectes (pas d'attribut `type` sur les hostes).
- `@tailwindcss/forms` : conserve (base) ; les inputs natifs continuent de recevoir leur reset.
- Aucun fichier composant ni template n'a ete modifie.
- Le ControlValueAccessor (writeValue, registerOnChange, handleInput, etc.) n'a pas ete touche.
- `payment-form.component.html`, FormControl, services, API et routes : non touches.

## Avertissement console "unload listeners"

L'avertissement Chrome provient de **Zone.js** (polyfills.js:4421, `ZoneTask.customScheduleGlobal`). C'est un comportement interne du polyfill Angular, pas du code applicatif. Zone.js enregistre `unload` pour la gestion de zone scheduling. Ce code ne peut pas etre modifie cote projet ; il disparaitra avec la migration vers Angular zoneless.