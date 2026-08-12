# Rapport — Module Staff : DTOs, Mappers, Services, Repositories, Controllers & Alignement Frontend

**Date :** 2025  
**Périmètre :** `backend/staff` + `frontend/features/staff`

---

## 1. Analyse de l'existant

Avant intervention, le module `staff` disposait déjà de :

| Couche | Fichiers existants |
|---|---|
| Domain | `EmployeeNumber.java`, `StaffAssignment.java`, `StaffMember.java`, `StaffPosition.java` |
| DTOs | `StaffMemberBasicDTO`, `StaffMemberMediumDTO`, `StaffMemberFullDTO`, `StaffAssignmentBasicDTO`, `StaffAssignmentMediumDTO`, `StaffAssignmentFullDTO`, `StaffMemberCreateRequest`, `StaffAssignmentCreateRequest` |
| Mappers | `StaffMemberMapper`, `StaffAssignmentMapper` |
| Interfaces service | `StaffMemberService`, `StaffAssignmentService` |
| Implémentations | `StaffMemberServiceImpl`, `StaffAssignmentServiceImpl` |
| Repositories | `StaffMemberRepository`, `StaffAssignmentRepository` |
| Controllers | `StaffMemberController`, `StaffAssignmentController` |
| Frontend | models, repository, use-cases (list, form), presentation (list, form) |

---

## 2. Tâches réalisées

### 2.1 Backend — DTOs manquants

#### `employee/EmployeeNumberDTO.java` *(nouveau)*
- DTO pour le value object `EmployeeNumber` (champ `value`)
- Placé dans `application/dto/employee/` conformément à la structure DDD

#### `position/StaffPositionDTO.java` *(nouveau)*
- DTO pour l'enum `StaffPosition` avec champs `code` et `label`
- Méthode factory `StaffPositionDTO.of(StaffPosition)` pour la conversion
- Placé dans `application/dto/position/`

### 2.2 Backend — Mappers manquants

#### `EmployeeNumberMapper.java` *(nouveau)*
- Mapper MapStruct `@Mapper(componentModel = "spring")` pour `EmployeeNumber ↔ EmployeeNumberDTO`
- Respecte l'architecture des mappers existants (même convention)

### 2.3 Backend — Service StaffPosition

#### `interfaces/StaffPositionService.java` *(nouveau)*
- Interface dans `application/interfaces/` (cohérent avec `StaffMemberService`, `StaffAssignmentService`)
- Méthode : `List<StaffPositionDTO> getAllPositions()`

#### `impl/StaffPositionServiceImpl.java` *(nouveau)*
- Implémentation dans `application/impl/` (cohérent avec les autres `*ServiceImpl`)
- Retourne toutes les valeurs de l'enum `StaffPosition` mappées en DTO

### 2.4 Backend — Controller : endpoint positions

#### `StaffAssignmentController.java` *(modifié)*
- Injection de `StaffPositionService`
- Ajout endpoint `GET /api/staff/assignments/positions` (accès `ADMIN | AGENT | ENSEIGNANT`)
- Permet au frontend de charger dynamiquement les positions disponibles

---

## 3. Architecture DDD respectée

```
staff/
├── application/                    ← couche Application
│   ├── dto/
│   │   ├── employee/
│   │   │   └── EmployeeNumberDTO       ← NOUVEAU
│   │   ├── position/
│   │   │   └── StaffPositionDTO        ← NOUVEAU
│   │   ├── StaffMember{Basic,Medium,Full}DTO
│   │   ├── StaffAssignment{Basic,Medium,Full}DTO
│   │   ├── StaffMemberCreateRequest
│   │   └── StaffAssignmentCreateRequest
│   ├── interfaces/
│   │   ├── StaffMemberService
│   │   ├── StaffAssignmentService
│   │   └── StaffPositionService        ← NOUVEAU
│   ├── impl/
│   │   ├── StaffMemberServiceImpl
│   │   ├── StaffAssignmentServiceImpl
│   │   └── StaffPositionServiceImpl    ← NOUVEAU
│   └── mapper/
│       ├── StaffMemberMapper
│       ├── StaffAssignmentMapper
│       └── EmployeeNumberMapper        ← NOUVEAU
├── domain/                         ← couche Domain
│   └── model/
│       ├── EmployeeNumber
│       ├── StaffAssignment
│       ├── StaffMember
│       └── StaffPosition
├── infrastructure/                 ← couche Infrastructure
│   └── persistence/
│       ├── StaffMemberRepository
│       └── StaffAssignmentRepository
└── web/                            ← couche Présentation
    ├── StaffMemberController
    └── StaffAssignmentController   ← modifié (+positions endpoint)
```

---

## 4. Alignement Frontend

### 4.1 Modèles (`domain/models/staff.model.ts`) *(modifié)*
- Ajout de `StaffAssignmentFull` (aligné sur `StaffAssignmentFullDTO` backend)
- Ajout de `StaffPositionOption` (aligné sur `StaffPositionDTO` backend)

