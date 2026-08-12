# Rapport d’implémentation — communication et notifications

## Réalisation

- `/communication` reste volontairement un écran d’attente fonctionnel et traduit ;
- les liens de messagerie non implémentés restent masqués ou désactivés dans le menu ;
- le centre de notifications conserve le compteur non lu, la liste récente, l’état vide et le marquage local comme lu ;
- les notifications sont nettoyées à la déconnexion et les doublons sont évités par identifiant ;
- aucun message, endpoint ou permission de messagerie n’a été inventé.

## Limites

Le backend ne fournit pas de contrat confirmé pour les messages métier, leur historique, leurs pièces jointes, leurs destinataires ou le marquage persistant comme lu. Le frontend ne peut donc pas proposer ces actions sans risque de simuler un comportement inexistant.

## Vérification

Les tests couvrent la gestion locale des notifications, le marquage comme lu, l’effacement et la déconnexion. Le build Angular et la compilation TypeScript doivent être exécutés avant livraison.
