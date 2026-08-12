# Rapport d’implémentation — affectations pédagogiques

## Périmètre livré

- route `/classes/:id/assignments` ajoutée avant la route paramétrique de classe ;
- consultation de la classe et des enseignants disponibles via les services existants ;
- affectation, remplacement et retrait de l’enseignant principal ;
- chargement, erreur, succès, état vide et sauvegarde désactivée pendant l’appel ;
- confirmation avant retrait ;
- permission `classes:write` réutilisée pour les actions de modification ;
- entrée de menu `classes.assign` activée.

## Limites constatées

`ClassRoomService` expose l’affectation enseignant-classe, mais aucun service ne fournit actuellement une API d’affectation enseignant-matière ou matière-classe, ni une vérification de conflit. Ces fonctionnalités restent explicitement non disponibles dans l’interface et ne font l’objet d’aucune règle métier inventée.

## Vérification

Le composant est couvert par des tests de chargement, sauvegarde et conservation des changements après erreur. La compilation TypeScript de l’application est validée ; le build Angular doit être relancé avec la commande du projet après intégration.
