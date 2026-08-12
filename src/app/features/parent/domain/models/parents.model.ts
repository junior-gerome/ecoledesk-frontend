import { TypeParent } from "@app/features/parent/domain/enums/typeParent.enum";

export interface Parents {
  id?: number;
  lastNameParent: string;
  firstNameParent: string;
  email: string;
  address: string;
  professionParent: string;
  phoneNumber: string;
  /** Relation historique; non persistée par l'API Guardian. */
  typeParent: TypeParent | null;
}

/** Contrat REST du backend pour un responsable légal. */
export interface GuardianApi {
  id?: number;
  lastNameGuardian: string;
  firstNameGuardian: string;
  email: string;
  address: string;
  occupation: string;
  phoneNumber: string;
}
