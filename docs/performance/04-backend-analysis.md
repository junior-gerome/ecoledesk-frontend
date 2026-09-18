# 04 — Analyse backend (Spring Boot / Java 21)

## Rappels (deja en place dans cette session)
- Mutations workflow = DTO leger (intentionnel) ; le FRONTEND recharge le dossier complet
  (correction appliquee) au lieu de se fier au DTO leger.

## Points d'attention restants
- tomcat.threads.max / HikariCP maximum-pool-size : ne pas augmenter arbitrairement,
  justifier par mesure
- Redis : caches avec cle + TTL + strategie d'invalidation + raison (NE PAS tout cacher)
- Transitions statut (DRAFT->SUBMITTED->UNDER_REVIEW->APPROVED/REJECTED) : verifier
  optimistic locking / pas de perte de mise a jour concurrente
- DTO de decision leger : garder (payload reduit) mais garantir que le client recharge
