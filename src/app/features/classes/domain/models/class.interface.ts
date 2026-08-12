import { Teacher } from "@app/features/teachers/domain/models";
import { AnneeScolaire } from "@app/features/gestion-annees/domain/models";
import { Section } from "@app/features/section/domain/models";

export interface Class {
  id?: number;
  nameClasse: string;
  level: string;
  capacity: number;
  teacher?: Teacher;
  section: Section;
  //actif: boolean;
  anneeScolaire: AnneeScolaire;
  description?: string;
}
