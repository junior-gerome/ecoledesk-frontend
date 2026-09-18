# 05 — Analyse frontend (Angular 18 standalone)

## Verifie / corrige
- Workflow detail preinscription : reload systematique apres mutation (DRAFT->soumission,
  revue, approbation, rejet) => pas de decalage d'affichage, pas de refresh manuel
- Bouton de soumission accessible depuis DRAFT (workflow complet sans F5)

## A auditer ensuite (checklist)
- subscriptions non liberees (prendre()/takeUntilDestroyed) — fuites memoires
- appels HTTP multiples identiques / debounce absent sur recherche
- pagination / virtual scroll / track dans @for
- ChangeDetectionStrategy.OnPush / signals au lieu de subscribe ad-hoc
- calculs lourds dans les templates (deplacer en computed)
