import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { Class } from '@app/features/classes/domain/models';
import { StudentPerformanceReport } from '@app/features/reports/domain/models';
import { ClassRoomService } from '@app/features/classes/infrastructure/classRoom.service';
import { SelectOption } from '@app/shared/ui/select/select.component';
import { ToastVariant } from '@app/shared/ui/toast/toast.component';
import {
  REPORT_REPOSITORY,
  ReportRepository,
} from '../../domain/repositories/report.repository';
import { ReportDomainService } from '../../domain/services/report-domain.service';

@Injectable()
export class PerformanceReportUseCase {
  private readonly repository = inject<ReportRepository>(REPORT_REPOSITORY);
  private readonly classRoomService = inject(ClassRoomService);
  private readonly domain = inject(ReportDomainService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly report = signal<StudentPerformanceReport | null>(null);
  readonly classOptions = signal<SelectOption<number>[]>([]);
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
    classId: [null as number | null],
    dateFrom: [this.defaultFrom],
    dateTo: [this.today],
  });

  initialize(): void {
    this.loadClasses();
    this.loadReport();
  }

  applyFilters(): void {
    this.loadReport();
  }

  resetFilters(): void {
    this.filtersForm.reset({
      classId: null,
      dateFrom: this.defaultFrom,
      dateTo: this.today,
    });
    this.loadReport();
  }

  hideToast(): void {
    this.toast.update((current) => ({ ...current, visible: false }));
  }

  private loadClasses(): void {
    this.classRoomService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (classes: Class[]) => {
          this.classOptions.set(
            (classes ?? [])
              .filter((classe) => Number(classe.id))
              .map((classe) => ({
                value: Number(classe.id),
                label: classe.nameClasse ?? `Classe ${classe.id}`,
              })),
          );
        },
        error: (error) => {
          console.error('Unable to load classes:', error);
          this.showToast(
            'Impossible de charger les classes.',
            'danger',
            'Chargement impossible',
          );
        },
      });
  }

  private loadReport(): void {
    const classId = this.filtersForm.value.classId ?? undefined;
    const dateFrom = this.filtersForm.value.dateFrom ?? undefined;
    const dateTo = this.filtersForm.value.dateTo ?? undefined;

    this.loading.set(true);
    this.repository
      .getPerformanceReport({ classId, dateFrom, dateTo })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (report) => {
          this.report.set(report || null);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Failed to load performance report:', error);
          this.loading.set(false);
          this.showToast(
            'Impossible de charger le rapport de performance.',
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
