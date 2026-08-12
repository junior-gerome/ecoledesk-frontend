# Rapport d’audit responsive et accessibilité

## Corrections partagées

- modale : focus initial, piège de focus, restauration du focus, Escape et `aria-labelledby` ;
- pagination : libellés ARIA, focus visible, retour à la ligne responsive et annonce de page ;
- tableaux : région scrollable horizontale et focusable avec libellé ;
- formulaires : contrôles déjà dotés de labels et descriptions, conservés sans changement métier ;
- alertes, skeletons, empty-state et toasts : annonces live conservées.

## Limites et suivi

Les tableaux métier conservent le défilement horizontal lorsque la densité d’information le justifie. Les graphiques doivent encore être vérifiés écran par écran pour fournir un résumé textuel métier. Les tests automatisés couvrent la modale et les composants partagés existants ; un contrôle clavier manuel reste recommandé.

## Vérification

La compilation TypeScript et le build Angular sont à exécuter après les corrections. Aucun endpoint ni comportement métier n’a été modifié.
