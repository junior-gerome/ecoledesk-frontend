# Revue complète du frontend et propositions d’évolution

Date de revue : 13 juillet 2026  
Périmètre : frontend uniquement (`src/`, configuration Angular, documentation frontend et scripts de contrôle).  
Principe : les affirmations ci-dessous sont fondées sur les fichiers observés. Une dépendance non vérifiable dans le frontend est signalée comme **Dépendance backend à confirmer**.

## 1. Résumé exécutif

Le projet est une application Angular 18 standalone nommée `school-management`. Le frontend couvre la gestion d’un établissement scolaire : authentification, élèves et parents, enseignants, classes, matières, présences, notes et bulletins, paiements, rapports, paramètres, recherche et support.

La base technique est solide : lazy loading par domaine, TypeScript strict, composants réutilisables dans `shared/ui`, services HTTP centralisés par feature, guards d’authentification/RBAC, intercepteurs HTTP, i18n français/anglais, exports PDF/Excel et tests Jasmine/Karma. Les dossiers `presentation`, `application`, `domain` et `infrastructure` montrent une volonté d’architecture en couches.

Les priorités sont toutefois de stabiliser les parcours avant d’ajouter beaucoup de fonctionnalités :

1. homogénéiser la protection des routes et l’affichage des menus ;
2. traiter les écrans annoncés mais désactivés ou sans workflow complet ;
3. harmoniser les conventions (`shared/domains`/`shared/domaines`, noms singulier/pluriel, `subject-creat`) ;
4. rendre systématiques les états de chargement, erreur, vide, succès et confirmation ;
5. centraliser les contrats d’API et supprimer les doubles repositories/services lorsque le comportement est identique ;
6. augmenter les tests sur auth, guards, intercepteurs, routes et parcours critiques ;
7. vérifier l’accessibilité et le responsive des tableaux, sidebars, formulaires et exports.

Le niveau de maturité apparent est **fonctionnel sur les parcours principaux mais inégal selon les modules**. Les fonctionnalités de communication, les liens/messages parents et l’assignation de classes sont explicitement incomplètes ou désactivées dans la navigation. Plusieurs routes métier sont placées sous le seul `authGuard`, sans contrôle de rôle ou permission visible dans `src/app/app.routes.ts`.

## 2. Compréhension générale du projet à partir du frontend

### 2.1 Objectif apparent du projet

Le frontend constitue un back-office de gestion scolaire. Il permet à des personnels authentifiés de suivre les élèves, les inscriptions, les classes, les enseignants, les résultats scolaires, l’assiduité, les paiements et les documents administratifs.

Preuves : `src/app/features/`, `src/app/layout/sidebar/sidebar.component.ts`, `src/app/features/dashboard/`, `src/app/features/students/`.

### 2.2 Domaine métier

Le modèle visible est celui d’un établissement organisé par année scolaire, sections, classes, matières, trimestres et séquences. Les flux couvrent notamment :

- admission/inscription et édition des élèves ;
- rattachement parent-enfant ;
- organisation pédagogique (enseignants, matières, classes, sections) ;
- saisie, consultation et export des notes/bulletins ;
- présence quotidienne, absences et justifications ;
- facturation/paiements et reçus ;
- rapports de performance, rapports financiers et documents scolaires ;
- administration des utilisateurs, préférences, audit et années scolaires.

Les règles de calcul métier détaillées ou les droits définitifs restent **Dépendance backend à confirmer** lorsqu’ils ne sont pas explicitement vérifiables dans les modèles frontend.

### 2.3 Utilisateurs et rôles

Les rôles sont regroupés côté frontend via `ROLE_GROUPS` et contrôlés par `RbacService`, `roleGuard`, `permissionGuard`, ainsi que les directives `has-role` et `has-permission`.

Les groupes observables sont :

- `STAFF` pour les présences et les élèves ;
- `FINANCE` pour paiements et montants ;
- `ACADEMIC` pour notes et bulletins ;
- `ADMIN_ONLY` pour années scolaires et paramètres.

Les libellés métiers exacts des membres de ces groupes ne sont pas entièrement confirmables à partir des seuls fichiers parcourus. Le brief demande notamment une matrice Employé/Manager/Administrateur : la correspondance exacte de ces appellations avec `ROLE_GROUPS` est **À confirmer**.

### 2.4 Technologies frontend

Localisation : `package.json`, `angular.json`, `tsconfig.json`, `src/styles.scss`, `tailwind.config.js`.

| Élément | Observation |
|---|---|
| Framework | Angular 18.2.x, composants standalone |
| Langage | TypeScript 5.4, mode strict et templates stricts indiqués dans la documentation du projet |
| UI/styles | SCSS, Tailwind CSS, Angular Material/CDK, composants maison `shared/ui` |
| Données réactives | RxJS, signals et quelques stores/facades |
| Graphiques | Chart.js, `ng2-charts` |
| Exports | jsPDF, html2canvas, xlsx |
| Temps réel | STOMP et SockJS dans le service de notification |
| Traductions | `@ngx-translate/core`, fichier `src/assets/i18n/i18n_lang.json` |
| Tests | Jasmine/Karma, tests unitaires et tests HTTP |
| Déploiement | Docker/Nginx, `DockerFile`, `nginx.conf` |

### 2.5 Modules identifiés

Les 21 domaines visibles sous `src/app/features` sont : `attendance`, `auth`, `classes`, `communication`, `dashboard`, `gestion-annees`, `grades`, `inscriptionstudent`, `montant`, `parent`, `payments`, `reports`, `search`, `section`, `sequence`, `settings`, `students`, `subjects`, `support`, `teachers`, `trimestre` et les domaines associés aux écrans d’administration.

## 3. Architecture frontend actuelle

### 3.1 Arborescence

La structure générale est :

```text
src/app/
├── core/          # auth, guards, interceptors, modèles, services, config
├── layout/        # MainLayout, header, sidebar, nav, footer, forbidden
├── shared/        # UI, directives, pipes, validateurs, layouts de page
└── features/      # domaines métier, souvent presentation/application/domain/infrastructure
```

Point positif : la séparation entre transversal, présentation et métier est lisible. Risque : les conventions ne sont pas appliquées uniformément. Certaines features ont des use cases, repositories et stores ; d’autres utilisent directement un service dans le composant.

### 3.2 Modules

Le découpage par feature est approprié au lazy loading. Les modules métier sont autonomes dans leurs routes et modèles. La feature `attendance` est particulièrement documentée (`README.md`, `ARCHITECTURE.md`, `TESTS.md`, rapports de corrections), mais cette documentation est plus abondante que celle de plusieurs autres features.

Amélioration : formaliser un patron unique : `routes.ts`, `presentation`, `application`, `domain`, `infrastructure`, tests au même niveau et README court par domaine.

### 3.3 Composants

Les composants partagés comprennent notamment `button`, `input`, `select`, `textarea`, `table`, `pagination`, `modal`, `empty-state`, `skeleton`, `toast`, `alert`, `badge`, `card`, `avatar`, `page-header` et `page-layout`.

Point positif : la présence d’un embryon de design system facilite l’harmonisation. Risque : les templates mélangent composants maison, classes Tailwind et styles SCSS locaux ; les contrats d’accessibilité et les états supportés par chaque composant ne sont pas documentés de façon centrale.

