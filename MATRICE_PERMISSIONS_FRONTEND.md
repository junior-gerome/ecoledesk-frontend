# Matrice des permissions frontend

## Architecture retenue

Les rôles sont centralisés dans `src/app/core/constants/roles.constants.ts` et les permissions dans `src/app/core/constants/permissions.constants.ts`. Les politiques typées sont regroupées dans `src/app/core/security/access-policy.ts`.

Les routes utilisent `data.accessPolicy`, avec compatibilité pour les anciennes clés `roles` et `permissions`. `authGuard` contrôle la session; `roleGuard` et `permissionGuard` renvoient vers `/forbidden` pour une session valide non autorisée. La page `/forbidden` reste accessible à tout utilisateur authentifié.

La sidebar réutilise `RbacService.canAccess`. Les directives `hasRole` et `hasPermission` réutilisent le même service.

> Le RBAC frontend améliore l'expérience mais ne remplace jamais la vérification des permissions côté serveur.

## Matrice des routes

| Route | Politique | Menu | Statut |
| --- | --- | --- | --- |
| `/dashboard` | Authentifié | Session active | Protégée |
| `/students` | STAFF + `students:read` | Selon droit | Protégée |
| `/attendance` | STAFF + `attendance:read` | Selon droit | Protégée |
| `/payments/list` | FINANCE + `payments:read` | Selon droit | Protégée |
| `/reports` | `reports:read` | Selon droit | Protégée |
| `/grades` | ACADEMIC + `grades:read` | Selon droit | Protégée |
| `/settings` | ADMIN + `settings:read` | Admin uniquement | Protégée |
| `/annees` | ADMIN + `settings:write` | Admin uniquement | Protégée |
| `/montant` | FINANCE + `payments:write` | Selon droit | Protégée |
| `/subjects`, `/teachers`, `/classes`, `/section`, `/trimestre`, `/sequence`, `/parents`, `/communication`, `/support` | Authentifié | Session active | Protégée |

## Actions confirmées

| Domaine | Action | Permission |
| --- | --- | --- |
| Élèves | Écriture (création, modification, suppression, import) | `students:write` |
| Paiements | Écriture | `payments:write` |
| Présences | Saisie/validation | `attendance:write` |
| Notes | Saisie/modification | `grades:write` |
| Utilisateurs | Consultation | `users:read` |
| Utilisateurs | Modification des droits | `users:rights` |

## Points à confirmer

Les permissions dédiées à subjects, teachers, classes, section, trimestre, sequence, parents, communication et support ne sont pas confirmées par les contrats frontend observés; ces routes conservent donc leur comportement authentifié. Les rôles existants `AGENT`, `ENSEIGNANT` et `TEACHER` sont conservés. Les entrées `disabled`/ `comingSoon` restent des fonctionnalités non livrées.

