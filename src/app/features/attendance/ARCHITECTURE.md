# Architecture Visuelle - Module Attendance

## Vue d'ensemble des Couches

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Daily      │  │   Absence    │  │Justification │          │
│  │  Component   │  │  Component   │  │  Component   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│         └─────────────────┼──────────────────┘                   │
│                           │                                      │
│                    ┌──────▼───────┐                              │
│                    │     Store    │                              │
│                    └──────┬───────┘                              │
└───────────────────────────┼──────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                       APPLICATION                                │
│                    ┌──────────────┐                              │
│                    │    Facade    │                              │
│                    └──────┬───────┘                              │
│                           │                                      │
│                    ┌──────▼───────┐                              │
│                    │   Use Case   │                              │
│                    └──────┬───────┘                              │
└───────────────────────────┼──────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                         DOMAIN                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Models     │  │ Repositories │  │   Services   │          │
│  │  (Entities)  │  │ (Interfaces) │  │   (Logic)    │          │
│  └──────────────┘  └──────┬───────┘  └──────────────┘          │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            │ implements
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                     INFRASTRUCTURE                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Repository  │  │   Service    │  │    Mapper    │          │
│  │    Impl      │  │     HTTP     │  │   API ↔ DTO  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘          │
└─────────┼──────────────────┼────────────────────────────────────┘
          │                  │
          └────────┬─────────┘
                   │
                   ▼
            ┌─────────────┐
            │   BACKEND   │
            │  (Spring)   │
            └─────────────┘
```

## Flux de Données Détaillé

### 1. Chargement Initial

```
User Action: Ouvre la page
    │
    ▼
Component.ngOnInit()
    │
    ▼
Store.initialize()
    │
    ▼
Facade.initialize()
    │
    ▼
UseCase.initialize()
    │
    ├─► UseCase.loadSections()
    │       │
    │       ▼
    │   Repository.getSections()
    │       │
    │       ▼
    │   HTTP GET /section
    │       │
    │       ▼
    │   Backend Response
    │       │
    │       ▼
    │   Signal: sections.set([...])
    │
    └─► UseCase.watchFormChanges()
            │
            ▼
        Subscribe to form changes
```

### 2. Sélection de Section

```
User Action: Sélectionne une section
    │
    ▼
Form.sectionId.valueChanges
    │
    ▼
UseCase.loadClassesBySection(sectionId)
    │
    ▼
Repository.getClassesBySection(sectionId)
    │
    ▼
HTTP GET /classes/by-section/{id}
    │
    ▼
Backend Response
    │
    ▼
Signal: classes.set([...])
    │
    ▼
Component: Affiche les classes
```

### 3. Chargement des Élèves

```
User Action: Sélectionne classe + date
    │
    ▼
Form.classId.valueChanges + Form.date.valueChanges
    │
    ▼
UseCase.refreshStudents()
    │
    ├─► Repository.getActiveSchoolYear()
    │       │
    │       ▼
    │   HTTP GET /annees-scolaires/active
    │       │
    │       ▼
    │   schoolYearId
    │
    └─► Repository.getDailyRecords(classId, date, schoolYearId)
            │
            ▼
        HTTP GET /attendance/records?classId=X&date=Y&anneeScolaireId=Z
            │
            ▼
        Backend Response (Array<AttendanceRecord>)
            │
            ▼
        Mapper: date [2024,1,15] → "2024-01-15"
            │
            ▼
        DomainService.mapRecordsToStudentRows()
            │
            ▼
        Signal: students.set([...])
            │
            ▼
        Component: Affiche le tableau
```

### 4. Modification de Statut

```
User Action: Change statut d'un élève
    │
    ▼
Component: (click)="store.setStatus(row, 'ABSENT')"
    │
    ▼
Store.setStatus(row, status)
    │
    ▼
Facade.setStatus(row, status)
    │
    ▼
UseCase.setStatus(row, status)
    │
    ▼
DomainService.updateRowStatus(rows, studentId, status)
    │
    ▼
Signal: students.update(...)
    │
    ▼
Component: Affiche le nouveau statut
```

### 5. Sauvegarde

```
User Action: Clique sur "Valider"
    │
    ▼
Component: store.markAttendance()
    │
    ▼
Store.markAttendance()
    │
    ▼
