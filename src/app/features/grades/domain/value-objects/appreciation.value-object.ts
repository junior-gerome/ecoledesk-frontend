/**
 * Appreciation Value Object
 * Représente les commentaires/appréciations sur la performance
 */
export class Appreciation {
  private readonly _text: string;
  private readonly _level: "positive" | "neutral" | "negative";

  private constructor(
    text: string,
    level: "positive" | "neutral" | "negative",
  ) {
    this.validate(text);
    this._text = text;
    this._level = level;
  }

  static create(
    text: string,
    level: "positive" | "neutral" | "negative" = "neutral",
  ): Appreciation {
    return new Appreciation(text, level);
  }

  static fromMentionType(mention: string): Appreciation {
    const appreciations: Record<
      string,
      { text: string; level: "positive" | "neutral" | "negative" }
    > = {
      EXCELLENT: {
        text: "Excellent travail. Continuez ainsi!",
        level: "positive",
      },
      TRES_BIEN: {
        text: "Très bon travail. Poursuivez vos efforts.",
        level: "positive",
      },
      BIEN: {
        text: "Bon travail. Restez concentré.",
        level: "positive",
      },
      ASSEZ_BIEN: {
        text: "Performance acceptable. Augmentez vos efforts.",
        level: "neutral",
      },
      PASSABLE: {
        text: "Résultats justes passants. Travaillez davantage.",
        level: "neutral",
      },
      FAIBLE: {
        text: "Performance faible. Redoublez d'efforts.",
        level: "negative",
      },
      TRES_FAIBLE: {
        text: "Performance très faible. Attention requise.",
        level: "negative",
      },
    };

    const config = appreciations[mention] || {
      text: "Voir avec l'enseignant",
      level: "neutral",
    };
    return new Appreciation(config.text, config.level);
  }

  private validate(text: string): void {
    if (!text || text.trim().length === 0) {
      throw new Error("Appreciation text cannot be empty");
    }
    if (text.length > 500) {
      throw new Error("Appreciation text cannot exceed 500 characters");
    }
  }

  get text(): string {
    return this._text;
  }

  get level(): "positive" | "neutral" | "negative" {
    return this._level;
  }

  get color(): string {
    const colors = {
      positive: "text-green-700 bg-green-50",
      neutral: "text-gray-700 bg-gray-50",
      negative: "text-red-700 bg-red-50",
    };
    return colors[this._level];
  }

  get icon(): string {
    const icons = {
      positive: "✓",
      neutral: "•",
      negative: "⚠️",
    };
    return icons[this._level];
  }

  equals(other: Appreciation): boolean {
    return this._text === other._text && this._level === other._level;
  }

  toString(): string {
    return this._text;
  }
}