### 3.4 Services

Les services sont répartis entre `core/services`, services d’infrastructure propres aux features, repositories et use cases. Les appels couvrent les ressources principales et les exports de documents.

Incohérences observées :

- `core/configuration/api-endpoints.config.ts` centralise seulement une partie des endpoints ; de nombreux services construisent encore directement `${environment.apiUrl}/...` ;
- le module paiements possède `payment.service.ts`, `payment-list.repository.ts` et `payment-form.repository.ts`, avec des fallbacks billing/API principale ; cette compatibilité est utile mais augmente le risque de divergence ;
- certains composants appellent des services simples, d’autres passent par store/facade/use case ;
- `shared/domains` et `shared/domaines` coexistent, ainsi que deux fichiers de valeur d’identifiant proches (`basseId.ts` et `base-id.ts`).

### 3.5 Routes

`src/app/app.routes.ts` utilise le lazy loading pour les principales features. Le layout principal est protégé par `authGuard`. Les protections de rôle/permission sont présentes sur `attendance`, `students`, `payments`, `reports`, `grades`, `annees`, `montant` et `settings`.

Risque majeur : `dashboard`, `subjects`, `teachers`, `classes`, `trimestre`, `sequence`, `section`, `parents`, `communication` et `support` sont sous le layout authentifié mais n’ont pas de protection métier explicite dans le fichier racine. Cela peut être volontaire, mais l’intention n’est pas démontrable à partir du frontend.

### 3.6 Guards et interceptors

`authGuard` redirige vers `/auth/login` si la session n’est pas authentifiée. `roleGuard` et `permissionGuard` redirigent vers `/forbidden` en cas de refus. Les intercepteurs `auth`, `loading` et `error` sont enregistrés dans `src/app/app.config.ts`.

Points positifs : responsabilité centralisée et route d’interdiction dédiée. À renforcer : tests explicites des chaînes de redirection, comportement en session expirée, distinction 401/403, et vérification de la protection effective des routes enfant.

### 3.7 Styles et composants partagés

Le projet combine SCSS global/local, Tailwind et Angular Material. Cette combinaison est viable, mais nécessite une règle de priorité : tokens de design, composants partagés avant classes ad hoc, et conventions responsive communes.

Les icônes de la sidebar sont des SVG inline dans `sidebar.component.ts`. Cela fonctionne, mais mélange configuration de navigation et contenu visuel ; un registre d’icônes ou un composant dédié serait plus maintenable.

## 4. Cartographie des routes

| Route | Page ou composant | Rôle concerné | Protection visible | Statut | Observation |
|---|---|---|---|---|---|
| `/auth/login` | `login` | Utilisateur non authentifié | Publique | Fonctionnelle apparente | Authentification via `AuthService` |
| `/auth/register` | `register` | Utilisateur non authentifié | Publique | Fonctionnelle apparente | Création de compte visible |
| `/auth/forgot-password` | `forgot-password` | Utilisateur non authentifié | Publique | Fonctionnelle apparente | Demande de réinitialisation |
| `/auth/reset-password` | `reset-password` | Utilisateur non authentifié | Publique | À confirmer | Jeton et nouveau mot de passe dans l’écran |
| `/dashboard` | `DashboardComponent` | Utilisateur authentifié | `authGuard` | Fonctionnelle apparente | Métriques, graphiques et chargement différé |
| `/attendance/*` | Présence quotidienne, absences, justifications | Staff | `roleGuard` + `permissionGuard` | Fonctionnelle/partielle selon écran | Routes `daily`, `absence`, `justification` |
| `/students`, `/students/new`, `/students/:id` | Page élève, composants liste/formulaire | Staff | `roleGuard` + `permissionGuard` | Partiellement fonctionnelle | Profil et import visibles ; workflow exact à confirmer |
| `/subjects`, `/subjects/new`, `/subjects/:id` | Liste/création sujet | Authentifié | Auth seulement | Partiellement fonctionnelle | Pas de contrôle métier visible dans route racine |
| `/teachers`, `/teachers/new`, `/teachers/subjects`, `/teachers/schedule`, `/teachers/:id` | Liste/formulaire/affectations/planning | Authentifié | Auth seulement | Partiellement fonctionnelle | Routes de détail et formulaire à vérifier ensemble |
| `/classes`, `/classes/form`, `/classes/:id` | Liste/formulaire classe | Authentifié | Auth seulement | Partiellement fonctionnelle | Assignation désactivée dans sidebar |
| `/section`, `/section/section`, `/section/:id` | Gestion sections | Authentifié | Auth seulement | À confirmer | Deux chemins relatifs déclarés dans `section.routes.ts` |
| `/trimestre`, `/trimestre/new`, `/trimestre/:id` | Liste/création trimestre | Authentifié | Auth seulement | Partiellement fonctionnelle | CRUD visible côté route/service |
| `/sequence`, `/sequence/new`, `/sequence/:id` | Liste/création séquence | Authentifié | Auth seulement | Partiellement fonctionnelle | CRUD visible côté route/service |
| `/payments/list`, `/payments/new`, `/payments/receipts`, `/payments/:id` | Paiements et reçus | Finance | `roleGuard` + `permissionGuard` | Fonctionnelle/partielle | Fallback entre API billing et API principale |
| `/reports/performance` | Rapport performance | Permission rapports | `permissionGuard` | Fonctionnelle apparente | Données API et filtres visibles |
| `/reports/financial` | Rapport financier | Permission rapports | `permissionGuard` | Fonctionnelle apparente | Dépendance aux données financières |
| `/reports/documents` | Documents scolaires | Permission rapports | `permissionGuard` | Partiellement fonctionnelle | Génération dépendante des contrats API |
| `/grades`, `/grades/form`, `/grades/new`, `/grades/new-notes`, `/grades/bulletin`, `/grades/bulletin/:studentId`, `/grades/class-report`, `/grades/edit/:id` | Notes, bulletins et rapports | Académique | `roleGuard` + `permissionGuard` | Fonctionnelle/partielle | Plusieurs routes proches ; `/new` et `/form` à rationaliser |
| `/annees`, `/annees/new-annees` | Gestion année scolaire | Administration | `roleGuard` + `permissionGuard` | Partiellement fonctionnelle | Même composant déclaré pour liste et création |
| `/montant`, `/montant/montant`, `/montant/:id` | Tarification | Finance | `roleGuard` + `permissionGuard` | Partiellement fonctionnelle | Route redondante potentielle (`/montant` et `/montant/montant`) |
| `/settings/users`, `/settings/preferences`, `/settings/audit` | Administration | Administration | `roleGuard` + `permissionGuard` | Fonctionnelle apparente | Sous-domaines distincts |
| `/parents`, `/parents/links`, `/parents/messages` | Parents et communication parentale | Authentifié | Auth seulement | Incomplète | Sous-routes présentes dans sidebar ; réalisation non confirmée pour les liens/messages |
| `/communication` | `communication-coming-soon` | Authentifié | Auth seulement | Interface uniquement | Composant explicitement “coming soon” |
| `/support/helpcenter`, `/support/contact` | Centre d’aide/ticket | Authentifié | Auth seulement | Fonctionnelle apparente | Service support présent |
| `/forbidden` | Forbidden page | Utilisateur refusé | Auth seulement | Fonctionnelle apparente | Destination des guards |
| `**` | Redirection | Tous | — | Fonctionnelle apparente | Fallback vers dashboard dans layout, auth hors layout |

