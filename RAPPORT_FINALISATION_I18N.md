# Rapport de finalisation i18n

## Audit

Les textes codés en dur ont été recensés dans les templates, composants, confirmations, erreurs, toasts, états vides et composants partagés. Les écrans métier récents utilisent déjà majoritairement des clés `studentProfile`, `classAssignments`, `schoolContext` et `globalSearch`.

## Corrections

- layout et navigation : clés dédiées pour les libellés de menu ;
- pagination : libellés et page dynamique traduisibles ;
- notifications et toasts : actions prévues pour utiliser les ressources i18n ;
- documentation des formats dynamiques, dates et montants.

## Limites

Quelques écrans legacy utilisent encore des appels natifs `alert`/`confirm` et des messages français directs. Ils doivent être migrés écran par écran vers le service de traduction afin de préserver le comportement et d’éviter une refonte fonctionnelle globale.

## Vérification

La compilation et les tests doivent vérifier le changement de langue, le rechargement des ressources et l’absence de régression dans les formulaires et états vides.
