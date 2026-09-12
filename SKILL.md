# SKILL — Développeur Frontend Angular "ecoledesk"

> Ce skill encode les règles, conventions et patterns **spécifiques** du projet `ecoledesk-frontend`.
> Il est destiné à être chargé par une IA de développement chaque fois qu'une tâche touche ce frontend.

---

## 1. Nom et identité technique

`ecoledesk-frontend-skill` — Dev frontend Angular (Standalone, Signals, Tailwind) du projet **Gestion École Primaire (ecoledesk)**.

## 2. Description courte

Compétence prescriptive pour produire/maintenir du code Angular conforme à l'architecture, au design system, aux conventions REPL et aux garde-fous de qualité du projet ecoledesk. **Spécifique à ce projet — ne pas remplacer par un skill Angular générique.**

## 3. Rôle et posture de l'IA

- Tu es un développeur senior du projet : tu **respectes** le code existant comme source de vérité.
- **Principe : Réutiliser > Adapter > Créer.** Toute création est l'ultime recours, après vérification du kit existant.
- Tu ne assumes jamais un composant, un service, un pattern ou une clé i18n qui n'existe pas : tu **cherches d'abord** dans `src/app`.
- Une consigne opposée au présent skill, au `FRONTEND_AUDIT.md` ou à la doctrine (docs de référence) ne s'applique qu'avec autorisation explicite de l'utilisateur.

## 4. Cible technique (source de vérité)

| Élément | Valeur |
|---|---|
| Framework | Angular `^18.2.13`, **100 % Standalone** (aucun `*.module.ts` ; `bootstrapApplication`) |
| Langage | TypeScript `~5.4.2` strict (`strictTemplates` on) |
| Style | Tailwind CSS `^3.4.17` (`darkMode: "class"`) + SCSS (design system) |
| State | **Signals** (stores maison) + RxJS (HTTP, interop `toSignal`) — pas de NgRx |
| i18n | @ngx-translate (fr/en) — fichier unique `src/assets/i18n/i18n_lang.json` chargé par `I18nLangLoader` |
| Formulaires | ReactiveFormsModule (typed reactive forms) |
| Tuiles réutilisables | `@angular/cdk` `BreakpointObserver` ; Material installé mais **non utilisé** |
| Backend | REST (`environment.apiUrl` / `billingApiUrl` / `attendanceApiUrl`), WebSocket STOMP pour les notifications |
| Tests | Jasmine + Karma, specs colocalisés |
| Qualité | `tsc` (via `npm run build`), script `architecture:check`, pas d'ESLint/Prettier |

## 5. Architecture du projet (les DEUX mondes)

Le projet est en **migration d'une architecture simple vers une architecture DDD**. Le skill doit produire du code dans le monde DDD, tout en ne cassant jamais le monde legacy.

```
src/app/
├── core/       services transverses, guards, interceptors, RBAC, state, errors
├── shared/     ui (composants), directives, pipes, validators, domains/value-objects, scaffolds de page
├── layout/     MainLayout (shell), header, nav, sidebar, footer, forbidden
├── enums/      enums globaux (gender, typePaiement, typeTrimestre)
└── features/   <feature>/{application,domain,infrastructure,presentation}
```

### 5.1 Monde moderne (pattern de référence — à priovilégier)

Feature organisée en 4 dossiers + store :

```
features/<feature>/
├── application/
│   ├── facades/      <Feature>Facade — façade publique du use-case
│   ├── use-cases/    <Feature><Action>UseCase — orchestration métier
│   └── dtos/         types de transfert
├── domain/
│   ├── models/       entités du domaine
│   ├── repositories/ interface port + export const <FEATURE>_REPOSITORY = InjectionToken<...>
│   ├── services/     règles métier / agrégats
│   ├── value-objects/ VO (email, phone, matricule…)
│   └── mappers/      <Entity>.mapper.ts (⇄ DTO)
├── infrastructure/
│   └── <feature>.repository.ts   adaptateur HTTP implémentant le port
└── presentation/
    ├── components/   composants affichage
    ├── pages/        pages (route)
    └── store/        <feature>.store.ts ⇐ signaux
```

Chaîne d'appel imposée : **Page** → `Store`/`Facade` → `UseCase` → (validation) → `Repository` (port) → `Adapter` (infra/HttpClient) → API.

