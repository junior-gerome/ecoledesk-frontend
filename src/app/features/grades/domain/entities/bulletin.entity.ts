/**
 * Bulletin Entity (Aggregate Root)
 * Agrégat racine pour les bulletins
 */
import { AcademicContext } from "../value-objects/academic-context.value-object";
import { Average } from "../value-objects/average.value-object";
import { Mention } from "../value-objects/mention.value-object";
import { GradeRow } from "./grade-row.entity";
import { StudentGradeHeader } from "./student-grade-header.entity";

export class Bulletin {
  readonly id: string;
  readonly studentHeader: StudentGradeHeader;
  readonly gradeRows: GradeRow[];
  readonly academicContext: AcademicContext;
  readonly studentRank?: number;
  readonly totalStudentsInClass?: number;
  readonly createdAt: Date;
  readonly lastUpdatedAt: Date;

  constructor(
    id: string,
    studentHeader: StudentGradeHeader,
    gradeRows: GradeRow[],
    academicContext: AcademicContext,
    createdAt: Date,
    lastUpdatedAt: Date,
    studentRank?: number,
    totalStudentsInClass?: number,
  ) {
    this.id = id;
    this.studentHeader = studentHeader;
    this.gradeRows = gradeRows;
    this.academicContext = academicContext;
    this.createdAt = createdAt;
    this.lastUpdatedAt = lastUpdatedAt;
    this.studentRank = studentRank;
    this.totalStudentsInClass = totalStudentsInClass;
  }

  static create(
    studentHeader: StudentGradeHeader,
    gradeRows: GradeRow[],
    academicContext: AcademicContext,
    studentRank?: number,
    totalStudentsInClass?: number,
  ): Bulletin {
    const now = new Date();
    const id = `${studentHeader.studentId}-${academicContext.sequenceLabel}-${now.getTime()}`;

    return new Bulletin(
      id,
      studentHeader,
      gradeRows,
      academicContext,
      now,
      now,
      studentRank,
      totalStudentsInClass,
    );
  }

  /**
   * Calcule la moyenne générale du bulletin
   */
  getGeneralAverage(): Average {
    if (this.gradeRows.length === 0) {
      return Average.createDirect(0);
    }

    let totalWeightedScore = 0;
    let totalCoefficient = 0;

    for (const row of this.gradeRows) {
      totalWeightedScore += row.average.value * row.coefficient.value;
      totalCoefficient += row.coefficient.value;
    }

    const generalAverage =
      totalCoefficient > 0 ? totalWeightedScore / totalCoefficient : 0;
    return Average.createDirect(generalAverage, totalCoefficient);
  }

  /**
   * Obtient la mention générale (Excellent, Très bien, etc)
   */
  getGeneralMention(): Mention {
    return Mention.fromAverage(this.getGeneralAverage().value);
  }

  /**
   * Compte le nombre de matières avec note passante (>=10)
   */
  getPassingSubjectsCount(): number {
    return this.gradeRows.filter((row) => row.average.isPass).length;
  }

  /**
   * Compte le nombre de matières non-passantes
   */
  getFailingSubjectsCount(): number {
    return this.gradeRows.filter((row) => !row.average.isPass).length;
  }

  /**
   * Vérifie si l'élève a des issues
   */
  isSuccessful(): boolean {
    const passingCount = this.getPassingSubjectsCount();
    const totalSubjects = this.gradeRows.length;
    return passingCount >= totalSubjects * 0.7; // 70% de réussite minimum
  }

  /**
   * Obtient les meilleurs sujets
   */
  getTopSubjects(limit: number = 3): GradeRow[] {
    return [...this.gradeRows]
      .sort((a, b) => b.average.value - a.average.value)
      .slice(0, limit);
  }

  /**
   * Obtient les pires sujets
   */
  getBottomSubjects(limit: number = 3): GradeRow[] {
    return [...this.gradeRows]
      .sort((a, b) => a.average.value - b.average.value)
      .slice(0, limit);
  }

  /**
   * Total des coefficients
   */
  getTotalCoefficient(): number {
    return this.gradeRows.reduce((sum, row) => sum + row.coefficient.value, 0);
  }
}
