# Guide de Migration des Imports

## Changements d'imports après restructuration DDD

### Core Models (conservés)

✅ **Aucun changement nécessaire pour :**
```typescript
import { ApiModels } from '@app/core/models/api.models';
import { AuthModels } from '@app/core/models/auth.models';
import { AuthState } from '@app/core/models/auth-state.model';
import { NavigationModel } from '@app/core/models/navigation.model';
import { NotificationModel } from '@app/core/models/notification.model';
```

**Nouveau (recommandé) :**
```typescript
import { ApiModels, AuthModels, AuthState, NavigationModel, NotificationModel } from '@app/core/models';
```

### Models déplacés vers Features

#### Attendance
```typescript
// ❌ Ancien
import { AttendanceModel } from '@app/core/models/attendance/attendance.model';

// ✅ Nouveau
import { AttendanceModel } from '@app/features/attendance/domain/models';
```

#### Classes
```typescript
// ❌ Ancien
import { ClassInterface } from '@app/core/models/classes/class.interface';

// ✅ Nouveau
import { ClassInterface } from '@app/features/classes/domain/models';
```

#### Grades
```typescript
// ❌ Ancien
import { BulletinRow } from '@app/core/models/BulletinRow/BulletinRow.model';
import { CreateGradeRequest } from '@app/core/models/CreateGradeRequest/CreateGradeRequest.model';
import { GradeResponse } from '@app/core/models/GradeResponse/GradeResponse.model';
import { GradeStats } from '@app/core/models/GradeStats/GradeStats.model';
import { StudentRankingItem } from '@app/core/models/StudentRankingItem/StudentRankingItem.model';
import { StudentReport } from '@app/core/models/StudentReport/StudentReport.model';
import { SubjectAverage } from '@app/core/models/SubjectAverage/SubjectAverage.model';

// ✅ Nouveau
import { 
  BulletinRow, 
  CreateGradeRequest, 
  GradeResponse, 
  GradeStats, 
  StudentRankingItem, 
  StudentReport, 
  SubjectAverage 
} from '@app/features/grades/domain/models';
```

#### Students
```typescript
// ❌ Ancien
import { StudentStatistics } from '@app/core/models/student-statistics/student-statistics.model';
import { StudentByClasseDTO } from '@app/core/models/StudentByCountClass/studentByClasseDTO';
import { StudentBySectionCountDto } from '@app/core/models/studentBySectionCountDto/StudentBySectionCountDto';

// ✅ Nouveau
import { 
  StudentStatistics, 
  StudentByClasseDTO, 
  StudentBySectionCountDto 
} from '@app/features/students/domain/models';
```

#### Parents
```typescript
// ❌ Ancien
import { ParentsModel } from '@app/core/models/parent/parents.model';

// ✅ Nouveau
import { ParentsModel } from '@app/features/parent/domain/models';
```

#### Payments
```typescript
// ❌ Ancien
import { PaymentModel } from '@app/core/models/payment/payment.model';

// ✅ Nouveau
import { PaymentModel } from '@app/features/payments/domain/models';
```

#### Reports
```typescript
// ❌ Ancien
import { ReportsModel } from '@app/core/models/reports/reports.model';

// ✅ Nouveau
import { ReportsModel } from '@app/features/reports/domain/models';
```

#### Section
```typescript
// ❌ Ancien
import { SectionInterface } from '@app/core/models/section/section.interface';
import { Subsection } from '@app/core/models/Subsection';

// ✅ Nouveau
import { SectionInterface, Subsection } from '@app/features/section/domain/models';
```

#### Sequence
```typescript
// ❌ Ancien
import { Sequence } from '@app/core/models/sequences/Sequence';

// ✅ Nouveau
import { Sequence } from '@app/features/sequence/domain/models';
```

#### Subjects
```typescript
// ❌ Ancien
import { Subject } from '@app/core/models/subjects/subject';

// ✅ Nouveau
import { Subject } from '@app/features/subjects/domain/models';
```

#### Teachers
```typescript
// ❌ Ancien
import { Teacher } from '@app/core/models/teachers/teacher';

// ✅ Nouveau
import { Teacher } from '@app/features/teachers/domain/models';
```

#### Trimestre
```typescript
// ❌ Ancien
import { Trimestre } from '@app/core/models/trimestre/Trimestre';

// ✅ Nouveau
import { Trimestre } from '@app/features/trimestre/domain/models';
```

#### Support
```typescript
// ❌ Ancien
import { SupportModel } from '@app/core/models/support/support.model';

// ✅ Nouveau
import { SupportModel } from '@app/features/support/domain/models';
```

#### Montant
```typescript
// ❌ Ancien
import { Montant } from '@app/core/models/montant/montant';

// ✅ Nouveau
import { Montant } from '@app/features/montant/domain/models';
```

#### Année Scolaire
```typescript
// ❌ Ancien
import { AnneeScolaire } from '@app/core/models/annee/annee-scolaire';

// ✅ Nouveau
import { AnneeScolaire } from '@app/features/gestion-annees/domain/models';
```

