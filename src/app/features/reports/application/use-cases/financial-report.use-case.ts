import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { FinancialReport } from '@app/features/reports/domain/models';
import { ToastVariant } from '@app/shared/ui/toast/toast.component';
import {
  REPORT_REPOSITORY,
  ReportRepository,
} from '../../domain/repositories/report.repository';
import { ReportDomainService } from '../../domain/services/report-domain.service';

@Injectable()
export class FinancialReportUseCase {
  private readonly repository = inject<ReportRepository>(REPORT_REPOSITORY);
  private readonly domain = inject(ReportDomainService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly report = signal<FinancialReport | null>(null);
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

  readonly today = this.domain.today();
  readonly defaultFrom = this.domain.defaultFromDate();

  readonly filtersForm = this.fb.group({
    dateFrom: [this.defaultFrom],
    dateTo: [this.today],
  });

  initialize(): void {
    this.loadReport();
  }

  applyFilters(): void {
    this.loadReport();
  }

  resetFilters(): void {
    this.filtersForm.reset({
      dateFrom: this.defaultFrom,
      dateTo: this.today,
    });
    this.loadReport();
  }

  hideToast(): void {
    this.toast.update((current) => ({ ...current, visible: false }));
  }

  private loadReport(): void {
    const dateFrom = this.filtersForm.value.dateFrom ?? undefined;
    const dateTo = this.filtersForm.value.dateTo ?? undefined;

    this.loading.set(true);
    this.repository
      .getFinancialReport({ dateFrom, dateTo })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (report) => {
          this.report.set(report || null);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Failed to load financial report:', error);
          this.loading.set(false);
          this.showToast(
            'Impossible de charger le rapport financier.',
            'danger',
            'Chargement impossible',
          );
        },
      });
  }

  private showToast(message: string, variant: ToastVariant, title = ''): void {
    this.toast.set({ visible: true, title, message, variant });
  }
}