Routes orphelines ou incohérentes à vérifier : les enfants `/students/profile`, `/classes/assign`, `/parents/links` et `/parents/messages` apparaissent dans le menu ; les deux premiers sont explicitement désactivés, tandis que l’existence d’un composant effectif pour les deux derniers n’est pas confirmée dans l’inventaire observé. `section.routes.ts`, `montant.routes.ts`, `gestion-annees/annees.routes.ts` et `grades.routes.ts` méritent une vérification de cohérence entre routes, liens et écran réellement chargé.

## 5. Inventaire des pages et interfaces

| Interface | Route | Rôle | Objectif | Données/actions | Statut | Observation |
|---|---|---|---|---|---|---|
| Connexion | `/auth/login` | Public | Ouvrir une session | Email, mot de passe, soumission | Partiellement fonctionnelle | Gestion backend à confirmer, validation visible |
| Élèves | `/students` | Staff | Consulter et rechercher les élèves | Liste, recherche, import/export, édition | Fonctionnelle/partielle | `student-page` combine plusieurs responsabilités |
| Formulaire élève | `/students/new`, écran intégré | Staff | Créer/éditer une fiche et une inscription | Identité, section/classe, parent, montant | Fonctionnelle apparente | Nombreuses dépendances de référence |
| Parents | `/parents` | Authentifié | Gérer les parents | Liste/formulaire/service | Partiellement fonctionnelle | Liens et messages non confirmés |
| Enseignants | `/teachers/*` | Authentifié | Gérer les enseignants | CRUD, matières, planning | Fonctionnelle apparente | Route de détail et formulaire à vérifier |
| Classes/sections | `/classes/*`, `/section/*` | Authentifié | Organiser les classes | Formulaires, listes, affectation enseignant | Partielle | Assignation annoncée désactivée dans sidebar |
| Matières | `/subjects/*` | Authentifié | Gérer les matières | Liste, création, édition | Fonctionnelle apparente | Nom `subject-creat` incohérent |
| Présence quotidienne | `/attendance/daily` | Staff | Saisir la présence | Section/classe, élèves, statut, heure | Fonctionnelle apparente | Store et repository dédiés |
| Absences | `/attendance/absence` | Staff | Suivre les absences | Recherche, liste, statuts | Partielle | États métier à couvrir explicitement |
| Justifications | `/attendance/justification` | Staff | Traiter une justification | Texte/formulaire, soumission | Partielle | Confirmation et historique à vérifier |
| Notes | `/grades/*` | Académique | Saisir/consulter les notes | Classe, élève, matière, période, édition | Fonctionnelle/partielle | Plusieurs use cases, exports présents |
| Bulletin | `/grades/bulletin` | Académique | Consulter/exporter un bulletin | Sélection, PDF/Excel selon écran | Fonctionnelle apparente | Dépendance aux données de calcul |
| Dashboard | `/dashboard` | Authentifié | Synthétiser l’activité | Compteurs, graphiques, statistiques | Fonctionnelle apparente | États de chargement visibles |
| Paiements | `/payments/*` | Finance | Enregistrer, consulter et imprimer | Formulaire, filtres, reçu | Fonctionnelle/partielle | Fallback d’API à clarifier |
| Rapports | `/reports/*` | Rapports | Lire des indicateurs et documents | Filtres, génération | Fonctionnelle apparente | Erreurs/absence de données à tester |
| Années scolaires | `/annees/*` | Administration | Créer/activer une année | Formulaire, activation | Partielle | Même composant pour deux routes |
| Paramètres | `/settings/*` | Administration | Administrer utilisateurs, préférences et audit | Recherche, rôle, statut, sauvegarde | Fonctionnelle apparente | Contrats d’autorisations à tester |
| Communication | `/communication` | Authentifié | Préparer la messagerie/alertes | Aucun workflow métier complet visible | Interface uniquement | “Coming soon” explicite |
| Support | `/support/*` | Authentifié | Consulter l’aide et contacter le support | Recherche, ticket | Fonctionnelle apparente | Endpoint support présent |

## 6. Inventaire des fonctionnalités frontend

| Fonctionnalité | Module | Rôle | Page/composants | Service | Statut | Limites |
|---|---|---|---|---|---|---|
| Connexion/session | Core/auth | Tous | login, `AuthService`, session/token | `auth.service.ts`, `token.service.ts` | Fonctionnelle apparente | Renouvellement et expiration à tester |
| Déconnexion | Layout/core | Authentifié | Sidebar | `AuthService.logout()` | Fonctionnelle apparente | Retour vers login à vérifier |
| RBAC navigation/routes | Core | Selon rôle | Guards/directives/sidebar | `RbacService` | Partiellement fonctionnelle | Protection non uniforme sur toutes les features |
| CRUD élèves | Students | Staff | page/form/list | `student-enrollment.repository.ts` | Fonctionnelle/partielle | Détails, suppression et confirmations à vérifier |
| Import/export élèves | Students | Staff | student page | file/export services | Fonctionnelle apparente | Gestion des erreurs de fichier à tester |
| CRUD enseignants | Teachers | Personnel | list/form | repository | Fonctionnelle apparente | Tests de parcours limités |
| CRUD classes | Classes | Personnel | list/form | repositories/services | Partiellement fonctionnelle | Assignation de classe désactivée dans menu |
| CRUD matières/trimestres/séquences | School | Personnel | listes/formulaires | services correspondants | Fonctionnelle/partielle | Routes et conventions à normaliser |
| Présence/absence/justification | Attendance | Staff | trois pages | repository/service/store | Fonctionnelle/partielle | États vides, erreurs et rôles à consolider |
| Saisie/édition notes | Grades | Académique | grade form/list | use cases, repository | Fonctionnelle apparente | Routes `/form`, `/new`, `/new-notes` redondantes possibles |
| Bulletin et exports | Grades | Académique | bulletin/report | PDF/Excel services | Fonctionnelle apparente | Performance et conformité du document à tester |
| Paiements et reçus | Payments | Finance | list/form/receipts | billing + fallback | Fonctionnelle/partielle | Double source et dépendance backend |
| Rapports | Reports | Rapports | performance/financial/documents | report repositories | Fonctionnelle apparente | Permissions et données vides à vérifier |
| Recherche avancée | Search | Authentifié | advanced-search | service/facade | À confirmer | Présente dans les fichiers mais pas exposée dans `app.routes.ts` observé |
| Notifications | Core | Tous | notification component/service | STOMP/SockJS | À confirmer | Connexion temps réel et affichage à tester |
| i18n | Core/shared | Tous | TranslateModule/switcher | i18n service/loader | Partiellement fonctionnelle | Certains textes sont codés en dur dans templates |
| Thème | Core/shared | Tous | theme component/service | theme service | Fonctionnelle apparente | Contraste des deux thèmes à auditer |
| Support | Support | Authentifié | help center/contact | support service | Fonctionnelle apparente | Workflow de ticket dépendant du backend |

## 7. Analyse des parcours utilisateurs

