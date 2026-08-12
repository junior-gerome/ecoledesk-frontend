# Scan frontend

Date du scan: 2026-05-24

## Resume executif

- Application Angular `school-management` basee sur Angular 18, composants standalone, SCSS, Tailwind CSS, RxJS et Angular Material/CDK.
- 21 domaines fonctionnels detectes dans `src/app/features`.
- 45 composants de fonctionnalite et 25 composants `shared`/`layout` detectes.
- Architecture deja orientee couches: `presentation`, `application`, `domain`, `infrastructure`.
- Un controle d'architecture existe via `npm run architecture:check`.
- Points a prioriser: finir l'homogeneisation des dossiers, renforcer les tests, clarifier les conventions de routes/API et consolider le design system.

## Stack et configuration

- Framework: Angular `18.2.x`.
- Langage: TypeScript strict, `strictTemplates` active.
- UI: SCSS, Tailwind CSS, Angular Material, Angular CDK.
- Librairies metier: Chart.js, jsPDF, html2canvas, xlsx, angularx-qrcode.
- Temps reel: STOMP et SockJS.
- Tests: Karma/Jasmine.
- Build: Angular CLI, budgets production `650kb` warning et `1mb` error pour le bundle initial.
- Deploiement: Dockerfile Angular avec Nginx, proxy vers `/api`, `/billing-api` et `/attendance-api`.

## Squelette actuel

```text
frontend/
|-- angular.json
|-- package.json
|-- package-lock.json
|-- tailwind.config.js
|-- tsconfig.json
|-- tsconfig.app.json
|-- tsconfig.spec.json
|-- Dockerfile
|-- nginx.conf
|-- scripts/
|   `-- architecture-check.mjs
|-- docs/
|   |-- ARCHITECTURE-CURRENT.md
|   |-- ARCHITECTURE-ENTERPRISE.md
|   `-- FRONTEND_SCAN.md
`-- src/
    |-- main.ts
    |-- index.html
    |-- styles.scss
    |-- environments/
    |   |-- environment.ts
    |   `-- environment.prod.ts
    |-- assets/
    |   |-- icons/
    |   `-- i18n/
    `-- app/
        |-- app.component.*
        |-- app.config.ts
        |-- app.routes.ts
        |-- core/
        |   |-- config/
        |   |-- configuration/
        |   |-- constants/
        |   |-- errors/
        |   |-- guards/
        |   |-- interceptors/
        |   |-- models/
        |   |-- notification/
        |   |-- security/
        |   |-- services/
        |   `-- tokens/
        |-- layout/
        |   |-- MainLayout.component.*
        |   |-- footer/
        |   |-- forbidden/
        |   |-- header/
        |   |-- nav/
        |   `-- sidebar/
        |-- shared/
        |   |-- directives/
        |   |-- domains/
        |   |-- domaines/
        |   |-- form-body/
        |   |-- page-form-body/
        |   |-- page-header/
        |   |-- page-layout/
        |   |-- pipes/
        |   |-- theme/
        |   `-- ui/
        `-- features/
            |-- attendance/
            |-- auth/
            |-- classes/
            |-- communication/
            |-- dashboard/
            |-- gestion-annees/
            |-- grades/
            |-- inscriptionstudent/
            |-- montant/
            |-- parent/
            |-- payments/
            |-- reports/
            |-- search/
            |-- section/
            |-- sequence/
            |-- settings/
            |-- students/
            |-- subjects/
            |-- support/
            |-- teachers/
            `-- trimestre/
```

## Organisation par couches

La majorite des features suivent ce modele:

```text
feature/
|-- feature.routes.ts
|-- application/
|   |-- facades/
|   |-- services/
|   `-- use-cases/
|-- domain/
|   |-- entities/
|   |-- mappers/
|   |-- models/
|   |-- repositories/
|   |-- services/
|   `-- value-objects/
|-- infrastructure/
|   |-- services/
|   `-- repositories/adapters
`-- presentation/
    |-- components ou pages
    `-- store/
```

Repartition observee dans `features`:

| Couche ou dossier | Nombre approximatif de fichiers TS |
|---|---:|
| `domain` | 103 |
| `presentation` | 70 |
| `infrastructure` | 45 |
| `application` | 35 |

## Routage principal

- `/auth`: routes publiques de connexion, inscription et mot de passe oublie.
- `/`: layout principal protege par `authGuard`.
- Routes lazy-load principales: `dashboard`, `attendance`, `students`, `subjects`, `teachers`, `classes`, `trimestre`, `sequence`, `payments`, `reports`, `grades`, `annees`, `montant`, `settings`, `section`, `parents`, `communication`, `support`.
- Routes avec roles:
  - `attendance`, `students`: `ROLE_GROUPS.STAFF`.
  - `payments`, `montant`: `ROLE_GROUPS.FINANCE`.
  - `grades`: `ROLE_GROUPS.ACADEMIC`.
  - `annees`, `settings`: `ROLE_GROUPS.ADMIN_ONLY`.
- Fallback interne: `forbidden` et redirect vers `dashboard`.

## Configuration API

- `environment.ts`:
  - `apiUrl`: `http://localhost:8080/api`.
  - `billingApiUrl`: `http://localhost:8082/api`.
  - `attendanceApiUrl`: `http://localhost:8083/api`.
- `environment.prod.ts`:
  - `apiUrl`: `/api`.
  - `billingApiUrl`: `/billing-api`.
  - `attendanceApiUrl`: `/attendance-api`.
- `app.config.ts` declare `provideHttpClient` avec `authInterceptor`, `loadingInterceptor`, `errorInterceptor`.
- `core/config/api-base-url.ts` fournit `API_BASE_URL`.
- `core/configuration/api-endpoints.config.ts` centralise quelques endpoints, surtout auth, inscription, annee scolaire et attendance.

