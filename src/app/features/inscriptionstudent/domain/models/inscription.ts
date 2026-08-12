import { StudentEntity } from '@features/students/domain/models/student.entity';
import { AnneeScolaire } from '@app/features/gestion-annees/domain/models';
import { Class } from '@app/features/classes/domain/models';
import { Montant } from '@app/features/montant/domain/models';
import { Parents } from '@app/features/parent/domain/models';

export type PreInscriptionStatus =
  | 'BROUILLON'
  | 'EN_ATTENTE'
  | 'VALIDEE'
  | 'REFUSEE'
  | 'ANNULEE'
  | 'INSCRITE';

export type StudentRecord = Omit<
  StudentEntity,
  'id' | 'dateOfBirth' | 'registrationDate' | 'parent'
> & {
  id?: number | string | null;
  dateOfBirth: Date | string | [number, number, number];
  registrationDate: Date | string | [number, number, number];
  parent: Parents;
};

export interface Inscription {
  id?: number;
  student: StudentRecord;
  classeRoom?: Class;
  /** Present dans la reponse API (InscriptionStudentDTO). */
  classeRoomId?: number;
  montant?: Montant;
  anneescolaire?: AnneeScolaire;
  /** Present dans la reponse API (InscriptionStudentDTO). */
  anneeScolaireId?: number;
  dateInscription: Date | string;
  statutPreinscription?: PreInscriptionStatus;
  datePreinscription?: Date | string;
}