### Parcours d’administration

Le parcours visible est : connexion → dashboard → utilisateurs/paramètres → années scolaires → sections/classes/matières. La base existe, mais l’ordre fonctionnel n’est pas guidé par un assistant ou une checklist. La création d’une année active, la disponibilité des références et les permissions doivent être testées comme un parcours transversal.

### Parcours d’inscription

Le parcours visible est : élèves → nouveau formulaire → section/classe/parent/montant → soumission → consultation de la fiche. Les dépendances de référence sont nombreuses et plusieurs données viennent d’API différentes. Un état d’erreur par champ et une confirmation post-soumission sont nécessaires pour éviter une inscription ambiguë.

### Parcours pédagogique

Le parcours visible est : classe/matière/enseignant → présence ou notes → bulletin/rapport. Les écrans de notes et de présence disposent de services et modèles dédiés. Il manque toutefois un guidage transversal visible : contexte d’année, classe, période et statut de validation devraient rester persistants et explicites.

### Parcours financier

Le parcours visible est : tarification → paiement → liste → reçu → rapport financier. La présence de deux URLs de paiement avec fallback améliore la résilience, mais masque potentiellement les erreurs d’intégration. L’utilisateur doit obtenir un résultat univoque et une notification claire après création ou génération de reçu.

### Parcours communication/support

Le support a une page d’aide et un formulaire de contact. La communication interne est explicitement en attente ; les sous-menus d’alertes/messages sont désactivés. Le parcours est donc interrompu au niveau de la notification et de l’échange entre établissement, personnel et parents.

## 8. Revue du code frontend

### 8.1 Points positifs

- Angular standalone et lazy loading généralisé ;
- séparation `core`/`shared`/`layout`/`features` ;
- TypeScript strict et modèles métier nombreux ;
- composants UI partagés déjà disponibles ;
- guards, RBAC et intercepteurs centralisés ;
- validateurs dédiés (`phone`, `matricule`, `date-range`) ;
- services d’export isolés ;
- tests présents sur plusieurs features et services HTTP ;
- documentation particulière de la feature attendance et scripts d’architecture.

### 8.2 Problèmes critiques

| Constat | Preuve | Impact |
|---|---|---|
| Protection métier inégale | `src/app/app.routes.ts` : guards présents seulement sur certains groupes | Accès incohérent à des routes authentifiées |
| Menus vers fonctionnalités non livrées | `sidebar.component.ts` : `disabled: true` pour profil, assignation et communication | Parcours interrompus, dette produit visible |
| Communication explicitement non disponible | `communication-coming-soon.component.ts`, route `/communication` | Fonctionnalité annoncée mais non utilisable |
| Endpoints non uniformément centralisés | services utilisant directement `environment.apiUrl` malgré `api-endpoints.config.ts` | Changements d’environnement plus risqués |
| Routes potentiellement redondantes | grades `/form`, `/new`, `/new-notes`; montant `/montant/montant`; section chemins relatifs | Liens cassés ou maintenance multipliée |

### 8.3 Problèmes importants

- `shared/domains` et `shared/domaines` créent deux conventions de localisation ;
- noms divergents : `inscriptionstudent`, `subject-creat`, `Trimestre.ts` ;
- services et repositories en doublon dans certaines features ;
- présence de textes français codés en dur alors qu’un système i18n existe ;
- la taille et la responsabilité de `students/presentation/pages/student-page.component.ts` semblent élevées au regard de ses imports, stores, import/export et formulaire intégré ; à découper si la complexité confirmée par le mainteneur ;
- mélange d’API principale, billing et attendance sans abstraction commune visible ;
- `unknown[]` dans `advanced-search.service.ts` limite la sécurité de typage des résultats de recherche ;
- un `any` est documenté dans `attendance/ARCHITECTURE.md` ; il s’agit d’une documentation ou d’un exemple, donc à confirmer dans le code exécutable.

### 8.4 Duplication

Duplication observée ou probable :

- accès aux classes, sections, enseignants et années scolaires depuis plusieurs repositories ;
- deux familles de services/repositories pour les paiements ;
- URLs construites dans chaque infrastructure ;
- plusieurs écrans CRUD possiblement réimplémentés au lieu d’un contrat partagé de liste/formulaire/état ;
- SVG et logique d’ouverture dans le composant sidebar.

Recommandation : extraire des ports partagés uniquement après mesure de duplication réelle, afin de ne pas créer une abstraction prématurée.

### 8.5 Typage

Le projet utilise de nombreux modèles, DTO et value objects, ce qui est positif. Points à améliorer : remplacer les collections génériques de recherche par des unions ou DTO typés ; vérifier les réponses `HttpClient` non paramétrées dans les exports/rapports ; contrôler les valeurs nulles dans les sélections dépendantes ; ajouter des types aux options de sidebar et statuts plutôt que des chaînes libres.

### 8.6 Code inutilisé

À vérifier avant suppression :

- `src/app/features/search/` semble disposer d’un service et d’une page mais n’apparaît pas dans les routes racines observées ;
- `features/inscriptionstudent/` contient un écran de paiement/inscription distinct de `students`, ce qui peut être legacy ou un flux encore requis ;
- `src/app/migrate-imports.js`, `fix-relative-imports.js` et les documents de migration peuvent être conservés pour historique, mais leur statut doit être explicité ;
- `shared/domaines/` peut être une ancienne convention encore référencée ; ne pas supprimer sans recherche complète des imports ;
- les routes de menu désactivées sont de la dette produit, pas nécessairement du code inutilisé.

### 8.7 Recommandations

1. Définir une convention de nommage et l’appliquer progressivement.
2. Maintenir une table de routes et permissions générée ou testée.
3. Centraliser les URLs par domaine dans une configuration typée.
4. Choisir un mode de façade/store par feature selon une règle documentée.
5. Écrire des tests de composants shared avec clavier, erreur et disabled.
6. Éviter de supprimer les éléments legacy tant que leur non-référencement n’est pas prouvé.

## 9. Analyse des services et appels API

| Service/repository | Méthodes/usage | Appelant | Gestion erreur | Statut | Observation |
|---|---|---|---|---|---|
| `core/services/auth.service.ts` | login, register, reset | Auth pages | Intercepteur global + flux RxJS | Fonctionnel apparent | URLs auth construites localement |
| `features/students/infrastructure/student-enrollment.repository.ts` | listes, références, création/édition/suppression, validation | Student page/form/stores | À confirmer selon méthode | Fonctionnel/partiel | Beaucoup de dépendances et d’endpoints |
| `features/teachers/infrastructure/teacher.repository.ts` | CRUD, sujets, planning | Teacher pages/use cases | À confirmer | Fonctionnel apparent | Contrat assez lisible |
| `features/classes/infrastructure/*repository.ts` | liste/formulaire/affectation | Class pages/use cases | À confirmer | Partiel | Plusieurs repositories pour un même domaine |
| `features/attendance/infrastructure/*` | références, présence, justificatifs, résumé | Attendance stores/components | Repositories + intercepteur | Fonctionnel/partiel | Feature la mieux documentée ; endpoints de références répétés |
| `features/grades/infrastructure/*` | notes, rapports, exports | Grade pages/use cases | À confirmer | Fonctionnel apparent | Plusieurs chemins d’accès et exports |
| `features/payments/infrastructure/*` | CRUD, résumé, reçu | Payment pages/stores | Fallback billing → API principale | Partiel | Résilience utile, diagnostic des erreurs moins lisible |
| `features/reports/infrastructure/*` | performance, finance, documents | Report pages/use cases | À confirmer | Fonctionnel apparent | Données vides et erreurs à tester |
| `features/settings/infrastructure/*` | users, préférences, rôles, permissions, audit | Settings pages | À confirmer | Fonctionnel apparent | Contrôle frontend à compléter par backend |
| `features/search/infrastructure/advanced-search.service.ts` | recherches par domaine, globales, favoris | Search page/facade | À confirmer | À confirmer | Page non reliée à la route racine observée |
| `core/notification/notification.service.ts` | websocket STOMP/SockJS | Notification component | À confirmer | À confirmer | Dépendance temps réel visible, état de reconnexion à vérifier |
| `shared/components/photo-upload` | upload photo | Student/other form | callback d’erreur visible dans composant | Partiel | URL `/api/files/upload` codée directement |

