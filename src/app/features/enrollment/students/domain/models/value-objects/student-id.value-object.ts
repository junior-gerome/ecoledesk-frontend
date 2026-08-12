import { BaseId } from "@app/shared/domains/value-objects/base-id";

export class StudentId extends BaseId {
  private constructor(value: string) {
    super(value);
  }

  static fromUnknown(value: unknown): StudentId | null {
    if (value === null || value === undefined) {
      return null;
    }

    const normalized = String(value).trim();
    if (!normalized) {
      return null;
    }

    return new StudentId(normalized);
  }
}
