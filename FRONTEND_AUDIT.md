# FRONTEND_AUDIT — ecoledesk-frontend

**Projet :** `C:\school\ecoledesk-frontend` (package `school-management`, titre "Gestion École Primaire")
**Date d'audit :** 2026-09-09
**Méthode :** lecture intégrale des fichiers `.ts`, `.html`, `.scss` sources sous `src\app` (~579 fichiers inventoriés ; 448 `.ts` dont specs, 83 `.html`, 48 `.scss`), des fichiers de configuration racine, et des documents de doctrine du projet.
**Règle de véracité :** aucune information n'est inférée ; tout ce qui est rapporté provient du code réel. Les valeurs non vérifiables sont marquées `NON DÉFINI`.

---

## 1. Architecture détectée

### 1.1 Vue d'ensemble

Application Angular **100 % Standalone Components** (aucun `*.module.ts` sous `src/app`), organisée en 5 dossiers racine sous `src/app` :

```
src/
├── main.ts                        → bootstrapApplication(AppComponent, appConfig)
├── index.html                     → <html lang="fr">, titre "Gestion École Primaire"
├── styles.scss                    → Tailwind + @layer components (design system) + styles d'impression (bulletin + reçu de paiement)
├── environments/
│   ├── environment.ts             → dev : http://localhost:8080/api
│   └── environment.prod.ts        → prod : /api, /billing-api, /attendance-api
├── assets/                        → images, i18n_lang.json, logo
└── app/
    ├── app.component.{ts,html,scss}
    ├── app.config.ts              → ApplicationConfig (providers racine)
    ├── app.routes.ts              → routing racine
    ├── enums/                     → gender.ts, typePaiement.enum.ts, typeTrimestre.enum.ts
    ├── core/                      → services transverses, guards, interceptors, sécurité, état global
    ├── shared/                    → UI kit, directives, pipes, validators, value objects, scaffolds de page
    ├── layout/                    → MainLayout (shell) + header/nav/sidebar/footer + forbidden
    └── features/                  → 24 features métier, organisées en DDD pour les plus récentes
```

### 1.2 `core/`

| Dossier | Contenu |
|---|---|
| `authentication/` | `token.service.ts` (wrapper access/refresh sur `SessionService`) |
| `config/` | `api-base-url.ts` + fournisseur `API_BASE_URL` |
| `configuration/` | `api-endpoints.config.ts` (centralisation de tous les endpoints) |
| `constants/` | `permissions.constants.ts` (`APP_PERMISSIONS`), `roles.constants.ts` (`APP_ROLES`, `ROLE_GROUPS`) |
| `context/` | `school-context.service.ts` (année scolaire / trimestre / séquence actifs) |
| `errors/` | `app-error.model.ts` (`AppError`, `toAppError`) |
| `guards/` | `auth.guard.ts`, `role.guard.ts`, `permission.guard.ts` (+ specs) |
| `i18n/` | `i18n-lang.loader.ts` (`I18nLangLoader`) |
| `interceptors/` | `auth.interceptor.ts`, `error.interceptor.ts`, `loading.interceptor.ts`, `http-context-tokens.ts` |
| `models/` | `api.models.ts` (`PageRequest`, `PageResponse<T>`, `ApiResponse<T>`…), `auth.models.ts`, `auth-state.model.ts`, `i18n.model.ts`, `navigation.model.ts`, `notification.model.ts`, `roles.type.ts` |
| `notification/` | `notification.service.ts` (WebSocket STOMP + notifications manuelles) + `notification.component.*` |
| `security/` | `access-policy.ts` (`AccessPolicy`, `ACCESS_POLICIES`), `rbac.service.ts` |
| `services/` | `auth.service.ts`, `browser-api.service.ts`, `global-search.service.ts`, `i18n.service.ts`, `loading.service.ts`, `session.service.ts`, `storage.service.ts`, `theme/theme.service.ts` |
| `state/` | `app.state.ts` (compteur de requêtes, sidebar state — signals) |
| `tokens/` | `api-base-url.token.ts` (`API_BASE_URL`) |
| `utils/` | `date.utils.ts`, `file.utils.ts`, `string.utils.ts` |

Toutes les entrées de `core/` sont ré-exportées via des barrels `index.ts`.

### 1.3 `shared/`

- **UI kit** `shared/ui/` : `alert`, `avatar`, `badge`, `button`, `card`, `empty-state`, `input`, `modal`, `pagination`, `select`, `skeleton`, `table`, `textarea`, `toast`.
- **Scaffolds de page** : `page-layout` (`app-page-layout` : `max-w-7xl` + `space-y-6`), `page-header` (titre + zone actions), `form-body` (grille 2 colonnes sm), `page-form-body` (bandeau `bg-white shadow`).
- **Composants métier partagés** : `components/photo-upload`, `language-switcher`, `schoolIllustration`, `theme`.
- **Directives** : `auto-focus`, `has-permission`, `has-role`, `loading` (`[appLoading]` overlay spinner), `status-badge`.
- **Pipes** : `currency-fcfa`, `grade-mention`, `month-label`, `student-name`.
- **Validators** : `date-range.validator.ts`, `matricule.validator.ts`, `phone.validator.ts`.
- **Value objects & domaines** : `shared/domains/value-objects/` (`base-id.ts`, `email.ts`, `PageResponse.model.ts`) et **doublon hérité typo** `shared/domaines/value-objects/` (`basseId.ts`, `email.ts`).
- **Utils** : `form.utils.ts`, `table.utils.ts`.
- `shared/BaseEntity/domain/entity/baseEntity.ts`.