Dépendances backend à confirmer : contrats de pagination, formats d’erreur, codes de statut métier, support des exports binaires, endpoints exacts de recherche, photo, communication, parents/messages et règles de permission. Le rapport ne juge pas leur implémentation serveur.

## 10. Analyse des rôles et permissions côté frontend

| Interface/action | Employé | Manager | Administrateur | Autre rôle | Contrôle visible |
|---|---:|---:|---:|---:|---|
| Dashboard | À confirmer | À confirmer | À confirmer | Authentifié | `authGuard` seulement |
| Élèves | Groupe `STAFF` | Selon mapping | Selon mapping | Refus si hors groupe | rôle + `STUDENTS_READ` |
| Présences | Groupe `STAFF` | Selon mapping | Selon mapping | Refus si hors groupe | rôle + `ATTENDANCE_READ` |
| Paiements | Groupe `FINANCE` | Selon mapping | Selon mapping | Refus si hors groupe | rôle + `PAYMENTS_READ` |
| Notes | Groupe `ACADEMIC` | Selon mapping | Selon mapping | Refus si hors groupe | rôle + `GRADES_READ` |
| Rapports | Permission | Permission | Permission | Selon permission | `REPORTS_READ` |
| Paramètres | Refus apparent | Refus apparent | Autorisé | Refus apparent | `ADMIN_ONLY` + `SETTINGS_READ` |
| Années scolaires | Refus apparent | Refus apparent | Autorisé | Refus apparent | `ADMIN_ONLY` + `SETTINGS_WRITE` |
| Montants | Groupe `FINANCE` | Selon mapping | Selon mapping | Refus si hors groupe | rôle + `PAYMENTS_WRITE` |
| Communication/support | Authentifié | Authentifié | Authentifié | Authentifié | Auth seulement dans route racine |

La matrice Employé/Manager/Administrateur ne peut pas être remplie de façon certaine sans le mapping complet de `roles.constants.ts` et les données de session. Les contrôles de menu et guards frontend ne remplacent jamais les contrôles backend. Les boutons masqués ou désactivés sont uniquement une mesure d’ergonomie ; les APIs doivent vérifier les permissions.

Incohérence à traiter : les routes non protégées par `roleGuard`/`permissionGuard` sont accessibles à tout utilisateur authentifié, alors que le menu peut donner une impression de segmentation par domaine.

## 11. Analyse UX/UI

| Interface | Points positifs | Problèmes UX/UI | Impact | Recommandation | Priorité |
|---|---|---|---|---|---|
| Layout/sidebar | Catégories, icônes, sous-menus, fermeture mobile prévue | Menus désactivés et catégories nombreuses ; logique SVG dans TS | Compréhension et découverte | Afficher une raison ou masquer les fonctions non livrées ; garder une navigation cohérente | Haute |
| Dashboard | Cartes/graphiques et placeholder/loading | Contexte année/période non explicite dans les preuves | Risque de mauvaise interprétation des indicateurs | Afficher période, dernière mise à jour et état vide | Haute |
| Listes CRUD | Composants table, pagination, empty state disponibles | Usage non uniforme des filtres/pagination/confirmations | Effort opérationnel variable | Patron liste commun avec recherche, filtres, pagination, erreur, vide | Haute |
| Formulaires | Inputs/selects/textarea partagés, validations | Textes codés en dur et dépendances en cascade | Erreurs de saisie, traductions incomplètes | Résumé d’erreurs, labels persistants, aide contextuelle | Haute |
| Paiements | Filtres, reçus, états d’action désactivés | Fallback d’API invisible à l’utilisateur | Incertitude en cas d’échec | Message de résultat et identifiant de transaction | Haute |
| Notes/bulletins | Sélection de classe/élève/période, export | Plusieurs routes proches et contexte à conserver | Navigation confuse | Unifier le workflow et afficher le contexte en en-tête | Moyenne |
| Présences | Écran quotidien et statuts visibles | Justification/historique et erreurs à confirmer | Risque de saisie non tracée | Confirmation, autosauvegarde contrôlée ou statut de soumission | Haute |
| Communication | Entrée visible dans la sidebar | Écran “coming soon” | Promesse non tenue | Masquer jusqu’à livraison ou afficher une roadmap explicite | Haute |
| Support | Centre d’aide et contact | État du ticket et suivi non visible dans l’inventaire | Peu de visibilité après envoi | Ajouter confirmation, numéro de ticket et historique | Moyenne |

## 12. Analyse de l’accessibilité

Points favorables : composants de formulaire partagés, éléments `button` réutilisables, états `disabled`, structure de layout, composants d’alert/toast et skeleton déjà présents.

Risques à auditer dans le code et au navigateur :

- SVG inline de la sidebar : vérifier nom accessible, `aria-hidden` et focus ;
- boutons d’icônes du header/sidebar : vérifier label textuel ou `aria-label` ;
- modales : focus initial, retour du focus, fermeture clavier et `role="dialog"` ;
- messages de validation : association `label`/champ, `aria-describedby`, annonce des erreurs ;
- statuts et badges : ne pas transmettre l’information uniquement par couleur ;
- tableaux : en-têtes, scope, lecture mobile et ordre de tabulation ;
- graphiques : résumé textuel ou tableau de données alternatif ;
- titres de pages et hiérarchie H1/H2 ;
- contraste des thèmes clair/sombre et focus visible ;
- états de chargement et notifications : annonce `aria-live` sans répétition excessive.

Impact : les problèmes touchent clavier, lecteurs d’écran et utilisateurs mobiles. Priorité haute pour les composants shared, car une correction bénéficie à toutes les features.

## 13. Analyse du responsive design

Le layout expose une méthode `closeSidebarMobile()` et des fichiers SCSS sur header/sidebar/layout, ce qui indique une intention responsive. La présence de classes Tailwind responsive est à confirmer écran par écran.

Risques identifiés :

