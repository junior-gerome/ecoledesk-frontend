import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { TableComponent } from '@app/shared/ui/table/table.component';
import { IndeterminateCheckboxDirective } from '@app/shared/ui/checkbox/indeterminate-checkbox.directive';
import { ToastComponent, ToastVariant } from '@app/shared/ui/toast/toast.component';
import { ListExportService, ListExportOptions } from '@app/shared/services/list-export.service';
import { PreEnrollment, PreEnrollmentStatus } from '../../domain/models/pre-enrollment.model';
import { PreEnrollmentHttpRepository } from '../../infrastructure/pre-enrollment-http.repository';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-pre-enrollment-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PageHeaderComponent,
    PageLayoutComponent,
    ButtonComponent,
    TableComponent,
    IndeterminateCheckboxDirective,
    ToastComponent,
  ],
  templateUrl: './pre-enrollment-list-page.component.html',
})
export class PreEnrollmentListPageComponent implements OnInit {
  private readonly repository = inject(PreEnrollmentHttpRepository);
  private readonly router = inject(Router);
  private readonly listExport = inject(ListExportService);

  readonly selectedIds = signal<Set<number>>(new Set<number>());
  readonly exportMenuOpen = signal(false);
  readonly isExporting = signal(false);

  readonly allPageSelected = computed(() => {
    const ids = this.filteredEnrollments().map((item) => item.id);
    return ids.length > 0 && ids.every((id) => this.selectedIds().has(id));
  });
  readonly somePageSelected = computed(() =>
    this.filteredEnrollments().some((item) => this.selectedIds().has(item.id)),
  );
  readonly selectedCount = computed(() => this.selectedIds().size);
  readonly pageCount = computed(() => this.filteredEnrollments().length);

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

