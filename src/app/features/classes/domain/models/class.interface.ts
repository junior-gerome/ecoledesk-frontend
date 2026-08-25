import { StaffMemberBasic } from "@app/features/staff/domain/models/staff.model";
import { AnneeScolaire } from "@app/features/gestion-annees/domain/models";
import { Section } from "@app/features/section/domain/models";

export interface Class {
  id?: number;
  nameClasse: string;
  level: string;
  capacity: number;
  teacher?: StaffMemberBasic;
  section: Section;
  academicYear: AnneeScolaire;
  description?: string;
}