### 1.4 `layout/`

- `MainLayout.component.ts` : shell route `''` protégée par `authGuard`, rend `app-nav` + `<router-outlet/>`.
- `layout.service.ts` : responsive (`BreakpointObserver` + `toSignal(isMobile)`), état `sidebarOpen` (signal) + `effect`.
- `sidebar/` : menu multi-catégories, icônes SVG inline (sprites heroicons), RBAC via `accessPolicy` (`isItemVisible`), état des menus par signals.
- `header/` : avatar, thème, langue, recherche globale (debounce + `switchMap`), notifications.
- `nav/`, `footer/`, `forbidden/` : bars. `footer.component.html` = simple placeholder.

### 1.5 `features/` — 24 features

| Feature | Maturité (structures internes) |
|---|---|
| `auth` | Simple + DDD partiel (login/register/forgot/reset) |
| `attendance` | **DDD complète** : `application/{facades,use-cases}`, `domain/{models,repositories,services}`, `infrastructure`, `presentation/{absence,daily,justification,store}` |
| `classes` | DDD partielle : use-cases + repositories/domain + `presentation/{list,form,assignments}` |
| `communication` | Coming-soon (composant simple) |
| `dashboard` | DDD : use-case + repository + domain service + `presentation/dashboard` (charts) |
| `enrollment/students` | **DDD de référence** : facades, use-cases, store signals, mappers, value objects, repository token |
| `gestion-annees` | Simple : service direct `AnneeScolaireService` |
| `grades` | DDD riche : dtos, facades, mappers, use-cases, `bulletin`, `reports`, exports PDF/Excel, store |
| `inscriptionstudent` | Simple : réutilise le pipeline `PaymentFormUseCase` |
| `montant` | Simple : service direct + routes (avec alias typo `MotantRoutes`) |
| `parent` | DDD partielle : facade + repository + entities/VO |
| `payments` | DDD riche : facades, use-cases, stores, receipts (PDF/impression), pagination serveur |
| `pre-enrollments` | DDD : repository HTTP `PageResponse<T>`, pages list/detail/wizard |
| `reports` | DDD : use-cases + repository + domain service (mais service hérité `reports.service.ts` restant) |
| `search` | DDD partielle : facade + service `advanced-search` |
| `section` | Simple |
| `sequence` | Simple : service + routes |
| `settings` | Simple (5 services infrastructure) + `settings/users` en DDD |
| `staff` | DDD : use-cases + repository |
| `students` | **Shim de ré-export** vers `enrollment/students` (ne pas étendre) |
| `subjects` | Simple : service + routes (contient des artefacts `dist/` commités) |
| `support` | Simple : services help-center/contact |
| `teachers` | DDD : use-cases + repository + schedule/subjects |
| `trimestre` | Simple : service + routes |

**Patterns d'infrastructure par feature :**
- Features **DDD / repository token** : enrollment/students, payments, reports, dashboard, pre-enrollments, parent, settings/users, attendance, grades, staff, teachers, classes.
- Features **service direct `HttpClient` (`providedIn: 'root'`)** : gestion-annees, montant, sequence, trimestre, section, subjects, support, settings (services simples).
- Les adaptateurs de repository sont fournis **au niveau de la route** (array `providers` du composant page) via `useExisting: <ConcreteAdapter>` derrière le token (`ENROLLMENT_REPOSITORY`, `PAYMENT_LIST_REPOSITORY`, `REPORT_REPOSITORY`, etc.).

### 1.6 Routing racine (`app.routes.ts`)

- Bloc hors-layout : `auth` → lazy `AUTH_ROUTES`.
- Bloc layout (`''` + `MainLayoutComponent` + `canActivate: [authGuard]`) :
  - `''` → redirect `dashboard` ; `**` → redirect `dashboard`.
  - Chaque feature = `loadChildren`/`loadComponent` lazy + `canActivate: [roleGuard, permissionGuard]` + `data.accessPolicy` / `data.roles` / `data.permissions` (voir §5.5).
  - Routes de compat : `parents*` → redirect `guardians*`.
- `app.config.ts` : `provideRouter(appRoutes, withComponentInputBinding(), withEnabledBlockingInitialNavigation(), withPreloading(PreloadAllModules))`, `provideHttpClient(withFetch(), withInterceptors([...]))`, `provideAnimations()`, `API_BASE_URL_PROVIDER`, `TranslateModule.forRoot({ defaultLanguage: 'fr' })` + `APP_INITIALIZER` → `I18nService.init()`.
- **Aucun resolver** dans le projet (chargement en `ngOnInit` des composants / use-cases).

---

## 2. Technologies détectées

