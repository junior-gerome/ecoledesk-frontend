import { Gender } from "@app/enums/gender";

export interface Teacher {
  id?: number;
  firstnameTeacher: string;
  lastnameTeacher: string;
  email: string;
  gender: Gender;
  phoneNumber: string;
  speciality: string;
  dateEmbauche: Date | string;
  niveau: string;
  address?: string;
}
