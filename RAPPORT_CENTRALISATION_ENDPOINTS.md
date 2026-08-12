# Rapport — centralisation des endpoints frontend

## Périmètre livré

- inventaire des bases API principale, billing, attendance et fichiers ;
- extension typée de `API_ENDPOINTS` ;
- génération de chemins avec identifiants encodés ;
- migration de l’adaptateur attendance, du service paiements et du composant photo-upload ;
- conservation du fallback billing vers l’API principale ;
- conservation des `HttpParams` et formats de réponse.

## Non-modifié

Aucun endpoint backend n’a été renommé. Les services non migrés gardent leur comportement actuel afin de limiter le risque. Les bases URL ne sont pas fusionnées.

## Tests

Les tests vérifient les bases par environnement, les identifiants encodés, les URLs billing/fallback, les endpoints attendance et les URLs upload/download/delete de fichiers.
