# Architecture actuelle & écarts (Primary-School)

## Correspondance `features/` ↔ `domains/`

Le code utilise **`src/app/features/`** au lieu de `domains/`. C'est **équivalent fonctionnel** ; une migration de dossiers est optionnelle (rename + alias TypeScript).

| Spec `domains/` | Projet actuel `features/` | Maturité DDD |
|---|---|---|
| auth | auth | Moyenne |
| dashboard | dashboard | Moyenne |
| students | students | **Élevée** (entities, store, use-cases) |
| teachers | teachers | Élevée |
| parents | parent | Moyenne |
| classes | classes | Moyenne |
| subjects | subjects | Moyenne |
| grades | grades | Élevée |
| payments | payments | Moyenne |
| enrollments | inscriptionstudent | Moyenne |
| attendance | attendance | **Élevée** (récent) |
| users | settings/users | Partielle |
| notifications | core/notification | Hors feature |
| reports | reports | Moyenne |
| settings | settings, gestion-annees | Partielle |
| schedules | teachers (schedule) | Partielle |
| bulletins | grades/bulletin | Partielle |

## Core — état

| Élément spec | Statut |
|---|---|
| auth.guard | ✅ `core/guards/auth.guard.ts` |
| role.guard | ✅ `core/guards/role.guard.ts` |
| permission.guard | ✅ `core/guards/permission.guard.ts` |
| jwt interceptor | ✅ `auth.interceptor.ts` |
| error interceptor | ✅ ajouté `error.interceptor.ts` |
| loading interceptor | ✅ ajouté `loading.interceptor.ts` |
| rbac.service | ✅ ajouté `core/security/rbac.service.ts` |
| api-endpoints.config | ✅ ajouté `core/configuration/api-endpoints.config.ts` |
| token.service séparé | ⚠️ fusionné dans `session.service.ts` |
| storage.service | ⚠️ via `session` / `browser-api` |
| app.state global | ❌ à introduire si besoin |

## Shared & UI

| Spec | Statut |
|---|---|
| PrimeNG | ❌ non installé — UI = **shared/ui** custom + Angular Material |
| has-role / has-permission | ✅ directives ajoutées |
| data-table PrimeNG | ❌ — `shared/ui/table` custom |

## Présences (attendance) — référence DDD

```
attendance/
├── domain/           models, repositories (ports), domain services
├── application/      use-cases, facades, management service
├── infrastructure/   HTTP, mappers, adapters
└── presentation/     pages + store Signals (daily)
```

API : microservice `8083` + roster via monolithe `8080`.

## Commandes qualité

```bash
npm run architecture:check   # frontières presentation / HTTP
npm run build
```

## Plan de convergence recommandé

1. **Phase 1** — Core complet (interceptors, RBAC, endpoints) ✅  
2. **Phase 2** — Store + Facade par domaine pilote ✅ (attendance, students, grades, payments/receipts)  
3. **Phase 3** — `roleGuard` sur routes sensibles ✅ (students, attendance, grades, payments, annees, montant, settings)  
4. **Phase 4** — PrimeNG **ou** consolider le design system custom (décision produit)  
5. **Phase 5** — Rename `features` → `domains` si l'équipe le valide  
