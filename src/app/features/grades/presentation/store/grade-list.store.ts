import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BadgeVariant } from '@app/shared/ui/badge/badge.component';
import { SelectOption } from '@app/shared/ui/select/select.component';
import { ListExportColumn, ListExportOptions, ListExportService } from '@app/shared/services/list-export.service';
import { GradeListDTO } from '../../application/dtos';
import { GradeListFacade } from '../../application/facades/grade-list.facade';
import { Mention } from '../../domain/value-objects';
import { parseSequenceOrder, resolveTrimesterFromOrder } from '../../period-utils';

interface FilterState {
  classId?: number;
  period?: string;
  subjectId?: number;
}

export type GradeViewMode = 'list' | 'releve';

export interface ReleveRow {
  studentId: number;
  studentName: string;
  cells: Record<string, number | null>;
  average: number;
  rank: number;
  mention: string;
}

@Injectable()
export class GradeListStore {
  private readonly destroyRef = inject(DestroyRef);
  private readonly facade = inject(GradeListFacade);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly listExport = inject(ListExportService);

  readonly grades = signal<GradeListDTO[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly classOptions = signal<SelectOption<number>[]>([]);
  readonly subjectOptions = signal<SelectOption<number>[]>([]);
  readonly periodOptions = signal<SelectOption<string>[]>([]);
  readonly filters = signal<FilterState>({});
  readonly searchText = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = signal(20);
  readonly viewMode = signal<GradeViewMode>('list');

  readonly windowedGrades = computed(() => this.applyPeriodWindow(this.grades()));

  readonly filteredGrades = computed(() => {
    const search = this.searchText().trim().toLowerCase();
    return this.windowedGrades().filter(
      (grade) =>
        !search ||
        grade.studentName.toLowerCase().includes(search) ||
        grade.subjectName.toLowerCase().includes(search) ||
        grade.mention.toLowerCase().includes(search),
    );
  });

  readonly paginatedGrades = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredGrades().slice(start, start + this.pageSize());
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredGrades().length / this.pageSize())),
  );

  readonly selectedClassName = computed(() => {
    const classId = this.filters().classId ?? 0;
    return this.classOptions().find((option) => option.value === classId)?.label ?? `Classe ${classId}`;
  });

  readonly releveSubjects = computed(() =>
    Array.from(new Set(this.filteredGrades().map((grade) => grade.subjectName))).sort(),
  );

  readonly releveRows = computed<ReleveRow[]>(() => {
    const grades = this.filteredGrades();
    const subjects = this.releveSubjects();
    const byStudent = new Map<number, { name: string; rows: GradeListDTO[] }>();

    grades.forEach((grade) => {
      const entry = byStudent.get(grade.studentId) ?? { name: grade.studentName, rows: [] };
      entry.rows.push(grade);
      byStudent.set(grade.studentId, entry);
    });

    const rows = Array.from(byStudent.entries()).map(([studentId, entry]) => {
      const cells: Record<string, number | null> = {};
      let sum = 0;
      let count = 0;

      subjects.forEach((subject) => {
        const subjectGrades = entry.rows.filter((row) => row.subjectName === subject);
        if (!subjectGrades.length) {
          cells[subject] = null;
          return;
        }
        const average = subjectGrades.reduce((total, row) => total + row.score, 0) / subjectGrades.length;
        cells[subject] = Number(average.toFixed(2));
        sum += average;
        count += 1;
      });

      const average = count ? Number((sum / count).toFixed(2)) : 0;
      return {
        studentId,
        studentName: entry.name,
        cells,
        average,
        rank: 0,
        mention: Mention.fromAverage(average).label,
      };
    }).sort((left, right) => right.average - left.average);

    rows.forEach((row, index) => {
      row.rank = index + 1;
    });

    return rows;
  });

  readonly releveSubjectAverages = computed<Record<string, number | null>>(() => {
    const averages: Record<string, number | null> = {};

    this.releveSubjects().forEach((subject) => {
      const values = this.releveRows()
        .map((row) => row.cells[subject])
        .filter((value): value is number => typeof value === 'number');

      averages[subject] = values.length
        ? Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(2))
        : null;
    });

    return averages;
  });

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
          this.periodOptions.set(this.buildPeriodOptions(periods ?? []));
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
      this.error.set('gradePage.requireClass');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.facade
      .listGrades({
        classId,
        period: this.isTrimesterPeriod(period) ? '' : period,
        subjectId: currentFilters.subjectId,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (gradeList) => {
          this.grades.set(gradeList);
          this.currentPage.set(1);
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
    this.currentPage.set(1);
    this.loadGrades();
  }

  onPeriodChange(period: string | null): void {
    this.filters.update((filters) => ({ ...filters, period: period || '' }));
    this.currentPage.set(1);
    this.loadGrades();
  }

  onSubjectChange(subjectId: number | null): void {
    this.filters.update((filters) => ({
      ...filters,
      subjectId: Number(subjectId) || 0,
    }));
    this.currentPage.set(1);
    this.loadGrades();
  }

  onSearchChange(text: string | number | null): void {
    this.searchText.set(String(text || ''));
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.filters.set({});
    this.searchText.set('');
    this.grades.set([]);
    this.currentPage.set(1);
    this.error.set('gradePage.requireClass');
  }

  setPage(page: number): void {
    this.currentPage.set(page);
  }

  setViewMode(mode: GradeViewMode): void {
    this.viewMode.set(mode);
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

  exportReleveExcel(): void {
    this.exportReleve('xlsx');
  }

  exportRelevePdf(): void {
    this.exportReleve('pdf');
  }

  exportReleve(format: 'xlsx' | 'pdf'): Promise<void> {
    if (!this.releveRows().length || !this.filters().classId) {
      return Promise.resolve();
    }

    const subjects = this.releveSubjects();
    const columns: ListExportColumn[] = [
      { header: this.translate.instant('gradePage.student'), key: 'studentName', weight: 2 },
      ...subjects.map((subject) => ({ header: subject, key: subject, weight: 1 })),
      { header: 'Moy. gen.', key: 'average', weight: 1, align: 'center' as const },
      { header: 'Rang', key: 'rank', weight: 1, align: 'center' as const },
      { header: 'Mention', key: 'mention', weight: 1 },
    ];

    const rows = this.releveRows().map((row) => ({
      studentName: row.studentName,
      ...row.cells,
      average: row.average,
      rank: row.rank,
      mention: row.mention,
    }));

    const periodLabel = this.filters().period || 'Toutes les periodes';
    const options: ListExportOptions = {
      title: `Releve de notes - ${this.selectedClassName()}`,
      subtitle: `Periode : ${periodLabel}`,
      columns,
      rows,
      fileName: `releve-notes-${this.selectedClassName().replace(/\s+/g, '-')}-${periodLabel.replace(/\s+/g, '-')}.${format}`,
    };

    return format === 'xlsx'
      ? this.listExport.exportExcel(options)
      : this.listExport.exportPdf(options);
  }

  private buildPeriodOptions(periods: string[]): SelectOption<string>[] {
    const exactOptions = periods.map((period) => ({ label: period, value: period }));

    const maxOrderByTrimester = new Map<number, number>();
    periods.forEach((period) => {
      const order = parseSequenceOrder(period);
      if (order <= 0) {
        return;
      }
      const trimester = resolveTrimesterFromOrder(order);
      const current = maxOrderByTrimester.get(trimester) ?? 0;
      maxOrderByTrimester.set(trimester, Math.max(current, order));
    });

    const trimesterOptions = Array.from(maxOrderByTrimester.entries())
      .sort(([left], [right]) => left - right)
      .map(([trimester]) => ({
        label: `Trimestre ${trimester}`,
        value: `Trimestre ${trimester}`,
      }));

    return [
      { label: this.translate.instant('gradePage.allPeriods'), value: '' },
      ...exactOptions,
      ...trimesterOptions,
    ];
  }

  private isTrimesterPeriod(period: string): boolean {
    return /^\s*trimestre\s*\d+\s*$/i.test(period);
  }

  private applyPeriodWindow(grades: GradeListDTO[]): GradeListDTO[] {
    const period = this.filters().period || '';

    if (!period) {
      return grades;
    }

    if (this.isTrimesterPeriod(period)) {
      const trimester = Number(period.match(/(\d+)/)?.[1] ?? 0);
      const boundary = trimester === 1 ? 2 : trimester === 2 ? 4 : Number.MAX_SAFE_INTEGER;
      return grades.filter((grade) => parseSequenceOrder(grade.period) <= boundary);
    }

    const normalized = period.trim().toLowerCase();
    return grades.filter(
      (grade) => grade.period.trim().toLowerCase() === normalized,
    );
  }
}