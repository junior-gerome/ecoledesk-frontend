# Recherche globale frontend

La recherche avancée existante est maintenant accessible directement sur `/search` et depuis le header. Elle conserve les filtres déjà supportés par `SearchFilters`, utilise un debounce pour les suggestions et annule les requêtes précédentes avec `switchMap`.

Les domaines réellement déclarés par le service sont élèves, paiements, notes, classes et enseignants. Aucun domaine supplémentaire ni résultat fictif n’a été ajouté. Le backend reste responsable du filtrage d’accès aux résultats.

Les contrats de résultats sont encore hétérogènes côté API ; les champs utilisés par la page restent donc optionnels jusqu’à confirmation d’un DTO backend commun.
