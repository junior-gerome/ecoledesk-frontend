# Rapport d’implémentation — recherche globale

## Réalisation

- route `/search` ajoutée dans le layout authentifié ;
- accès secondaire ajouté au header ;
- page avancée existante conservée avec filtres section, niveau, période et critères métier ;
- suggestions avec debounce et annulation des requêtes précédentes déjà présentes.

## Limites

Le frontend ne dispose pas d’un contrat global de résultats suffisamment homogène pour garantir un modèle unique pour tous les domaines. Les résultats restent donc présentés selon les champs optionnels existants. Les permissions et filtrages de sécurité doivent être appliqués par les endpoints backend ; aucune donnée supplémentaire n’a été exposée côté client.

## Vérification

La route et le header doivent être validés par le build Angular et les tests de navigation existants.
