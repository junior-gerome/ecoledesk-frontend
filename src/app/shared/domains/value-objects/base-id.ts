export abstract class BaseId {
  protected readonly value: string;

  constructor(value: string) {
    const normalized = value?.trim();
    if (!normalized) {
      throw new Error("ID cannot be empty");
    }

    this.value = normalized;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: BaseId): boolean {
    return other.constructor === this.constructor && this.value === other.value;
  }
}