Facade.markAttendance()
    │
    ▼
UseCase.markAttendance()
    │
    ├─► Validation du formulaire
    │
    ├─► DomainService.buildSavePayload()
    │       │
    │       ▼
    │   {
    │     classId: 10,
    │     className: "CP-A",
    │     date: "2024-01-15",
    │     entries: [...]
    │   }
    │
    └─► Repository.saveDailyAttendance(payload)
            │
            ▼
        HTTP POST /attendance/daily
            │
            ▼
        Backend: Sauvegarde en DB
            │
            ▼
        Backend Response: Array<AttendanceRecord>
            │
            ▼
        Mapper: Transforme la réponse
            │
            ▼
        UseCase: showToast("Succès")
            │
            ▼
        UseCase.refreshStudents()
            │
            ▼
        Component: Affiche le toast
```

## Diagramme de Classes

```
┌─────────────────────────────────────┐
│   DailyAttendanceComponent          │
│  ─────────────────────────────────  │
│  - store: AttendanceDailyStore      │
│  ─────────────────────────────────  │
│  + ngOnInit(): void                 │
└──────────────┬──────────────────────┘
               │ injects
               ▼
┌─────────────────────────────────────┐
│   AttendanceDailyStore              │
│  ─────────────────────────────────  │
│  - facade: AttendanceDailyFacade    │
│  ─────────────────────────────────  │
│  + initialize(): void               │
│  + setStatus(): void                │
│  + markAttendance(): void           │
└──────────────┬──────────────────────┘
               │ injects
               ▼
┌─────────────────────────────────────┐
│   AttendanceDailyFacade             │
│  ─────────────────────────────────  │
│  - useCase: DailyAttendanceUseCase  │
│  ─────────────────────────────────  │
│  + initialize(): void               │
│  + setStatus(): void                │
│  + markAttendance(): void           │
└──────────────┬──────────────────────┘
               │ injects
               ▼
┌─────────────────────────────────────┐
│   DailyAttendanceUseCase            │
│  ─────────────────────────────────  │
│  - repository: Repository           │
│  - domain: DomainService            │
│  - sections: Signal<Section[]>      │
│  - students: Signal<Student[]>      │
│  ─────────────────────────────────  │
│  + initialize(): void               │
│  + loadSections(): void             │
│  + refreshStudents(): void          │
│  + markAttendance(): void           │
└──────────────┬──────────────────────┘
               │ injects
               ▼
┌─────────────────────────────────────┐
│   DailyAttendanceRepository         │
│         (Abstract)                  │
│  ─────────────────────────────────  │
│  + getSections(): Observable        │
│  + getClassesBySection(): Observable│
│  + getDailyRecords(): Observable    │
│  + saveDailyAttendance(): Observable│
└──────────────┬──────────────────────┘
               │ implements
               ▼
┌─────────────────────────────────────┐
│ DailyAttendanceRepositoryAdapter    │
│  ─────────────────────────────────  │
│  - http: HttpClient                 │
│  ─────────────────────────────────  │
│  + getSections(): Observable        │
│  + getClassesBySection(): Observable│
│  + getDailyRecords(): Observable    │
│  + saveDailyAttendance(): Observable│
└─────────────────────────────────────┘
```

## Diagramme de Séquence - Sauvegarde

```
User    Component    Store    Facade    UseCase    Domain    Repository    Backend
 │          │          │         │          │         │           │           │
 │ Click    │          │         │          │         │           │           │
 ├─────────►│          │         │          │         │           │           │
 │          │ mark()   │         │          │         │           │           │
 │          ├─────────►│         │          │         │           │           │
 │          │          │ mark()  │          │         │           │           │
 │          │          ├────────►│          │         │           │           │
 │          │          │         │ mark()   │         │           │           │
 │          │          │         ├─────────►│         │           │           │
 │          │          │         │          │ build() │           │           │
 │          │          │         │          ├────────►│           │           │
 │          │          │         │          │◄────────┤           │           │
 │          │          │         │          │ payload │           │           │
 │          │          │         │          │         │           │           │
 │          │          │         │          │ save(payload)       │           │
 │          │          │         │          ├────────────────────►│           │
 │          │          │         │          │                     │ POST      │
 │          │          │         │          │                     ├──────────►│
 │          │          │         │          │                     │           │
 │          │          │         │          │                     │◄──────────┤
 │          │          │         │          │◄────────────────────┤ response  │
 │          │          │         │          │ records             │           │
 │          │          │         │          │                     │           │
 │          │          │         │          │ toast("Succès")     │           │
 │          │◄─────────┴─────────┴──────────┤                     │           │
 │◄─────────┤                               │                     │           │
 │ Toast    │                               │                     │           │
