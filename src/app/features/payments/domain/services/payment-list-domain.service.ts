import { Injectable } from '@angular/core';

@Injectable()
export class PaymentListDomainService {
  statusClass(status: string): string {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'LATE':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  receiptFileName(paymentId: number): string {
    return `recu-paiement-${paymentId}.pdf`;
  }
}
