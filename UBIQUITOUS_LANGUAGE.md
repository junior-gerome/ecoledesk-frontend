# Ubiquitous Language

Ce document definit le vocabulaire partage du projet ERP ecole primaire. Il doit etre maintenu avec les experts metier avant d'introduire ou de renommer un concept dans le code, les ecrans, les API ou les tickets.

Regle de gouvernance : tout mot ambigu utilise dans une user story, un endpoint, une table, un DTO ou un libelle d'ecran doit avoir une definition ici, avec l'expert metier responsable de sa validation.

## Experts metier a impliquer

| Domaine | Experts metier attendus | Responsabilite |
| --- | --- | --- |
| Direction | Directeur, secretaire general | Arbitrage final des termes transverses, regles institutionnelles |
| Scolarite | Responsable des inscriptions, secretariat scolaire | Eleves, parents, preinscriptions, inscriptions, classes |
| Pedagogie | Directeur des etudes, enseignants principaux | Notes, sequences, trimestres, bulletins, affectations pedagogiques |
| Finances | Comptable, caissier, responsable financier | Montants, paiements, remises, recus, soldes |
| Vie scolaire | Surveillant general, responsable discipline | Presences, absences, retards, justifications |
| Administration systeme | Administrateur applicatif | Utilisateurs, roles, profils, permissions, audit |

## Regles de nommage

| Regle | Decision |
| --- | --- |
| Langue metier | Les libelles metier sont en francais simple. Les noms techniques peuvent rester en anglais si le framework l'impose. |
| Accentuation dans le code | Eviter les accents dans les identifiants techniques. Les accents sont autorises dans les libelles visibles si l'encodage est maitrise. |
| Singulier/pluriel | Le concept est defini au singulier. Les collections utilisent le pluriel. |
| Statuts | Les statuts sont des valeurs metier explicites et stables. Ne pas melanger statuts techniques et statuts visibles. |
| Synonymes | Un seul terme canonique est autorise par concept. Les synonymes connus sont listes comme termes a eviter ou alias historiques. |

## Glossaire metier

### Scolarite et inscription

