# Guide responsive et accessibilité

## Principes appliqués

- Les formulaires partagés utilisent un label associé, `aria-describedby`, `aria-invalid` et `aria-required`.
- Les états d’erreur, de chargement, vide et toast utilisent des annonces `aria-live` adaptées.
- Les tableaux utilisent un conteneur scrollable horizontalement et une région focusable nommée sur mobile.
- La pagination est navigable au clavier, conserve des boutons suffisamment grands et annonce la page courante.
- Les modales piègent le focus, ferment avec Escape et rendent le focus à l’élément déclencheur.
- Les boutons icônes doivent fournir `ariaLabel`; les SVG décoratifs sont masqués avec `aria-hidden`.

## Responsive par contexte

- Tableaux métier : défilement horizontal explicite lorsque toutes les colonnes sont utiles.
- Actions de ligne : conserver les actions prioritaires et regrouper les secondaires dans un menu lorsque l’écran est étroit.
- Formulaires : grille responsive avec passage en une colonne sur téléphone.
- Sidebar : navigation mobile repliable, avec boutons clavier et focus visible.
- Graphiques : fournir un résumé textuel ou une table équivalente pour les lecteurs d’écran.

## Contrôle manuel

Tester au clavier `Tab`, `Shift+Tab`, `Enter`, `Space` et `Escape`, puis à 320 px, 768 px et largeur desktop. Vérifier que le focus reste visible et que les messages d’erreur sont annoncés.