| Technologie | Version | Usage |
|---|---|---|
| Angular | `^18.2.13` | Framework, standalone, signaux |
| TypeScript | `~5.4.2` | strict, `ES2022` |
| RxJS | `~7.8.0` | HTTP, souscriptions, `BehaviorSubject` résiduels |
| Tailwind CSS | `^3.4.17` + `@tailwindcss/forms` | Design system principal |
| SCSS | — | `styles.scss` (2 000 lignes) + fichiers `.scss` de composants (majoritairement vides) |
| @angular/cdk | `^18.2.13` | `BreakpointObserver` (layout), `Breakpoints` |
| @angular/material | `^18.2.13` | installé ; **non utilisé** dans les composants audités (usage résiduel `NON DÉFINI`) |
| @ngx-translate/core + http-loader | `^15.0.0` | i18n fr/en via `I18nLangLoader` + fichier `assets/i18n/i18n_lang.json` |
| chart.js / ng2-charts | `^3.9.1` / `^3.1.2` | dashboards |
| xlsx | `^0.18.5` | export/import Excel (élèves, notes) |
| jspdf + html2canvas | `^4.2.1` / `^1.4.1` | export PDF (bulletins, reçus) |
| angularx-qrcode | `^18.0.2` | QR codes |
| @stomp/stompjs + sockjs-client | `^7.1.1` / `^1.6.1` | WebSocket de notifications |
| Jasmine + Karma | ~4.6 / ~6.4 | tests unitaires (`ng test`) |
| Node | — | scripts `architecture:check` (frontières DDD), `test:students` |

**Absents :** NgRx/NGXS/Akita (pas de state management externalisé), ESLint, Prettier, stylelint, nx, resolvers, HTTP clients dédiés par microservice, PrimeNG.

**Build :** `@angular-devkit/build-angular:browser`, budgets `initial 650kb/1mb`, `anyComponentStyle 6kb/10kb`, `allowedCommonJsDependencies: [sockjs-client, html2canvas, canvg, dompurify, raf, rgbcolor]`.

---

## 3. Patterns détectés

### 3.1 Composants

- **Standalone partout** ; `changeDetection: ChangeDetectionStrategy.OnPush` sur la majorité des composants de `shared/ui` et les composants "smart" récents. Certains composants (layout, auth) restent en détection par défaut.
- **API d'entrées hétérogène :**
  - **Majorité** : `@Input()` / `@Output()` + `EventEmitter` (ex. `ButtonComponent`, `InputComponent`, `HeaderComponent`, `student-list`).
  - **Signal inputs** (`input()`, `computed`) : `EmptyStateComponent`, `SkeletonComponent`, `LoadingDirective` — signe d'une migration partielle vers les signaux.
- **CVA** (ControlValueAccessor) pour la saisie : `InputComponent` (avec toggle password), `SelectComponent`, `TextareaComponent`, `PhotoUploadComponent`.
- **Templates inline** pour composants simples : `modal`, `pagination`, `skeleton`, `empty-state`, `forbidden`, `coming-soon`, `theme`, `language-switcher`, `reset-password`.
- **Lifecycle** : `OnInit` omniprésent pour le chargement initial ; `OnDestroy` uniquement là où des souscriptions existent ; `OnChanges`/`AfterViewInit` pour les CVA et le modal (gestion focus/`aria`).
- **Composants conteneur/présentation** : la page (ex. `student-page`) injecte store/facade, les composants enfants (`student-list`, `student-form`) reçoivent `@Input`/émettent `@Output`.

### 3.2 Services & Injection de dépendances

- **`providedIn: 'root'`** pour les services transverses (`AuthService`, `SessionService`, `StorageService`, etc.) et les services simples par feature.
- **Pattern Repository port + InjectionToken + adaptateur infrastructure** pour les features "modernes" :
  - `domain/repositories/X.repository.ts` définit l'interface + `export const X_REPOSITORY = new InjectionToken<XRepository>('X_REPOSITORY')`.
  - `infrastructure/X.repository.ts` implémente l'adaptateur.
  - Le composant page fournit dans ses `providers` : `ConcreteAdapter`, `{ provide: X_REPOSITORY, useExisting: ConcreteAdapter }`, puis `DomainService`, `Store`, `UseCase`, `Facade`.
  - Exemples vérifiés : `ENROLLMENT_REPOSITORY`, `PAYMENT_LIST_REPOSITORY`, `PAYMENT_RECEIPT_REPOSITORY`, `REPORT_REPOSITORY` (fourni au niveau composant de report).

### 3.3 Gestion d'état

- **Signals + stores "maison"** (le pattern de référence) : `enrollment.store.ts`, `student-page.store.ts`, `attendance-daily.store.ts`, `payment-receipt.store.ts`, `grade-list.store.ts`.
  - Convention : propriétés privées `_foo = signal<T>(...)`, expositions publiques `readonly foo = this._foo.asReadonly()`, méthodes `async` avec `try/catch/finally`, résultat d'action typé `{ success, kind, message }` (`StoreActionResult` dans enrollment.store).
  - `computed` pour dérivations (pagination, filtres, options de formulaire).
