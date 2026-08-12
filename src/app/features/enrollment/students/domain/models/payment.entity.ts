import { TypePaiement } from '@app/enums/typePaiement.enum';
import { ClassroomEntity } from './classroom.entity';

export interface PaymentEntity {
  id?: string | null;
  count?: number | null;
  classeRoom?: ClassroomEntity | null;
  typePaiement?: TypePaiement | string | null;
}
