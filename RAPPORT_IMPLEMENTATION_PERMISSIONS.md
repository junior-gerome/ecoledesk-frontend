# Rapport d'implémentation des permissions frontend

## Analyse

Analyse des routes et du lazy loading dans `src/app/app.routes.ts` et les fichiers de features, de l'authentification/session dans `core/services`, du RBAC dans `core/constants`, `core/security` et `core/guards`, de la sidebar dans `layout/sidebar`, des directives dans `shared/directives` et des tests existants.

## Modifications

- Ajout de politiques explicites dans `src/app/core/security/access-policy.ts`.
- Adaptation de `roleGuard` et `permissionGuard` à `data.accessPolicy`, avec migration compatible.
- Ajout de politiques aux routes prioritaires dans `src/app/app.routes.ts`.
- Synchronisation de la sidebar avec les politiques élèves, présences, notes, paiements, rapports et paramètres.
- Protection des actions confirmées de création/modification/suppression/import/export élèves et paiements via `HasPermissionDirective`.
- Directives `hasPermission` et `hasRole` rendues réactives aux changements de session.
- Ajout des deux documents de référence à la racine.

## Sécurité et comportement

Les utilisateurs non connectés restent redirigés vers `/auth/login`. Les utilisateurs connectés sans droit sont redirigés vers `/forbidden`. `/forbidden` n'a pas de permission métier et ne peut pas boucler vers lui-même. Aucun backend, endpoint ou contrat API n'a été modifié.

## Vérifications

Commandes exécutées : `cmd /c node_modules\\.bin\\tsc --noEmit -p tsconfig.app.json` (succès), `cmd /c npm test -- --watch=false --browsers=ChromeHeadless --include=src/app/core/security/rbac.service.spec.ts` (5 tests réussis) et `cmd /c npm run build -- --configuration development` (succès). Le build production a généré les bundles mais reste soumis au budget SCSS dashboard existant.

## Limites et confirmations attendues

Les actions restantes doivent attendre la confirmation backend des permissions dédiées importer/exporter/supprimer/reçu et des domaines sans permission connue. Le frontend ne remplace pas l'autorisation serveur.




