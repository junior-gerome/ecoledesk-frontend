# Guide i18n frontend

L’application utilise exclusivement `ngx-translate` avec `I18nService`, les ressources `fr` et `en` de `src/assets/i18n/i18n_lang.json`, et le français comme langue par défaut.

Les textes visibles doivent utiliser une clé contextualisée dans les templates (`feature.action`, `feature.error`, `feature.empty`). Les identifiants techniques, noms d’API et valeurs métier reçues du backend ne sont pas traduits.

Les valeurs dynamiques utilisent les paramètres ngx-translate, par exemple `{{ 'common.pageOf' | translate:{ current: page, total: totalPages } }}`. Les dates, nombres et montants doivent rester formatés par les pipes Angular selon le contexte local et la devise XAF/FCFA.

Pour éviter une clé brute, chaque nouvelle clé doit être ajoutée aux deux langues et le français reste le fallback. Les composants partagés acceptent encore des libellés personnalisés pour préserver la compatibilité des appels existants.
