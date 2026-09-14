import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import {
  ClassRoomOption,
  DocumentReviewStatus,
  EnrollmentResponse,
  PreEnrollment,
  PreEnrollmentDocument,
  PreEnrollmentStatus,
} from '../../domain/models/pre-enrollment.model';
import { PreEnrollmentHttpRepository } from '../../infrastructure/pre-enrollment-http.repository';

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

  readonly preEnrollment = signal<PreEnrollment | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Inscription & Confirmation state
  readonly availableClasses = signal<ClassRoomOption[]>([]);
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
          this.loadExistingEnrollment(data.id);
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

  /**
   * Recharge une éventuelle inscription déjà créée pour une préinscription approuvée.
   * Évite de proposer "Créer l'inscription" alors qu'une inscription existe déjà
   * (retours sur la page, double affichage, doublon interdit côté backend).
   */
  loadExistingEnrollment(preEnrollmentId: number): void {
    this.repository.getEnrollmentByPreEnrollment(preEnrollmentId).subscribe({
      next: (enrollment) => {
        if (enrollment) {
          this.createdEnrollment.set(enrollment);
        }
      },
      error: (err) => console.error('Error loading existing enrollment', err),
    });
  }

  /**
   * Recharge le dossier complet (GET détail, incluant la liste des pièces justificatives)
   * après une mutation workflow. Les endpoints de décision renvoient un DTO léger
   * sans `documents` : sans ce rechargement la liste serait vidée et le compteur
   * d'approbations repasserait à zéro.
   */
  reload(id: number, message?: string, successMessageText?: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.repository.getById(id).subscribe({
      next: (data) => {
        this.preEnrollment.set(data);
        this.isLoading.set(false);
        if (message) {
          this.successMessage.set(message);
        }
        if (data.status === 'APPROVED') {
          this.loadExistingEnrollment(data.id);
          this.loadClasses(data.academicYearId);
        }
      },
      error: (err) => {
        this.error.set(err?.message || 'Impossible de recharger le dossier.');
        this.isLoading.set(false);
      },
    });
  }

  loadClasses(academicYearId?: number): void {
    this.repository.loadClasses(academicYearId).subscribe({
      next: (classes) => {
        this.availableClasses.set(classes || []);
        const withId = (classes || []).filter((classroom) => classroom.id != null);
        if (withId.length === 0) {
          this.selectedClassroomId.set(null);
          return;
        }
        const requestedLevel = this.preEnrollment()?.requestedLevel?.trim().toLowerCase();
        const matching =
          requestedLevel
            ? withId.find(
                (classroom) =>
                  classroom.nameClasse?.trim().toLowerCase() === requestedLevel ||
                  classroom.level?.trim().toLowerCase() === requestedLevel,
              )
            : undefined;
        this.selectedClassroomId.set(matching?.id ?? withId[0].id!);
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
      next: () => {
        // Le backend renvoie un DTO léger (sans documents) : on recharge le dossier complet
        // pour conserver la liste des pièces et débloquer les décisions.
        this.reload(current.id, 'L’étude du dossier a commencé.');
      },
      error: (err) => {
        this.error.set(err?.message || 'Erreur lors du passage en revue.');
        this.isLoading.set(false);
      },
    });
  }

  /** Soumet le dossier (DRAFT → SUBMITTED) pour démarrer le workflow d'étude. */
  submitDossier(): void {
    const current = this.preEnrollment();
    if (!current) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.repository.submit(current.id).subscribe({
      next: () => {
        // DTO de décision léger (sans documents ni identité complète) : on recharge le
        // dossier complet pour conserver pièces, état civil, niveau et année scolaire.
        this.reload(current.id, 'Le dossier a été soumis pour étude.');
      },
      error: (err) => {
        this.error.set(err?.message || 'Erreur lors de la soumission du dossier.');
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
          // Le backend renvoie un DTO léger (sans documents ni bornes candidat) :
          // on recharge le dossier complet pour conserver pièces + identité + année.
          this.reload(current.id, 'La pièce justificative a été mise à jour.');
        },
        error: (err) => {
          this.error.set(err?.message || 'Erreur lors de la revue du document.');
          this.isLoading.set(false);
        },
      });
  }

  /** Telecharge un document du dossier depuis le stockage objet (MinIO). */
  downloadDocument(doc: PreEnrollmentDocument): void {
    const current = this.preEnrollment();
    if (!current || doc.id == null) return;

    this.repository.downloadDocument(current.id, doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.storageReference?.split('/').pop() || 'document';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading document', err);
        this.error.set(err?.message || 'Impossible de télécharger le document.');
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
      next: (received) => {
        // DTO de décision léger (sans pièces ni identité complet) : on recharge le dossier
        // complet pour conserver la liste des documents et afficher la classe d'affectation.
        this.reload(current.id, 'Le dossier de préinscription a été approuvé.');
      },
      error: (err) => {
        this.error.set(err?.message || 'Erreur lors de l’approbation du dossier.');
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
        next: () => {
          // DTO de décision léger (sans pièces ni bornes identité complètes) : on recharge
          // le dossier complet pour conserver documents, naissance/genre, niveau et année.
          this.reload(current.id, 'Dossier rejeté.');
        },
        error: (err) => {
          this.error.set(err?.message || 'Erreur lors du rejet du dossier.');
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
        this.error.set(err?.message || 'Erreur lors de la création de l’inscription.');
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
        this.error.set(err?.message || 'Erreur lors de la confirmation de l’inscription.');
        this.isEnrolling.set(false);
      },
    });
  }

  cancelEnrollment(): void {
    const enrollment = this.createdEnrollment();
    if (!enrollment) return;

    this.isEnrolling.set(true);
    this.error.set(null);

    this.repository.cancelEnrollment(enrollment.id, 'Annulation administrative du dossier').subscribe({
      next: (cancelled) => {
        this.createdEnrollment.set(cancelled);
        this.isEnrolling.set(false);
        this.successMessage.set('Inscription annulée. La préinscription reste consultable.');
      },
      error: (err) => {
        this.error.set(err?.message || 'Erreur lors de l’annulation de l’inscription.');
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
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'CANCELLED':
        return 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  allDocumentsApproved(): boolean {
    const docs = this.preEnrollment()?.documents;
    if (!docs || docs.length === 0) return false;
    return docs.every((d) => d.reviewStatus === 'APPROVED');
  }

  /** Indice de l'étape workflow (0-based) : Soumis=0, En étude=1, Approuvé=2, Rejeté=-1 */
  readonly workflowSteps = [
    { key: 'SUBMITTED', label: 'Soumis', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { key: 'UNDER_REVIEW', label: 'En cours d\'étude', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
    { key: 'APPROVED', label: 'Approuvé', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  getWorkflowStepIndex(): number {
    const status = this.preEnrollment()?.status;
    switch (status) {
      case 'SUBMITTED': return 0;
      case 'UNDER_REVIEW': return 1;
      case 'APPROVED': return 2;
      case 'REJECTED': return 1;
      default: return -1;
    }
  }

  isRejected(): boolean {
    return this.preEnrollment()?.status === 'REJECTED';
  }

  isTerminalStatus(): boolean {
    const s = this.preEnrollment()?.status;
    return s === 'APPROVED' || s === 'REJECTED' || s === 'CANCELLED' || s === 'EXPIRED';
  }

  getDocumentStats(): { total: number; approved: number; rejected: number; pending: number } {
    const docs = this.preEnrollment()?.documents ?? [];
    return {
      total: docs.length,
      approved: docs.filter((d) => d.reviewStatus === 'APPROVED').length,
      rejected: docs.filter((d) => d.reviewStatus === 'REJECTED').length,
      pending: docs.filter((d) => d.reviewStatus !== 'APPROVED' && d.reviewStatus !== 'REJECTED').length,
    };
  }
}
