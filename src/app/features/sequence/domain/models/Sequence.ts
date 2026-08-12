import { Trimestre } from "@app/features/trimestre/domain/models";

export interface Sequence {
  id?: number;
  libelleSequence: string;
  // numero: number;
  trimestre?: Trimestre;
}

