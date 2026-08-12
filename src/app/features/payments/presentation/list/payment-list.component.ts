import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from "@app/shared/ui/input/input.component";
import { SelectComponent } from "@app/shared/ui/select/select.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PaymentListUseCase } from "@features/payments/application/use-cases/payment-list.use-case";
import { PAYMENT_LIST_REPOSITORY } from "@features/payments/domain/repositories/payment-list.repository";
import { PAYMENT_RECEIPT_REPOSITORY } from "@features/payments/domain/repositories/payment-receipt.repository";
import { PaymentListDomainService } from "@features/payments/domain/services/payment-list-domain.service";
import { PaymentListRepositoryAdapter } from "@features/payments/infrastructure/payment-list.repository";
import { PaymentReceiptService } from "@features/payments/infrastructure/payment-receipt.service";
import { ReceiptDocumentGateway } from "@features/payments/infrastructure/receipt-document.gateway";
import { HasPermissionDirective } from "@app/shared/directives/has-permission.directive";
import { APP_PERMISSIONS } from "@app/core/constants/permissions.constants";
import { ModalComponent } from "@app/shared/ui/modal/modal.component";
import { SkeletonComponent } from "@app/shared/ui/skeleton/skeleton.component";
import { EmptyStateComponent } from "@app/shared/ui/empty-state/empty-state.component";
import { signal } from "@angular/core";

@Component({
  selector: "app-payment-list",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterLink,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    PageLayoutComponent,
    PageHeaderComponent,
    HasPermissionDirective,
    ModalComponent,
    SkeletonComponent,
    EmptyStateComponent,
  ],
  templateUrl: `./payment-list.component.html`,
  styleUrls: ["./payment-list.component.scss"],
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
    PaymentListDomainService,
    PaymentListUseCase,
  ],
})
export class PaymentListComponent implements OnInit {
  readonly permissions = APP_PERMISSIONS;
  readonly pendingDeletion = signal<number | null>(null);
  readonly useCase = inject(PaymentListUseCase);

  requestDelete(id: number): void {
    this.pendingDeletion.set(id);
  }
  cancelDelete(): void {
    this.pendingDeletion.set(null);
  }
  confirmDelete(): void {
    const id = this.pendingDeletion();
    this.pendingDeletion.set(null);
    if (id !== null) this.useCase.deletePayment(id);
  }
  ngOnInit(): void {
    this.useCase.initialize();
  }
}