- tableaux élèves, notes, paiements et rapports susceptibles de dépasser la largeur mobile ; prévoir colonnes prioritaires, scroll horizontal explicite ou vue carte ;
- filtres multiples dans notes, paiements, rapports et recherche susceptibles de s’empiler sans ordre clair ;
- formulaires longs (élève, enseignant, paiement, préférences) à organiser en sections repliables sur téléphone ;
- modales et documents PDF/preview à limiter à la largeur du viewport ;
- graphiques dashboard à rendre lisibles sans dépendre d’une largeur fixe ;
- sidebar catégorisée à tester avec clavier et écran étroit ;
- boutons d’action groupés dans les lignes de tableau à transformer en menu d’actions sur petit écran.

Les comportements exacts sur ordinateur/tablette/téléphone ne peuvent pas être certifiés sans exécution visuelle. Statut : **À confirmer par tests de viewport**.

## 14. Fonctionnalités frontend manquantes

Les manques ci-dessous sont liés à des constats observés, pas à une liste générique :

1. **Contrat de permission uniforme** : certaines routes ont seulement `authGuard` alors que des groupes voisins ont RBAC.
2. **Parcours de communication** : route et entrée existent, composant “coming soon”, sous-actions désactivées.
3. **Profil étudiant détaillé** : le menu contient `students.profile` mais le lien est désactivé et pointe vers `/students`.
4. **Assignation de classe complète** : `classes.assign` est désactivé dans la sidebar ; le service possède des opérations d’affectation à vérifier.
5. **Liens et messages parents** : présents dans le menu, mais écrans et workflow complets non confirmés.
6. **Historique/confirmation systématiques** : nécessaire après suppression, validation d’inscription, justification, paiement et activation d’année.
7. **États vides/erreur/chargement homogènes** : les briques existent, leur utilisation partout n’est pas démontrée.
8. **Recherche avancée accessible** : feature présente mais route racine non identifiée dans `app.routes.ts` observé.
9. **Contexte global d’année/période** : les écrans métier utilisent année, trimestre ou séquence mais aucun sélecteur global n’est visible dans la navigation observée.
10. **Suivi des notifications** : service temps réel visible, mais workflow de reconnexion, lecture et préférences non confirmé.

## 15. Nouvelles fonctionnalités proposées

### 15.1 Fonctionnalités indispensables

### Matrice de permissions et parcours sécurisé

**Constat actuel :** `app.routes.ts` applique les guards métier à certains domaines seulement ; d’autres routes sont sous `authGuard` seul.

**Utilisateurs concernés :** tous les utilisateurs authentifiés, surtout personnel, finance, académique et administrateurs.

**Description :** définir pour chaque route et action un contrat rôle/permission partagé par route, menu et composants d’action ; ajouter des tests de navigation autorisée/refusée.

**Scénario utilisateur :** un employé ouvre `/settings/users` directement ; il reçoit `/forbidden` et ne voit pas l’entrée d’administration.

**Interfaces concernées :** `app.routes.ts`, sidebar, boutons d’actions de chaque feature, page forbidden.

**Composants frontend nécessaires :** matrice de configuration typée, directive d’action, tests de guards/routes, message d’accès refusé.

**Données nécessaires :** rôle et permissions de session, métadonnées de route.

**Dépendance backend :** permissions réellement reconnues par les APIs à confirmer.

**Justification :** évite que navigation et autorisation présentent des comportements contradictoires.

**Valeur ajoutée :** réduction du risque d’exposition fonctionnelle et meilleure compréhension du produit.

**Priorité :** Critique.

**Complexité frontend :** Moyenne.

**Risques :** régression d’accès si le mapping de rôles est incomplet ; prévoir tests de non-régression.

### Finalisation des états de workflow

**Constat actuel :** les composants shared existent, mais les états de confirmation, erreur, vide et chargement ne sont pas uniformément démontrés.

**Utilisateurs concernés :** tous les opérateurs de listes et formulaires.

**Description :** appliquer un contrat standard à chaque liste/formulaire : chargement, succès, erreur récupérable, vide, validation et confirmation des actions sensibles.

**Scénario utilisateur :** après la création d’un paiement, l’utilisateur voit un toast de succès, le numéro de reçu et les actions imprimer/télécharger ; en cas d’échec, le formulaire reste récupérable.

**Interfaces concernées :** élèves, présences, notes, paiements, années, paramètres, support.

**Composants frontend nécessaires :** `loading`, `empty-state`, `alert`, `toast`, modal de confirmation, résumé d’erreurs.

**Données nécessaires :** état de requête, message métier, identifiant d’opération.

**Dépendance backend :** formats d’erreur et identifiants de résultat à confirmer.

**Justification :** termine les parcours interrompus sans changer le modèle visuel.

**Valeur ajoutée :** moins de soumissions répétées et meilleure confiance utilisateur.

**Priorité :** Critique.

**Complexité frontend :** Moyenne.

**Risques :** messages contradictoires si intercepteur et composant notifient tous deux ; définir une responsabilité unique.

### 15.2 Fonctionnalités importantes

### Profil étudiant et historique unifiés

**Constat actuel :** le menu expose `students.profile` mais le sous-menu est désactivé et pointe vers `/students`.

**Utilisateurs concernés :** staff, administration, personnel académique selon permission.

**Description :** créer un écran de détail avec identité, inscriptions, classe, parents, paiements, présences, notes et historique d’actions en onglets ou sections.

**Scénario utilisateur :** depuis la liste, un agent ouvre un élève, consulte sa classe actuelle et son historique d’inscriptions sans perdre les filtres de la liste.

**Interfaces concernées :** `/students/:id`, `student-page`, `student-form`, liens depuis paiements/notes/présences.

**Composants frontend nécessaires :** en-tête étudiant, tabs, résumé, tables d’historique, modal d’action.

**Données nécessaires :** étudiant, inscription, parent, classe, paiements, absences, notes.

**Dépendance backend :** endpoint agrégé ou endpoints détaillés à confirmer.

**Justification :** complète le lien déjà prévu entre liste et profil.

**Valeur ajoutée :** moins de navigation et meilleure traçabilité.

**Priorité :** Haute.

**Complexité frontend :** Élevée.

**Risques :** écran trop chargé ; privilégier une architecture progressive et lazy des onglets.

### Assignation classes, enseignants et matières

**Constat actuel :** le menu contient une assignation de classe désactivée ; les services enseignants/classes exposent pourtant des opérations connexes.

**Utilisateurs concernés :** administration et responsables pédagogiques.

**Description :** écran d’affectation avec classe, année, enseignant principal, matières et contrôle des conflits.

**Scénario utilisateur :** un responsable choisit une classe, voit son enseignant actuel, affecte un remplaçant et reçoit un avertissement en cas de conflit.

**Interfaces concernées :** `/classes`, `/teachers/subjects`, `/teachers/schedule`, nouvelle vue d’affectation.

**Composants frontend nécessaires :** sélecteurs dépendants, tableau d’affectation, modal de confirmation, badge de conflit.

**Données nécessaires :** classes, enseignants disponibles, matières, horaires, année active.

**Dépendance backend :** règles de conflit et endpoints d’affectation à confirmer.

**Justification :** transforme une action annoncée mais désactivée en workflow cohérent.

**Valeur ajoutée :** fiabilise l’organisation scolaire.

**Priorité :** Haute.

**Complexité frontend :** Élevée.

**Risques :** concurrence entre modifications ; recharger le contexte après sauvegarde.

### Recherche globale réellement accessible

