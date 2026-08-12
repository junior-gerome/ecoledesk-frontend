export class Coefficient {
  private constructor(private readonly coefficientValue: number) {}

  static create(value: number): Coefficient {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error("Le coefficient doit etre strictement positif.");
    }

    return new Coefficient(value);
  }

  static fromUnsafe(value: unknown, fallback = 1): Coefficient {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return new Coefficient(this.normalizeFallback(fallback));
    }

    return new Coefficient(parsed);
  }

  get value(): number {
    return this.coefficientValue;
  }

  private static normalizeFallback(value: number): number {
    if (!Number.isFinite(value) || value <= 0) {
      return 1;
    }

    return value;
  }
}
