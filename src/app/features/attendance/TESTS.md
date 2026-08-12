# Script de Test - Module Attendance

## Tests Unitaires

### Tester le Repository
```bash
ng test --include='**/attendance/infrastructure/daily-attendance.repository.spec.ts'
```

### Tester le Repository (Intégration)
```bash
ng test --include='**/attendance/infrastructure/daily-attendance.repository.integration.spec.ts'
```

### Tester le Composant Daily
```bash
ng test --include='**/attendance/presentation/daily/daily-attendance.component.spec.ts'
```

### Tester le Composant Absence
```bash
ng test --include='**/attendance/presentation/absence/absence-tracking.component.spec.ts'
```

### Tester le Composant Justification
```bash
ng test --include='**/attendance/presentation/justification/justifications.component.spec.ts'
```

## Tests Complets

### Tester tout le module
```bash
ng test --include='**/attendance/**/*.spec.ts'
```

### Tester avec couverture
```bash
ng test --include='**/attendance/**/*.spec.ts' --code-coverage
```

## Tests E2E (si configuré)

```bash
ng e2e --spec='**/attendance/**/*.e2e-spec.ts'
```

## Vérification de la Couverture

Après avoir exécuté les tests avec `--code-coverage`, ouvrir:
```
coverage/index.html
```

### Objectifs de Couverture
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

## Tests Manuels

### 1. Test du Flux Complet
1. Ouvrir l'application
2. Naviguer vers "Pointage Journalier"
3. Sélectionner une section
4. Sélectionner une classe
5. Sélectionner une date
6. Vérifier que les élèves sont chargés
7. Modifier quelques statuts (Présent/Absent/Retard)
8. Sauvegarder
9. Vérifier le message de succès
10. Recharger la page
11. Vérifier que les données sont persistées

### 2. Test des Erreurs
1. Déconnecter le backend
2. Essayer de charger les sections
3. Vérifier le message d'erreur
4. Reconnecter le backend
5. Réessayer

### 3. Test de Performance
1. Sélectionner une classe avec 30+ élèves
2. Vérifier que le chargement est rapide (< 2s)
3. Modifier plusieurs statuts rapidement
4. Vérifier que l'UI reste réactive

## Checklist de Validation

- [ ] Tous les tests unitaires passent
- [ ] Tous les tests d'intégration passent
- [ ] Couverture de code > 80%
- [ ] Pas d'erreurs dans la console
- [ ] Pas de warnings TypeScript
- [ ] Pas de vulnérabilités de sécurité
- [ ] Performance acceptable (< 2s pour charger 30 élèves)
- [ ] Gestion d'erreur fonctionnelle
- [ ] Messages utilisateur clairs
- [ ] Données persistées correctement

## Commandes Utiles

### Linter
```bash
ng lint --fix
```

### Build
```bash
ng build --configuration production
```

### Analyse de Bundle
```bash
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

## Debugging

### Mode Debug dans VS Code
1. Ajouter un breakpoint dans le code
2. Lancer "Debug Angular Tests" dans VS Code
3. Le debugger s'arrêtera au breakpoint

### Logs de Debug
Activer les logs détaillés:
```typescript
// Dans environment.ts
export const environment = {
  production: false,
  debug: true,
  apiUrl: 'http://localhost:8080/api'
};
```

## Rapport de Test

Après exécution des tests, générer un rapport:
```bash
ng test --include='**/attendance/**/*.spec.ts' --code-coverage --watch=false
```

Le rapport sera disponible dans:
```
coverage/attendance/index.html
```

## CI/CD

### GitHub Actions
```yaml
- name: Run Attendance Tests
  run: ng test --include='**/attendance/**/*.spec.ts' --watch=false --code-coverage
```

### GitLab CI
```yaml
test:attendance:
  script:
    - ng test --include='**/attendance/**/*.spec.ts' --watch=false --code-coverage
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
```

## Troubleshooting

### Tests qui échouent
1. Vérifier que toutes les dépendances sont installées: `npm install`
2. Nettoyer le cache: `npm cache clean --force`
3. Supprimer node_modules et réinstaller: `rm -rf node_modules && npm install`

### Tests lents
1. Utiliser `fdescribe` et `fit` pour exécuter uniquement certains tests
2. Vérifier qu'il n'y a pas de `setTimeout` trop longs
3. Utiliser `fakeAsync` et `tick` pour les tests asynchrones

### Erreurs de timeout
Augmenter le timeout dans `karma.conf.js`:
```javascript
browserNoActivityTimeout: 60000
```