### 4.2 Repository domain (`domain/repositories/staff.repository.ts`) *(modifié)*
- `createAssignment` : `Observable<StaffAssignmentMedium>` → `Observable<StaffAssignmentFull>` ✅
- `closeAssignment` : `Observable<StaffAssignmentMedium>` → `Observable<StaffAssignmentFull>` ✅ (le backend retourne `StaffAssignmentFullDTO`)
- Ajout méthode `getPositions(): Observable<StaffPositionOption[]>`

### 4.3 Repository adapter (`infrastructure/staff.repository.ts`) *(modifié)*
- Implémentation des corrections de types ci-dessus
- Ajout `getPositions()` → `GET /api/staff/assignments/positions`

### 4.4 Use-case détail (`application/use-cases/staff-detail.use-case.ts`) *(nouveau)*
- Charge le membre, ses affectations et les positions disponibles
- Expose `createAssignment()` et `closeAssignment()`

### 4.5 Page de détail (`presentation/detail/`) *(nouveau)*
- `staff-detail.component.ts` + `staff-detail.component.html`
- Affiche les informations du membre + tableau des affectations
- Modal de création d'affectation avec select dynamique des positions

### 4.6 Routes (`staff.routes.ts`) *(modifié)*
| Route | Composant | Avant | Après |
|---|---|---|---|
| `/staff` | StaffListComponent | ✅ | ✅ inchangé |
| `/staff/new` | StaffFormComponent | ✅ | ✅ inchangé |
| `/staff/:id` | ~~StaffFormComponent~~ → **StaffDetailComponent** | ❌ form | ✅ détail |
| `/staff/:id/edit` | StaffFormComponent | ❌ absent | ✅ nouveau |

### 4.7 Liste (`presentation/list/staff-list.component.html`) *(modifié)*
- Bouton "Modifier" redirige vers `/staff/:id/edit` (était `/staff/:id`)
- Ajout bouton "Détail" → `/staff/:id`
- Aucune régression sur la désactivation

---

## 5. Endpoints Backend — Récapitulatif complet

| Méthode | URL | Rôles | Description |
|---|---|---|---|
| GET | `/api/staff/members` | ADMIN, AGENT | Liste medium |
| GET | `/api/staff/members/basic` | ADMIN, AGENT, ENSEIGNANT | Liste basic |
| GET | `/api/staff/members/{id}` | ADMIN, AGENT | Détail full |
| POST | `/api/staff/members` | ADMIN, AGENT | Créer |
| PUT | `/api/staff/members/{id}` | ADMIN, AGENT | Modifier |
| DELETE | `/api/staff/members/{id}` | ADMIN | Désactiver |
| GET | `/api/staff/members/count` | ADMIN, AGENT | Comptage |
| GET | `/api/staff/assignments/member/{id}` | ADMIN, AGENT | Affectations par membre |
| GET | `/api/staff/assignments/member/{id}/active` | ADMIN, AGENT | Affectations actives |
| GET | `/api/staff/assignments/position/{position}` | ADMIN, AGENT | Par position |
| GET | `/api/staff/assignments/{id}` | ADMIN, AGENT | Détail affectation |
| POST | `/api/staff/assignments` | ADMIN, AGENT | Créer affectation |
| PATCH | `/api/staff/assignments/{id}/close` | ADMIN, AGENT | Clôturer affectation |
| GET | `/api/staff/assignments/positions` | ADMIN, AGENT, ENSEIGNANT | **NOUVEAU** — Liste positions |

---

## 6. Prévention des régressions

- Aucun fichier existant n'a été supprimé
- Les signatures des services et mappers existants sont inchangées
- Le mapper `StaffMemberMapper.toAssignmentList()` reste délégué à la couche service (comportement inchangé)
- La route `/staff/new` est inchangée
- Le `StaffFormComponent` fonctionne pour les deux routes (`new` et `:id/edit`) via `paramMap.get('id')`
- Les tests existants ne sont pas impactés (aucune suppression de méthode publique)

---

## 7. Fichiers créés / modifiés

### Créés (7)
1. `backend/.../dto/employee/EmployeeNumberDTO.java`
2. `backend/.../dto/position/StaffPositionDTO.java`
3. `backend/.../mapper/EmployeeNumberMapper.java`
4. `backend/.../interfaces/StaffPositionService.java`
5. `backend/.../impl/StaffPositionServiceImpl.java`
6. `frontend/.../use-cases/staff-detail.use-case.ts`
7. `frontend/.../detail/staff-detail.component.ts`
8. `frontend/.../detail/staff-detail.component.html`

### Modifiés (6)
1. `backend/.../web/StaffAssignmentController.java` — ajout endpoint positions
2. `frontend/.../models/staff.model.ts` — ajout `StaffAssignmentFull`, `StaffPositionOption`
3. `frontend/.../repositories/staff.repository.ts` — correction types + `getPositions()`
4. `frontend/.../infrastructure/staff.repository.ts` — implémentation corrections
5. `frontend/.../staff.routes.ts` — routes détail + edit
6. `frontend/.../list/staff-list.component.html` — boutons détail + edit
