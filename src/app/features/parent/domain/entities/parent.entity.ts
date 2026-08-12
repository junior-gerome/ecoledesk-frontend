import { Email } from "@app/shared/domains/value-objects/email";
import { TypeParent } from "../enums/typeParent.enum";
import { PhoneNumber } from "../value-objects/phone-number.vo";

export class Parent {
  constructor(
    public id: string,
    public lastNameParent: string,
    public firstNameParent: string,
    public email: Email,
    public address: string,
    public professionParent: string,
    public phoneNumber: PhoneNumber,
    public typeParent: TypeParent,

  ) {}
}
