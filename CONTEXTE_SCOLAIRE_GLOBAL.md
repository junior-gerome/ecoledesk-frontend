# Contexte scolaire global

## Objet

Le service `SchoolContextService` centralise l’année scolaire, le trimestre et la séquence sélectionnés.

## Sources et règles

- Les années proviennent de `AnneeScolaireService`.
- Les trimestres proviennent de `TrimestreService`.
- Les séquences proviennent de `SequenceService`.
- L’année active est choisie par défaut, puis le premier choix compatible si nécessaire.
- Un changement d’année conserve seulement un trimestre compatible et réinitialise toujours la séquence.
- Un changement de trimestre réinitialise la séquence incompatible.

## Utilisation

Le header expose les sélecteurs disponibles. Les composants métier peuvent observer `contextChanged$`, lire les signaux sélectionnés et utiliser `revision` pour invalider leurs données locales.

Le contexte persiste une sélection par utilisateur via `SessionService`. La clé est supprimée à la déconnexion ou au changement d’utilisateur, afin d’éviter de réutiliser un contexte d’un autre compte.

## Limites d’intégration API

Les APIs actuelles n’acceptent pas toutes les mêmes paramètres : certaines utilisent `anneeScolaireId`, d’autres `period`, et plusieurs écrans chargent encore leurs périodes localement. Le contexte n’ajoute donc aucun paramètre global silencieux. Chaque fonctionnalité doit transmettre le contexte uniquement lorsque son service et son endpoint le supportent réellement.

Les erreurs de chargement sont récupérables avec `retry()` et les états de chargement et d’erreur sont exposés au header.
