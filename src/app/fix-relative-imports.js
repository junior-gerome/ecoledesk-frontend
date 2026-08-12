const fs = require('fs');
const path = require('path');

const replacements = {
  // Imports relatifs à corriger
  "from '../teachers/teacher'": "from '@app/features/teachers/domain/models'",
  "from '../annee/annee-scolaire'": "from '@app/features/gestion-annees/domain/models'",
  "from '../section/section.interface'": "from '@app/features/section/domain/models'",
  "from '../SubjectAverage/SubjectAverage.model'": "from '@app/features/grades/domain/models'",
  "from '../classes/class.interface'": "from '@app/features/classes/domain/models'",
  "from '../montant/montant'": "from '@app/features/montant/domain/models'",
  "from '../parent/parents.model'": "from '@app/features/parent/domain/models'",
  "from '../trimestre/Trimestre'": "from '@app/features/trimestre/domain/models'",
  "from '../../models/montant/montant'": "from '@app/features/montant/domain/models'",
  "from '@app/core/models/auth/auth.models'": "from '@app/core/models'",
  "from '@app/core/models/auth/roles.type'": "from '@app/core/models'",
  "from '@core/services/notification/notification.service'": "from '@app/core/notification/notification.service'",
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

function fixRelativeImports() {
  console.log('🔧 Correction des imports relatifs...\n');
  
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
  
  console.log('\n✨ Correction terminée!');
  console.log(`📊 Fichiers modifiés: ${filesModified}`);
  console.log(`🔄 Remplacements effectués: ${replacementsMade}`);
}

fixRelativeImports();
