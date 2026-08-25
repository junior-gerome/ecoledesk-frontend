/**
 * Domain model for academic year.
 *
 * Field names are kept identical to the backend AcademicYearDTO.
 */
export interface AnneeScolaire {
  id?: number;
  libelleAcademicYear: string;
  dateDebut: string;
  dateFin: string;
  statutCode: boolean;
}