  // ── Données ─────────────────────────────────────────────────────────────
  readonly preEnrollments = signal<PreEnrollment[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // ── Pagination (côté serveur) ────────────────────────────────────────────
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(20);
  readonly totalElements = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly isFirst = signal<boolean>(true);
  readonly isLast = signal<boolean>(true);

  // Pages visibles autour de la page courante
  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages: number[] = [];
    const start = Math.max(0, current - 2);
    const end = Math.min(total - 1, current + 2);
    if (start > 0) pages.push(0);
    if (start > 1) pages.push(-1); // ellipsis
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 2) pages.push(-1); // ellipsis
    if (end < total - 1) pages.push(total - 1);
    return pages;
  });

  // ── Filtres locaux (appliqués sur la page courante) ──────────────────────
  readonly selectedStatus = signal<string>('ALL');
  readonly searchQuery = signal<string>('');

  readonly filteredEnrollments = computed(() => {
    let list = this.preEnrollments();
    const status = this.selectedStatus();
    const query = this.searchQuery().trim().toLowerCase();

    if (status !== 'ALL') {
      list = list.filter((item) => item.status === status);
    }

    if (query) {
      list = list.filter((item) => {
        const numberMatch = item.number?.toLowerCase().includes(query);
        const nameMatch =
          `${item.applicantFirstName || ''} ${item.applicantLastName || ''}`
            .toLowerCase()
            .includes(query);
        const levelMatch = item.requestedLevel?.toLowerCase().includes(query);
        return numberMatch || nameMatch || levelMatch;
      });
    }

    return list;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.repository.getAll(this.currentPage(), this.pageSize(), this.selectedStatus()).subscribe({
      next: (response) => {
        this.preEnrollments.set(response.content ?? []);
        this.totalElements.set(response.totalElements ?? 0);
        this.totalPages.set(response.totalPages ?? 0);
        this.isFirst.set(response.first ?? this.currentPage() === 0);
        this.isLast.set(response.last ?? this.currentPage() >= (response.totalPages ?? 1) - 1);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading pre-enrollments', err);
        this.error.set('Impossible de charger les préinscriptions.');
        this.isLoading.set(false);
      },
    });
  }

  // ── Navigation pagination ────────────────────────────────────────────────
  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
    this.clearSelection();
    this.loadData();
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.clearSelection();
    this.loadData();
  }

  // ── Filtres ───────────────────────────────────────────────────────────────
  filterByStatus(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(0);
    this.clearSelection();
    this.loadData();
  }

  goToDetail(id: number): void {
    this.router.navigate(['/pre-enrollments', id]);
  }

  getStatusBadgeClass(status: PreEnrollmentStatus): string {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'UNDER_REVIEW':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'CANCELLED':
        return 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusLabel(status: PreEnrollmentStatus): string {
    switch (status) {
      case 'DRAFT':        return 'Brouillon';
      case 'SUBMITTED':    return 'Soumis';
      case 'UNDER_REVIEW': return 'En cours d\u2019\u00e9tude';
      case 'APPROVED':     return 'Approuv\u00e9';
      case 'REJECTED':     return 'Rejet\u00e9';
      case 'CANCELLED':    return 'Annul\u00e9';
      case 'EXPIRED':      return 'Expir\u00e9';
      default:             return status;
    }
  }

  /** Borne haute de la plage affichée (ex: "1–20 sur 47"). */
  rangeEnd(): number {
    return Math.min(
      (this.currentPage() + 1) * this.pageSize(),
      this.totalElements()
    );
  }

  // ── Sélection ──────────────────────────────────────────────────────────────
  toggleExportMenu(): void {
    this.exportMenuOpen.update((open) => !open);
  }

  closeExportMenu(): void {
    this.exportMenuOpen.set(false);
  }

  toggleSelection(id: number): void {
    this.selectedIds.update((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  toggleSelectAllOnPage(checked: boolean): void {
    this.selectedIds.update((current) => {
      const next = new Set(current);
      for (const item of this.filteredEnrollments()) {
        if (checked) {
          next.add(item.id);
        } else {
          next.delete(item.id);
        }
      }
      return next;
    });
  }

  clearSelection(): void {
    this.selectedIds.set(new Set<number>());
  }

  // ── Export ────────────────────────────────────────────────────────────────
  async onExportSelectionExcel(): Promise<void> {
    const rows = this.selectedEnrollments();
    if (!rows.length) {
      this.showToast('Aucun dossier sélectionné', 'warning', 'Export');
      return;
    }
    this.closeExportMenu();
    await this.runExport('Excel', this.buildOptions('Préinscriptions — sélection', rows, 'xlsx'));
  }

  async onExportSelectionPdf(): Promise<void> {
    const rows = this.selectedEnrollments();
    if (!rows.length) {
      this.showToast('Aucun dossier sélectionné', 'warning', 'Export');
      return;
    }
    this.closeExportMenu();
    await this.runExport('PDF', this.buildOptions('Préinscriptions — sélection', rows, 'pdf'));
  }

  async onExportPageExcel(): Promise<void> {
    const rows = this.filteredEnrollments();
    if (!rows.length) {
      this.showToast('Aucun dossier à exporter', 'warning', 'Export');
      return;
    }
    this.closeExportMenu();
    await this.runExport('Excel', this.buildOptions('Préinscriptions — page affichée', rows, 'xlsx'));
  }

  async onExportPagePdf(): Promise<void> {
    const rows = this.filteredEnrollments();
    if (!rows.length) {
      this.showToast('Aucun dossier à exporter', 'warning', 'Export');
      return;
    }
    this.closeExportMenu();
    await this.runExport('PDF', this.buildOptions('Préinscriptions — page affichée', rows, 'pdf'));
  }

  async onExportAllExcel(): Promise<void> {
    this.closeExportMenu();
    const rows = await this.fetchAllMatching();
    await this.runExport('Excel', this.buildOptions('Liste des préinscriptions', rows, 'xlsx'));
  }

  async onExportAllPdf(): Promise<void> {
    this.closeExportMenu();
    const rows = await this.fetchAllMatching();
    await this.runExport('PDF', this.buildOptions('Liste des préinscriptions', rows, 'pdf'));
  }

  private selectedEnrollments(): PreEnrollment[] {
    return this.filteredEnrollments().filter((item) => this.selectedIds().has(item.id));
  }

  private async runExport(format: 'Excel' | 'PDF', options: ListExportOptions): Promise<void> {
    if (this.isExporting()) return;
    this.isExporting.set(true);
    try {
      if (format === 'Excel') {
        await this.listExport.exportExcel(options);
      } else {
        await this.listExport.exportPdf(options);
      }
      this.showToast(
        `${options.rows.length} dossier(s) exporté(s) en ${format}`,
        'success',
        'Export réussi',
      );
    } catch {
      console.error('Erreur lors de l\'export', format);
      this.showToast(`Erreur lors de l'export ${format}`, 'danger', 'Erreur');
    } finally {
      this.isExporting.set(false);
    }
  }

  private buildOptions(title: string, items: PreEnrollment[], extension: 'xlsx' | 'pdf'): ListExportOptions {
    const date = new Date().toISOString().split('T')[0];
    return {
      title,
      subtitle: `Généré le ${new Date().toLocaleDateString('fr-FR')} — ${items.length} dossier(s)`,
      fileName: `liste-preinscriptions-${date}.${extension}`,
      columns: [
        { header: 'N° Dossier', key: 'dossier', weight: 14, align: 'center' },
        { header: 'Candidat', key: 'candidat', weight: 26 },
        { header: 'Niveau demandé', key: 'niveau', weight: 22 },
        { header: 'Année scolaire', key: 'annee', weight: 20 },
        { header: 'Statut', key: 'statut', weight: 18, align: 'center' },
      ],
      rows: items.map((item) => this.toExportRow(item)),
    };
  }

  private toExportRow(item: PreEnrollment): Record<string, string> {
    const gender =
      item.applicantGender === 'FEMININ' || item.applicantGender === 'FEMALE'
        ? 'Fille'
        : 'Garçon';
    return {
      dossier: item.number || String(item.id),
      candidat: `${item.applicantLastName} ${item.applicantFirstName} (${gender})`,
      niveau: item.requestedLevel || '—',
      annee: item.academicYearLabel || 'N/A',
      statut: this.getStatusLabel(item.status),
    };
  }

  private async fetchAllMatching(): Promise<PreEnrollment[]> {
    const status = this.selectedStatus();
    const query = this.searchQuery().trim().toLowerCase();
    const all: PreEnrollment[] = [];
    let page = 0;
    let hasNext = true;

    while (hasNext) {
      const response = await firstValueFrom(
        this.repository.getAll(page, 200, status),
      );
      all.push(...(response.content ?? []));
      hasNext = !response.last;
      page += 1;
      if (page > 5000) break;
    }

    if (!query) return all;
    return all.filter((item) => {
      const text = `${item.number || ''} ${item.applicantFirstName || ''} ${item.applicantLastName || ''} ${item.requestedLevel || ''}`.toLowerCase();
      return text.includes(query);
    });
  }

  private showToast(message: string, variant: ToastVariant, title = ''): void {
    this.toast.set({ visible: true, title, message, variant });
  }

  hideToast(): void {
    this.toast.update((current) => ({ ...current, visible: false }));
  }
}
