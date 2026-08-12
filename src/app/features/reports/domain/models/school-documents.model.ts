export type SchoolDocumentApiDateValue =
  | Date
  | string
  | number[]
  | null
  | undefined;

export interface SchoolYearApi {
  id?: number | string | null;
  libelleAnneeScolaire?: string | null;
}

export interface SchoolClassApi {
  id?: number | string | null;
  nameClasse?: string | null;
  section?: {
    libelle?: string | null;
  } | null;
  anneeScolaire?: SchoolYearApi | null;
}

export interface SchoolStudentApi {
  id?: number | string | null;
  firstNameStudent?: string | null;
  lastNameStudent?: string | null;
  dateOfBirth?: SchoolDocumentApiDateValue;
  registrationDate?: SchoolDocumentApiDateValue;
}

export interface SchoolEnrollmentApi {
  id?: number | string | null;
  student?: SchoolStudentApi | null;
  studentId?: number | string | null;
  classeRoom?: SchoolClassApi | null;
  classeRoomId?: number | string | null;
  anneescolaire?: SchoolYearApi | null;
  anneeScolaireId?: number | string | null;
  dateInscription?: SchoolDocumentApiDateValue;
}

export interface SchoolDocumentsData {
  students: SchoolStudentApi[];
  enrollments: SchoolEnrollmentApi[];
  classes: SchoolClassApi[];
  activeSchoolYear: SchoolYearApi | null;
}
