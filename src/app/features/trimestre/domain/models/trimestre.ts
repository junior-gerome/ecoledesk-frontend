import { AnneeScolaire } from "@app/features/gestion-annees/domain/models";

export interface Trimestre {
  id?: number;
  libelleTrimestre: string;
  // numero: number;
  anneeScolaire: AnneeScolaire;
  // type: TypeTrimestre;
}
