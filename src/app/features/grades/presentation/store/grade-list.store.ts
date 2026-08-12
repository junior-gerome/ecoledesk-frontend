import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
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
            [{ label: 'Toutes les classes', value: 0 }].concat(
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
            [{ label: 'Toutes les matieres', value: 0 }].concat(
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
            [{ label: 'Toutes les periodes', value: '' }].concat(
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
      this.error.set('Selectionnez une classe');
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
          this.error.set('Erreur au chargement des notes');
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
    this.error.set('Selectionnez une classe');
  }

  setPage(page: number): void {
    this.currentPage.set(page);
  }

  addNewGrade(): void {
    void this.router.navigate(['/grades/form']);
  }

  getMentionColor(mention: string): string {
    const colors: Record<string, string> = {
      Excellent:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Tres bien':
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      Bien: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'Assez bien':
        'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
      Passable:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      Faible:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'Tres faible':
        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
      colors[mention] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    );
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