- **Facade → UseCase → Store** : `StudentEnrollmentFacade` expose les read-only du use-case et délègue les actions ; `use-case` valide et appelle le store ; le store appelle le repository. Le composant n'injecte souvent que le store ou la facade.
- **`rxjs` interop** : `toSignal(BreakpointObserver...)`, `takeUntilDestroyed(this.destroyRef)`, `firstValueFrom`.
- **Résidus `BehaviorSubject`** : `school-context.service.ts` (`contextChangedSubject` + `contextChanged$`), `notification.service.ts` (`notificationsSubject`), `auth.service.ts` (`isAuthenticatedSubject`/`isAuthenticated$`).
- **État global minimal** : `core/state/app.state.ts` (compteur `pendingRequests` → `isLoading` computed, `sidebarOpen`).

### 3.4 Formulaires

- **Reactive Forms (FormBuilder)** partout. Exemple canonique : `enrollment-form.builder.ts` — `FormGroup` typé (`EnrollmentFormGroup` type), contrôles `nonNullable` + `Validators.required`, méthodes `create()`.
- **Validators partagés** : `date-range.validator.ts` (rangée entre deux contrôles), `matricule.validator.ts`, `phone.validator.ts`.
- **Gestion erreur de champ** : les CVA reçoivent `[control]="form.get('x')"` et affichent `hasError` (invalid + touched/dirty), `errorEntries` avec messages par défaut FR (fusionnés avec `errorMessages` fournis). `markAllAsTouched()` pour soumettre.
- **CVA bindés** en `[(ngModel)]` dans certains composants récents (`grade-list-page`) et en `formControlName` dans d'autres (`login`) — double style d'usage des mêmes composants.

### 3.5 Appels HTTP

- `HttpClient` direct dans les services (simple et parfois dans les adaptateurs).
- **3 intercepteurs fonctionnels** (`app.config.ts`) :
  1. `auth.interceptor` : injecte `Authorization: Bearer <token>`, **refresh token avec queue** (`refreshRequest$` + `shareReplay` + `SKIP_AUTH_REFRESH` context token), logout sur échec refresh.
  2. `error.interceptor` : `toAppError()`, navigation `/auth/login` sur 401, toast d'erreur via `NotificationService.error` sauf requête silencieuse.
  3. `loading.interceptor` : `LoadingService.show()/hide()` sauf requête silencieuse.
- **Requêtes silencieuses** : `SILENT_REQUEST` (HttpContextToken) et en-têtes hérités `X-Silent` / `X-Silent-Error` (tolérés pour compat, à éviter). Utilisé par `refreshSession`, `school-documents.repository` (`forkJoin`), dépôts de pré-inscription.
- **Base URL multiple** : `environment.apiUrl` / `billingApiUrl` / `attendanceApiUrl` ; `API_ENDPOINTS` centralise les chemins (`core/configuration/api-endpoints.config.ts`).
- **Contexte scolaire global** : `SchoolContextService` charge années/trimestres/sequences (forkJoin), filtre par `computed`, persiste la sélection par utilisateur.

### 3.6 Erreurs & notifications

- **`AppError`** : `{ status, statusGroup, message, code, details, isNetworkError }` + `toAppError(unknown)` + messages FR par statut.
- **`NotificationService`** : notifications WebSocket (STOMP `/ws`, subscription `/user/{id}/notifications`) + API manuelle `success/error/info/warning(message, targetId)` → `NotificationComponent` dans le header.
- **`ToastComponent`** (`shared/ui/toast`) : auto-dismiss (duration), variantes `neutral/info/success/warning/danger`, intégré commerce par page (ex. `student-page` — signal `toast` local).
- **Alert inline** : `app-alert` et blocs Tailwind `bg-red-50 dark:bg-red-900/20`.
- **Anti-motif résiduel** : `confirm()`/`alert()` natifs dans `student-page.component.ts:323`, `teacher-list`, `staff-form` (voir §7).

### 3.7 Rôles, permissions, guards

- **Centrale RBAC** : `APP_PERMISSIONS` (`X:read/X:write`, valeurs `'students:read'`…), `WILDCARD_PERMISSION='*'`, `ROLE_PERMISSION_DEFAULTS` (par rôle), `ROLE_GROUPS` (`STAFF`, `FINANCE`, `ACADEMIC`, `ADMIN_ONLY`), `ACCESS_POLICIES` (map `{ roles?, permissions?, requireAllPermissions? }`).
- **Guards** : `authGuard` (redirige `/auth/login`), `roleGuard`, `permissionGuard` — fonctions `CanActivateFn` + `inject()`, redirigent vers `/forbidden`.
- **UI RBAC** : directives `hasPermission` / `has-role` (masquage via `*ngIf` équivalent), `RbacService.canAccess(policy)/hasPermission/hasEveryPermission`.
- **Auth** : JWT access + refresh stockés en session storage via `SessionService`/`TokenService` ; `AuthService.login/register/forgotPassword/resetPassword/refreshSession/logout`.

### 3.8 Pagination & tableaux

- **`app-pagination`** (`shared/ui/pagination`, template inline) : `pageChange` event, libellés i18n (`common.pageOf`, `common.previous/next`).
- **`app-table`** (`shared/ui/table`) : enveloppe `<table>` avec projection `[table-head]`/`[table-body]`, gère l'empty state via `app-empty-state`, scroll horizontal, dark mode. **Très peu utilisé en pratique** (voir §7).
- Pagination **côté client** (signal + `computed`: `paginatedGrades`, `totalPages`) pour grades ; **côté serveur** pour pre-enrollments/payments (`sort=creationDate,desc`).
- La plupart des listes **réécrivent** leurs tableaux inline avec Tailwind (`student-list`, `grade-list-page`, `pre-enrollment-list`, `montant`) au lieu de `app-table`.

