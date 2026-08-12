/**
 * StudentGradeHeader Entity
 * Infos élève pour le bulletin
 */
export class StudentGradeHeader {
  readonly studentId: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly matricule?: string;
  readonly className: string;
  readonly classId: number;
  readonly academicYear: string;
  readonly enrollmentDate?: Date;

  constructor(
    studentId: number,
    firstName: string,
    lastName: string,
    classId: number,
    className: string,
    academicYear: string,
    matricule?: string,
    enrollmentDate?: Date,
  ) {
    this.studentId = studentId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.matricule = matricule;
    this.className = className;
    this.classId = classId;
    this.academicYear = academicYear;
    this.enrollmentDate = enrollmentDate;
  }

  get fullName(): string {
    return `${this.lastName} ${this.firstName}`.trim();
  }

  get displayName(): string {
    return this.fullName;
  }

  get initials(): string {
    const first = this.firstName.charAt(0).toUpperCase();
    const last = this.lastName.charAt(0).toUpperCase();
    return `${first}${last}`;
  }
}
