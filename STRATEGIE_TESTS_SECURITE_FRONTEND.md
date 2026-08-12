# Stratégie de tests de sécurité frontend

## Architecture

Le frontend utilise Angular 18 standalone avec Jasmine/Karma et ChromeHeadless. Les tests sont exécutés avec `npm test -- --watch=false --browsers=ChromeHeadless`. Les tests unitaires utilisent `TestBed.runInInjectionContext`, des spies Jasmine, `HttpTestingController` pour les flux HTTP et des composants hôtes standalone pour les directives.

Les données de session sont isolées par test avec un stockage mémoire fourni à `BrowserApiService`. Aucun test de cette évolution ne réalise d’appel réseau réel.

## Guards

| Guard | Scénarios couverts | Résultat |
| --- | --- | --- |
| Auth | authentifié, non authentifié, session invalide/expirée | Couvert |
| Rôle | rôle exact, groupe, refus, aucun rôle, route sans rôle, politique centrale | Couvert |
| Permission | présente, absente, AND, OR explicite, liste vide, politique centrale | Couvert |

Les guards retournent les `UrlTree` réels vers `/auth/login` ou `/forbidden`. Une route sans rôle ou permission est autorisée par ces guards, tout en restant protégée par le `authGuard` parent.

## Intercepteurs

| Intercepteur | Scénarios |
| --- | --- |
| Auth | token, absence de token, endpoints `/auth/`, conservation de la requête, renouvellement après 401 |
| Error | 401, 403, 404, 500, réseau, traitement silencieux local |
| Loading | succès, erreur, concurrence, requête `X-Silent` |

Le loader repose sur un compteur, ce qui garantit qu’une requête terminée ne masque pas une autre requête encore active.

## Routes et navigation

Le contrat des routes sensibles vérifie les guards et les politiques centrales pour élèves, présence, paiements, notes et paramètres. `/forbidden` reste accessible dans le layout authentifié et les fallbacks `**` sont vérifiés. Les directives `hasRole` et `hasPermission` testent l’affichage autorisé, le retrait du DOM et les listes de rôles/permissions.

## Limites

Les tests de navigation complète avec composants lazy ne sont pas dupliqués dans chaque spec : le contrat de routes et les guards sont testés isolément pour rester rapides. Les permissions réelles fournies par le backend et la sémantique exacte des profils métier doivent rester alignées avec le contrat serveur.