### 3.9 Exports & documents

- Excel : `xlsx` (dynamic import) + `FileReader` (imports avec prévisualisation/validation) — `student-file-export.service.ts`, `grade-file-export.service.ts`.
- PDF : `jspdf` + `html2canvas` ; **documents d'impression** : bulletin scolaire (styles `bulletin-*`, A4, watermark, mention) et reçu de paiement (`payment-receipt-*`), variantes `--pdf`.

---

## 4. Design System détecté

### 4.1 Tailwind (`tailwind.config.js`)

- `darkMode: "class"` → dark mode contrôlé par la classe `.dark` sur `<html>` (`ThemeService`).
- `content: ["./src/**/*.{html,ts}"]`.
- **Couleur unique étendue** : palette `primary` (bleu/ciel) — `DEFAULT #1e3a8a`, 50→950 (`#f0f9ff`…`#082f49`).
- **Animation** : `scroll` (15s linear infinite) + keyframes (marquee).
- **Plugin** : `@tailwindcss/forms`.
- Tout le reste = palette Tailwind par défaut (`gray`, `slate`, `blue`, `green`, `emerald`, `amber`, `red`, `sky`, `cyan`).

### 4.2 Design system SCSS (`src/styles.scss`, `@layer components`)

**Boutons** (base `.btn` + tailles `.btn-sm/.btn-md/.btn-lg` + variantes) : `.btn-primary`, `.btn-secondary`, `.btn-success`, `.btn-warning`, `.btn-danger`, `.btn-neutral`, `.btn-ghost`. Tous : `inline-flex items-center gap-2 rounded-md transition-colors focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed`, avec variante `dark:` systématique.

**Formulaires** : `.form-label`, `.form-control` (bordure `primary-300`/focus `ring-primary-500`, dark `gray-800`), `.form-error` (rouge), `.form-hint` (gris).

**Cartes** : `.card` (`bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 rounded-lg p-6`), `.card-header`.

**Badges** : `.badge` + `.badge-xs/.badge-sm` + `.badge-neutral/.badge-info/.badge-primary/.badge-success/.badge-warning/.badge-danger` (rounded-full, ring-1 ring-inset, dark variants).

> **Note :** les composants `shared/ui/*` ont leurs propres classes (ex. `CardComponent` utilise `bg-white dark:bg-slate-700 rounded`, `BadgeComponent` utilise `.badge badge-xs badge-info`...) — deux sources de vérité stylistique coexistent (§7).

### 4.3 Thème & dark mode

- `ThemeService` (`core/services/theme/`) : bascule classe `.dark`, persistance (`NON DÉFINI` — mécanisme localStorage non confirmé), composant `shared/theme/theme.component`.
- **Dark mode omniprésent** dans les templates : presque chaque classe est doublée en `dark:`.

### 4.4 Impression (`@media print`)

- Bulletin : A4, `@page { size: A4; margin: 10mm }`, suppression décors écran, `print-color-adjust: exact`, variante `.bulletin-shell--pdf`.
- Reçu paiement : styles `payment-receipt-*` + variantes PDF et responsive (breakpoints 1024/960/720).

---

## 5. Conventions détectées

### 5.1 Nommage

- Fichiers : **kebab-case** ; suffixes canoniques `.component.ts|.html|.scss`, `.service.ts`, `.guard.ts`, `.interceptor.ts`, `.directive.ts`, `.pipe.ts`, `.validator.ts`, `.model.ts`, `.repository.ts`, `.use-case.ts`, `.facade.ts`, `.store.ts`, `.routes.ts`.
- Classes : **PascalCase** + suffixe (ex. `GradeListPageComponent`, `StudentEnrollmentFacade`, `EnrollmentStore`).
- Sélecteurs : préfixe **`app-`** (`app-button`, `app-input`, `app-page-layout`).
- Routes : **kebab-case**, fichiers `{feature}.routes.ts`, exports `const X_ROUTES` (parfois `Routes`).
- Barrels `index.ts` dans chaque dossier de `core/`, `shared/` (utils) et plusieurs features.
- Variables/private signals : convention `_state = signal(...)` + `readonly state = this._state.asReadonly()` (mais non universelle ; `GoldListStore` expose `readonly grades = signal(...)` sans `_`).
- Énumérations : `gender.ts`, `typePaiement.enum.ts`, `typeTrimestre.enum.ts` (fichier racine `enums/` = hors feature).

### 5.2 Alias de modules (`tsconfig.json`)

`@app/*` → `src/app/*`, `@core/*`, `@shared/*`, `@features/*`, `@environments/*`. **Les imports relatifs coexistent avec les alias** (ex. `@features/payments/...`, `@app/core/...`, relatifs `../../domain/...` dans les features).

### 5.3 Options TypeScript/Angular strictes

`strict: true`, `noPropertyAccessFromIndexSignature`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `angularCompilerOptions.strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers`, `useDefineForClassFields: false`, `enableI18nLegacyMessageIdFormat: false`.

