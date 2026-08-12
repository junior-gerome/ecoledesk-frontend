import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  BulletinBrandingConfig,
  DEFAULT_BULLETIN_BRANDING_CONFIG,
} from '@app/features/grades/infrastructure/services/bulletin-branding.service';
import { PaymentReceiptDocumentViewModel } from '@features/payments/domain/models/payment-receipt.model';

@Component({
  selector: 'app-payment-receipt-document',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-receipt-document.component.html',
})
export class PaymentReceiptDocumentComponent {
  @Input({ required: true }) receipt!: PaymentReceiptDocumentViewModel;
  @Input() branding: BulletinBrandingConfig = DEFAULT_BULLETIN_BRANDING_CONFIG;
  @Input() pdfMode = false;

  logoLoadFailed = false;

  get hasLogo(): boolean {
    return !!this.branding.logoUrl && !this.logoLoadFailed;
  }

  get studentInitials(): string {
    const parts = String(this.receipt?.studentName || '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    return (parts.map((part) => part[0]?.toUpperCase() || '').join('') || 'RP').slice(0, 2);
  }

  get receiptReference(): string {
    const receiptNumber = String(this.receipt?.receiptNumber || '').trim();
    return receiptNumber || `REC-${String(this.receipt?.id || 0).padStart(5, '0')}`;
  }

  get paymentMethodDisplay(): string {
    const value = String(this.receipt?.paymentMethodLabel || '').trim();
    return value && value !== '-' ? value : 'Non precise';
  }

  get amountInWords(): string {
    const amount = Math.max(0, Math.round(Number(this.receipt?.amount || 0)));
    const words = this.numberToFrenchWords(amount);
    return `${this.capitalize(words)} francs CFA`;
  }

  get documentNarrative(): string {
    const typeLabel = String(this.receipt?.typeLabel || 'paiement').toLowerCase();
    return `Cette quittance confirme la reception effective du paiement relatif a ${typeLabel}.`;
  }

  onLogoError(): void {
    this.logoLoadFailed = true;
  }

  private capitalize(value: string): string {
    return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
  }

  private numberToFrenchWords(value: number): string {
    if (value === 0) {
      return 'zero';
    }

    const scales = [
      { value: 1_000_000_000, label: 'milliard' },
      { value: 1_000_000, label: 'million' },
      { value: 1_000, label: 'mille' },
    ];

    for (const scale of scales) {
      if (value >= scale.value) {
        const head = Math.floor(value / scale.value);
        const tail = value % scale.value;
        const headLabel =
          scale.label === 'mille' && head === 1
            ? 'mille'
            : `${this.numberToFrenchWords(head)} ${scale.label}${head > 1 && scale.label !== 'mille' ? 's' : ''}`;

        return tail ? `${headLabel} ${this.numberToFrenchWords(tail)}` : headLabel;
      }
    }

    return this.convertUnderOneThousand(value);
  }

  private convertUnderOneThousand(value: number): string {
    if (value < 100) {
      return this.convertUnderOneHundred(value);
    }

    const hundreds = Math.floor(value / 100);
    const remainder = value % 100;

    if (hundreds === 1) {
      return remainder ? `cent ${this.convertUnderOneHundred(remainder)}` : 'cent';
    }

    const hundredsLabel = remainder ? 'cent' : 'cents';
    return remainder
      ? `${this.convertUnderOneHundred(hundreds)} ${hundredsLabel} ${this.convertUnderOneHundred(remainder)}`
      : `${this.convertUnderOneHundred(hundreds)} ${hundredsLabel}`;
  }

  private convertUnderOneHundred(value: number): string {
    const units = [
      'zero',
      'un',
      'deux',
      'trois',
      'quatre',
      'cinq',
      'six',
      'sept',
      'huit',
      'neuf',
      'dix',
      'onze',
      'douze',
      'treize',
      'quatorze',
      'quinze',
      'seize',
      'dix-sept',
      'dix-huit',
      'dix-neuf',
    ];

    if (value < 20) {
      return units[value];
    }

    if (value < 70) {
      const tensMap: Record<number, string> = {
        20: 'vingt',
        30: 'trente',
        40: 'quarante',
        50: 'cinquante',
        60: 'soixante',
      };
      const tens = Math.floor(value / 10) * 10;
      const remainder = value % 10;
      const tensLabel = tensMap[tens];

      if (remainder === 0) {
        return tensLabel;
      }

      if (remainder === 1) {
        return `${tensLabel} et un`;
      }

      return `${tensLabel}-${units[remainder]}`;
    }

    if (value < 80) {
      if (value === 71) {
        return 'soixante et onze';
      }

      return `soixante-${units[value - 60]}`;
    }

    if (value === 80) {
      return 'quatre-vingts';
    }

    const remainder = value - 80;
    return `quatre-vingt-${units[remainder]}`;
  }
}
