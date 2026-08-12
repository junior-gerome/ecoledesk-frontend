import { Gender } from "@app/enums/gender";
import { ParentEntity } from "./parent.entity";
import { ApiDateValue } from "./value-objects/api-date-value.type";

export interface StudentEntity {
  id?: string | null;
  lastNameStudent: string;
  firstNameStudent: string;
  dateOfBirth: ApiDateValue;
  registrationDate?: ApiDateValue;
  gender?: Gender | string | null;
  ecolePrecedente: string;
  photoUrl?: string;
  parent?: ParentEntity | null;
}
