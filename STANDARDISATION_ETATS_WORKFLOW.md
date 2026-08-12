# Standardisation des états et workflows

## États retenus

Les écrans distinguent :

- état initial : aucune requête métier n'a encore été lancée ;
- chargement : skeleton ou indicateur, sans état vide simultané ;
- succès : données affichées ou toast métier ;
- vide : résultat réussi sans donnée ;
- erreur : message compréhensible et possibilité de réessayer lorsque disponible ;
- validation : erreurs proches des champs via les composants de formulaire ;
- confirmation : modal partagée avant suppression ou opération irréversible.

## Composants réutilisés

- `app-skeleton` pour le chargement accessible ;
- `app-empty-state` pour les listes sans données ;
- `app-alert` pour les erreurs et informations persistantes ;
- `app-toast` pour les succès ponctuels ;
- `app-modal` pour les confirmations ;
- `app-button` pour bloquer une soumission pendant `loading` ;
- `app-table` pour éviter d'afficher un tableau vide avec ses seuls en-têtes.

Aucun nouveau composant visuel n'a été ajouté.

## Responsabilités

L'intercepteur de chargement affiche la progression globale des requêtes HTTP. Les features gardent leurs états locaux lorsque l'écran doit distinguer chargement, vide, erreur et données. L'intercepteur d'erreur traite les erreurs globales; le composant ajoute seulement le contexte métier nécessaire et ne doit pas répéter le même toast.

## Règles principales

Une liste suit le flux `loading -> data`, `loading -> empty` ou `loading -> error`. Les anciennes données peuvent rester visibles pendant un rechargement lorsque le store le permet. Les formulaires conservent leurs valeurs après erreur et utilisent `app-button[loading]` pour empêcher les doubles soumissions.

Les confirmations utilisent `app-modal` avec Annuler et une action explicite. Les opérations financières distinguent l'enregistrement du paiement de la génération du reçu.

## Accessibilité et i18n

Les skeletons utilisent `role=status` et `aria-live`; les alertes utilisent `role=alert` pour les erreurs; les états vides sont annoncés comme statut. Les libellés visibles doivent provenir des traductions existantes. Les textes techniques, tokens et réponses backend brutes ne sont jamais affichés.

## Exemple

```html
@if (loading()) {
  <app-skeleton [count]="5" />
} @else if (error()) {
  <app-alert type="error" [message]="error()!" />
} @else if (!items().length) {
  <app-empty-state [description]="'feature.noItems' | translate" />
} @else {
  <app-table>...</app-table>
}
```

