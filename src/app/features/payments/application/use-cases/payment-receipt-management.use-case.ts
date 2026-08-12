import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastVariant } from '@app/shared/ui/toast/toast.component';
import { debounceTime, distinctUntilChanged, finalize, from, switchMap } from 'rxjs';
import {
  PaymentReceiptFilters,
  PaymentReceiptViewModel,
} from '../../domain/models/payment-receipt.model';
import {
  PaymentReceiptRepository,
  PAYMENT_RECEIPT_REPOSITORY,
} from '../../domain/repositories/payment-receipt.repository';
import { PaymentReceiptDomainService } from '../../domain/services/payment-receipt-domain.service';
import { PaymentReceiptPdfExportService } from '../../infrastructure/payment-receipt-pdf-export.service';
import { ReceiptDocumentGateway } from '../../infrastructure/receipt-document.gateway';

@Injectable()
export class PaymentReceiptManagementUseCase {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly repository = inject<PaymentReceiptRepository>(
    PAYMENT_RECEIPT_REPOSITORY,
  );
  private readonly domain = inject(PaymentReceiptDomainService);
  private readonly documentGateway = inject(ReceiptDocumentGateway);
  private readonly pdfExportService = inject(PaymentReceiptPdfExportService);

  readonly receipts = signal<PaymentReceiptViewModel[]>([]);
  readonly isLoading = signal(false);
  readonly downloadingReceiptId = signal<number | null>(null);
  readonly previewingReceiptId = signal<number | null>(null);
  readonly printingReceiptId = signal<number | null>(null);

  readonly toast = signal<{
    visible: boolean;
    title: string;
    message: string;
    variant: ToastVariant;
  }>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  readonly filterForm = this.fb.nonNullable.group({
    search: [''],
    receiptNumber: [''],
    status: [''],
    type: [''],
    startDate: [''],
    endDate: [''],
  });

  readonly statusOptions = [
    { label: 'Tous les statuts', value: '' },
    { label: 'Paye', value: 'PAID' },
    { label: 'En attente', value: 'PENDING' },
    { label: 'En retard', value: 'LATE' },
    { label: 'Annule', value: 'CANCELLED' },
  ];

  readonly typeOptions = [
    { label: 'Tous les types', value: '' },
    { label: 'Frais inscription', value: 'FRAIS_INSCRIPTION' },
    { label: 'Frais scolaire', value: 'FRAIS_SCOLAIRE' },
    { label: 'Frais transport', value: 'FRAIS_TRANSPORT' },
    { label: 'Frais cantine', value: 'FRAIS_CANTINE' },
    { label: 'Frais examen', value: 'FRAIS_EXAMEN' },
    { label: 'Frais autres', value: 'FRAIS_AUTRES' },
  ];

  readonly summary = computed(() =>
    this.domain.computeSummary(this.receipts()),
  );

  initialize(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(
          (previous, current) =>
            JSON.stringify(previous) === JSON.stringify(current),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        void this.loadReceipts();
      });

