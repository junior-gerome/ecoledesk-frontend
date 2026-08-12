import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { BadgeComponent } from '@app/shared/ui/badge/badge.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { InputComponent } from '@app/shared/ui/input/input.component';
import { SelectComponent } from '@app/shared/ui/select/select.component';
import { TableComponent } from '@app/shared/ui/table/table.component';
import { ToastComponent } from '@app/shared/ui/toast/toast.component';
import { PaymentReceiptFacade } from '@features/payments/application/facades/payment-receipt.facade';
import { PaymentReceiptManagementUseCase } from '@features/payments/application/use-cases/payment-receipt-management.use-case';
import { PAYMENT_LIST_REPOSITORY } from '@features/payments/domain/repositories/payment-list.repository';
import { PAYMENT_RECEIPT_REPOSITORY } from '@features/payments/domain/repositories/payment-receipt.repository';
import { PaymentReceiptDomainService } from '@features/payments/domain/services/payment-receipt-domain.service';
import { PaymentListRepositoryAdapter } from '@features/payments/infrastructure/payment-list.repository';
import { PaymentReceiptService } from '@features/payments/infrastructure/payment-receipt.service';
import { ReceiptDocumentGateway } from '@features/payments/infrastructure/receipt-document.gateway';
import { PaymentReceiptStore } from '@features/payments/presentation/store/payment-receipt.store';

@Component({
  selector: 'app-payment-receipt-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    PageLayoutComponent,
    PageHeaderComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TableComponent,
    BadgeComponent,
    ToastComponent,
  ],
  templateUrl: './payment-receipt-management.component.html',
  providers: [
    ReceiptDocumentGateway,
    PaymentListRepositoryAdapter,
    {
      provide: PAYMENT_LIST_REPOSITORY,
      useExisting: PaymentListRepositoryAdapter,
    },
    PaymentReceiptService,
    {
      provide: PAYMENT_RECEIPT_REPOSITORY,
      useExisting: PaymentReceiptService,
    },
    PaymentReceiptDomainService,
    PaymentReceiptManagementUseCase,
    PaymentReceiptFacade,
    PaymentReceiptStore,
  ],
})
export class PaymentReceiptManagementComponent implements OnInit {
  protected readonly store = inject(PaymentReceiptStore);

  ngOnInit(): void {
    this.store.initialize();
  }
}
