import { TypeParent } from "@app/features/parent/domain/enums/typeParent.enum";

export interface ParentEntity {
  id?: string | null;
  typeParent?: TypeParent | string | null;
  lastNameParent: string;
  firstNameParent: string;
  email: string;
  address: string;
  professionParent: string;
  phoneNumber: string;
  photoUrl?: string;
}
