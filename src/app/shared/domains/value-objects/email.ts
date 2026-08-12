export class Email {
  private readonly value: string;

  private constructor(email: string) {
    const normalized = Email.normalize(email);

    if (!Email.isValid(normalized)) {
      throw new Error("Email invalid");
    }

    this.value = normalized;
  }

  static create(email: string): Email {
    return new Email(email);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  private static normalize(email: string): string {
    return email.trim().toLowerCase();
  }

  private static isValid(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return regex.test(email);
  }
}
