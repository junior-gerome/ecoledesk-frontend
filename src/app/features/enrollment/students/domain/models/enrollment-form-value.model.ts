import { Gender } from "@app/enums/gender";
import { TypeParent } from "@app/features/parent/domain/enums/typeParent.enum";

export interface EnrollmentFormValue {
  studentId: string | null;
  parentId: string | null;
  lastNameStudent: string;
  firstNameStudent: string;
  dateOfBirth: string;
  gender: Gender | string | null;
  ecolePrecedente: string;
  sectionId: string | null;
  classId: string | null;
  montantId: string | null;
  TypeParent: TypeParent | string | null;
  lastNameParent: string;
  firstNameParent: string;
  professionParent: string;
  address: string;
  phoneNumber: string;
  email: string;
}