| Terme ambigu | Terme canonique | Definition metier | Experts metier a valider | Synonymes / termes a eviter | Questions ouvertes |
| --- | --- | --- | --- | --- | --- |
| Eleve / Student | Eleve | Personne physique scolarisee ou candidate a la scolarisation dans l'etablissement. | Responsable inscriptions, direction | Student dans les libelles visibles | Un eleve refuse doit-il rester visible dans la liste principale ? |
| Candidat | Preinscrit | Eleve dont le dossier est cree mais dont l'inscription definitive n'est pas encore acquise. | Responsable inscriptions | Nouveau eleve, prospect | Faut-il distinguer candidat sans paiement et candidat avec paiement ? |
| Preinscription | Preinscription | Dossier initial permettant de reserver ou demander une place avant inscription definitive. | Responsable inscriptions, comptable | Demande d'inscription, inscription provisoire | Quels champs rendent une preinscription complete ? |
| Inscription | Inscription definitive | Validation administrative qui rattache officiellement un eleve a une classe et une annee scolaire. | Direction, responsable inscriptions | Validation, admission | L'inscription definitive exige-t-elle toujours un paiement valide ? |
| Dossier eleve | Fiche eleve | Ensemble des informations administratives de l'eleve, de ses responsables et de sa situation scolaire. | Responsable inscriptions | Profil eleve | Quelles pieces justificatives doivent etre rattachees ? |
| Classe / ClasseRoom | Classe | Groupe pedagogique auquel l'eleve est affecte pour une annee scolaire. | Direction des etudes | Classroom, room, salle | Une classe represente-t-elle une salle physique ou un niveau-groupe ? |
| Section | Section | Regroupement pedagogique ou linguistique des classes, par exemple francophone, anglophone ou maternelle/primaire selon l'organisation locale. | Direction, responsable pedagogique | Cycle, filiere | La section porte-t-elle des regles de frais differentes ? |
| Niveau | Niveau | Degré scolaire pedagogique, par exemple SIL, CP, CE1, CM1. | Direction des etudes | Level | Le niveau est-il porte par la classe ou separe ? |
| Annee scolaire | Annee scolaire | Periode administrative de reference pour inscriptions, notes, absences et paiements. | Direction, secretariat | Exercice scolaire | Une seule annee scolaire peut-elle etre active ? |
| Annee active | Annee scolaire active | Annee scolaire utilisee par defaut pour les operations courantes. | Direction, administrateur applicatif | Active year | Que se passe-t-il pendant la transition entre deux annees ? |
| Statut preinscription | Statut de preinscription | Etat courant du dossier de preinscription. Valeurs cibles : BROUILLON, EN_ATTENTE, VALIDEE, REFUSEE, ANNULEE, INSCRITE. | Responsable inscriptions, direction | REJETEE | Qui peut passer chaque statut ? |
| BROUILLON | Brouillon | Dossier commence mais pas encore soumis a decision administrative. | Responsable inscriptions | Draft | Un brouillon reserve-t-il une place ? |
| EN_ATTENTE | En attente | Dossier soumis, en attente de validation, refus ou annulation. | Responsable inscriptions | Pending | Une preinscription en attente peut-elle etre modifiee librement ? |
| VALIDEE | Validee | Preinscription acceptee administrativement, mais pas necessairement convertie en inscription definitive. | Direction, responsable inscriptions | Accepted | A quel moment devient-elle INSCRITE ? |
| REFUSEE | Refusee | Preinscription rejetee par l'etablissement avec justification. | Direction | Rejetee | Le refus doit-il bloquer une nouvelle preinscription la meme annee ? |
| ANNULEE | Annulee | Preinscription abandonnee ou retiree avant decision finale. | Responsable inscriptions | Cancelled | Qui peut annuler : ecole, parent, les deux ? |
| INSCRITE | Inscrite | Preinscription convertie en inscription definitive. | Direction, responsable inscriptions | Enrolled | La conversion cree-t-elle un enregistrement d'inscription distinct ? |
| Responsable / Parent | Responsable legal | Personne rattachee a l'eleve et autorisee a etre contactee ou a effectuer des demarches. | Responsable inscriptions | Parent si ce n'est pas toujours le parent biologique | Faut-il gerer plusieurs responsables par eleve ? |
| Tuteur | Tuteur | Responsable legal ou delegue qui n'est pas forcement le pere ou la mere. | Responsable inscriptions | Guardian | Le tuteur a-t-il les memes droits qu'un parent ? |
| Parent utilisateur | Compte parent | Compte applicatif permettant a un responsable de consulter les informations autorisees. | Administration systeme, responsable inscriptions | Parent, profil parent | Le compte parent est-il cree automatiquement ? |

### Finances

| Terme ambigu | Terme canonique | Definition metier | Experts metier a valider | Synonymes / termes a eviter | Questions ouvertes |
| --- | --- | --- | --- | --- | --- |
| Montant | Tarif | Somme attendue pour un type de frais donne, souvent associee a une classe ou une section. | Comptable, responsable financier | Amount, montant a payer | Le tarif depend-il de l'annee scolaire ? |
| Type paiement | Type de frais | Nature metier d'un paiement attendu ou recu : preinscription, inscription, scolarite, uniforme, etc. | Comptable | Payment type | Liste exacte des types a figer. |
| Frais de preinscription | Frais de preinscription | Somme requise pour enregistrer ou traiter une preinscription. | Comptable, responsable inscriptions | Frais dossier | Est-il remboursable si REFUSEE ou ANNULEE ? |
| Frais d'inscription | Frais d'inscription | Somme requise pour rendre l'inscription definitive. | Comptable, direction | Admission fee | Est-il separe des frais de preinscription ? |
| Paiement | Paiement | Transaction financiere enregistree pour un eleve et un type de frais. | Comptable, caissier | Versement | Un paiement partiel est-il autorise ? |
| Paiement partiel | Paiement partiel | Paiement inferieur au montant total attendu, laissant un solde restant. | Comptable | Avance, acompte | Comment calculer les relances ? |
| Solde | Solde restant | Montant encore du par l'eleve ou le responsable pour un type de frais. | Comptable | Reste, montant restant | Le solde est-il calcule ou stocke ? |
| Remise | Remise | Reduction accordee sur un montant attendu. | Responsable financier, direction | Discount | Qui peut accorder une remise et avec quelle justification ? |
| Recu | Recu de paiement | Document justificatif remis apres un paiement valide. | Caissier, comptable | Receipt | Un recu peut-il etre regenere ou annule ? |
| Numero de recu | Reference de recu | Identifiant unique du recu emis pour un paiement. | Comptable | Receipt number | Numerotation automatique ou manuelle ? |
| Statut paiement | Statut de paiement | Etat d'un paiement. Valeurs cibles a valider : PENDING, PAID, LATE, CANCELLED. | Comptable | Etat paiement | Faut-il un statut PARTIAL distinct ? |
| PAID | Paye | Paiement considere comme encaisse et valide. | Comptable | Regle | Quelles methodes de paiement exigent une validation supplementaire ? |
| PENDING | En attente de paiement | Paiement cree mais pas encore encaisse ou confirme. | Comptable | En attente | Peut-il generer un recu ? |
| LATE | En retard | Paiement attendu mais non regle apres l'echeance. | Comptable, direction | Retard | Calcul automatique selon dueDate ? |
| CANCELLED | Annule | Paiement invalide ou annule administrativement. | Comptable | Supprime | Doit-on garder une trace d'audit obligatoire ? |
| Methode de paiement | Mode de paiement | Canal utilise : espece, mobile money, virement, cheque, etc. | Caissier, comptable | Payment method | Liste exacte des modes acceptes. |

