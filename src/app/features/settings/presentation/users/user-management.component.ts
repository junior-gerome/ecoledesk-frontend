import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BadgeComponent } from '@app/shared/ui/badge/badge.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { InputComponent } from '@app/shared/ui/input/input.component';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { SelectComponent } from '@app/shared/ui/select/select.component';
import { TableComponent } from '@app/shared/ui/table/table.component';
import { ToastComponent } from '@app/shared/ui/toast/toast.component';
import { UserManagementUseCase } from '@features/settings/users/application/use-cases/user-management.use-case';
import { UserEntity, UserRole, UserStatus } from '@features/settings/users/domain/models/user.entity';
import { USER_MANAGEMENT_REPOSITORY } from '@features/settings/users/domain/repositories/user-management.repository';
import { UserManagementDomainService } from '@features/settings/users/domain/services/user-management-domain.service';
import { UserManagementRepositoryAdapter } from '@features/settings/users/infrastructure/user-management.repository';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BadgeComponent,
    ButtonComponent,
    InputComponent,
    ModalComponent,
    PageHeaderComponent,
    PageLayoutComponent,
    SelectComponent,
    TableComponent,
    ToastComponent,
    TranslateModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  providers: [
    UserManagementRepositoryAdapter,
    {
      provide: USER_MANAGEMENT_REPOSITORY,
      useExisting: UserManagementRepositoryAdapter,
    },
    UserManagementDomainService,
    UserManagementUseCase,
  ],
})
export class UserManagementComponent {
  private readonly useCase = inject(UserManagementUseCase);

  readonly roleOptions = this.useCase.roleOptions;
  readonly statusOptions = this.useCase.statusOptions;
  readonly permissionGroups = this.useCase.permissionGroups;

  readonly users = this.useCase.users;
  readonly loading = this.useCase.loading;
  readonly saving = this.useCase.saving;
  readonly modalOpen = this.useCase.modalOpen;
  readonly editingUser = this.useCase.editingUser;
  readonly autoSyncRole = this.useCase.autoSyncRole;
  readonly filteredUsers = this.useCase.filteredUsers;
  readonly toast = this.useCase.toast;

  readonly filtersForm = this.useCase.filtersForm;
  readonly userForm = this.useCase.userForm;

  get ctrl() {
    return this.userForm.controls;
  }

  get isEditMode(): boolean {
    return this.useCase.isEditMode();
  }

  showToast(message: string, variant: 'success' | 'warning' | 'danger' | 'info', title = ''): void {
    this.useCase.showToast(message, variant, title);
  }

  hideToast(): void {
    this.useCase.hideToast();
  }

  openCreate(): void {
    this.useCase.openCreate();
  }

  openEdit(user: UserEntity): void {
    this.useCase.openEdit(user);
  }

  closeModal(): void {
    this.useCase.closeModal();
  }

  saveUser(): void {
    this.useCase.saveUser();
  }

  deleteUser(user: UserEntity): void {
    this.useCase.deleteUser(user);
  }

  toggleStatus(user: UserEntity): void {
    this.useCase.toggleStatus(user);
  }

  applyRoleDefaults(role: UserRole): void {
    this.useCase.applyRoleDefaults(role);
  }

  applyCurrentRoleDefaults(): void {
    this.useCase.applyCurrentRoleDefaults();
  }

  togglePermission(key: string): void {
    this.useCase.togglePermission(key);
  }

  hasPermission(key: string): boolean {
    return this.useCase.hasPermission(key);
  }

  permissionCount(user: UserEntity): number {
    return this.useCase.permissionCount(user);
  }

  roleLabel(role: UserRole): string {
    return this.useCase.roleLabel(role);
  }

  statusLabel(status: UserStatus): string {
    return this.useCase.statusLabel(status);
  }

  roleVariant(role: UserRole) {
    return this.useCase.roleVariant(role);
  }

  statusVariant(status: UserStatus) {
    return this.useCase.statusVariant(status);
  }
}
