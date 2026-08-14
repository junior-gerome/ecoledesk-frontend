/**
 * Domain model for academic year.
 *
 * Field alignment with backend AcademicYearDTO:
 *   libelleAcademicYear  ← canonical backend field name
 *   libelleAnneeScolaire ← legacy alias kept for backward compatibility with
 *                          existing mappers/components that still use the old name.
 *                          Both are optional so either can be present.
 */
export interface AnneeScolaire {
  id?: number;
  /** Canonical field name from backend AcademicYearDTO */
  libelleAcademicYear?: string;
  /** Legacy alias — kept for backward compatibility */
  libelleAnneeScolaire?: string;
  dateDebut: string;
  dateFin: string;
  statutCode: boolean;
}
