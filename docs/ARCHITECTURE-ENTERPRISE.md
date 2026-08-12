# Frontend Angular Enterprise — School Management System

> **Rôle** : Architecte Logiciel Senior · Expert Angular 18+ · DDD · Clean Architecture · UX/UI Moderne  
> **Stack cible** : Angular 18+ · Signals · Tailwind CSS · PrimeNG (cible) · TypeScript Strict · RxJS

Ce document est la **référence cible**. Pour l'état réel du dépôt et le plan de convergence, voir [ARCHITECTURE-CURRENT.md](./ARCHITECTURE-CURRENT.md).

---

## Objectif global

Frontend Angular **professionnel, scalable, maintenable, modulaire et prêt pour la production** pour une application complète de gestion d'école.

### Périmètre fonctionnel

| Domaine | Description |
|---|---|
| Authentification | JWT, sessions, refresh token, MFA |
| Utilisateurs | CRUD, rôles, permissions |
| Élèves | Gestion complète, import/export |
| Enseignants | Affectations matières & classes |
| Parents | Suivi enfants, communications |
| Classes | Organisation, affectations |
| Matières | Catalogue, volumes horaires |
| Notes | Saisie, moyennes, classements |
| Bulletins | Génération PDF, archivage |
| Paiements | Suivi, reçus, historique |
| Inscriptions | Workflow complet |
| Présences | Appel, statistiques |
| Emplois du temps | Planification, conflits |
| Notifications | Temps réel, historique |
| Rapports | Analytique, exports |
| Dashboard | KPIs, graphiques |
| Paramètres | Configuration système |

---

## Technologies obligatoires (cible)

- Angular 18+ · Standalone Components · Signals · RxJS
- Tailwind CSS · Reactive Forms · TypeScript strict
- DDD · Clean Architecture · Repository · Use Cases · Lazy Loading

---

## Structure DDD cible

```
src/app/
├── core/
├── shared/
├── layout/
└── domains/          # cible (aujourd'hui: features/)
    └── [domain]/
        ├── domain/
        ├── application/
        ├── infrastructure/
        └── presentation/
```

---

## Règles d'architecture

```
✅  Domain sans dépendance Angular
✅  Logique métier dans les Use Cases
✅  Pas d'HTTP dans presentation/
✅  Repository Pattern (port domain / impl infrastructure)
✅  Signals pour le state UI
✅  Lazy loading par domaine
✅  Guards + Interceptors JWT / Error / Loading

❌  Pas de logique métier dans les composants
❌  Pas de HttpClient direct dans les stores
❌  Pas de any implicite
```

---

## Objectif final

```
Frontend Angular DDD  ↔  HTTP/REST + JWT  ↔  Backend Spring Boot DDD
```

---

*Référence v1.0 — School Management System*
