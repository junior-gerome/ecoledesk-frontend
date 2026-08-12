# Communication et notifications frontend

## État réel des contrats

Le frontend ne dispose actuellement d’aucun service REST confirmé pour les annonces, les messages ciblés, les destinataires par classe, les messages aux parents, l’historique, les pièces jointes ou les préférences de messagerie. Ces liens restent donc désactivés et `/communication` explique cette indisponibilité.

Le seul transport identifié est un canal STOMP sur SockJS à `${apiUrl}/ws`, avec une destination utilisateur `/user/{userId}/notifications`. Le centre utilise ce flux pour afficher les notifications reçues en temps réel. Le marquage comme lu et l’effacement sont actuellement locaux, car aucun endpoint persistant n’a été identifié.

## Sécurité

Le frontend s’abonne uniquement à la destination de l’utilisateur courant. Les notifications sont dédupliquées par identifiant et vidées à la déconnexion. Le backend doit impérativement contrôler l’autorisation de la destination utilisateur ; le frontend ne doit jamais être considéré comme une barrière suffisante.

## Cycle de vie

La connexion est ouverte après authentification et fermée à la déconnexion. Les composants utilisent `takeUntilDestroyed` pour nettoyer leurs abonnements. Les états vide, connecté, déconnecté et erreur sont affichés sans exposer le contenu dans les logs.

## Contrats backend nécessaires

Pour activer la messagerie, il faudra confirmer des endpoints et permissions pour la création et la consultation des messages, les destinataires autorisés, les pièces jointes, l’historique, les préférences, la persistance du statut lu et la navigation vers une ressource. Il faudra également documenter le contrat STOMP, les règles d’abonnement et la stratégie de reconnexion.
