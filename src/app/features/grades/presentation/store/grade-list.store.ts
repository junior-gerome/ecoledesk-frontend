import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BadgeVariant } from '@app/shared/ui/badge/badge.component';
import { SelectOption } from '@app/shared/ui/select/select.component';
import { GradeListDTO } from '../../application/dtos';
import { GradeListFacade } from '../../application/facades/grade-list.facade';

interface FilterState {
  classId?: number;
  period?: string;
  subjectId?: number;
}

@Injectable()
export class GradeListStore {
  private readonly destroyRef = inject(DestroyRef);
  private readonly facade = inject(GradeListFacade);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly grades = signal<GradeListDTO[]>([]);
  readonly filteredGrades = signal<GradeListDTO[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly classOptions = signal<SelectOption<number>[]>([]);
  readonly subjectOptions = signal<SelectOption<number>[]>([]);
  readonly periodOptions = signal<SelectOption<string>[]>([]);
  readonly filters = signal<FilterState>({});
  readonly searchText = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = signal(20);

  readonly paginatedGrades = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredGrades().slice(start, start + this.pageSize());
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredGrades().length / this.pageSize())),
  );

  initialize(): void {
    this.loadFilterOptions();
    this.loading.set(false);
  }

  loadFilterOptions(): void {
    this.facade
      .listClasses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (classes) => {
          this.classOptions.set(
            [{ label: this.translate.instant('gradePage.allClasses'), value: 0 }].concat(
              classes.map((entry) => ({ label: entry.name, value: entry.id })),
            ),
          );
        },
        error: (err) => console.error('Erreur classes:', err),
      });

    this.facade
      .listSubjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (subjects) => {
          this.subjectOptions.set(
            [{ label: this.translate.instant('gradePage.allSubjects'), value: 0 }].concat(
              subjects.map((entry) => ({ label: entry.name, value: entry.id })),
            ),
          );
        },
        error: (err) => console.error('Erreur matieres:', err),
      });

    this.facade
      .listPeriods()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (periods) => {
          this.periodOptions.set(
            [{ label: this.translate.instant('gradePage.allPeriods'), value: '' }].concat(
              periods.map((period) => ({ label: period, value: period })),
            ),
          );
        },
        error: (err) => console.error('Erreur periodes:', err),
      });
  }

  loadGrades(): void {
    const currentFilters = this.filters();
    const classId = currentFilters.classId || 0;
    const period = currentFilters.period || '';

    if (!classId) {
      this.grades.set([]);
      this.filteredGrades.set([]);
      this.error.set('gradePage.requireClass');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.facade
      .listGrades({
        classId,
        period,
        subjectId: currentFilters.subjectId,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (gradeList) => {
          this.grades.set(gradeList);
          this.applySearchFilter();
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('gradePage.loadError');
          this.loading.set(false);
          console.error(err);
        },
      });
  }

  onClassChange(classId: number | null): void {
    this.filters.update((filters) => ({ ...filters, classId: Number(classId) || 0 }));
    this.loadGrades();
  }

  onPeriodChange(period: string | null): void {
    this.filters.update((filters) => ({ ...filters, period: period || '' }));
    this.loadGrades();
  }

  onSubjectChange(subjectId: number | null): void {
    this.filters.update((filters) => ({
      ...filters,
      subjectId: Number(subjectId) || 0,
    }));
    this.loadGrades();
  }

  onSearchChange(text: string | number | null): void {
    this.searchText.set(String(text || ''));
    this.applySearchFilter();
  }

  resetFilters(): void {
    this.filters.set({});
    this.searchText.set('');
    this.grades.set([]);
    this.filteredGrades.set([]);
    this.currentPage.set(1);
    this.error.set('gradePage.requireClass');
  }

  setPage(page: number): void {
    this.currentPage.set(page);
  }

  addNewGrade(): void {
    void this.router.navigate(['/grades/form']);
  }

  getMentionVariant(mention: string): BadgeVariant {
    const bands: Record<string, BadgeVariant> = {
      Excellent: 'success',
      'Très bien': 'success',
      Bien: 'info',
      'Assez bien': 'info',
      Passable: 'warning',
      Faible: 'warning',
      'Très faible': 'danger',
    };

    return bands[mention] ?? 'neutral';
  }

  private applySearchFilter(): void {
    const search = this.searchText().trim().toLowerCase();
    const filtered = this.grades().filter(
      (grade) =>
        !search ||
        grade.studentName.toLowerCase().includes(search) ||
        grade.subjectName.toLowerCase().includes(search),
    );

    this.filteredGrades.set(filtered);
    this.currentPage.set(1);
  }
}
