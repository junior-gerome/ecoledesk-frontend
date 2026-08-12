const fs = require('fs');
const path = require('path');

const replacements = {
  // Models vers Features
  "@app/core/models/attendance/attendance.model": "@app/features/attendance/domain/models",
  "@app/core/models/classes/class.interface": "@app/features/classes/domain/models",
  "@app/core/models/section/section.interface": "@app/features/section/domain/models",
  "@app/core/models/sequences/Sequence": "@app/features/sequence/domain/models",
  "@app/core/models/subjects/subject": "@app/features/subjects/domain/models",
  "@app/core/models/teachers/teacher": "@app/features/teachers/domain/models",
  "@app/core/models/trimestre/Trimestre": "@app/features/trimestre/domain/models",
  "@app/core/models/parent/parents.model": "@app/features/parent/domain/models",
  "@app/core/models/payment/payment.model": "@app/features/payments/domain/models",
  "@app/core/models/reports/reports.model": "@app/features/reports/domain/models",
  "@app/core/models/support/support.model": "@app/features/support/domain/models",
  "@app/core/models/annee/annee-scolaire": "@app/features/gestion-annees/domain/models",
  "@app/core/models/montant/montant": "@app/features/montant/domain/models",
  "@app/core/models/inscriptionStudent/inscription": "@app/features/inscriptionstudent/domain/models",
  "@app/core/models/BulletinRow/BulletinRow.model": "@app/features/grades/domain/models",
  "@app/core/models/CreateGradeRequest/CreateGradeRequest.model": "@app/features/grades/domain/models",
  "@app/core/models/GradeResponse/GradeResponse.model": "@app/features/grades/domain/models",
  "@app/core/models/GradeStats/GradeStats.model": "@app/features/grades/domain/models",
  "@app/core/models/StudentRankingItem/StudentRankingItem.model": "@app/features/grades/domain/models",
  "@app/core/models/StudentReport/StudentReport.model": "@app/features/grades/domain/models",
  "@app/core/models/SubjectAverage/SubjectAverage.model": "@app/features/grades/domain/models",
  "@app/core/models/student-statistics/student-statistics.model": "@app/features/students/domain/models",
  "@app/core/models/StudentByCountClass/studentByClasseDTO": "@app/features/students/domain/models",
  "@app/core/models/studentBySectionCountDto/StudentBySectionCountDto": "@app/features/students/domain/models",
  "@app/core/models/Subsection": "@app/features/section/domain/models",
  "@app/core/models/PageResponse/PageResponse.model": "@app/shared/domains/value-objects",
  "@app/core/models/sidebarItem/sidebarItems": "@app/layout",
  
  // Services vers Infrastructure
  "@app/core/services/attendance/attendance.service": "@app/features/attendance/infrastructure/attendance.service",
  "@app/core/services/classe/classRoom.service": "@app/features/classes/infrastructure/classRoom.service",
  "@app/core/services/grades/grades.service": "@app/features/grades/infrastructure/grades.service",
  "@app/core/services/montant/montant.service": "@app/features/montant/infrastructure/montant.service",
  "@app/core/services/parent/parent.service": "@app/features/parent/infrastructure/parent.service",
  "@app/core/services/payment/payment.service": "@app/features/payments/infrastructure/payment.service",
  "@app/core/services/reports/reports.service": "@app/features/reports/infrastructure/reports.service",
  "@app/core/services/section/section.service": "@app/features/section/infrastructure/section.service",
  "@app/core/services/sequence/sequence.service": "@app/features/sequence/infrastructure/sequence.service",
  "@app/core/services/subject/subject.service": "@app/features/subjects/infrastructure/subject.service",
  "@app/core/services/support/support.service": "@app/features/support/infrastructure/support.service",
  "@app/core/services/trimestre/trimestre.service": "@app/features/trimestre/infrastructure/trimestre.service",
  "@app/core/services/anneescolaire/annee-scolaire.service": "@app/features/gestion-annees/infrastructure/annee-scolaire.service",
  "@app/core/services/notification/notification.service": "@app/core/notification/notification.service",
  "@app/core/services/layout/layout.service": "@app/layout/layout.service",
  "@app/core/services/preferences/preferences.service": "@app/features/settings/infrastructure/preferences.service",
  "@app/core/services/session/session.service": "@app/features/settings/infrastructure/session.service",
  "@app/core/services/searchService/advanced-search.service": "@app/features/search/infrastructure/advanced-search.service",
  "@app/core/services/authentifications/auth.service": "@app/core/services/auth.service",
};

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.angular')) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else if (file.endsWith('.ts')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

function migrateImports() {
  console.log('🚀 Début de la migration des imports...\n');
  
  const files = getAllFiles('.');
  console.log(`📁 Fichiers trouvés: ${files.length}\n`);
  
  let filesModified = 0;
  let replacementsMade = 0;
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    Object.keys(replacements).forEach(oldPath => {
      const newPath = replacements[oldPath];
      if (content.includes(oldPath)) {
        content = content.split(oldPath).join(newPath);
        modified = true;
        replacementsMade++;
      }
    });
    
    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      filesModified++;
      console.log(`✅ ${file}`);
    }
  });
  
  console.log('\n✨ Migration terminée!');
  console.log(`📊 Fichiers modifiés: ${filesModified}`);
  console.log(`🔄 Remplacements effectués: ${replacementsMade}`);
  console.log('\n⚠️  Prochaines étapes:');
  console.log('1. Vérifier la compilation: npm run build');
  console.log('2. Exécuter les tests: npm run test');
}

migrateImports();
