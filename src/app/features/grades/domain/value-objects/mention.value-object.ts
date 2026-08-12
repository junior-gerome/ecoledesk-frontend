/**
 * Mention Value Object
 * Qualifie le niveau de performance (Excellent, Très Bien, Bien, etc)
 */
export type MentionType =
  | "EXCELLENT"
  | "TRES_BIEN"
  | "BIEN"
  | "ASSEZ_BIEN"
  | "PASSABLE"
  | "FAIBLE"
  | "TRES_FAIBLE";

export class Mention {
  private readonly type: MentionType;

  private constructor(type: MentionType) {
    this.type = type;
  }

  static fromAverage(average: number): Mention {
    let type: MentionType;

    if (average >= 18) {
      type = "EXCELLENT";
    } else if (average >= 16) {
      type = "TRES_BIEN";
    } else if (average >= 14) {
      type = "BIEN";
    } else if (average >= 12) {
      type = "ASSEZ_BIEN";
    } else if (average >= 10) {
      type = "PASSABLE";
    } else if (average >= 8) {
      type = "FAIBLE";
    } else {
      type = "TRES_FAIBLE";
    }

    return new Mention(type);
  }

  static create(type: MentionType): Mention {
    return new Mention(type);
  }

  get value(): MentionType {
    return this.type;
  }

  get label(): string {
    const labels: Record<MentionType, string> = {
      EXCELLENT: "Excellent",
      TRES_BIEN: "Très bien",
      BIEN: "Bien",
      ASSEZ_BIEN: "Assez bien",
      PASSABLE: "Passable",
      FAIBLE: "Faible",
      TRES_FAIBLE: "Très faible",
    };
    return labels[this.type];
  }

  get color(): string {
    const colors: Record<MentionType, string> = {
      EXCELLENT: "text-green-700 bg-green-50",
      TRES_BIEN: "text-emerald-700 bg-emerald-50",
      BIEN: "text-blue-700 bg-blue-50",
      ASSEZ_BIEN: "text-cyan-700 bg-cyan-50",
      PASSABLE: "text-yellow-700 bg-yellow-50",
      FAIBLE: "text-orange-700 bg-orange-50",
      TRES_FAIBLE: "text-red-700 bg-red-50",
    };
    return colors[this.type];
  }

  get emoji(): string {
    const emojis: Record<MentionType, string> = {
      EXCELLENT: "⭐⭐⭐⭐⭐",
      TRES_BIEN: "⭐⭐⭐⭐",
      BIEN: "⭐⭐⭐",
      ASSEZ_BIEN: "⭐⭐",
      PASSABLE: "⭐",
      FAIBLE: "⚠️",
      TRES_FAIBLE: "❌",
    };
    return emojis[this.type];
  }

  equals(other: Mention): boolean {
    return this.type === other.type;
  }

  toString(): string {
    return this.label;
  }
}
