export interface SchoolYearEntity {
  id?: string | null;
  /** Canonical field from backend AcademicYearDTO */
  libelleAcademicYear?: string | null;
  /** Legacy alias kept for backward compatibility with existing mappers/components */
  libelleAnneeScolaire?: string | null;
  dateDebut?: string | null;
  dateFin?: string | null;
  statutCode?: boolean | null;
}