### Pedagogie, notes et bulletins

| Terme ambigu | Terme canonique | Definition metier | Experts metier a valider | Synonymes / termes a eviter | Questions ouvertes |
| --- | --- | --- | --- | --- | --- |
| Matiere / Subject | Matiere | Discipline enseignee et evaluee, par exemple mathematiques ou lecture. | Directeur des etudes | Subject dans les libelles visibles | Une matiere peut-elle appartenir a plusieurs niveaux ? |
| Enseignant | Enseignant | Personnel pedagogique responsable de cours, notes ou presences selon ses affectations. | Direction des etudes | Teacher | Un enseignant peut-il saisir toutes les classes ? |
| Affectation | Affectation pedagogique | Association entre un enseignant, une classe, une matiere et une annee scolaire. | Direction des etudes | Assignment | L'affectation doit-elle inclure les sequences/trimestres ? |
| Sequence | Sequence | Periode pedagogique d'evaluation a l'interieur d'un trimestre. | Directeur des etudes | Evaluation period | Nombre exact de sequences par trimestre. |
| Trimestre | Trimestre | Periode academique regroupant plusieurs sequences et servant aux bulletins periodiques. | Directeur des etudes | Term | Les trimestres sont-ils fixes par annee scolaire ? |
| Note | Note | Resultat chiffre attribue a un eleve dans une matiere pour une evaluation ou une periode. | Enseignants, directeur des etudes | Grade | Note sur 20 uniquement ? |
| Coefficient | Coefficient | Poids d'une note ou d'une matiere dans le calcul de moyenne. | Directeur des etudes | Poids | Coefficient par matiere, classe ou evaluation ? |
| Moyenne | Moyenne | Resultat calcule a partir des notes et coefficients. | Directeur des etudes | Average | Arrondi a combien de decimales ? |
| Rang | Rang | Position d'un eleve dans une classe selon une moyenne definie. | Directeur des etudes | Classement | Gerer les ex aequo comment ? |
| Appreciation | Appreciation | Commentaire pedagogique associe a une note, moyenne ou bulletin. | Enseignant, directeur des etudes | Commentaire | Appreciation automatique ou manuelle ? |
| Bulletin | Bulletin scolaire | Document officiel presentant les notes, moyennes, appreciations et decisions pour une periode. | Direction des etudes, direction | Report card | Le bulletin ne doit-il inclure que des notes verrouillees ? |
| Statut note | Statut de note | Etat de cycle de vie d'une note. Valeurs cibles : DRAFT, VALIDATED, LOCKED. | Directeur des etudes | Status grade | Qui peut retrograder une note validee ? |
| DRAFT | Brouillon de note | Note saisie mais pas encore validee pedagogiquement. | Enseignant | Draft | Visible par les parents ? |
| VALIDATED | Note validee | Note controlee et acceptee pour calculs officiels. | Directeur des etudes | Validee | Validation individuelle ou par classe ? |
| LOCKED | Note verrouillee | Note definitive, non modifiable sans procedure exceptionnelle. | Direction des etudes, direction | Cloturee | Qui peut deverrouiller ? |
| Rapport de classe | Rapport de classe | Synthese pedagogique pour une classe et une periode. | Directeur des etudes | Class report | Inclut-il absences et paiements ? |

