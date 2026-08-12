import { Injectable } from '@angular/core';
import {
  PaymentReceiptSummary,
  PaymentReceiptViewModel,
} from '../models/payment-receipt.model';

@Injectable()
export class PaymentReceiptDomainService {
  computeSummary(receipts: PaymentReceiptViewModel[]): PaymentReceiptSummary {
    const paidReceipts = receipts.filter((receipt) => receipt.status === 'PAID');
    const numberedReceipts = receipts.filter((receipt) => !!receipt.receiptNumber);

    return {
      totalReceipts: receipts.length,
      totalPaidAmount: paidReceipts.reduce(
        (total, receipt) => total + receipt.amount,
        0,
      ),
      numberedReceipts: numberedReceipts.length,
      pendingReceiptGeneration: paidReceipts.filter(
        (receipt) => !receipt.receiptNumber,
      ).length,
    };
  }

  receiptActionTooltip(
    receipt: Pick<PaymentReceiptViewModel, 'canGenerateReceipt'>,
    action: 'preview' | 'print' | 'download',
  ): string {
    if (!receipt.canGenerateReceipt) {
      return 'Disponible uniquement apres validation du paiement.';
    }

    if (action === 'preview') {
      return 'Ouvrir le recu dans un nouvel onglet.';
    }

    if (action === 'print') {
      return "Ouvrir directement la fenetre d'impression du recu.";
    }

    return 'Telecharger le recu au format PDF.';
  }
}