```

## État des Signals

```
┌─────────────────────────────────────────────────────────────┐
│                    UseCase Signals                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  sections: Signal<Section[]>                                │
│  ├─ Initialisé: []                                          │
│  └─ Après loadSections(): [{id:1, libelle:"Primaire"}, ...] │
│                                                             │
│  classes: Signal<Class[]>                                   │
│  ├─ Initialisé: []                                          │
│  └─ Après sélection section: [{id:10, name:"CP-A"}, ...]   │
│                                                             │
│  students: Signal<StudentAttendanceRow[]>                   │
│  ├─ Initialisé: []                                          │
│  └─ Après sélection classe+date: [                         │
│      {studentId:100, name:"Jean", status:"PRESENT", ...},   │
│      {studentId:101, name:"Marie", status:"ABSENT", ...}    │
│     ]                                                       │
│                                                             │
│  loadingSections: Signal<boolean>                           │
│  ├─ Avant requête: true                                     │
│  └─ Après requête: false                                    │
│                                                             │
│  saving: Signal<boolean>                                    │
│  ├─ Avant save: true                                        │
│  └─ Après save: false                                       │
│                                                             │
│  toast: Signal<{visible, title, message, variant}>          │
│  ├─ Initial: {visible: false, ...}                          │
│  └─ Après action: {visible: true, title:"Succès", ...}     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Mapping Backend ↔ Frontend

```
Backend (Java)                    Frontend (TypeScript)
─────────────────────────────────────────────────────────────

AttendanceRecord {                AttendanceRecord {
  id: Long                          id: number
  studentId: Long                   studentId: number
  studentName: String               studentName: string
  classId: Long                     classId: number
  className: String                 className: string
  date: LocalDate                   date: string
    → [2024, 1, 15]                   → "2024-01-15"
  status: AttendanceStatus          status: AttendanceStatus
  hours: BigDecimal                 hours: number
    → 4.0                             → 4
  justified: boolean                justified: boolean
  justificationNote: String         justificationNote?: string
  updatedAt: LocalDateTime          updatedAt: string
}                                 }

AttendanceStatus (enum)           AttendanceStatus (type)
  - PRESENT                         - "PRESENT"
  - ABSENT                          - "ABSENT"
  - LATE                            - "LATE"
```

## Points d'Extension

### Ajouter un nouveau statut

1. **Backend**: Ajouter dans `AttendanceStatus.java`
```java
public enum AttendanceStatus {
    PRESENT, ABSENT, LATE, EXCUSED  // ← Nouveau
}
```

2. **Frontend**: Ajouter dans `attendance.model.ts`
```typescript
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
```

3. **Domain**: Adapter la logique dans `daily-attendance-domain.service.ts`
```typescript
normalizeHours(status: AttendanceStatus, hours: number): number {
  if (status === 'PRESENT' || status === 'EXCUSED') {
    return 0;
  }
  // ...
}
```

### Ajouter un nouveau endpoint

1. **Domain**: Ajouter dans l'interface `daily-attendance.repository.ts`
```typescript
abstract getAttendanceByStudent(studentId: number): Observable<AttendanceRecord[]>;
```

2. **Infrastructure**: Implémenter dans `daily-attendance.repository.ts`
```typescript
override getAttendanceByStudent(studentId: number) {
  return this.http.get<any>(`${environment.apiUrl}/attendance/by-student/${studentId}`);
}
```

3. **Application**: Utiliser dans le use case
```typescript
loadStudentHistory(studentId: number) {
  this.repository.getAttendanceByStudent(studentId).subscribe(...);
}
```

## Conclusion

Cette architecture garantit:
- ✅ Séparation des responsabilités
- ✅ Testabilité maximale
- ✅ Maintenabilité à long terme
- ✅ Évolutivité facile
- ✅ Indépendance des couches
