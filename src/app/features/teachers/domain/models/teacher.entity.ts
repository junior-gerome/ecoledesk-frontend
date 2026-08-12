export type Gender = "MASCULIN" | "FEMININ";

export interface TeacherEntity {
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
  photoUrl?: string;
}
