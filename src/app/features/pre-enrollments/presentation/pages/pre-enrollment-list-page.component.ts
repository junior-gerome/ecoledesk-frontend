import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { TableComponent } from '@app/shared/ui/table/table.component';
import { PreEnrollment, PreEnrollmentStatus } from '../../domain/models/pre-enrollment.model';
import { PreEnrollmentHttpRepository } from '../../infrastructure/pre-enrollment-http.repository';

@Component({
  selector: 'app-pre-enrollment-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PageLayoutComponent,
    PageHeaderComponent,
    ButtonComponent,
    TableComponent,
  ],
  templateUrl: './pre-enrollment-list-page.component.html',
})
export class PreEnrollmentListPageComponent implements OnInit {
  private readonly repository = inject(PreEnrollmentHttpRepository);
  private readonly router = inject(Router);

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
    this.loadData();
  }

  // ── Filtres ───────────────────────────────────────────────────────────────
  filterByStatus(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(0);
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
}
