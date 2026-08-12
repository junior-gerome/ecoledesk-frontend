import { TranslateModule } from '@ngx-translate/core';
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
import { ActivatedRoute, Router } from "@angular/router";
import { AnneeScolaire } from "@app/features/gestion-annees/domain/models";
import { Section } from "@app/features/section/domain/models";
import { SectionService } from "@app/features/section/infrastructure/section.service";
import { FormBodyComponent } from "@app/shared/form-body/form-body.component";
import { PageFormBodyComponent } from "@app/shared/page-form-body/page-form-body.component";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { TextareaComponent } from "@app/shared/ui/textarea/textarea.component";
import { finalize, first } from "rxjs";

@Component({
  selector: "app-section",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    TextareaComponent,
    ButtonComponent,
    PageLayoutComponent,
    PageHeaderComponent,
    PageFormBodyComponent,
    FormBodyComponent,
    TranslateModule,
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
  private readonly destroyRef = inject(DestroyRef);

  readonly sectionForm: FormGroup = this.fb.group({
    libelle: ["", Validators.required],
    description: [""],
  });

  readonly isEditMode = signal(false);
  readonly isSubmitting = signal(false);
  readonly activeSchoolYear = signal<AnneeScolaire | null>(null);
  readonly error = signal<string | null>(null);

  sectionId?: number;

  get ctrl() {
    return this.sectionForm.controls;
  }

  ngOnInit(): void {
    this.sectionService
      .getAnneeScolaireActive()
      .pipe(first(), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.activeSchoolYear.set(data),
        error: () =>
          this.error.set("Impossible de charger l'annee scolaire active."),
      });

    const idParam = this.route.snapshot.paramMap.get("id");
    if (idParam) {
      this.isEditMode.set(true);
      this.sectionId = Number(idParam);
    }
  }

  onSubmit(): void {
    if (this.sectionForm.invalid) {
      this.sectionForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode()) {
      this.error.set("La mise a jour des sections n'est pas encore disponible.");
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const formData = this.sectionForm.getRawValue();
    const sectionToSave: Section = {
      libelle: formData.libelle,
    };

    this.sectionService
      .createSection(sectionToSave)
      .pipe(
        first(),
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => void this.router.navigate(["/section"]),
        error: () =>
          this.error.set("Une erreur est survenue lors de la creation de la section."),
      });
  }

  cancel(): void {
    void this.router.navigate(["/section"]);
  }
}