## Scan des composants de fonctionnalite

| Feature | Composants detectes |
|---|---|
| `attendance` | `absence-tracking`, `daily-attendance`, `justifications` |
| `auth` | `forgot-password`, `login`, `register` |
| `classes` | `class-form`, `class-list` |
| `communication` | `communication-coming-soon` |
| `dashboard` | `dashboard` |
| `gestion-annees` | `gestion-annees` |
| `grades` | `bulletin-page`, `bulletin-selector`, `grade-form-page`, `grade-list-page`, `class-report` |
| `inscriptionstudent` | `inscription` |
| `montant` | `montant` |
| `parent` | `parent`, `parent-list` |
| `payments` | `payment-form`, `payment-list`, `payment-receipt-document`, `payment-receipt-management` |
| `reports` | `financial-report`, `performance-report` |
| `search` | `advanced-search` |
| `section` | `section` |
| `sequence` | `sequence-create`, `sequence-list` |
| `settings` | `preferences`, `user-management` |
| `students` | `student-form`, `student-list`, `student-page` |
| `subjects` | `subject-creat`, `subject-list` |
| `support` | `support-contact`, `help-center` |
| `teachers` | `teacher-form`, `teacher-list`, `teacher-schedule`, `teacher-subjects` |
| `trimestre` | `trimestre-create`, `trimestre-list` |

## Scan des composants partages

Layout:

- `MainLayout`, `footer`, `forbidden-page`, `header`, `nav`, `sidebar`.

UI shared:

- `alert`, `avatar`, `badge`, `button`, `card`, `empty-state`, `input`, `modal`, `pagination`, `select`, `skeleton`, `table`, `textarea`, `toast`.

Composants de page:

- `form-body`, `page-form-body`, `page-header`, `page-layout`, `theme`.

Autres briques partagees:

- Directives: `auto-focus`, `has-permission`, `has-role`, `loading`, `status-badge`.
- Pipes: `currency-fcfa`, `grade-mention`, `month-label`, `student-name`.
- Core: guards, interceptors, RBAC, notifications, services de session/theme/i18n/recherche.

## Tests detectes

- 36 fichiers `*.spec.ts` detectes dans `src/app`.
- Couverture presente sur quelques zones importantes: auth, students, classes, payments, attendance, dashboard, shared button, guards/config indirectement.
- Script cible disponible: `npm run test:students`.
- Point notable: les schematics Angular sont configures avec `skipTests: true`, donc les nouveaux composants/services ne generent pas de tests par defaut.

## Points forts

- Separation claire entre `core`, `shared`, `layout` et `features`.
- Lazy loading generalise par feature.
- Frontieres d'architecture controlees par script local.
- TypeScript strict et Angular strict templates actives.
- Intercepteurs HTTP deja centralises.
- Systeme de roles/permissions present cote routage et directives.
- Design system embryonnaire dans `shared/ui`.
- Assets i18n existants pour `fr` et `en`.

## Points de friction detectes

- Coexistence de `shared/domains` et `shared/domaines`, avec un controle d'architecture qui signale deja le chemin legacy.
- Quelques conventions de nommage divergentes: `subject-creat`, `inscriptionstudent`, `ROUTES` en majuscules, routes parfois singulier/pluriel.
- Certaines features ont toutes les couches, d'autres ont surtout des dossiers vides ou tres partiels.
- Les stores/facades sont utilises dans certaines features mais pas de facon uniforme.
- `api-endpoints.config.ts` ne couvre pas encore toutes les ressources, ce qui peut laisser des URLs en dur dans les services.
- Les composants UI partages existent, mais Angular Material, Tailwind et composants maison peuvent se chevaucher sans convention documentee.
- Les tests existent, mais restent limites par rapport au nombre de features et aux guards/interceptors critiques.

## Ameliorations proposees

### Priorite P0

1. Supprimer ou migrer `shared/domaines` vers `shared/domains`, puis faire passer `npm run architecture:check` en CI.
2. Normaliser les noms de routes et dossiers: `subjects`, `trimesters` ou convention singulier choisie, `inscription-student`, `subject-create`.
3. Centraliser tous les endpoints HTTP dans une configuration typee et interdire les URLs API directement dans `infrastructure`.
4. Ajouter des tests minimaux sur `authInterceptor`, `errorInterceptor`, `loadingInterceptor`, `authGuard`, `roleGuard` et les routes protegees.
5. Documenter un patron unique de feature: routes, presentation, facade/use-case, domain, infrastructure.

### Priorite P1

1. Harmoniser la gestion d'etat: choisir quand utiliser store, facade ou service simple.
2. Extraire les contrats des composants `shared/ui`: inputs, outputs, etats loading/disabled/error, accessibilite.
3. Completer la couverture des flows critiques: login, reset password, enrollment students, payment, attendance, grade entry, bulletin export.
4. Ajouter un controle de bundle dans la CI pour surveiller `jsPDF`, `html2canvas`, `xlsx`, `chart.js`.
5. Standardiser les pages CRUD: liste, creation, edition, suppression, empty state, erreurs, pagination.

### Priorite P2

1. Completer l'i18n pour les textes visibles des features.
2. Ajouter des tests d'accessibilite simples sur les composants partages et formulaires majeurs.
3. Ajouter une documentation courte de contribution frontend: conventions de nommage, imports alias, tests requis.
4. Nettoyer les scripts de migration anciens si la migration est terminee.
5. Prevoir des tests e2e pour les parcours administrateur, finance et enseignant.

## Commandes utiles

```bash
npm run build
npm run test
npm run test:students
npm run architecture:check
```