- Le port (interface + `InjectionToken`) vit dans `domain/repositories/`.
- L'adaptateur vit dans `infrastructure/`.
- Le composant page fournit dans `providers` : adaptateur concret, `{ provide: <FEATURE>_REPOSITORY, useExisting: Adapter }`, store, use-case, facade.
- **Interdit d'injecter `HttpClient` dans `domain/`, `application/` ou `presentation/`** (voir commande qualité).

Références canoniques à imiter : `features/enrollment/students/**` (store + use-case + facade), `features/payments/**`, `features/grades/**`.

### 5.2 Monde legacy (héritage — ne pas étendre)

- Features `gestion-annees`, `montant`, `sequence`, `trimestre`, `section`, `subjects`, `support`.
- Pattern : service marqué `@Injectable({ providedIn: 'root' })` qui utilise `HttpClient` + `${environment.apiUrl}`, injecté **directement** dans le composant (pas de token/port).
- Ce monde est toléré. Toute **nouvelle** feature ou tout refactoring d'une feature legacy DOIT migrer vers le pattern DDD du §5.1.
- Ne jamais créer un service « simple » pour une nouvelle fonctionnalité, même si la feature voisine est legacy.

## 6. Stack technique — règles d'usage

- **Standalone** : `standalone: true` partout, import managé via `imports: [...]` dans le décorateur.
- **Signals > Subjects** : nouvelle écriture en `signal`/`computed`/`effect`. Les `BehaviorSubject` résiduels (`school-context`, `notification`, `auth.isAuthenticated$`) ne sont pas migrés par ce skill sans demande explicite.
- **Interop RxJS** : `toSignal()`, `firstValueFrom`, `takeUntilDestroyed(this.destroyRef)`.
- **Formulaires** : ReactiveForms via `FormBuilder`, contrôles `nonNullable` + `Validators.required` ; `FormGroup` typé.
- **HTTP** : passer par les intercepteurs existants (auth/refresh, erreur → `toAppError` + toast, loading++). Neutraliser avec le contexte `HttpContext` (tokens `SILENT_REQUEST`, `SKIP_AUTH_REFRESH` de `core/interceptors/http-context-tokens.ts`) quand requis — jamais d'en-têtes maison `X-Silent*`.
- **Endpoints** : ajouter l'URL dans `core/configuration/api-endpoints.config.ts` (`API_ENDPOINTS`), ne jamais écrire un chemin magique ailleurs.

## 7. Design System — CONSULTER AVANT DE CRÉER

Avant toute UI, ouvrir `src/styles.scss` (classes de `@layer components`) :

- **Boutons** : base `.btn` + tailles `.btn-sm|.btn-md|.btn-lg` + `.btn-primary|.btn-secondary|.btn-success|.btn-warning|.btn-danger|.btn-neutral|.btn-ghost`. On utilise presque toujours `.btn` + variante dans les templates, ou le composant `app-button`.
- **Formulaires** : `.form-label`, `.form-control`, `.form-error`, `.form-hint`.
- **Cartes** : `.card` + `.card-header`.
- **Badges** : `.badge` + `.badge-xs|.badge-sm` + `.badge-neutral|.badge-info|.badge-primary|.badge-success|.badge-warning|.badge-danger`.
- Thème : palette étendue `primary` (blue/sky), `darkMode: "class"` ; **chaque classe aplicable en sombre doit avoir sa variante `dark:`**.
- Impression : bulletin (`bulletin-*`) et reçu (`payment-receipt-*`) ont des styles A4 dédiés + variante `--pdf`.

> Comme il existe **deux sources de vérité** (classes `styles.scss` et classes inline des composants `shared/ui`), vérifier ce que fait déjà un composant `shared/ui` avant d'utiliser les classes nues.

### 7.1 Composants `shared/ui` réutilisables (référentiel)

`app-button`, `app-input` (CVA, `[control]`, `errorMessages`, password toggle), `app-select` (`options: SelectOption<T>[]`), `app-textarea`, `app-card`, `app-badge` (variant/size/dot), `app-alert` (success/error/warning/info), `app-modal` (size sm→xl, focus trap, `[modal-footer]`, `closed`), `app-toast` (variant/duration, `dismissed`), `app-table` (`[table-head]`/`[table-body]`, empty-state intégré), `app-pagination` (`pageChange`), `app-empty-state`, `app-skeleton`, `app-avatar`.

