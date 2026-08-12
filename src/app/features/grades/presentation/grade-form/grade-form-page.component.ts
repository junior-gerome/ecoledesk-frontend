/**
 * GradeFormPageComponent
 * Formulaire moderne de saisie des notes
 */
import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";

import {
  CreateGradeUseCase,
  ListGradesUseCase,
} from "@features/grades/application/use-cases";
import { GradeValidationService } from "@features/grades/domain/services";

import { TranslateModule } from '@ngx-translate/core';
import { AlertComponent } from "@app/shared/ui/alert/alert.component";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { CardComponent } from "@app/shared/ui/card/card.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import {
  SelectComponent,
  SelectOption,
} from "@app/shared/ui/select/select.component";
import { TextareaComponent } from "@app/shared/ui/textarea/textarea.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageFormBodyComponent } from "@app/shared/page-form-body/page-form-body.component";
import { FormBodyComponent } from "@app/shared/form-body/form-body.component";

@Component({
  selector: "app-grade-form-page",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    SelectComponent,
    AlertComponent,
    TextareaComponent,
    PageLayoutComponent,
    PageHeaderComponent,
    PageFormBodyComponent,
    FormBodyComponent
],
  templateUrl: "./grade-form-page.component.html",
  styleUrl: "./grade-form-page.component.scss",
})
export class GradeFormPageComponent implements OnInit {
  private readonly fb = inject<FormBuilder>(FormBuilder);
  private readonly router = inject<Router>(Router);
  private readonly createGradeUseCase = inject<CreateGradeUseCase>(
    CreateGradeUseCase,
  );
  private readonly listGradesUseCase = inject<ListGradesUseCase>(
    ListGradesUseCase,
  );
  private readonly validationService = inject<GradeValidationService>(
    GradeValidationService,
  );

  gradeForm!: FormGroup;
  readonly submitting = signal(false);
  readonly success = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly classOptions = signal<SelectOption<number>[]>([]);
  readonly subjectOptions = signal<SelectOption<number>[]>([]);
  readonly periodOptions = signal<SelectOption<string>[]>([]);
  readonly studentOptions = signal<SelectOption<number>[]>([]);

  readonly mentionLabel = signal("");
  readonly scoreStatus = signal<"valid" | "invalid" | "neutral">("neutral");

  ngOnInit(): void {
    this.initForm();
    this.loadFormOptions();
    this.setupScoreValidation();
    this.gradeForm
      .get("classId")
      ?.valueChanges.subscribe((classId) => this.onClassChange(Number(classId) || 0));
  }

  private initForm(): void {
    this.gradeForm = this.fb.group(
      {
        classId: [null, Validators.required],
        studentId: [null, Validators.required],
        subjectId: [null, Validators.required],
        score: [null, [Validators.required, Validators.min(0), Validators.max(20)]],
        coefficient: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
        period: ["", Validators.required],
        comments: [""],
        assessmentDate: [this.today(), Validators.required],
      },
      { validators: this.scoreValidator.bind(this) },
    );
  }

  private scoreValidator(form: FormGroup): { [key: string]: unknown } | null {
    const score = Number(form.get("score")?.value);
    const coefficient = Number(form.get("coefficient")?.value);

    if (Number.isFinite(score) && Number.isFinite(coefficient)) {
      const scoreValidation = this.validationService.validateScore(score);
      const coefficientValidation =
        this.validationService.validateCoefficient(coefficient);

      if (!scoreValidation.valid || !coefficientValidation.valid) {
        return { invalidGrade: true };
      }
    }

    return null;
  }

  private setupScoreValidation(): void {
    this.gradeForm.get("score")?.valueChanges.subscribe((scoreValue) => {
      const score = Number(scoreValue);

      if (!Number.isFinite(score)) {
        this.scoreStatus.set("neutral");
        this.mentionLabel.set("");
        return;
      }

      const validation = this.validationService.validateScore(score);
      if (!validation.valid) {
        this.scoreStatus.set("invalid");
        this.mentionLabel.set("");
        return;
      }

      this.scoreStatus.set("valid");
      if (score >= 16) this.mentionLabel.set("EXCELLENT");
      else if (score >= 14) this.mentionLabel.set("TRES BON");
      else if (score >= 12) this.mentionLabel.set("BON");
      else if (score >= 10) this.mentionLabel.set("ACCEPTABLE");
      else if (score >= 8) this.mentionLabel.set("BON TRAVAIL");
      else this.mentionLabel.set("A RENFORCER");
    });
  }

  private loadFormOptions(): void {
    this.listGradesUseCase.listClasses().subscribe({
      next: (classes: Array<{ id: number; name: string }>) => {
        this.classOptions.set(classes.map((entry) => ({ label: entry.name, value: entry.id })));
      },
      error: (err: unknown) => console.error("Erreur chargement classes:", err),
    });

    this.listGradesUseCase.listSubjects().subscribe({
      next: (subjects: Array<{ id: number; name: string }>) => {
        this.subjectOptions.set(
          subjects.map((entry) => ({ label: entry.name, value: entry.id })),
        );
      },
      error: (err: unknown) => console.error("Erreur chargement matieres:", err),
    });

    this.listGradesUseCase.listPeriods().subscribe({
      next: (periods: string[]) => {
        this.periodOptions.set(periods.map((period) => ({ label: period, value: period })));
      },
      error: (err: unknown) => console.error("Erreur chargement periodes:", err),
    });
  }

  onClassChange(classId: number): void {
    if (!classId) {
      this.studentOptions.set([]);
      this.gradeForm.patchValue({ studentId: null }, { emitEvent: false });
      return;
    }

    this.listGradesUseCase.listStudents(classId).subscribe({
      next: (students: Array<{ id: number; name: string }>) => {
        this.studentOptions.set(
          students.map((entry) => ({ label: entry.name, value: entry.id })),
        );
      },
      error: (err: unknown) => console.error("Erreur chargement eleves:", err),
    });
  }

  submitForm(): void {
    if (this.gradeForm.invalid) {
      this.error.set("Veuillez remplir tous les champs correctement");
      this.gradeForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(null);

    const formValue = this.gradeForm.getRawValue();

    this.createGradeUseCase
      .execute({
        studentId: Number(formValue.studentId),
        subjectId: Number(formValue.subjectId),
        classId: Number(formValue.classId),
        score: Number(formValue.score),
        coefficient: Number(formValue.coefficient),
        period: String(formValue.period),
        comments: formValue.comments ? String(formValue.comments) : undefined,
        assessmentDate: String(formValue.assessmentDate),
      })
      .subscribe({
        next: () => {
          this.success.set("Note creee avec succes.");
          this.submitting.set(false);
          setTimeout(() => {
            this.gradeForm.reset({ coefficient: 1, assessmentDate: this.today() });
            this.studentOptions.set([]);
            this.mentionLabel.set("");
            this.scoreStatus.set("neutral");
          }, 1500);
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : "Erreur lors de la creation";
          this.error.set(message);
          this.submitting.set(false);
          console.error(err);
        },
      });
  }

  resetForm(): void {
    this.gradeForm.reset({ coefficient: 1, assessmentDate: this.today() });
    this.studentOptions.set([]);
    this.mentionLabel.set("");
    this.scoreStatus.set("neutral");
    this.error.set(null);
    this.success.set(null);
  }

  goBack(): void {
    void this.router.navigate(["/grades"]);
  }

  private today(): string {
    return new Date().toISOString().split("T")[0];
  }
}