### 5.4 Tests

- Jasmine + Karma (`ng test`), fichiers `.spec.ts` colocalisés (services, guards, interceptors, stores, composants, repositories, mappers, domain services, routes).
- Script spécifique : `npm run test:students` (Karma ChromeHeadless sur `src/app/features/students/**/*.spec.ts`).
- **Convention verbose : pas de tests E2E détectés.**

### 5.5 Sécurisation des routes (modèle)

Chaque route enfant = `canActivate: [roleGuard, permissionGuard]` + `data: { accessPolicy: ..., roles?, permissions? }`. Les routes "legacy" utilisent `ACCESS_POLICIES` vides (`authenticated`, `subjects`, `parents`, `communication`, `support`, `dashboard`). Les routes sensibles utilisent des policies explicites (`studentsRead`, `paymentsRead`, `settingsRead`…).

### 5.6 Qualité archi (script `architecture:check`)

`scripts/architecture-check.mjs` (via `npm run architecture:check`) sanctionne :
- `presentation/**` ne doit pas importer `@angular/common/http` / `HttpClient` / `environment.*ApiUrl`.
- interdiction du chemin `shared/domaines` (→ `@shared/domains`).
- `domain/**` ne doit pas utiliser `HttpClient`.
- `application/**` ne doit pas appeler `HttpClient`.
- interdiction du type `any` (sauf commentaire eslint).

> **Conséquence :** tout le code de `presentation`, `domain`, `application` doit passer par repository/adapter infrastructure. Les features "simples" (qui appellent `HttpClient` dans leurs services en `infrastructure/` et injectent le service directement dans le composant **sans token**) respectent encore la limite si le composant n'importe pas `HttpClient` directement — potentiellement des violations non analysées par le script (injection du service concret dans presentation reste permis par le script).

---

## 6. Composants réutilisables

### 6.1 UI kit (`shared/ui`) — à réutiliser en priorité

| Composant | Sélecteur | Rôle vérifié |
|---|---|---|
| `button` | `app-button` | variant/size/type/disabled/loading/fullWidth/prefixIcon, `clicked` output, aria : label/controls/expanded/pressed/busy |
| `input` | `app-input` | CVA, type (incl. password toggle), label/id auto, required/readonly/hint, `[control]` pour erreurs, `errorMessages`, min/max/pattern/autocomplete |
| `select` | `app-select` | CVA, `options: SelectOption<T>[]`, placeholder `-- Choisir --`, autofocus, `[control]` |
| `textarea` | `app-textarea` | CVA, rows, hint, `[control]`, `errorMessages` |
| `card` | `app-card` | padding none/sm/md/lg, hoverable |
| `badge` | `app-badge` | variant neutral/info/success/warning/danger, size xs/sm, dot |
| `alert` | `app-alert` | type success/error/warning/info, title, message |
| `modal` | `app-modal` | open/title/size sm·md·lg·xl, closeOnBackdrop/Escape, focus trap + tab, `closed` output, `[modal-footer]` |
| `toast` | `app-toast` | visible/title/message/variant/duration, `dismissed` |
| `table` | `app-table` | projection `[table-head]`/`[table-body]`, empty-state intégré, scroll, label aria |
| `pagination` | `app-pagination` | currentPage/totalPages, `pageChange`, libellés i18n |
| `empty-state` | `app-empty-state` | title/description/icon/actionLabel, `actionClicked` |
| `skeleton` | `app-skeleton` | count/height/width/containerClass |
| `avatar` | `app-avatar` | src/name/size/status/rounded, fallback initiales |

### 6.2 Scaffolds de mise en page

| Composant | Usage |
|---|---|
| `app-page-layout` | section `max-w-7xl space-y-6`, projette `app-page-header` + contenu |
| `app-page-header` | h1 titre + zone actions |
| `app-form-body` | grille `sm:grid-cols-2` pour champs |
| `app-page-form-body` | bandeau blanc/shadow pour bloc formulaire |
| `app-language-switcher` / `app-theme` | langue + dark mode |
| `app-school-illustration` | illustration (page login) |

### 6.3 Directives / pipes / validators

- `[appLoading]` (overlay spinner), `hasPermission`, `hasRole` (`*hasPermission="...`), `[appStatusBadge]`, `appAutoFocus`.
- `gradeMention`, `monthLabel`, `studentName`, `currencyFcfa` (**vide — cassé**).
- `phoneValidator`, `matriculeValidator`, `dateRangeValidator`.

---

## 7. Problèmes détectés

### 7.1 — Critique

| # | Problème | Localisation vérifiée |
|---|---|---|
| C1 | **Regex mal formée** `/^\+2376\d{8 $/` (accolade fermante manquante) + préfixe camerounais codé en dur → crash à la validation / fausse validation | `features/parent/domain/value-objects/phone-number.vo.ts:27` |
| C2 | **`currency-fcfa.pipe.ts` vide** → pipe enregistré mais à sortie vide (monnaie cassée partout où elle est utilisée) | `shared/pipes/currency-fcfa.pipe.ts` |

### 7.2 — Important