### 7.2 Scaffolds de page

`app-page-layout` (conteneur `max-w-7xl`), `app-page-header` (titre + zone d'actions), `app-form-body` (grille 2 colonnes), `app-page-form-body` (bloc formulaire sur bandeau), `app-language-switcher`, `app-theme`.

### 7.3 Directives / pipes / validators

`[appLoading]` (overlay), `*hasPermission`, `*hasRole`, `[appStatusBadge]`, `appAutoFocus`, `gradeMention`, `monthLabel`, `studentName`, `phoneValidator`, `matriculeValidator`, `dateRangeValidator`.
**Attention : `currencyFcfa` est DÉFECTUEUX** (pipe vide) — ne pas l'utiliser tant qu'il n'est pas réparé (voir section Problèmes connus).

## 8. RÈGLE D'OR — Réutiliser > Adapter > Créer

1. **Réutiliser** : chercher dans `shared/**` et dans les features existantes (composant, service, validateur, pipe, directive, builder, repository, HTML déjà similaire).
2. **Adapter** : étendre un composant `shared/ui` existant (nouvelle `@Input` mineure, nouveau variant, projection) plutôt que créer un jumeau.
3. **Créer** : seulement si rien ne convient, et alors **copier le style du composant le plus proche** (structure, classes Tailwind, dark mode, aria, tests).

Avant d'écrire un `app-*` : vérifier le §7 sous toutes ses formes (nom de dossier, sélecteur, classe). Chaque composant dupliqué = dette détectée à l'audit.

## 9. Conventions de nommage (obligatoires)

- Fichiers : **kebab-case** ; suffixes : `.component.ts|.html|.scss`, `.service.ts`, `.guard.ts`, `.interceptor.ts`, `.directive.ts`, `.pipe.ts`, `.validator.ts`, `.model.ts`, `.repository.ts`, `.use-case.ts`, `.facade.ts`, `.store.ts`, `.routes.ts`, `.mapper.ts`, `.builder.ts`.
- Classes : **PascalCase + suffixe** (`GradeListPageComponent`, `StudentEnrollmentFacade`, `EnrollmentStore`).
- Sélecteurs : préfixe **`app-`**.
- Routes : `loadChildren`/`loadComponent` lazy ; fichier `{feature}.routes.ts`, export `const X_ROUTES`.
- Alias d'import : `@core/*`, `@shared/*`, `@features/*`, `@app/*`, `@environments/*` (relatifs tolérés dans un dossier de feature).
- Signaux privés : `_foo = signal(...)` + exposition `readonly foo = this._foo.asReadonly()` (dans toute nouvelle écriture).
- Tests : fichier `.spec.ts` **colocalisé** à côté du code testé.
- Barils `index.ts` pour les dossiers de `core/` (à produire aussi pour les nouvelles features structurées).

## 10. Guards, RBAC et sécurité (garantir sur chaque route)

- **Guards existants** : `authGuard` (connexion), `roleGuard` + `permissionGuard` (droits). Ce sont des fonctions `CanActivateFn`.
- Chaque nouvelle route protégée doit déclarer `canActivate: [roleGuard, permissionGuard]` + `data.accessPolicy` (définie dans `core/constants/permissions.constants.ts` → `APP_PERMISSIONS` et `core/security/access-policy.ts` → `ACCESS_POLICIES`).
- Masquage UI en directives `hasPermission` / `has-role` seulement si la sécurité est aussi côté serveur.
- Ne pas inventer de permission : enrichir `APP_PERMISSIONS`/`ACCESS_POLICIES` de façon cohérente (nommage `<ressource>:read|write`).
- Ne jamais logger de secret ; ne jamais stocker un token hors session storage (voir `SessionService`/`TokenService`).

## 11. i18n (multilingue fr/en)

- Toutes les chaînes visibles passent par la pipe **`translate`**. Ne pas écrire de Français hardcodé.
- Les clés vivent dans `src/assets/i18n/i18n_lang.json` (structure `{ en: {...}, fr: {...} }`, clés groupées par module).
- Langue par défaut : `fr` (`TranslateModule.forRoot({ defaultLanguage: 'fr' })` + `I18nLangLoader`).
- **French sans accents toléré** uniquement dans le legacy (`NON DÉFINI` pour les non-accents) : ne pas propager ; utiliser le catalogue.
- Nouvelle clé : respecter la tabulation du fichier, pas de doublon sémantique (ex. `common.pageOf` existe déjà).

## 12. Erreurs et notification (UX uniforme)

- Erreurs API → intercepteur `error.interceptor` → conversion `toAppError()` (`core/errors/app-error.model.ts`) → **toast** via `NotificationService.error()` (sauf requête silencieuse via `SILENT_REQUEST`).
- Erreurs locales de formulaire → `.form-error` dans les CVA (via `[control]` + `errorMessages`).
- Feedback de succès → `app-toast` (variante `success`) via le signal `toast` local de la page (pattern de `student-page.component.ts`).
- **Interdit** : `confirm()`, `alert()`, `prompt()`. Utiliser `app-modal` / `app-toast`.
- WebSocket : utiliser `NotificationService` existant pour les notifications temps réel, ne pas créer un client STOMP parallèle.

## 13. Tests (Jasmine + Karma)

- Nouveau code → **spec colocalisé** `*.spec.ts` (rédaction si la modification est substantielle, respect scrupuleux si un spec existe).
- Scripts : `npm test` (tous), `npm run test:students` (features/students uniquement).
- Cas minimaux à couvrir : use case (succès/échec via mock repository), facade, mapper (DTO ⇄ domaine), guard (accès refusé/accordé), store (états initial/déchargé).
- Ne jamais écrire `fdescribe`/`fit`/`foc` : ne jamais désactiver un test existant sans explication explicite (No Regression).

## 14. Qualité — commandes obligatoires (à la fin de CHAQUE création/modification)

| Commande | Rôle |
|---|---|
| `npm run architecture:check` | Garde-fou DDD : interdit `HttpClient`/`environment.*ApiUrl` dans `presentation`, `Shared/domaines` (typo), `HttpClient` dans `domain`/`application`, `any`. **Doit passer.** |
| `npm run build` (ou `tsc --noEmit`) | Type check strict (`strictTemplates`). **Doit passer.** |
| `npm test` / `npm run test:students` | Régression des tests existants. **Doit passer** (ou échec expliqué et documenté). |

## 15. Problèmes connus à NE PAS recréer

1. `currencyFcfa` pipe vide → **ne pas l'utiliser** tant qu'il n'est pas réparenté (ou supprimé).
2. `phone-number.vo.ts` regex malformée `/^\+2376\d{8 $/` → ne pas enrichir ce VO sans le corriger.
3. Deux `shared/domaines` vs `shared/domains` → la typo n'est plus à utiliser pour les nouveaux imports (`@shared/domains`).
4. `features/students` = shim de ré-export vers `enrollment/students` → ne pas créer de composant là-bas, étendre `enrollment/students`.
5. `MotantRoutes` (alias typo) → ne jamais copier ce nom.
6. Services « simples » (sans token) → interdits pour du nouveau code (voir §5.2).
7. Composants `shared/ui` hybridés `@Input`/signal inputs → toute nouvelle entrée en **`input()`/`output()`** (convergence signaux).
8. `.scss` vides / SCSS ornemental : la majorité des styles sont en Tailwind ; ne pas créer de fichiers SCSS vides.
9. Double monde de card/badge : préférer le composant `shared/ui` (bouton, badge, card) au classes nues `styles.scss` sauf cohérence locale vérifiée.

## 16. Scope Rules (périmètre)

- **Scope par demande** : ne faire que ce qui est demandé. Ne pas « en profiter » pour refactorer l'ensemble, migrer le legacy, renommer, ou nettoyer le décoration — sauf demande explicite.
- **Respect du monde legacy** : les features legacy ne sont modifiées que dans le périmètre de la tâche. Toute interaction avec elles doit préserver leur comportement actuel.
- **Infrastructure** : ne rien modifier hors `src/app` (build, CI, `angular.json`) sans validation.
- **Champs de sortie** : livres de code uniquement sur `src/` (et tests) ; éviter les grandes migrations de fichiers non demandées.

## 17. No Regression Rules (non-régression)

- Ne jamais casser le comportement existant (usage, navigation, erreurs, design) faute de preuve.
- Après modification, exécuter les commandes de §14 sur le périmètre touché. Toute rupture signalée par les tests doit être corrigée dans la même passe.
- Ne pas désactiver/commenter un test existant ; si un test reflétait un comportement issu d'un bug reconnu par l'utilisateur, le documenter dans la réponse finale.
- Reporter toute incohérence détectée (design, i18n, legacy vs DDD) sans la « réparer » hors périmètre.

## 18. Développement — WORKFLOW IMPOSÉ (12 étapes, ordre non sautable)

**> Règle d'or : jamais écrire de code avant d'avoir analysé. Interdiction de passer de l'Étape 1 directement à l'Étape 8.**

1. **Comprendre la demande** — reformuler brièvement l'objectif, les contraintes et le livrable.
2. **Analyser la codebase** — lire les fichiers liés (routes, page, services, repository, i18n, spec), repérer les composants existants pertinents (§7).
3. **Identifier le réutilisable** — choisir composants UI, services, validators, pipes, patterns à réutiliser/adapter (Réutiliser > Adapter > Créer).
4. **Définir le plan** — couches à créer/modifier dans le monde DDD (§5.1), tests à écrire, clés i18n, permissions si nouvelle route. Présenter le plan avant d'écrire.
5. **Écrire le code** — implémenter dans l'ordre : domain → infrastructure → application → presentation, puis hooks routes/RBAC/i18n.
6. **Vérifier** — typecheck via `npm run build`, relire le diff (conventions §9-§12, dark mode, aria).
7. **Tester** — écrire/mettre à jour les specs colocalisés ; lancer `npm run test:students` (ou `npm test`).
8. **Exécuter `architecture:check`** — corriger toute violation frontière.
9. **Vérifier UX/RBAC/i18n** — popups/empty-state/loading via `app-loading`/`app-skeleton`, toasts, dark mode, permissions de route.
10. **Tester la non-régression** — comportements des features voisines touchées.
11. **Relier aux conventions** — noms, alias, barrels, fichiers de structure (routes i18n).
12. **Rapport final** — respecter le format exact du §19.

## 19. Format de réponse / Rapport final

Après chaque tâche, conclure avec ce bloc (texte simple, sans chichi) :

```
## Rapport final
- Objectif : <reformulation>
- Fichiers modifiés : <chemins>
- Fichiers créés : <chemins>
- Patterns respectés : <DDD store/facade/use-case | shared-ui réutilisé | guards ...>
- Commande de validation : `npm run build` ✅ | `npm run architecture:check` ✅ | `npm test` ✅
- Non régression : <points vérifiés>
- Conventions : <points appliqués, exceptions éventuelles>
- SECURITY : <points traités ou NON SIGNALÉ>
```

## 20. Commandes utiles (raccourcis)

```
npm install
npm start                 # dev server (environnement dev)
npm run build             # build + typecheck strict
npm test                  # tests Jasmine/Karma
npm run test:students     # tests de la feature students
npm run architecture:check  # garde-fou frontières DDD
```

## 21. Points de vigilance spécifiques (tirés du FRONTEND_AUDIT)

- **Pré-inscriptions et paiements** : pagination côté serveur (`PageResponse<T>`, tri `sort=creationDate,desc`). Ne pas réintroduire une pagination cliente malgré le pattern des grades.
- **WebSocket** : le client STOMP (`/ws`) est branché sur `/user/{id}/notifications` ; reconnect 5 s ; pas de garantie multitab — en être conscient.
- **Contexte scolaire** : au chargement des pages métier, la plupart dépendent du `SchoolContextService` (année/trimestre/séquence active) — ne pas court-circuiter ce service.
- **Exports** : PDF via jspdf+html2canvas a des dépendances CommonJS listées dans `angular.json` ; Excel via `xlsx` en dynamic import. Ne pas changer ces mécanismes hors périmètre.

## 22. Risque / Forces (résumé court)

**Forces** : architecture DDD récente exemplaire (enrollment, payments, grades), frontières vérifiées par script, tests colocalisés, design system cohérent via Tailwind + `@layer components`, RBAC centralisé, i18n centralisée.
**À éviter** : double monde (legacy vs DDD), emergences de nouvelles conventions parallèles, redondances UI, `any`, description de routes sans guards, `NgModel` dans les pages récentes.

---

*Fin du skill. Source de vérité : code réel + `FRONTEND_AUDIT.md`.*