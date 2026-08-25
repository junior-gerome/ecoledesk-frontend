import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { NotificationService } from "@app/core/notification/notification.service";
import { AnneeScolaire } from "@app/features/gestion-annees/domain/models";
import { Section } from "@app/features/section/domain/models";
import { SectionService } from "@app/features/section/infrastructure/section.service";
import { FormBodyComponent } from "@app/shared/form-body/form-body.component";
import { PageFormBodyComponent } from "@app/shared/page-form-body/page-form-body.component";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { BadgeComponent } from "@app/shared/ui/badge/badge.component";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { ModalComponent } from "@app/shared/ui/modal/modal.component";
import { TableComponent } from "@app/shared/ui/table/table.component";
import { TextareaComponent } from "@app/shared/ui/textarea/textarea.component";
import { finalize, first } from "rxjs";

@Component({
  selector: "app-section",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    InputComponent,
    TextareaComponent,
    ButtonComponent,
    BadgeComponent,
    TableComponent,
    ModalComponent,
    PageLayoutComponent,
    PageHeaderComponent,
    PageFormBodyComponent,
    FormBodyComponent,
  ],
  templateUrl: "./section.component.html",
  styleUrl: "./section.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sectionService = inject(SectionService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly sectionForm: FormGroup = this.fb.group({
    libelle: ["", Validators.required],
    description: [""],
  });

  readonly isEditMode = signal(false);
  readonly isSubmitting = signal(false);
  readonly isLoading = signal(false);
  readonly activeSchoolYear = signal<AnneeScolaire | null>(null);
  readonly sections = signal<Section[]>([]);
  readonly editingSectionId = signal<number | null>(null);
  readonly sectionPendingDeletion = signal<Section | null>(null);
  readonly error = signal<string | null>(null);

  get ctrl() {
    return this.sectionForm.controls;
  }

  ngOnInit(): void {
    this.loadActiveSchoolYear();
    this.loadSections();

    const idParam = this.route.snapshot.paramMap.get("id");
    if (idParam) {
      const id = Number(idParam);
      if (Number.isFinite(id) && id > 0) {
        this.sectionService
          .getByIdSection(id)
          .pipe(first(), takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (sec) => this.editSection(sec),
            error: () =>
              this.notificationService.error("Impossible de charger la section demandée.", 0),
          });
      }
    }
  }

  loadActiveSchoolYear(): void {
    this.sectionService
      .getAnneeScolaireActive()
      .pipe(first(), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.activeSchoolYear.set(data),
        error: () =>
          this.error.set("Impossible de charger l'année scolaire active."),
      });
  }

  loadSections(): void {
    this.isLoading.set(true);
    this.sectionService
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (data) => this.sections.set(data || []),
        error: () =>
          this.notificationService.error("Impossible de charger les sections.", 0),
      });
  }

  onSubmit(): void {
    if (this.sectionForm.invalid || this.isSubmitting()) {
      this.sectionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const formData = this.sectionForm.getRawValue();
    const sectionToSave: Section = {
      libelle: String(formData.libelle ?? "").trim(),
      description: formData.description ? String(formData.description).trim() : undefined,
    };

    if (this.isEditMode() && this.editingSectionId()) {
      this.sectionService
        .update(this.editingSectionId()!, sectionToSave)
        .pipe(
          first(),
          finalize(() => this.isSubmitting.set(false)),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: () => {
            this.notificationService.success("Section mise à jour avec succès.", 0);
            this.resetForm();
            this.loadSections();
          },
          error: (err: unknown) => {
            const message = "Une erreur est survenue lors de la mise à jour de la section.";
            this.error.set(message);
            this.notificationService.error(message, 0);
          },
        });
    } else {
      this.sectionService
        .createSection(sectionToSave)
        .pipe(
          first(),
          finalize(() => this.isSubmitting.set(false)),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: () => {
            this.notificationService.success("Section créée avec succès.", 0);
            this.resetForm();
            this.loadSections();
          },
          error: (err: unknown) => {
            const message = "Une erreur est survenue lors de la création de la section.";
            this.error.set(message);
            this.notificationService.error(message, 0);
          },
        });
    }
  }

  editSection(section: Section): void {
    this.isEditMode.set(true);
    this.editingSectionId.set(section.id ?? null);
    this.sectionForm.patchValue({
      libelle: section.libelle,
      description: section.description || "",
    });
    this.error.set(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  cancel(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.sectionForm.reset({ libelle: "", description: "" });
    this.isEditMode.set(false);
    this.editingSectionId.set(null);
    this.error.set(null);
  }

  requestDelete(section: Section): void {
    this.sectionPendingDeletion.set(section);
  }

  closeDeleteModal(): void {
    this.sectionPendingDeletion.set(null);
  }

  confirmDelete(): void {
    const section = this.sectionPendingDeletion();
    if (!section?.id) {
      this.closeDeleteModal();
      return;
    }

    this.sectionService
      .delete(section.id)
      .pipe(first(), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success("Section supprimée avec succès.", 0);
          this.closeDeleteModal();
          if (this.editingSectionId() === section.id) {
            this.resetForm();
          }
          this.loadSections();
        },
        error: () => {
          this.notificationService.error(
            "Impossible de supprimer cette section (des classes y sont peut-être rattachées).",
            0
          );
          this.closeDeleteModal();
        },
      });
  }
}
