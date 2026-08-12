import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { SelectComponent } from "@app/shared/ui/select/select.component";
import { TextareaComponent } from "@app/shared/ui/textarea/textarea.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageFormBodyComponent } from "@app/shared/page-form-body/page-form-body.component";
import { FormBodyComponent } from "@app/shared/form-body/form-body.component";
import { ClassFormUseCase } from "@features/classes/application/use-cases/class-form.use-case";
import { ClassFormRepository } from "@features/classes/domain/repositories/class-form.repository";
import { ClassFormDomainService } from "@features/classes/domain/services/class-form-domain.service";
import { ClassFormRepositoryAdapter } from "@features/classes/infrastructure/class-form.repository";

@Component({
  selector: "app-class-form",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TextareaComponent,
    PageLayoutComponent,
    PageHeaderComponent,
    FormBodyComponent,
    PageFormBodyComponent,
  ],
  templateUrl: "./class-form.component.html",
  styleUrls: ["./class-form.component.scss"],
  providers: [
    ClassFormRepositoryAdapter,
    {
      provide: ClassFormRepository,
      useExisting: ClassFormRepositoryAdapter,
    },
    ClassFormDomainService,
    ClassFormUseCase,
  ],
})
export class ClassFormComponent implements OnInit {
  readonly useCase = inject(ClassFormUseCase);

  get classForm() {
    return this.useCase.classForm;
  }

  get ctrl() {
    return this.useCase.classForm.controls;
  }

  get isEditMode() {
    return this.useCase.isEditMode;
  }

  get isSubmitting() {
    return this.useCase.isSubmitting;
  }

  get statutCode() {
    return this.useCase.activeAcademicYear;
  }

  get sectionOptions() {
    return this.useCase.sectionOptions;
  }

  get teacherOptions() {
    return this.useCase.teacherOptions;
  }

  get error() {
    return this.useCase.error;
  }

  ngOnInit(): void {
    this.useCase.initialize();
  }

  onSubmit(): void {
    this.useCase.save();
  }

  cancel(): void {
    this.useCase.cancel();
  }
}
