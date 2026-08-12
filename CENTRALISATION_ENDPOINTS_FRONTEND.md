# Centralisation des endpoints frontend

## Inventaire

Le frontend utilise trois bases distinctes : `environment.apiUrl` pour l’API principale, `environment.billingApiUrl` pour billing et `environment.attendanceApiUrl` pour attendance. Les fichiers étaient auparavant appelés directement avec `/api/files/...`. Les paiements disposent d’un fallback billing vers l’API principale.

## Configuration

`src/app/core/configuration/api-endpoints.config.ts` expose maintenant les domaines principaux, students, teachers, classes, inscription, années scolaires, attendance, billing, files et notifications. Les paramètres de requête restent construits par les repositories existants et ne sont pas modifiés par la configuration.

Les identifiants de chemin passent par `encodeURIComponent`. Les URLs de fichier conservent le même encodage et les bases billing/attendance ne sont pas fusionnées.

## Migration progressive

Les services attendance, paiements et upload de photo utilisent la nouvelle configuration. Les autres services peuvent être migrés domaine par domaine après vérification de leurs contrats, sans changement global de comportement.