| # | Problème | Localisation vérifiée |
|---|---|---|
| I1 | `attendance-api.service.ts` **vide** (placeholder non câblé) | `features/attendance/infrastructure/attendance-api.service.ts` |
| I2 | `DailyAttendanceRepositoryAdapter.getInscriptionsByClass()` renvoie une liste vide (endpoint `/inscription` non implémenté) → "strictMode silent fail" | `features/attendance/infrastructure/daily-attendance.repository.ts` |
| I3 | **Services d'infra dupliqués pour reports** (ancien `ReportsService` + nouveau `ReportRepositoryAdapter` frappent tous deux `/reports/*`) | `features/reports/infrastructure/reports.service.ts`, `report.repository.ts` |
| I4 | **`confirm()`/`alert()` natifs** mélangés au design modal/toast | `features/enrollment/students/presentation/pages/student-page.component.ts:323`, `features/teachers/presentation/list/teacher-list.component.ts`, `features/staff/presentation/form/staff-form.component.ts` |
| I5 | **Chaînes Françaises codées en dur** dans les pages pré-inscription (non passées par la pipe `translate`) | `features/pre-enrollments/presentation/pages/*.html` (+ nombreux libellés `student-page`) |
| I6 | **Deux "styles de composants" dans `shared/ui`** : `@Input`/`@Output` vs `input()` signals (`EmptyStateComponent`, `SkeletonComponent`, `LoadingDirective`) | `shared/ui/empty-state`, `shared/ui/skeleton`, `shared/directives/loading.directive.ts` |
| I7 | **Doublons de rôles** : `TEACHER`/`ENSEIGNANT`, `STUDENT`/`ELEVE` présents à la fois dans l'union `UserRole` et `ROLE_PERMISSION_DEFAULTS` | `core/models/roles.type.ts`, `core/constants/permissions.constants.ts` |

### 7.3 — Amélioration

| # | Problème | Localisation vérifiée |
|---|---|---|
| A1 | **`app-table` contournée** : la plupart des listes réécrivent leurs `<table>` (incohérence + duplication) | `grade-list-page.component.html`, `student-list.component.html`, `pre-enrollment-list`, `montant.component.html` |
| A2 | **`shared/domaines` (typo) en doublon** de `shared/domains` (compat laissée en place) ; `basseId.ts` vs `base-id.ts` | `shared/domaines/value-objects/*` |
| A3 | **`features/students` = shim de ré-export** vers `enrollment/students` | `features/students/students.routes.ts` |
| A4 | Artefacts **`dist/` commités sous `features/subjects/presentation/{create,list}/dist/*.html`** (dupliquent les templates réels) | `features/subjects/presentation/**` |
| A5 | Alias typo `export const MotantRoutes = MontantRoutes` (export mort propagé par copie) | `features/montant/montant.routes.ts` |
| A6 | **`input.component.html`** utilise la syntaxe attribut à quote simple (`[type]='type'`) — compile mais incohérente | `shared/ui/input/input.component.html` |
| A7 | Redirection d'édition des enseignants vers `/staff/new` (couvre un écran d'un autre module) | `features/teachers/presentation/form/teacher-form.component.ts` |

### 7.4 — Cosmétique / dette

| # | Problème | Localisation vérifiée |
|---|---|---|
| D1 | **48 fichiers `.scss` quasi vides** (0–1 ligne) — style 100% Tailwind dans les templates ; SCSS vide = bruit | partout |
| D2 | `footer.component.html` = `<p>footer works!</p>` (placeholder) | `layout/footer/footer.component.html` |
| D3 | Deux sources de vérité pour les cartes/badges : classes SCSS (`styles.scss`) vs classes des composants `shared/ui` (`CardComponent`: `dark:bg-slate-700` vs `.card`: `dark:bg-gray-800`) | `styles.scss` vs `shared/ui/card`, `shared/ui/badge` |
| D4 | Style d'usage des CVA variable : `[(ngModel)]` (grade-list) vs `formControlName` (auth) vs `[control]` (login) — même composant utilisé différemment | `grade-list-page.component.html`, `login.component.html` |
| D5 | Barils/doublons d'export (ex. `auth.models.ts` ne fait que ré-exporter `roles.type.ts`). `api.models.ts` vs `PageResponse.model.ts` dans shared/domains | `core/models/auth.models.ts`, `shared/domains/value-objects/PageResponse.model.ts` |
| D6 | Mixieurs `_` pour les signals privés : convention non uniforme (`EnrollmentStore` `_students`, `GradeListStore` `readonly grades = signal(...)`) | `enrollment.store.ts` vs `grade-list.store.ts` |
| D7 | Bloc de code commenté volumineux dans `login.component.html` (ancienne UI conservée en commentaire) | `login.component.html:1-63` |
| D8 | README/architecture `docs/ARCHITECTURE-CURRENT.md` mentionne PrimeNG/Material comme option — document non à jour du choix effectif (design system custom) | `docs/*.md` |

---

## 8. Incohérences