### Presence et vie scolaire

| Terme ambigu | Terme canonique | Definition metier | Experts metier a valider | Synonymes / termes a eviter | Questions ouvertes |
| --- | --- | --- | --- | --- | --- |
| Presence | Presence | Etat indiquant qu'un eleve est present a une date ou seance donnee. | Surveillant general, enseignants | Attendance | Presence journaliere ou par cours ? |
| Absence | Absence | Etat indiquant qu'un eleve n'etait pas present alors qu'il etait attendu. | Surveillant general | Absent | Absence demi-journee possible ? |
| Retard | Retard | Arrivee apres l'heure attendue. | Surveillant general | Late | Retard mesure en minutes ou simple statut ? |
| Justification | Justification d'absence | Motif accepte ou a examiner expliquant une absence ou un retard. | Surveillant general, direction | Excuse | Justification par document obligatoire ? |
| Absence justifiee | Absence justifiee | Absence avec motif accepte par l'etablissement. | Surveillant general | Excused absence | Qui valide la justification ? |
| Absence non justifiee | Absence non justifiee | Absence sans motif accepte. | Surveillant general | Unexcused absence | Declenche-t-elle une alerte automatique ? |
| Feuille d'appel | Appel journalier | Operation de saisie des presences pour une classe a une date donnee. | Enseignants, surveillant general | Daily attendance | Peut-on modifier un appel deja valide ? |

### Identite, acces et administration

| Terme ambigu | Terme canonique | Definition metier | Experts metier a valider | Synonymes / termes a eviter | Questions ouvertes |
| --- | --- | --- | --- | --- | --- |
| Utilisateur | Utilisateur applicatif | Compte permettant de se connecter a l'application. | Administrateur applicatif | User | Un eleve a-t-il toujours un utilisateur ? |
| Profil | Profil utilisateur | Ensemble d'informations metier associees a un utilisateur : role, reference, identite. | Administrateur applicatif | User profile | Un utilisateur peut-il avoir plusieurs profils actifs ? |
| Role | Role applicatif | Categorie fonctionnelle principale donnant un niveau d'acces global : ADMIN, AGENT, ENSEIGNANT, PARENT, ELEVE. | Administrateur applicatif, direction | RoleType | Role unique ou multi-role ? |
| Permission | Permission | Droit fin d'executer ou consulter une capacite, au format module:action. | Administrateur applicatif | Right, privilege | Les permissions viennent-elles du backend ou du frontend par defaut ? |
| ADMIN | Administrateur | Role disposant des droits d'administration et d'arbitrage applicatif. | Direction, administrateur applicatif | Super admin | Separations necessaires entre admin technique et direction ? |
| AGENT | Agent administratif | Role du personnel administratif gerant inscriptions, eleves et parfois paiements selon l'organisation. | Direction | Staff | L'agent peut-il valider des paiements ? |
| ENSEIGNANT | Enseignant | Role applicatif des enseignants. | Direction des etudes | TEACHER | Doit-il etre limite par affectation ? |
| PARENT | Parent | Role applicatif d'un responsable legal connecte. | Responsable inscriptions | Responsable | Quelles donnees financieres peut-il voir ? |
| ELEVE | Eleve utilisateur | Role applicatif eventuel d'un eleve connecte. | Direction | STUDENT | Est-il utilise en primaire ? |
| Session | Session utilisateur | Periode d'utilisation authentifiee de l'application. | Administrateur applicatif | Login session | Duree exacte d'expiration ? |
| Refresh token | Jeton de renouvellement | Jeton permettant d'obtenir une nouvelle session sans reconnexion manuelle. | Administrateur applicatif | Token refresh | Politique de rotation et revocation a documenter. |
| Audit | Journal d'audit | Trace non modifiable des actions sensibles realisees dans le systeme. | Administrateur applicatif, direction | Log | Quelles actions sont obligatoirement auditees ? |

### Documents et reporting