#### Inscription
```typescript
// ❌ Ancien
import { Inscription } from '@app/core/models/inscriptionStudent/inscription';

// ✅ Nouveau
import { Inscription } from '@app/features/inscriptionstudent/domain/models';
```

### Services déplacés vers Infrastructure

#### Attendance
```typescript
// ❌ Ancien
import { AttendanceService } from '@app/core/services/attendance/attendance.service';

// ✅ Nouveau
import { AttendanceService } from '@app/features/attendance/infrastructure';
```

#### Classes
```typescript
// ❌ Ancien
import { ClassRoomService } from '@app/core/services/classe/classRoom.service';

// ✅ Nouveau
import { ClassRoomService } from '@app/features/classes/infrastructure';
```

#### Grades
```typescript
// ❌ Ancien
import { GradesService } from '@app/core/services/grades/grades.service';

// ✅ Nouveau
import { GradesService } from '@app/features/grades/infrastructure';
```

#### Montant
```typescript
// ❌ Ancien
import { MontantService } from '@app/core/services/montant/montant.service';

// ✅ Nouveau
import { MontantService } from '@app/features/montant/infrastructure';
```

#### Parent
```typescript
// ❌ Ancien
import { ParentService } from '@app/core/services/parent/parent.service';

// ✅ Nouveau
import { ParentService } from '@app/features/parent/infrastructure';
```

#### Payment
```typescript
// ❌ Ancien
import { PaymentService } from '@app/core/services/payment/payment.service';

// ✅ Nouveau
import { PaymentService } from '@app/features/payments/infrastructure';
```

#### Reports
```typescript
// ❌ Ancien
import { ReportsService } from '@app/core/services/reports/reports.service';

// ✅ Nouveau
import { ReportsService } from '@app/features/reports/infrastructure';
```

#### Section
```typescript
// ❌ Ancien
import { SectionService } from '@app/core/services/section/section.service';

// ✅ Nouveau
import { SectionService } from '@app/features/section/infrastructure';
```

#### Sequence
```typescript
// ❌ Ancien
import { SequenceService } from '@app/core/services/sequence/sequence.service';

// ✅ Nouveau
import { SequenceService } from '@app/features/sequence/infrastructure';
```

#### Subject
```typescript
// ❌ Ancien
import { SubjectService } from '@app/core/services/subject/subject.service';

// ✅ Nouveau
import { SubjectService } from '@app/features/subjects/infrastructure';
```

#### Support
```typescript
// ❌ Ancien
import { SupportService } from '@app/core/services/support/support.service';

// ✅ Nouveau
import { SupportService } from '@app/features/support/infrastructure';
```

#### Trimestre
```typescript
// ❌ Ancien
import { TrimestreService } from '@app/core/services/trimestre/trimestre.service';

// ✅ Nouveau
import { TrimestreService } from '@app/features/trimestre/infrastructure';
```

#### Année Scolaire
```typescript
// ❌ Ancien
import { AnneeScolaireService } from '@app/core/services/anneescolaire/annee-scolaire.service';

// ✅ Nouveau
import { AnneeScolaireService } from '@app/features/gestion-annees/infrastructure';
```

### Services déplacés vers Layout

#### Layout
```typescript
// ❌ Ancien
import { LayoutService } from '@app/core/services/layout/layout.service';

// ✅ Nouveau
import { LayoutService } from '@app/layout';
```

#### Notification
```typescript
// ❌ Ancien
import { NotificationService } from '@app/core/services/notification/notification.service';

// ✅ Nouveau
import { NotificationService } from '@app/core/notification';
```

### Services déplacés vers Settings

#### Preferences
```typescript
// ❌ Ancien
import { PreferencesService } from '@app/core/services/preferences/preferences.service';

// ✅ Nouveau
import { PreferencesService } from '@app/features/settings/infrastructure';
```

#### Session
```typescript
// ❌ Ancien
import { SessionService } from '@app/core/services/session/session.service';

// ✅ Nouveau
import { SessionService } from '@app/features/settings/infrastructure';
```

### Shared Models

#### PageResponse
```typescript
// ❌ Ancien
import { PageResponse } from '@app/core/models/PageResponse/PageResponse.model';

// ✅ Nouveau
import { PageResponse } from '@app/shared/domains/value-objects';
```

#### SidebarItems
```typescript
// ❌ Ancien
import { SidebarItems } from '@app/core/models/sidebarItem/sidebarItems';

// ✅ Nouveau
import { SidebarItems } from '@app/layout';
```

## Commande de recherche et remplacement

Pour faciliter la migration, utilisez ces commandes de recherche/remplacement dans votre IDE :

1. Rechercher : `@app/core/models/([^/]+)/`
2. Remplacer par : `@app/features/$1/domain/models/`

3. Rechercher : `@app/core/services/([^/]+)/`
4. Remplacer par : `@app/features/$1/infrastructure/`

## Vérification

Après migration, vérifiez que :
1. Tous les imports sont mis à jour
2. L'application compile sans erreur
3. Les tests passent
4. Aucun import vers `@app/core/models/{feature}` ou `@app/core/services/{feature}` ne subsiste
