export class PhoneNumber{
  private readonly value: string;
  constructor(phone: string) {
    const normalized = PhoneNumber.normalize(phone);
    if (!PhoneNumber.isValid(normalized)) {
      throw new Error("Phone Number Invalid");
    }
    this.value = normalized;
  }

  //toujours retourne un format propre
  getValue(): string{
    return this.value;
  }

  //normalisation exclusion des caracteres y n'approprie
  private static normalize(phone: string): string{
    let p = phone.trim().replace(/\s+/g,'');

    if (p.startsWith('6')) {
      p = '+237' + p;
    }
    return p;
  }

  private static isValid(phone: string): boolean{
    const regex = /^\+2376\d{8 $/;
    return regex.test(phone);
  }
}