import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';
import { Gender } from "@app/enums/gender";
import { FormBodyComponent } from "@app/shared/form-body/form-body.component";
import { PageFormBodyComponent } from "@app/shared/page-form-body/page-form-body.component";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import {
  SelectComponent,
  SelectOption,
} from "@app/shared/ui/select/select.component";
import { TextareaComponent } from "@app/shared/ui/textarea/textarea.component";
import { PhotoUploadComponent } from "@app/shared/components/photo-upload/photo-upload.component";

import { TeacherFormUseCase } from "@features/teachers/application/use-cases/teacher-form.use-case";
import { TeacherEntity } from "@features/teachers/domain/models/teacher.entity";

@Component({
  selector: "app-teacher-form",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TextareaComponent,
    PageHeaderComponent,
    PageLayoutComponent,
    FormBodyComponent,
    PageFormBodyComponent,
    PhotoUploadComponent,
  ],
  providers: [TeacherFormUseCase],
  templateUrl: "./teacher-form.component.html",
  styleUrls: ["./teacher-form.component.scss"],
})
export class TeacherFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public readonly useCase = inject(TeacherFormUseCase);

  readonly isEditMode = signal(false);
  readonly teacherId = signal<number | undefined>(undefined);

  readonly teacherForm: FormGroup = this.fb.group({
    firstnameTeacher: ["", Validators.required],
    lastnameTeacher: ["", Validators.required],
    email: ["", [Validators.required, Validators.email]],
    phoneNumber: ["", [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
    speciality: [""],
    dateEmbauche: [
      new Date().toISOString().split("T")[0],
    ],
    niveau: [""],
    address: [""],
    gender: [null, Validators.required],
    photoUrl: [""],
  });

  readonly genders = Object.values(Gender);

  get genderOptions(): SelectOption<Gender>[] {
    return this.genders.map((gender) => ({ value: gender as Gender, label: gender }));
  }

  get ctrl() {
    return this.teacherForm.controls;
  }

  get isSubmitting() {
    return this.useCase.isSubmitting;
  }

  get error() {
    return this.useCase.error;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get("id");

    if (idParam !== null && !Number.isNaN(Number(idParam))) {
      const parsedId = Number(idParam);
      this.isEditMode.set(true);
      this.teacherId.set(parsedId);

      this.useCase.getTeacher(parsedId, (teacher) => {
        const dEmbauche = teacher.dateEmbauche
          ? new Date(teacher.dateEmbauche).toISOString().split('T')[0]
          : null;

        this.teacherForm.patchValue({
          firstnameTeacher: teacher.firstnameTeacher,
          lastnameTeacher: teacher.lastnameTeacher,
          email: teacher.email,
          phoneNumber: teacher.phoneNumber,
          speciality: teacher.speciality,
          dateEmbauche: dEmbauche,
          niveau: teacher.niveau,
          address: teacher.address,
          gender: teacher.gender,
          photoUrl: teacher.photoUrl,
        });
      });

      return;
    }

    if (idParam !== null && idParam !== 'new') {
      console.error(
        `ID d'enseignant invalide: ${idParam}. Redirection vers la liste.`,
      );
      void this.router.navigate(["/teachers"]);
    }
  }

  onSubmit(): void {
    if (!this.teacherForm.valid) {
      this.teacherForm.markAllAsTouched();
      return;
    }

    const formData = this.teacherForm.getRawValue();
    const teacherToSave: TeacherEntity = {
      ...formData,
      id: this.isEditMode() ? this.teacherId() : undefined,
    };

    this.useCase.saveTeacher(this.teacherId(), teacherToSave, () => {
      void this.router.navigate(["/teachers"]);
    });
  }

  cancel(): void {
    void this.router.navigate(["/teachers"]);
  }
}