**Constat actuel :** `features/search` contient service, façade, modèle et page, mais aucune route correspondante n’est visible dans `app.routes.ts`.

**Utilisateurs concernés :** tous les utilisateurs autorisés.

**Description :** exposer une recherche globale depuis le header avec suggestions, filtres de domaine et navigation vers la fiche trouvée.

**Scénario utilisateur :** l’agent saisit un matricule ; la recherche propose l’élève, le paiement et les notes associés.

**Interfaces concernées :** header, `advanced-search`, profils de détail.

**Composants frontend nécessaires :** champ global, popover de suggestions, filtres, résultats groupés.

**Données nécessaires :** résultats typés par domaine, favoris, suggestions.

**Dépendance backend :** endpoint global et droits de recherche à confirmer.

**Justification :** valorise une feature déjà présente et réduit la navigation manuelle.

**Valeur ajoutée :** gain de temps transversal.

**Priorité :** Haute.

**Complexité frontend :** Moyenne.

**Risques :** résultats trop larges ou fuite de données ; appliquer les permissions par domaine.

### 15.3 Fonctionnalités d’amélioration

### Centre de contexte année scolaire/période

**Constat actuel :** année, trimestre et séquence sont gérés dans plusieurs features, sans sélecteur global visible.

**Utilisateurs concernés :** administration, personnel académique et finance.

**Description :** sélecteur persistant de l’année active et, lorsque pertinent, du trimestre/séquence ; afficher le contexte dans les pages et requêtes.

**Scénario utilisateur :** le responsable change d’année dans le header et les listes de notes/présences se rechargent avec un avertissement de contexte.

**Interfaces concernées :** header, dashboard, notes, présences, rapports, paiements.

**Composants frontend nécessaires :** select global, service de contexte, guard de contexte, bannière d’avertissement.

**Données nécessaires :** années disponibles, année active, périodes.

**Dépendance backend :** portée des endpoints par année à confirmer.

**Justification :** évite les erreurs de consultation entre années.

**Valeur ajoutée :** cohérence des indicateurs et des opérations.

**Priorité :** Moyenne.

**Complexité frontend :** Élevée.

**Risques :** effets de bord sur les caches et stores ; invalider explicitement les données dépendantes.

### 15.4 Fonctionnalités futures

### Communication interne et parents

**Constat actuel :** `/communication` est un écran “coming soon” et les liens/messages parents sont désactivés ou non confirmés.

**Utilisateurs concernés :** administration, enseignants, parents et personnel autorisé.

**Description :** messagerie ciblée, annonces, notifications et historique de lecture, avec préférences par rôle.

**Scénario utilisateur :** un responsable publie une annonce à une classe ; les parents autorisés la voient et l’administration suit les lectures.

**Interfaces concernées :** `/communication`, `/parents/messages`, header notifications.

**Composants frontend nécessaires :** éditeur, destinataires, liste de conversations, badge non lu, centre de notifications.

**Données nécessaires :** messages, destinataires, statut de lecture, pièces jointes.

**Dépendance backend :** endpoints, websocket et règles de confidentialité à confirmer.

**Justification :** complète le domaine annoncé dans la navigation.

**Valeur ajoutée :** centralise la communication et réduit les échanges hors outil.

**Priorité :** Basse à moyen terme.

**Complexité frontend :** Élevée.

**Risques :** confidentialité, spam, temps réel et notifications concurrentes.

## 16. Nouvelles interfaces proposées

### 16.1 Détail étudiant

- **Rôle :** staff/administration selon permissions.
- **Objectif :** compléter `/students/:id`.
- **Accès :** authentification + permission de consultation étudiant.
- **Disposition :** en-tête avec nom, matricule, classe et statut ; cartes de synthèse ; onglets Informations, Inscriptions, Parents, Paiements, Présences, Notes, Historique.
- **Actions :** modifier, changer de classe, exporter, consulter les documents ; suppression avec confirmation forte si autorisée.
- **Filtres/tableaux :** période, année, statut ; pagination et tri dans les historiques.
- **États :** skeleton, vide par onglet, erreur récupérable, confirmation de sauvegarde.
- **Navigation :** retour à la liste en conservant recherche et pagination.
- **Composants :** `page-header`, `card`, `table`, `pagination`, `badge`, `modal`, `empty-state`.
- **Dépendances :** données élève/inscription/parent/paiement/notes ; **Dépendance backend à confirmer** pour l’agrégation.
- **Justification :** le menu prévoit déjà le profil et plusieurs domaines doivent converger vers une fiche unique.

### 16.2 Affectations pédagogiques

- **Rôle :** administrateur/responsable pédagogique.
- **Objectif :** remplacer l’action `classes.assign` désactivée.
- **Route suggérée :** `/classes/:id/assignments` ou sous-route cohérente à choisir.
- **Accès :** rôle/permission de gestion des classes et enseignants.
- **Disposition :** en-tête de classe ; résumé année/section ; zone de filtres enseignants/matières ; tableau des affectations ; panneau des conflits.
- **Actions :** ajouter, modifier, retirer, confirmer en masse ; modales pour opérations sensibles.
- **Validations :** classe et année obligatoires ; conflits affichés avant soumission.
- **États :** aucune affectation, chargement des références, erreurs par requête, succès avec résumé.
- **Composants :** select dépendants, table, badge de conflit, modal, alert.
- **Dépendances :** classes, enseignants, matières, planning ; règles backend à confirmer.
- **Justification :** raccorde les services existants et le besoin visible dans le menu.

### 16.3 Centre de recherche globale

- **Rôle :** tout rôle autorisé.
- **Objectif :** rendre exploitable `features/search`.
- **Route suggérée :** `/search` avec accès secondaire depuis le header.
- **Accès :** authentification et filtrage par permission.
- **Disposition :** en-tête avec champ principal ; filtres par domaine, section, classe, période et statut ; résultats groupés par type ; panneau de recherche enregistrée.
- **Actions :** ouvrir la fiche, enregistrer/supprimer un favori, réinitialiser les filtres.
- **États :** suggestions, recherche en cours, aucun résultat, erreur, résultats paginés.
- **Composants :** autocomplete/popover, select, table/carte responsive, empty state.
- **Dépendances :** résultats typés de `advanced-search.service.ts` ; endpoint global à confirmer.
- **Justification :** évite de laisser une feature existante non accessible.

### 16.4 Suivi des paiements et reçus

- **Rôle :** finance.
- **Objectif :** clarifier le workflow existant `/payments/list` → reçu.
- **Disposition :** titre et période ; cartes total/encaissé/en attente ; filtres ; tableau ; panneau détail avec historique et actions imprimer/télécharger.
- **Actions :** créer, consulter, générer, télécharger, imprimer ; confirmation avant suppression.
- **Statuts :** payé, en attente, annulé, reçu disponible/non disponible.
- **États :** chargement par section, liste vide, erreur billing/fallback, succès avec numéro de reçu.
- **Dépendances :** `payment-list.repository`, `payment-form.repository`, service PDF ; disponibilité des deux APIs à confirmer.
- **Justification :** rend visible la différence entre opération métier et génération de document.

## 17. Matrice de priorisation

