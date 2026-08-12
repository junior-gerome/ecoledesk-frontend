# Rapport d’implémentation — contexte scolaire global

## Réalisation

Un service transversal standalone a été ajouté dans `src/app/core/context/school-context.service.ts`. Il charge en parallèle les catalogues existants, expose des signaux pour l’état et la sélection, publie les changements via `contextChanged$` et gère la compatibilité entre année, trimestre et séquence.

Le header permet de sélectionner l’année, le trimestre et, lorsque disponible, la séquence. Les libellés sont ajoutés en français et en anglais dans les ressources i18n.

## Données réellement disponibles

Les services existants fournissent les années scolaires, leurs statuts, les trimestres liés à une année et les séquences liées à un trimestre. La persistance est limitée à la sélection de l’utilisateur courant via `SessionService`.

## Données non uniformisées

Les modules ne partagent pas encore un contrat API unique : présence utilise notamment `anneeScolaireId`, tandis que notes et certains rapports utilisent des paramètres de période propres à leur service. Aucun endpoint agrégé ni paramètre fictif n’a été créé et les requêtes existantes n’ont pas été modifiées silencieusement.

## Sécurité et cycle utilisateur

La sélection persistée est isolée par identifiant utilisateur. Elle est supprimée lors de la déconnexion ou d’un changement de compte. Les valeurs incompatibles sont rejetées et les actions de sélection sont limitées aux valeurs chargées.

## Vérification

Le service est couvert par des tests de chargement de l’année active, changement d’année, réinitialisation des périodes, persistance, déconnexion et erreur de chargement. La compilation finale doit être exécutée avec les commandes du projet avant livraison.
