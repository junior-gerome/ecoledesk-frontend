# Profil étudiant frontend

## Accès

La route `/students/:id` affiche le profil unifié. L’édition reste accessible par `/students/:id/edit`, afin de ne pas transformer l’accès historique au formulaire en page de consultation.

## Données réellement disponibles

- Profil personnel : `GET /students/:id` via `StudentEnrollmentRepository`.
- Inscription, classe, section et année active : services existants `getEnrollments`, `getAllClasses`, `getSections` et `getActiveSchoolYear`.
- Parent/responsable : propriété `student.parent` lorsqu’elle est renvoyée par l’API étudiant.
- Paiements : `PaymentService.getPayments({ studentId })`, chargé à l’ouverture de l’onglet.
- Notes : `GradesService.getGradesByStudent(studentId)`, chargé à l’ouverture de l’onglet.

## Sections affichées

Les onglets personnel, inscription, historique, parent, paiements et notes sont affichés selon les données disponibles. L’onglet présences n’est pas affiché : `AttendanceService` ne fournit pas actuellement de recherche par étudiant, et aucune donnée n’est fabriquée côté frontend.

## États et permissions

Le profil possède un skeleton initial, une erreur récupérable, des états vides par onglet et un chargement/erreur séparé pour les onglets secondaires. La modification est masquée sans `STUDENTS_WRITE`. Le bulletin réutilise la route existante des bulletins.

Le retour vers la liste transmet le paramètre de recherche `q`. La liste restaure ce contexte lorsqu’elle est rechargée.