    void this.loadReceipts();
  }

  async loadReceipts(): Promise<void> {
    this.isLoading.set(true);

    this.repository
      .getReceipts(this.currentFilters())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (receipts) => {
          this.receipts.set(receipts);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des recus', error);
          this.isLoading.set(false);
          this.showToast(
            'Impossible de charger les recus de paiement pour le moment.',
            'danger',
            'Chargement impossible',
          );
        },
      });
  }

  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      receiptNumber: '',
      status: '',
      type: '',
      startDate: '',
      endDate: '',
    });
  }

  async goToNewPayment(): Promise<void> {
    await this.router.navigate(['/payments/new']);
  }

  async editReceipt(paymentId: number): Promise<void> {
    await this.router.navigate(['/payments', paymentId]);
  }

  downloadReceipt(receipt: PaymentReceiptViewModel): void {
    const paymentId = this.ensureReceiptAvailable(receipt);
    if (!paymentId) {
      return;
    }

    this.downloadingReceiptId.set(paymentId);
    this.repository
      .getReceiptDocument(paymentId)
      .pipe(
        switchMap((receiptDocument) =>
          from(this.pdfExportService.generateBlob(receiptDocument)),
        ),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.downloadingReceiptId() === paymentId) {
            this.downloadingReceiptId.set(null);
          }
        }),
      )
      .subscribe({
        next: (blob) => {
          this.documentGateway.downloadBlob(
            blob,
            this.repository.buildReceiptFileName(receipt),
          );
          this.showToast(
            'Le recu PDF a ete telecharge avec succes.',
            'success',
            'Telechargement termine',
          );
        },
        error: (error) => {
          console.error('Erreur lors du telechargement du recu', error);
          this.showToast(
            'Le telechargement du recu a echoue.',
            'danger',
            'Telechargement impossible',
          );
        },
      });
  }

  previewReceipt(receipt: PaymentReceiptViewModel): void {
    const paymentId = this.ensureReceiptAvailable(receipt);
    if (!paymentId) {
      return;
    }

    this.previewingReceiptId.set(paymentId);
    this.repository
      .getReceiptDocument(paymentId)
      .pipe(
        switchMap((receiptDocument) =>
          from(this.pdfExportService.generateBlob(receiptDocument)),
        ),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.previewingReceiptId() === paymentId) {
            this.previewingReceiptId.set(null);
          }
        }),
      )
      .subscribe({
        next: (blob) => {
          const result = this.documentGateway.openPreview(
            blob,
            this.repository.buildReceiptFileName(receipt),
          );

          if (!result.ok) {
            this.showToast(
              "Le navigateur a bloque l'apercu du recu. Autorisez les pop-ups puis recommencez.",
              'warning',
              'Apercu bloque',
            );
            return;
          }

          this.showToast(
            "L'apercu du recu a ete ouvert dans un nouvel onglet.",
            'success',
            'Apercu pret',
          );
        },
        error: (error) => {
          console.error("Erreur lors de l'ouverture de l'apercu du recu", error);
          this.showToast(
            "L'apercu du recu a echoue.",
            'danger',
            'Apercu impossible',
          );
        },
      });
  }

  printReceipt(receipt: PaymentReceiptViewModel): void {
    const paymentId = this.ensureReceiptAvailable(receipt);
    if (!paymentId) {
      return;
    }

    this.printingReceiptId.set(paymentId);
    this.repository
      .getReceiptDocument(paymentId)
      .pipe(
        switchMap((receiptDocument) =>
          from(this.pdfExportService.generateBlob(receiptDocument)),
        ),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.printingReceiptId() === paymentId) {
            this.printingReceiptId.set(null);
          }
        }),
      )
      .subscribe({
        next: (blob) => {
          const result = this.documentGateway.openPrintable(
            blob,
            this.repository.buildReceiptFileName(receipt),
          );

          if (!result.ok) {
            this.showToast(
              "Le navigateur a bloque la fenetre d'impression. Autorisez les pop-ups puis recommencez.",
              'warning',
              'Impression bloquee',
            );
            return;
          }

          this.showToast(
            'Le recu a ete ouvert dans une fenetre imprimable.',
            'success',
            'Impression prete',
          );
        },
        error: (error) => {
          console.error("Erreur lors de l'impression du recu", error);
          this.showToast(
            "L'impression du recu a echoue.",
            'danger',
            'Impression impossible',
          );
        },
      });
  }

  deleteReceipt(paymentId: number): void {
    if (!paymentId || !confirm('Voulez-vous vraiment supprimer ce paiement ?')) {
      return;
    }

    this.repository.deletePayment(paymentId).subscribe({
      next: () => {
        this.receipts.update((current) =>
          current.filter((receipt) => receipt.id !== paymentId),
        );
        this.showToast(
          'Le paiement a ete supprime avec succes.',
          'success',
          'Suppression terminee',
        );
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du paiement', error);
        this.showToast(
          'La suppression du paiement a echoue.',
          'danger',
          'Suppression impossible',
        );
      },
    });
  }

  receiptActionTooltip(
    receipt: PaymentReceiptViewModel,
    action: 'preview' | 'print' | 'download',
  ): string {
    return this.domain.receiptActionTooltip(receipt, action);
  }

  hideToast(): void {
    this.toast.update((current) => ({ ...current, visible: false }));
  }

  private currentFilters(): PaymentReceiptFilters {
    return this.filterForm.getRawValue();
  }

  private ensureReceiptAvailable(
    receipt: PaymentReceiptViewModel,
  ): number | null {
    if (!receipt.id || !receipt.canGenerateReceipt) {
      this.showToast(
        "Le recu n'est disponible que pour un paiement valide.",
        'warning',
        'Action indisponible',
      );
      return null;
    }

    return receipt.id;
  }

  private showToast(message: string, variant: ToastVariant, title: string): void {
    this.toast.set({
      visible: true,
      title,
      message,
      variant,
    });
  }
}
