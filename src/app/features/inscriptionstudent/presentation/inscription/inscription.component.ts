import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { PaymentFormUseCase } from '../../../payments/application/use-cases/payment-form.use-case';
import { PaymentFormRepository } from '../../../payments/infrastructure/payment-form.repository';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TextareaComponent,
    FormBodyComponent,
    PageFormBodyComponent,
    PageHeaderComponent,
    PageLayoutComponent,
    TranslateModule,
  ],
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.scss'],
  providers: [PaymentFormRepository, PaymentFormUseCase],
})
export class InscriptionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly useCase = inject(PaymentFormUseCase);

  readonly inscriptionForm: FormGroup = this.fb.group({
    studentId: ['', Validators.required],
    type: [TypePaiement.FRAIS_INSCRIPTION, Validators.required],
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

  get studentOptions(): SelectOption<number>[] {
    return this.useCase.studentsSignal().map((student) => ({
      value: student.id,
      label: `${student.lastName} ${student.firstName}`.trim(),
    }));
  }

  ngOnInit(): void {
    this.useCase.loadStudents();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.paymentId = Number(idParam);
      if (this.paymentId) {
        this.isEditMode = true;
        this.useCase.getPayment(this.paymentId, (payment) => {
          this.inscriptionForm.patchValue({
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

  onSubmit(): void {
    if (this.inscriptionForm.invalid || this.isSubmitting) {
      this.inscriptionForm.markAllAsTouched();
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
    const raw = this.inscriptionForm.getRawValue();

    return {
      studentId: Number(raw.studentId),
      type: raw.type as TypePaiement,
      amount: Number(raw.amount),
      paymentDate: String(raw.paymentDate ?? ''),
      dueDate: String(raw.dueDate ?? ''),
      status: String(raw.status ?? 'PENDING') as Payment['status'],
      paymentMethod: String(raw.paymentMethod ?? 'CASH') as NonNullable<
        Payment['paymentMethod']
      >,
      receiptNumber: String(raw.receiptNumber ?? '').trim() || undefined,
      description: String(raw.description ?? '').trim() || undefined,
    };
  }
}
