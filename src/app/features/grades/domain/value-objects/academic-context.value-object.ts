/**
 * AcademicContext Value Object
 * Contexte académique (année, trimestre, séquence)
 */
export class AcademicContext {
  readonly academicYearLabel: string;
  readonly trimesterNumber: number;
  readonly sequenceLabel: string;
  readonly evaluationMonth: string;

  constructor(
    academicYearLabel: string,
    trimesterNumber: number,
    sequenceLabel: string,
    evaluationMonth: string,
  ) {
    this.validate(
      academicYearLabel,
      trimesterNumber,
      sequenceLabel,
      evaluationMonth,
    );
    this.academicYearLabel = academicYearLabel;
    this.trimesterNumber = trimesterNumber;
    this.sequenceLabel = sequenceLabel;
    this.evaluationMonth = evaluationMonth;
  }

  private validate(
    academicYearLabel: string,
    trimesterNumber: number,
    sequenceLabel: string,
    evaluationMonth: string,
  ): void {
    if (!academicYearLabel?.trim()) {
      throw new Error("Academic year label is required");
    }
    if (trimesterNumber < 1 || trimesterNumber > 4) {
      throw new Error("Semester must be between 1 and 4");
    }
    if (!sequenceLabel?.trim()) {
      throw new Error("Sequence label is required");
    }
    if (!evaluationMonth?.trim()) {
      throw new Error("Evaluation month is required");
    }
  }

  get trimesterLabel(): string {
    const labels = [
      "",
      "Premier trimestre",
      "Deuxième trimestre",
      "Troisième trimestre",
      "Quatrième trimestre",
    ];
    return labels[this.trimesterNumber] || "";
  }

  get displayLabel(): string {
    return `${this.sequenceLabel} - ${this.evaluationMonth} (${this.trimesterLabel})`;
  }

  equals(other: AcademicContext): boolean {
    return (
      this.academicYearLabel === other.academicYearLabel &&
      this.trimesterNumber === other.trimesterNumber &&
      this.sequenceLabel === other.sequenceLabel &&
      this.evaluationMonth === other.evaluationMonth
    );
  }

  toString(): string {
    return this.displayLabel;
  }
}
