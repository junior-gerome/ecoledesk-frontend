import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { environment } from '@environments/environment';
import {
  DocumentReviewStatus,
  EnrollmentResponse,
  PreEnrollment,
  PreEnrollmentDocument,
  PreEnrollmentStatus,
} from '../../domain/models/pre-enrollment.model';
import { PreEnrollmentHttpRepository } from '../../infrastructure/pre-enrollment-http.repository';

export interface ClassOption {
  id: number;
  nameClasse: string;
  level: string;
  capacity: number;
}

@Component({
  selector: 'app-pre-enrollment-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PageLayoutComponent,
    PageHeaderComponent,
    ButtonComponent,
  ],
  templateUrl: './pre-enrollment-detail-page.component.html',
})
export class PreEnrollmentDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly repository = inject(PreEnrollmentHttpRepository);
  private readonly http = inject(HttpClient);

  readonly preEnrollment = signal<PreEnrollment | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Inscription & Confirmation state
  readonly availableClasses = signal<ClassOption[]>([]);
  readonly selectedClassroomId = signal<number | null>(null);
  readonly createdEnrollment = signal<EnrollmentResponse | null>(null);
  readonly isEnrolling = signal<boolean>(false);

  // Modale de rejet / révision avec motif
  readonly isReasonModalOpen = signal<boolean>(false);
  readonly reasonModalTitle = signal<string>('');
  readonly reasonText = signal<string>('');
  private pendingAction: (() => void) | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadData(id);
    }
  }

  loadData(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.repository.getById(id).subscribe({
      next: (data) => {
        this.preEnrollment.set(data);
        this.isLoading.set(false);
        if (data.status === 'APPROVED') {
          this.loadClasses(data.academicYearId);
        }
      },
      error: (err) => {
        console.error('Error loading pre-enrollment detail', err);
        this.error.set('Impossible de charger le détail du dossier.');
        this.isLoading.set(false);
      },
    });
  }

  loadClasses(academicYearId?: number): void {
    const url = academicYearId
      ? `${environment.apiUrl}/classes?academicYearId=${academicYearId}`
      : `${environment.apiUrl}/classes`;
    this.http.get<ClassOption[]>(url).subscribe({
      next: (classes) => {
        this.availableClasses.set(classes || []);
        if (classes && classes.length > 0) {
          this.selectedClassroomId.set(classes[0].id);
        }
      },
      error: (err) => console.error('Error loading classes', err),
    });
  }

  startReview(): void {
    const current = this.preEnrollment();
    if (!current) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.repository.startReview(current.id).subscribe({
      next: (updated) => {
        this.preEnrollment.set(updated);
        this.isLoading.set(false);
        this.successMessage.set('L’étude du dossier a commencé.');
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Erreur lors du passage en revue.');
        this.isLoading.set(false);
      },
    });
  }

  reviewDocument(doc: PreEnrollmentDocument, status: DocumentReviewStatus, reason?: string): void {
    const current = this.preEnrollment();
    if (!current || !doc.id) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.repository
      .reviewDocument(current.id, doc.id, {
        status,
        reason,
      })
      .subscribe({
        next: (updated) => {
          this.preEnrollment.set(updated);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Erreur lors de la revue du document.');
          this.isLoading.set(false);
        },
      });
  }

  openRejectDocumentModal(doc: PreEnrollmentDocument, status: DocumentReviewStatus): void {
    this.reasonModalTitle.set(
      status === 'REJECTED' ? 'Rejeter la pièce justificative' : 'Demander le remplacement de la pièce'
    );
    this.reasonText.set('');
    this.pendingAction = () => this.reviewDocument(doc, status, this.reasonText());
    this.isReasonModalOpen.set(true);
  }

  approveDossier(): void {
    const current = this.preEnrollment();
    if (!current) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.repository.approve(current.id).subscribe({
      next: (updated) => {
        this.preEnrollment.set(updated);
        this.isLoading.set(false);
        this.successMessage.set('Dossier de préinscription approuvé avec succès !');
        this.loadClasses(updated.academicYearId);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Erreur lors de l’approbation du dossier.');
        this.isLoading.set(false);
      },
    });
  }

  openRejectDossierModal(): void {
    this.reasonModalTitle.set('Rejeter la préinscription');
    this.reasonText.set('');
    this.pendingAction = () => {
      const current = this.preEnrollment();
      if (!current) return;
      this.isLoading.set(true);
      this.repository.reject(current.id, { reason: this.reasonText() }).subscribe({
        next: (updated) => {
          this.preEnrollment.set(updated);
          this.isLoading.set(false);
          this.successMessage.set('Dossier rejeté.');
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Erreur lors du rejet du dossier.');
          this.isLoading.set(false);
        },
      });
    };
    this.isReasonModalOpen.set(true);
  }

  confirmReasonModal(): void {
    if (this.pendingAction) {
      this.pendingAction();
    }
    this.isReasonModalOpen.set(false);
  }

  closeReasonModal(): void {
    this.isReasonModalOpen.set(false);
    this.pendingAction = null;
  }

  // Affectation & Inscription
  createEnrollment(): void {
    const current = this.preEnrollment();
    const classId = this.selectedClassroomId();
    if (!current || !classId) return;

    this.isEnrolling.set(true);
    this.error.set(null);

    this.repository.createEnrollmentFromPreEnrollment(current.id, { classroomId: classId }).subscribe({
      next: (enrollment) => {
        this.createdEnrollment.set(enrollment);
        this.isEnrolling.set(false);
        this.successMessage.set('Inscription créée en attente de confirmation.');
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Erreur lors de la création de l’inscription.');
        this.isEnrolling.set(false);
      },
    });
  }

  confirmEnrollment(): void {
    const enrollment = this.createdEnrollment();
    if (!enrollment) return;

    this.isEnrolling.set(true);
    this.error.set(null);

    this.repository.confirmEnrollment(enrollment.id).subscribe({
      next: (confirmed) => {
        this.createdEnrollment.set(confirmed);
        this.isEnrolling.set(false);
        this.successMessage.set(
          'Inscription confirmée avec succès ! L’élève et ses responsables ont été enregistrés.'
        );
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Erreur lors de la confirmation de l’inscription.');
        this.isEnrolling.set(false);
      },
    });
  }

  getStatusBadgeClass(status?: PreEnrollmentStatus): string {
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
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  allDocumentsApproved(): boolean {
    const docs = this.preEnrollment()?.documents;
    if (!docs || docs.length === 0) return false;
    return docs.every((d) => d.reviewStatus === 'APPROVED');
  }
}
