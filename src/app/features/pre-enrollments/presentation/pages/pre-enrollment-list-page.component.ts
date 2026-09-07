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

  readonly preEnrollments = signal<PreEnrollment[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

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

    this.repository.getAll(0, 100).subscribe({
      next: (response) => {
        this.preEnrollments.set(response.content || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading pre-enrollments', err);
        this.error.set('Impossible de charger les préinscriptions.');
        this.isLoading.set(false);
      },
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatus.set(status);
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
      case 'DRAFT':
        return 'Brouillon';
      case 'SUBMITTED':
        return 'Soumis';
      case 'UNDER_REVIEW':
        return 'En cours d’étude';
      case 'APPROVED':
        return 'Approuvé';
      case 'REJECTED':
        return 'Rejeté';
      case 'CANCELLED':
        return 'Annulé';
      case 'EXPIRED':
        return 'Expiré';
      default:
        return status;
    }
  }
}