| ID | Proposition | Type | Module | Rôle | Priorité | Complexité frontend | Valeur ajoutée | Dépendance backend |
|---|---|---|---|---|---|---|---|---|
| P0-01 | Matrice de permissions et routes | Sécurité frontend | Core/routes | Tous | Critique | Moyenne | Accès cohérents | Mapping à confirmer |
| P0-02 | États de workflow standardisés | UX/UI | Shared + toutes features | Tous | Critique | Moyenne | Confiance et récupération | Contrats d’erreur à confirmer |
| P0-03 | Tests guards/intercepteurs/routes | Test | Core | Tous | Critique | Moyenne | Non-régression | Aucun direct |
| P1-01 | Profil étudiant | Interface | Students | Staff/admin | Haute | Élevée | Vue 360° | Données agrégées à confirmer |
| P1-02 | Affectations pédagogiques | Fonctionnalité | Classes/teachers | Admin/pédagogique | Haute | Élevée | Organisation fiable | Règles de conflit à confirmer |
| P1-03 | Recherche globale routée | Fonctionnalité | Search/header | Tous | Haute | Moyenne | Gain de temps | Endpoint/droits à confirmer |
| P1-04 | Centralisation des endpoints | Refactoring | Core/infrastructure | Équipe frontend | Haute | Moyenne | Déploiement sûr | Aucun direct |
| P1-05 | Harmonisation des conventions | Refactoring | Shared/features | Équipe frontend | Haute | Moyenne | Maintenabilité | Aucun direct |
| P2-01 | Contexte année/période global | UX/UI | Header/academic | Académique/admin | Moyenne | Élevée | Moins d’erreurs | Portée API à confirmer |
| P2-02 | Responsive tables et actions | Responsive | Shared/features | Tous | Moyenne | Moyenne | Usage mobile | Aucun direct |
| P2-03 | Audit accessibilité shared | Accessibilité | Shared/layout | Tous | Moyenne | Moyenne | Inclusion | Aucun direct |
| P3-01 | Communication interne/parents | Fonctionnalité | Communication/parents | Admin/parents | Basse | Élevée | Collaboration | API, websocket, confidentialité |
| P3-02 | Centre de notifications complet | Fonctionnalité | Core/communication | Tous | Basse | Élevée | Réactivité | Websocket à confirmer |

## 18. Plan d’évolution du frontend

### Phase 1 — Stabilisation

- **Tâches :** inventorier les routes réellement accessibles ; couvrir guards et intercepteurs ; vérifier les routes dupliquées ; retirer des menus les liens trompeurs ou les marquer explicitement non disponibles ; passer le contrôle d’architecture en CI.
- **Composants concernés :** `app.routes.ts`, guards, sidebar, forbidden, `app.config.ts`.
- **Dépendances :** mapping des rôles et permissions à confirmer.
- **Priorité/complexité :** Critique / Moyenne.
- **Risques :** bloquer un rôle légitime ; prévoir matrice de tests.
- **Résultat attendu :** aucune route métier sensible sans politique explicite et aucun lien de menu ambigu.

### Phase 2 — Finalisation des interfaces existantes

- **Tâches :** standardiser succès/erreur/vide/loading ; ajouter confirmations ; connecter les actions visibles ; clarifier paiement/reçu ; documenter les écrans “coming soon”.
- **Composants concernés :** `shared/ui`, élèves, attendance, grades, payments, settings, support.
- **Dépendances :** contrats d’erreur et statuts backend à confirmer.
- **Priorité/complexité :** Critique / Moyenne.
- **Risques :** doubles notifications avec intercepteurs ; définir la source de vérité.
- **Résultat attendu :** chaque action importante produit un retour explicite et récupérable.

### Phase 3 — Fonctionnalités manquantes

- **Tâches :** profil étudiant, assignations, recherche globale, historique des actions métier, suivi des parents/messages si validé.
- **Composants concernés :** students, classes, teachers, search, parents, communication.
- **Dépendances :** endpoints et droits à confirmer.
- **Priorité/complexité :** Haute / Élevée.
- **Risques :** écrans trop agrégés, incohérence entre données de domaines.
- **Résultat attendu :** parcours d’inscription, organisation et recherche complets.

### Phase 4 — Amélioration UX/UI

- **Tâches :** tokens et conventions de design ; navigation responsive ; filtres et tableaux cohérents ; i18n des textes codés en dur ; audit clavier/ARIA/contraste.
- **Composants concernés :** sidebar/header, shared UI, formulaires et tableaux.
- **Dépendances :** choix de convention SCSS/Tailwind/Material.
- **Priorité/complexité :** Haute / Moyenne.
- **Risques :** régression visuelle ; valider par captures et tests de viewport.
- **Résultat attendu :** expérience cohérente sur desktop, tablette et mobile.

### Phase 5 — Optimisation technique

- **Tâches :** centraliser endpoints ; supprimer doublons après preuve ; typer recherche et réponses HTTP ; clarifier stores/facades ; tests de parcours ; surveiller bundles PDF/Excel/graphiques.
- **Composants concernés :** infrastructure, application, shared, configuration.
- **Dépendances :** contrats API et stratégie d’état.
- **Priorité/complexité :** Moyenne / Moyenne à élevée.
- **Risques :** refactoring transversal et régressions silencieuses.
- **Résultat attendu :** code plus prévisible, testable et moins coûteux à faire évoluer.

## 19. Risques et précautions

- Ne pas considérer un guard frontend comme une sécurité suffisante : le backend doit contrôler chaque opération.
- Ne pas supprimer `shared/domaines`, `search` ou les scripts de migration avant une recherche d’imports et une validation d’usage.
- Ne pas fusionner les services paiements sans comprendre le fallback billing/API principale.
- Préserver le contexte de filtres et de pagination lors de l’ajout des écrans de détail.
- Tester les exports sur navigateur réel et avec données vides, accents, longues listes et erreurs réseau.
- Vérifier les contrats de dates, fuseaux, montants FCFA, statuts et fichiers avant de figer les DTO frontend.
- Encadrer les websockets STOMP/SockJS : reconnexion, déconnexion, session expirée et nettoyage des souscriptions.
- Mesurer les bundles après ajout de pages de rapports ou exports ; les bibliothèques PDF, Excel, canvas et graphiques peuvent peser sur le chargement initial si le lazy loading n’est pas suffisant.
- Maintenir l’i18n : les textes visibles actuellement codés en dur doivent être recensés avant toute traduction partielle.
- Valider l’accessibilité des composants shared avant de corriger page par page.

## 20. Conclusion

Le frontend fournit déjà une base crédible de système de gestion scolaire, avec une couverture métier large et une architecture Angular moderne. Le principal enjeu n’est pas d’ajouter immédiatement des modules, mais de rendre cohérents les accès, les workflows et les états d’interface.

La séquence recommandée est : sécuriser et tester les routes, finaliser les actions et retours utilisateur, compléter le profil étudiant/la recherche/les affectations, puis harmoniser responsive, accessibilité, i18n et conventions techniques. La communication interne et les fonctionnalités parents doivent rester planifiées comme évolutions distinctes, car leur réalisation dépend de contrats de données et de confidentialité qui ne sont pas démontrables dans le frontend actuel.

Ce rapport n’a modifié aucun fichier applicatif et ne propose aucune refonte backend détaillée.
