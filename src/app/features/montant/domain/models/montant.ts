import { TypePaiement } from "@app/enums/typePaiement.enum";
import { Class } from "@app/features/classes/domain/models";

export interface Montant {
  id?: number;
  count: number;
  classeRoom: Class;
  typePaiement: TypePaiement | string;
}
