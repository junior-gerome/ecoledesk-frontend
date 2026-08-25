import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Payment } from '@app/features/payments/domain/models';
import { TypePaiement } from '@app/enums/typePaiement.enum';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { InputComponent } from '@app/shared/ui/input/input.component';
import { SelectComponent, SelectOption } from '@app/shared/ui/select/select.component';
import { TextareaComponent } from '@app/shared/ui/textarea/textarea.component';
import { FormBodyComponent } from '@app/shared/form-body/form-body.component';
import { PageFormBodyComponent } from '@app/shared/page-form-body/page-form-body.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PaymentFormUseCase } from '@features/payments/application/use-cases/payment-form.use-case';
import { PaymentFormRepository } from '@features/payments/infrastructure/payment-form.repository';
import { SchoolContextService } from '@app/core/context/school-context.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TextareaComponent,
    FormBodyComponent,
    PageFormBodyComponent,
    PageLayoutComponent,
    PageHeaderComponent,
  ],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
  providers: [PaymentFormRepository, PaymentFormUseCase],
})
export class PaymentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly useCase = inject(PaymentFormUseCase);
  /** Contexte scolaire global — donne accès à l'année scolaire active */
  readonly schoolContext = inject(SchoolContextService);

  readonly paymentForm: FormGroup = this.fb.group({
    studentId: ['', Validators.required],
    type: [TypePaiement.FRAIS_SCOLAIRE, Validators.required],
    amount: ['', [Validators.required, Validators.min(0)]],
    paymentDate: [new Date().toISOString().split('T')[0], Validators.required],
    dueDate: ['', Validators.required],
    status: ['PENDING'],
    paymentMethod: ['CASH'],
    receiptNumber: [''],
    description: [''],
  });

  isEditMode = false;
  paymentId: number | null = null;

  /** Année scolaire active — affichée à titre informatif dans le formulaire */
  readonly activeSchoolYearLabel = computed(() => {
    const year = this.schoolContext.selectedSchoolYear();
    return year
      ? year.libelleAcademicYear
      : null;
  });

  get isSubmitting(): boolean {
    return this.useCase.isSubmitting();
  }

  readonly typeOptions: SelectOption<string>[] = Object.values(TypePaiement).map((type) => ({
    value: type,
    label: type.replace(/_/g, ' '),
  }));

  readonly statusOptions: SelectOption<string>[] = [
    { label: 'En attente', value: 'PENDING' },
    { label: 'Paye', value: 'PAID' },
    { label: 'En retard', value: 'LATE' },
    { label: 'Annule', value: 'CANCELLED' },
  ];

  readonly paymentMethodOptions: SelectOption<string>[] = [
    { label: 'Especes', value: 'CASH' },
    { label: 'Cheque', value: 'CHEQUE' },
    { label: 'Virement', value: 'VIREMENT' },
    { label: 'Mobile Money', value: 'MOBILE_MONEY' },
  ];

  /** Dropdown étudiants — affiche matricule + nom complet. Valeur en string pour compatibilité FormControl. */
  readonly studentOptions = computed<SelectOption<string>[]>(() =>
    this.useCase.studentsSignal().map((student) => ({
      value: String(student.id),
      label: student.studentNumber
        ? `${student.studentNumber} — ${student.lastName} ${student.firstName}`.trim()
        : `${student.lastName} ${student.firstName}`.trim(),
    })),
  );

  ngOnInit(): void {
    this.useCase.loadStudents();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.paymentId = Number(idParam);
      if (this.paymentId) {
        this.isEditMode = true;
        this.useCase.getPayment(this.paymentId, (payment) => {
          this.paymentForm.patchValue({
            studentId: payment.studentId,
            type: payment.type,
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            dueDate: payment.dueDate,
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            receiptNumber: payment.receiptNumber,
            description: payment.description,
          });
        });
      }
    }
  }

  onStudentSearch(keyword: string): void {
    this.useCase.searchStudentsByKeyword(keyword);
  }

  onSubmit(): void {
    if (this.paymentForm.invalid || this.isSubmitting) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.useCase.savePayment(
      this.isEditMode ? this.paymentId : null,
      this.buildPaymentPayload(),
      () => {
        void this.router.navigate(['/payments/list']);
      },
    );
  }

  cancel(): void {
    void this.router.navigate(['/payments/list']);
  }

  private buildPaymentPayload(): Payment {
    const raw = this.paymentForm.getRawValue();

    return {
      studentId: Number(raw.studentId),
      type: raw.type as TypePaiement,
      amount: Number(raw.amount),
      paymentDate: String(raw.paymentDate ?? ''),
      dueDate: String(raw.dueDate ?? ''),
      status: String(raw.status ?? 'PENDING') as Payment['status'],
      paymentMethod: String(raw.paymentMethod ?? 'CASH') as NonNullable<Payment['paymentMethod']>,
      receiptNumber: String(raw.receiptNumber ?? '').trim() || undefined,
      description: String(raw.description ?? '').trim() || undefined,
    };
  }
}
