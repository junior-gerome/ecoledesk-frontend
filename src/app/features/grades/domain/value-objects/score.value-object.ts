export class Score {
  private constructor(private readonly scoreValue: number) {}

  static create(value: number): Score {
    if (!Number.isFinite(value) || value < 0 || value > 20) {
      throw new Error("La note doit etre comprise entre 0 et 20.");
    }

    return new Score(value);
  }

  static fromUnsafe(value: unknown, fallback = 0): Score {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 20) {
      return new Score(this.normalizeFallback(fallback));
    }

    return new Score(parsed);
  }

  get value(): number {
    return this.scoreValue;
  }

  private static normalizeFallback(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    if (value < 0) {
      return 0;
    }

    if (value > 20) {
      return 20;
    }

    return value;
  }
}
