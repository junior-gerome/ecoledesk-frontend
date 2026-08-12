# Module Attendance - Architecture DDD

## Vue d'ensemble

Ce module gère le pointage des présences/absences des élèves selon l'architecture Domain-Driven Design (DDD).

## Structure des Couches

### 📦 Domain (Logique Métier)
**Responsabilité**: Contient la logique métier pure, indépendante de toute infrastructure.

```
domain/
├── models/                    # Entités et types métier
│   ├── attendance.model.ts    # Types: AttendanceRecord, AttendanceStatus, etc.
│   ├── student-attendance-row.model.ts
│   └── index.ts
├── repositories/              # Interfaces (contrats)
│   └── daily-attendance.repository.ts
└── services/                  # Services de domaine
    └── daily-attendance-domain.service.ts
```

**Règles**:
- ❌ Pas d'import Angular (@angular/*)
- ❌ Pas d'appels HTTP
- ✅ Logique métier pure
- ✅ Calculs, validations, transformations

### 🎯 Application (Use Cases)
**Responsabilité**: Orchestration de la logique métier pour répondre aux besoins applicatifs.

```
application/
├── facades/                   # Pattern Facade
│   └── attendance-daily.facade.ts
└── use-cases/                 # Cas d'utilisation
    └── daily-attendance.use-case.ts
```

**Règles**:
- ✅ Utilise les services de domaine
- ✅ Gère les états (signals)
- ✅ Orchestre les appels repository
- ❌ Pas d'appels HTTP directs

### 🔌 Infrastructure (Implémentation)
**Responsabilité**: Implémentation concrète des interfaces, communication externe.

```
infrastructure/
├── daily-attendance.repository.ts      # Implémentation du repository
├── daily-attendance.repository.spec.ts # Tests
├── attendance.service.ts               # Service HTTP général
└── attendance-api.mapper.ts            # Mapping API ↔ Domain
```

**Règles**:
- ✅ Implémente les interfaces du domaine
- ✅ Appels HTTP
- ✅ Mapping des données
- ✅ Gestion des erreurs réseau

### 🎨 Presentation (UI)
**Responsabilité**: Composants visuels et gestion de l'état UI.

```
presentation/
├── daily/                     # Composant pointage journalier
│   ├── daily-attendance.component.ts
│   ├── daily-attendance.component.html
│   └── daily-attendance.component.scss
├── absence/                   # Composant suivi des absences
├── justification/             # Composant justifications
└── store/                     # State management
    └── attendance-daily.store.ts
```

**Règles**:
- ✅ Injecte le Store
- ✅ Gère l'affichage
- ❌ Pas de logique métier
- ❌ Pas d'appels HTTP directs

## Flux de Données

```
Component → Store → Facade → UseCase → Repository → Backend
                              ↓
                         Domain Service
```

### Exemple: Sauvegarder un pointage

```typescript
// 1. Component
markAttendance() {
  this.store.markAttendance();
}

// 2. Store
markAttendance() {
  this.facade.markAttendance();
}

// 3. Facade
markAttendance() {
  this.dailyUseCase.markAttendance();
}

// 4. UseCase
markAttendance() {
  const payload = this.domain.buildSavePayload({...});
  this.repository.saveDailyAttendance(payload).subscribe(...);
}

// 5. Repository
saveDailyAttendance(payload) {
  return this.http.post('/attendance/daily', payload);
}
```

## Dépendances entre Couches

```
Presentation → Application → Domain ← Infrastructure
                                ↑
                                └─── implémente
```

- **Presentation** dépend de **Application**
- **Application** dépend de **Domain**
- **Infrastructure** implémente **Domain**
- **Domain** ne dépend de personne (pure)

## Providers

Les providers sont déclarés au niveau du composant pour l'isolation:

```typescript
@Component({
  providers: [
    DailyAttendanceRepositoryAdapter,
    {
      provide: DailyAttendanceRepository,
      useExisting: DailyAttendanceRepositoryAdapter,
    },
    DailyAttendanceDomainService,
    DailyAttendanceUseCase,
    AttendanceDailyFacade,
    AttendanceDailyStore,
  ],
})
export class DailyAttendanceComponent {}
```

## Tests

### Tests Unitaires
```bash
# Tester le repository
ng test --include='**/daily-attendance.repository.spec.ts'

# Tester le composant
ng test --include='**/daily-attendance.component.spec.ts'
```

### Tests d'Intégration
```bash
# Tester tout le module
ng test --include='**/attendance/**/*.spec.ts'
```

## Bonnes Pratiques

### ✅ À FAIRE
- Utiliser les interfaces du domaine
- Mapper les données dans l'infrastructure
- Gérer les erreurs à chaque couche
- Tester chaque couche indépendamment
- Utiliser les signals pour l'état

### ❌ À ÉVITER
- Appels HTTP dans le domaine
- Logique métier dans les composants
- Dépendances circulaires
- Couplage fort entre couches
- État global non contrôlé

## Entités Principales

### AttendanceRecord
```typescript
interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  date: string;
  status: AttendanceStatus;
  hours: number;
  justified: boolean;
  justificationNote?: string;
  updatedAt: string;
}
```

### AttendanceStatus
```typescript
type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";
```

### SaveDailyAttendancePayload
```typescript
interface SaveDailyAttendancePayload {
  classId: number;
  className: string;
  date: string;
  entries: DailyAttendanceEntryInput[];
}
```

## Endpoints Backend

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/section` | Liste des sections |
| GET | `/classes/by-section/{id}` | Classes d'une section |
| GET | `/annees-scolaires/active` | Année scolaire active |
| GET | `/inscription/by-class/{id}` | Élèves d'une classe |
| GET | `/attendance/records` | Pointages avec filtres |
| POST | `/attendance/daily` | Sauvegarder pointage journalier |
| PATCH | `/attendance/records/{id}/justification` | Justifier une absence |
| DELETE | `/attendance/records/{id}` | Supprimer un pointage |

## Maintenance

### Ajouter un nouveau cas d'utilisation
1. Créer l'interface dans `domain/repositories/`
2. Implémenter dans `infrastructure/`
3. Créer le use case dans `application/use-cases/`
4. Exposer via la facade
5. Utiliser dans le store
6. Consommer dans le composant

### Modifier une entité
1. Modifier dans `domain/models/`
2. Mettre à jour le mapper dans `infrastructure/`
3. Adapter les use cases si nécessaire
4. Mettre à jour les tests

## Support

Pour toute question sur l'architecture:
- Consulter `AUDIT_ATTENDANCE.md` pour l'audit complet
- Vérifier les tests pour des exemples d'utilisation
- Suivre les patterns existants