| Terme ambigu | Terme canonique | Definition metier | Experts metier a valider | Synonymes / termes a eviter | Questions ouvertes |
| --- | --- | --- | --- | --- | --- |
| Carte scolaire | Carte scolaire | Document d'identification scolaire emis pour un eleve inscrit ou preinscrit selon decision metier. | Direction, secretariat | School card | Emise avant ou apres inscription definitive ? |
| Carte d'identite scolaire | Carte d'identite scolaire | Variante de carte contenant les informations d'identification de l'eleve. | Direction, secretariat | Identity card | Difference exacte avec carte scolaire ? |
| Attestation de scolarite | Attestation de scolarite | Document officiel attestant qu'un eleve est regulierement inscrit pour une annee scolaire. | Direction | Certificate | Peut-elle etre emise pour une preinscription VALIDEE ? |
| Rapport financier | Rapport financier | Synthese des paiements, soldes et indicateurs financiers sur une periode. | Comptable, direction | Financial report | Inclut-il les paiements annules ? |
| Rapport de performance | Rapport de performance scolaire | Synthese pedagogique des resultats scolaires. | Directeur des etudes | Performance report | Basee sur notes validees ou verrouillees ? |
| Tableau de bord direction | Tableau de bord direction | Vue de pilotage regroupant indicateurs cles de scolarite, pedagogie, finances et presence. | Direction | Dashboard | Quels indicateurs sont officiels ? |

## Termes techniques acceptes

| Terme technique | Sens autorise | Remarque |
| --- | --- | --- |
| DTO | Objet de transport API | Ne doit pas definir le vocabulaire metier a lui seul. |
| Repository | Adaptateur de persistance ou d'API | Ne pas exposer les details HTTP a la presentation. |
| Use case | Orchestration applicative d'une intention utilisateur | Doit utiliser le vocabulaire canonique. |
| Entity | Objet metier riche ou structure representant un concept durable | Son nom doit correspondre au glossaire. |
| Guard | Protection de route Angular | Doit s'appuyer sur roles et permissions definis ici. |

## Decisions a prendre en atelier metier

| Sujet | Decision attendue | Experts requis | Priorite |
| --- | --- | --- | --- |
| Conversion preinscription vers inscription | Conditions exactes pour passer de VALIDEE a INSCRITE | Direction, responsable inscriptions, comptable | Haute |
| Paiement obligatoire | Dire si frais de preinscription ou inscription conditionnent la validation | Direction, comptable | Haute |
| Statut paiement partiel | Ajouter ou non PARTIAL dans le vocabulaire paiement | Comptable | Haute |
| Emission des bulletins | Utiliser uniquement les notes VALIDATED ou LOCKED | Directeur des etudes, direction | Haute |
| Affectations enseignants | Definir la granularite classe + matiere + annee scolaire | Directeur des etudes | Moyenne |
| Comptes parents | Creation automatique ou manuelle apres inscription | Responsable inscriptions, administrateur applicatif | Moyenne |
| Documents scolaires | Dire quels documents sont autorises pour preinscrits vs inscrits | Direction, secretariat | Moyenne |

## Termes a ne plus introduire sans justification

| Terme a eviter | Remplacer par | Raison |
| --- | --- | --- |
| Student dans les libelles visibles | Eleve | Le vocabulaire metier utilisateur est francais. |
| Classroom | Classe | Ambigu avec salle physique. |
| Rejetee | REFUSEE | Le backend et le metier cible utilisent REFUSEE. |
| Status generique | Statut du concept | Toujours preciser : statut de paiement, statut de note, statut de preinscription. |
| Montant pour tout | Tarif, paiement, solde selon le cas | "Montant" seul ne dit pas si c'est attendu, paye ou restant. |
| Validation | Validation de preinscription, validation de note, validation de paiement | Le terme est transverse et ambigu. |

## Processus de mise a jour

1. Identifier le terme ambigu dans un ticket, un ecran, une API ou une discussion metier.
2. Ajouter une ligne dans ce fichier avec une definition provisoire.
3. Faire valider par les experts metier indiques.
4. Renommer le code, les libelles et les tests pour utiliser le terme canonique.
5. Ajouter les decisions restantes dans la section "Decisions a prendre en atelier metier".

## Historique

| Date | Changement | Auteur |
| --- | --- | --- |
| 2026-07-07 | Creation initiale du langage ubiquitaire du projet. | Codex |
