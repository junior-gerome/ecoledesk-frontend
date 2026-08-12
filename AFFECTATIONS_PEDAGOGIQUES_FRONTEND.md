# Affectations pédagogiques frontend

La route `/classes/:id/assignments` permet de consulter une classe, son année scolaire, sa section et son enseignant principal. Les enseignants proposés proviennent de `ClassRoomService.getAvailableTeachers()`.

La sauvegarde et le retrait utilisent les endpoints existants `POST /classes/:classId/teacher/:teacherId` et `DELETE /classes/:classId/teacher`. Le retrait demande une confirmation et les actions d’écriture sont masquées sans la permission réelle `classes:write`.

Les affectations enseignant-matière et matière-classe ne sont pas simulées : aucun endpoint correspondant n’a été trouvé dans les services frontend actuels. L’écran affiche cette limitation et devra être complété lorsque le contrat backend sera disponible.