1. **Deux "mondes" parallèles par feature** : `domain/repository/token` + store + facade + use-case (enrollment, payments, grades, staff, teachers, attendance…) **vs** service `HttpClient` injecté directement dans le composant (montant, section, sequence, trimestre, subjects, annexes, support) — sans token. La limite `presentation != HttpClient` du script `architecture:check` n'est pas violée par les features simples seulement parce que le `HttpClient` vit dans le service, mais la frontière "port/adaptateur" est ignorée.
2. **API d'entrées de composants hétérogène** : `@Input`/`@Output` majoritaires, `input()`/`output()` dans `empty-state`, `skeleton`, `loading.directive`.
3. **Messages utilisateur FR sans/avec accents mélangés** : messages accentués (toasts `student-page`) et non accentués ("Veuillez selectionner...", "s de l'eleve") coexistent.
4. **RBAC** : utilisations redondantes `data.accessPolicy` ET `data.roles`/`data.permissions` sur certaines routes (`attendance`, `payments`…) alors que d'autres ne passent que `accessPolicy`.
5. **Pagination** : cliente (grades, enseignants, settings) vs serveur (pre-enrollments, payments) — deux implémentations.
6. **Style SCSS vs Tailwind** pour les primitives (`.card`/`.btn`/`.badge` dans `styles.scss`) vs classes Tailwind inline dans les composants `shared/ui`.
7. **`@tailwindcss/forms`** actif mais les CVA utilisent `.form-control` personnalisé — hybridation `form-control` vs classes tailwind nues (`border-gray-300 focus:border-blue-500`) dans les CVA (`input.component.ts:107`).
8. **`features/engglyphs`** : `enums/` hors feature (racine `app/enums`) alors que la convention features place les énumérations sous `domain/enums`.
9. Documentation (md) **inégale** : 30+ rapports/guides au fil du code, certains décrivant des décisions désormais contredites par le code (voir `RAPPORT_*.md`, `GUIDE_*.md`).

---

## 9. Risques

- **R1 — Build/runtime** : la regex malformée (C1) et le pipe vide (C2) peuvent casser la compilation stricte / produire des sorties UI incorrectes (montants sans devise).
- **R2 — Régression sur la frontière DDD** : le script `architecture:check` est un garde-fou puissant ; toute modification dans `presentation` qui touche `HttpClient`/`environment.*` casse le check. Les features simples n'ayant pas encore d'adaptateur risquent de voir leur composant court-circuiter le service.
- **R3 — Duplication de services/infra** (reports, le shim students, `domaines`) : deux implémentations du même endpoint → risque d'écart de contrat API et de corrections appliquées à une seule source.
- **R4 — i18n incomplète** : hardcoding FR dans les pages récentes → mauvaise expérience multi-langue, et duplication de catalogues (`i18n_lang.json` ne couvre pas tout).
- **R5 — Drag de stabilité** : WebSocket notifications reconnect (5 s), refresh JWT en queue simple (`refreshRequest$` partagé), état global minimal — les limites multitabs ne sont pas adressées.
- **R6 — Dette de maintenabilité** : 2 000 lignes de SCSS dans `styles.scss` + design system dupliqué dans `shared/ui` + templates inline → risque de divergence progressive.

---

## 10. Recommandations (sans modification — simples recommandations)

1. **Critique** : corriger la regex `phone-number.vo.ts` et remplir `currency-fcfa.pipe.ts` (ou supprimer/remplacer le pipe).
2. Supprimer les artefacts morts : `attendance-api.service.ts` vide, `features/subjects/presentation/**/dist/`, `MotantRoutes`, éventuellement `features/students` shim, `reports.service.ts` hérité.
3. **Choisir UN style d'entrées** pour les composants (signaux `input()` si le projet converge vers les signaux — cohérent avec les stores) et l'appliquer partout.
4. **Consolidation UI** : faire converger `shared/ui` sur les classes du design system `styles.scss` (card/badge) pour une seule source de vérité, puis généraliser `app-table` + `app-pagination`.
5. **Unifier la pagination** (serveur préférable) et le style d'usage des CVA (`formControlName` préféré — Reactif) en abandonnant `[(ngModel)]` dans les pages récentes.
6. **i18n** : passer toutes les chaînes FR au catalogue `assets/i18n/i18n_lang.json`.
7. **Remplacer `confirm()`/`alert()`** par `app-modal` + `app-toast` (pattern métier déjà en place dans `student-page`).
8. Rendre `architecture:check` plus strict pour les features simples (interdire l'injection du service concret dans `presentation` ; forcer token + adaptateur).
9. Publier de la documentation "état de l'art" unique (fusionner/archiver les multiples `RAPPORT_*`/`GUIDE_*`).

---

## 11. Informations absentes

- Version/usage effectif d'Angular Material : installé (`@angular/material ^18.2.13`) mais **aucun usage identifié dans les composants audités** → `NON DÉFINI`.
- Mécanisme de persistance du thème (localStorage clé ?) : non lisible dans les fichiers audités → `NON DÉFINI`.
- Détail du contrat API par endpoint (périodes scolaires, imports/exports CSV manquants) : non consolidé dans le code → `NON DÉFINI`.
- Règles de test systématiques par feature : seule `students` a un script dédié ; pas de convention documentée de couverture → `NON DÉFINI`.
- Convention externe (@ngx-translate — clés tabulées par module, gestion fichier unique) : non documentée hors code → `NON DÉFINI`.
- E2E : aucun outil/fichier de test E2E détecté.
- ESLint/Prettier : aucun (le code se fie à `tsc` + `architecture:check`).