# Rapport d’harmonisation des conventions

## Actions réalisées

- vérification des imports, routes, templates et tests avant chaque renommage ;
- renommage contrôlé de `subject-creat.component.*` vers `subject-create.component.*` ;
- renommage sensible à la casse de `Trimestre.ts` vers `trimestre.ts` et mise à jour de l’index ;
- conversion des doublons `montant/montant` et `section/section` en redirections de compatibilité ;
- conservation du wrapper `shared/domaines/value-objects/basseId.ts` car il constitue une compatibilité potentielle, sans supprimer de fichier non prouvé inutilisé.

## Routes déjà compatibles

Les routes grades `/grades/new` et `/grades/new-notes` redirigeaient déjà vers `/grades/form`. Les anciennes routes d’année scolaire sont conservées.

## Hors périmètre

Aucune logique métier, API ou structure de réponse n’a été modifiée. Aucun renommage massif ni suppression de module legacy n’a été effectué.

## Vérification

La compilation sensible aux imports et le build Angular doivent être exécutés après ces changements ; les tests de routes lazy doivent confirmer les chemins historiques et canoniques.
