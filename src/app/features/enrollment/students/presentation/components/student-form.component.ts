import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBodyComponent } from '@app/shared/form-body/form-body.component';
import { PageFormBodyComponent } from '@app/shared/page-form-body/page-form-body.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { InputComponent } from '@app/shared/ui/input/input.component';
import { SelectComponent, SelectOption } from '@app/shared/ui/select/select.component';
import { TextareaComponent } from '@app/shared/ui/textarea/textarea.component';
import { PaymentEntity } from '../../domain/models/payment.entity';
import { PhotoUploadComponent } from '@app/shared/components/photo-upload/photo-upload.component';
import { EnrollmentFormGroup } from '../../infrastructure/enrollment-form.builder';
@Component({
  selector: 'app-students-form',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TextareaComponent,
    PageFormBodyComponent,
    FormBodyComponent,
    PhotoUploadComponent,
  ],
  templateUrl: './student-form.component.html',
})
export class StudentFormComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  @Input({ required: true }) form!: EnrollmentFormGroup;
  @Input() isEditMode = false;
  @Input() isSubmitting = false;
  @Input() error: string | null = null;
  @Input() montantLoading = false;
  @Input() selectedMontant: PaymentEntity | null = null;
  @Input() genderOptions: SelectOption[] = [];
  @Input() typeParentOptions: SelectOption[] = [];
  @Input() sectionOptions: SelectOption<string>[] = [];
  @Input() classOptions: SelectOption<string>[] = [];
  @Input() classPlaceholder = 'studentPage.classPlaceholder';

  @Output() submitted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() sectionChanged = new EventEmitter<string | null>();
  @Output() classChanged = new EventEmitter<string | null>();

  get ctrl() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.form.controls.sectionId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sectionId) => {
        this.sectionChanged.emit(sectionId);
      });

    this.form.controls.classId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((classId) => {
        this.classChanged.emit(classId);
      });
  }

  amountLabel(): string {
    if (this.montantLoading) {
      return this.translate.instant('studentPage.amountLoading');
    }

    if (!this.selectedMontant) {
      return this.translate.instant('studentPage.amountSelectClass');
    }

    return `${new Intl.NumberFormat('fr-FR').format(this.selectedMontant.count ?? 0)} FCFA`;
  }

  amountClassName(): string {
    if (this.selectedMontant) {
      return 'font-bold text-primary-700 dark:text-primary-400';
    }

    return 'italic text-gray-500 dark:text-gray-400';
  }

  submitForm(): void {
    this.submitted.emit();
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
