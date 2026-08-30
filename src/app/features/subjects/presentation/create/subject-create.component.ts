import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { SubjectReponse, SubjectRequest } from "@app/features/subjects/domain/models";
import { SubjectService } from "@app/features/subjects/infrastructure/subject.service";
import { debounceTime,
  distinctUntilChanged,
  finalize,
  first } from "rxjs";
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { SelectComponent, SelectOption } from "@app/shared/ui/select/select.component";
import { TextareaComponent } from "@app/shared/ui/textarea/textarea.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageFormBodyComponent } from "@app/shared/page-form-body/page-form-body.component";
import { FormBodyComponent } from "@app/shared/form-body/form-body.component";

@Component({
  selector: "app-subject-create",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TextareaComponent,
    PageLayoutComponent,
    PageHeaderComponent,
    PageFormBodyComponent,
    FormBodyComponent,
  ],
  templateUrl: "./subject-create.component.html",
  styleUrls: ["./subject-create.component.scss"],
})
export class SubjectCreateComponent implements OnInit {
  /** Signals */
  readonly isEditMode = signal(false);
  readonly isSubmitting = signal(false);
  readonly isGeneratingCode = signal(false);
  readonly subjectReponseId = signal<number | null>(null);

  private readonly subjectService = inject(SubjectService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  subjectForm!: FormGroup;
  readonly actifOptions: SelectOption<boolean>[] = [
    { label: "Active", value: true },
    { label: "Inactive", value: false },
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
  }

  private initializeForm(): void {
    this.subjectForm = this.fb.group({
      nameSubject: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
       // Code généré automatiquement par le backend
      code: [""],
      coefficient: [
        1,
        [Validators.required, Validators.min(1), Validators.max(10)],
      ],
      description: ["", [Validators.maxLength(500)]],
      active: [true],
      createdAt: [""],
      updatedAt: [""],
    });

    // this.subjectForm
    //   .get("code")
    //   ?.valueChanges.pipe(
    //     tap((value) => {
    //       if (value) {
    //         this.subjectForm
    //           .get("code")
    //           ?.setValue(value.toUpperCase(), { emitEvent: false });
    //       }
    //     }),
    //     takeUntilDestroyed(this.destroyRef),
    //   )
    //   .subscribe();

    this.subjectForm
  .get("nameSubject")
  ?.valueChanges
  .pipe(
    debounceTime(500),
    distinctUntilChanged(),
    takeUntilDestroyed(this.destroyRef)
  )
  .subscribe((value: string) => {

    if (!this.isEditMode()) {
      this.generateSubjectCode(value);
    }

  });
  }

  get ctrl(){return this.subjectForm.controls}

 private generateSubjectCode(nameSubject: string): void {

  if (!nameSubject || nameSubject.trim().length < 2) {

    this.subjectForm
      .get("code")
      ?.setValue("");

    this.isGeneratingCode.set(false);

    return;
  }

  this.isGeneratingCode.set(true);

  this.subjectService
    .generateSubjectCode(nameSubject.trim())
    .pipe(
      first(),
      finalize(() => {
        this.isGeneratingCode.set(false);
      }),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({

      next: (code: string) => {

        this.subjectForm
          .get("code")
          ?.setValue(code, {
            emitEvent: false
          });

      },

      error: (error: unknown) => {

        console.error(
          "Erreur lors de la génération du code :",
          error
        );

        this.subjectForm
          .get("code")
          ?.setValue("");

      }

    });
}

  private checkEditMode(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const idParam = params.get("id");
        if (idParam && idParam !== "new") {
          const id = Number(idParam);
          this.isEditMode.set(true);
          this.subjectReponseId.set(id);
          this.loadSubject(id);
        }
      });
  }

  private loadSubject(id: number): void {
    this.subjectService
      .getSubject(id)
      .pipe(first(), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (subject) => {
          if (subject) {
            this.subjectForm.patchValue(subject);
            //this.subjectForm.get("code")?.disable();
          }
        },
        error: (err) => {
          console.error("Erreur de chargement", err);
          alert("âŒ Impossible de charger la matiÃ¨re.");
          this.router.navigate(["/subjects"]);
        },
      });
  }

  onSubmit(): void {
    if (this.subjectForm.invalid || this.isSubmitting()) {
      this.markFormGroupTouched(this.subjectForm);
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.subjectForm.getRawValue();
    const subjectData: SubjectRequest = {
      nameSubject: formValue.nameSubject,
      code: formValue.code,
      coefficient: formValue.coefficient,
      description: formValue.description || "",
      active: formValue.active,
    };

    const operation$ =
      this.isEditMode() && this.subjectReponseId()
        ? this.subjectService.updateSubject(this.subjectReponseId()!, subjectData)
        : this.subjectService.createSubject(subjectData);

    operation$
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          const successMessage = this.isEditMode()
            ? "âœ… MatiÃ¨re mise Ã  jour avec succÃ¨s !"
            : "âœ… MatiÃ¨re crÃ©Ã©e avec succÃ¨s !";
          // alert(successMessage);
          this.router.navigate(["/subjects"]);
        },
        error: (error) => {
          console.error("Erreur lors de la crÃ©ation:", error);
          // alert(
          //   error.status === 409
          //     ? "âŒ Une matiÃ¨re avec ce code existe dÃ©jÃ ."
          //     : "âŒ Erreur lors de l'enregistrement."
          // );
        },
      });
  }

  /** Annuler */
  cancel(): void {
    if (this.subjectForm.dirty) {
      const confirmCancel = confirm(
        "Des modifications non enregistrÃ©es seront perdues. Voulez-vous continuer ?",
      );
      if (!confirmCancel) return;
    }
    this.router.navigate(["/subjects"]);
  }

  /** Validation */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}


