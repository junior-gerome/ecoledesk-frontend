/**
 * Average Value Object
 * Calcule et représente la moyenne pondérée
 */
export class Average {
  private readonly _value: number;
  private readonly _totalCoefficient: number;

  private constructor(value: number, totalCoefficient: number) {
    this.validate(value, totalCoefficient);
    this._value = value;
    this._totalCoefficient = totalCoefficient;
  }

  static calculate(gradeScores: number[], coefficients?: number[]): Average {
    if (gradeScores.length === 0) {
      return new Average(0, 0);
    }

    const weights = coefficients ?? new Array(gradeScores.length).fill(1);

    if (gradeScores.length !== weights.length) {
      throw new Error("Scores and weights arrays must have the same length");
    }

    let totalWeighted = 0;
    let totalCoefficient = 0;

    for (let i = 0; i < gradeScores.length; i++) {
      totalWeighted += gradeScores[i] * weights[i];
      totalCoefficient += weights[i];
    }

    const average = totalCoefficient > 0 ? totalWeighted / totalCoefficient : 0;
    return new Average(average, totalCoefficient);
  }

  static createDirect(value: number, totalCoefficient: number = 0): Average {
    return new Average(value, totalCoefficient);
  }

  private validate(value: number, _totalCoefficient: number): void {
    if (!Number.isFinite(value)) {
      throw new Error("Average must be a finite number");
    }
    if (value < 0 || value > 20) {
      throw new Error("Average must be between 0 and 20");
    }
  }

  get value(): number {
    return this._value;
  }

  get totalCoefficient(): number {
    return this._totalCoefficient;
  }

  get isPass(): boolean {
    return this._value >= 10;
  }

  get rounded(): number {
    return Math.round(this._value * 100) / 100;
  }

  get rounded2Decimals(): string {
    return this._value.toFixed(2);
  }

  equals(other: Average): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this.rounded2Decimals;
  }

  toNumber(): number {
    return this._value;
  }
}
