import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastVariant } from '@app/shared/ui/toast/toast.component';
import { USER_MANAGEMENT_REPOSITORY } from '../../domain/repositories/user-management.repository';
import { UserManagementDomainService } from '../../domain/services/user-management-domain.service';
import { UserEntity, UserRole, UserStatus } from '../../domain/models/user.entity';

@Injectable()
export class UserManagementUseCase {
  private readonly repository = inject(USER_MANAGEMENT_REPOSITORY);
  private readonly domain = inject(UserManagementDomainService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly roleOptions = this.domain.roleOptions;
  readonly statusOptions = this.domain.statusOptions;
  readonly permissionGroups = this.domain.permissionGroups;
  readonly roleDefaults = this.domain.roleDefaults;

  readonly users = signal<UserEntity[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly modalOpen = signal(false);
  readonly editingUser = signal<UserEntity | null>(null);
  readonly autoSyncRole = signal(true);
  readonly filters = signal<{ search: string; roleType: UserRole | null; status: UserStatus | null }>({
    search: '',
    roleType: null,
    status: null,
  });

  readonly toast = signal<{
    visible: boolean;
    title: string;
    message: string;
    variant: ToastVariant;
  }>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  readonly filteredUsers = computed(() =>
    this.domain.filterUsers(this.users(), this.filters()),
  );

  readonly filtersForm = this.fb.group({
    search: [''],
    roleType: [null as UserRole | null],
    status: [null as UserStatus | null],
  });

  readonly userForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    roleType: ['AGENT' as UserRole, Validators.required],
    status: ['ACTIVE' as UserStatus, Validators.required],
    password: [''],
    permissions: [[] as string[]],
  });

  constructor() {
    this.bindFilters();
    this.bindRoleDefaults();
    this.applyRoleDefaults('AGENT');
    this.setPasswordRequired(true);
    this.loadUsers();
  }

  readonly isEditMode = computed(() => !!this.editingUser());

  showToast(message: string, variant: ToastVariant, title = ''): void {
    this.toast.set({ visible: true, title, message, variant });
  }

  hideToast(): void {
    this.toast.update((current) => ({ ...current, visible: false }));
  }

  openCreate(): void {
    this.editingUser.set(null);
    this.modalOpen.set(true);
    this.autoSyncRole.set(true);

    this.userForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      roleType: 'AGENT',
      status: 'ACTIVE',
      password: '',
      permissions: [],
    });

    this.applyRoleDefaults('AGENT');
    this.setPasswordRequired(true);
  }

  openEdit(user: UserEntity): void {
    this.editingUser.set(user);
    this.modalOpen.set(true);
    this.autoSyncRole.set(false);

    this.userForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleType: user.roleType,
      status: user.status,
      password: '',
      permissions: user.permissions ?? [],
    });

    this.setPasswordRequired(false);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingUser.set(null);
    this.userForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      roleType: 'AGENT',
      status: 'ACTIVE',
      password: '',
      permissions: [],
    });
    this.setPasswordRequired(true);
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const payload = this.domain.buildPayload(this.userForm.getRawValue());

    if (this.isEditMode()) {
      const userId = this.editingUser()?.id;
      if (!userId) {
        return;
      }

      this.saving.set(true);
      this.repository.update(userId, payload).subscribe({
        next: (updated) => {
          this.users.update((users) =>
            users.map((user) =>
              user.id === updated.id ? this.domain.normalizeUser(updated) : user,
            ),
          );
          this.saving.set(false);
          this.showToast('User updated', 'success', 'Success');
          this.closeModal();
        },
        error: () => {
          this.saving.set(false);
          this.showToast('Update failed', 'danger', 'Error');
        },
      });
      return;
    }

    this.saving.set(true);
    this.repository.create(payload).subscribe({
      next: (created) => {
        this.users.update((users) => [
          this.domain.normalizeUser(created),
          ...users,
        ]);
        this.saving.set(false);
        this.showToast('User created', 'success', 'Success');
        this.closeModal();
      },
      error: () => {
        this.saving.set(false);
        this.showToast('Creation failed', 'danger', 'Error');
      },
    });
  }

  deleteUser(user: UserEntity): void {
    if (!confirm('Delete this user?')) {
      return;
    }

    this.repository.delete(user.id).subscribe({
      next: () => {
        this.users.update((users) => users.filter((item) => item.id !== user.id));
        this.showToast('User deleted', 'success', 'Success');
      },
      error: () => {
        this.showToast('Delete failed', 'danger', 'Error');
      },
    });
  }

  toggleStatus(user: UserEntity): void {
    const nextStatus: UserStatus =
      user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    this.repository.updateStatus(user.id, nextStatus).subscribe({
      next: (updated) => {
        this.users.update((users) =>
          users.map((item) =>
            item.id === updated.id ? this.domain.normalizeUser(updated) : item,
          ),
        );
        this.showToast('Status updated', 'success', 'Success');
      },
      error: () => {
        this.showToast('Status update failed', 'danger', 'Error');
      },
    });
  }

  applyRoleDefaults(role: UserRole): void {
    const defaults = this.roleDefaults[role] ?? [];
    this.userForm.patchValue({ permissions: [...defaults] });
  }

  applyCurrentRoleDefaults(): void {
    const role = this.userForm.get('roleType')?.value as UserRole | null;
    if (role) {
      this.applyRoleDefaults(role);
    }
  }

  togglePermission(key: string): void {
    const permissions = (this.userForm.get('permissions')?.value ?? []) as string[];
    const next = permissions.includes(key)
      ? permissions.filter((permission) => permission !== key)
      : [...permissions, key];

    this.userForm.patchValue({ permissions: next });
    this.autoSyncRole.set(false);
  }

  hasPermission(key: string): boolean {
    const permissions = (this.userForm.get('permissions')?.value ?? []) as string[];
    return permissions.includes(key);
  }

  permissionCount(user: UserEntity): number {
    return user.permissions?.length ?? 0;
  }

  roleLabel(role: UserRole): string {
    return this.domain.roleLabel(role);
  }

  statusLabel(status: UserStatus): string {
    return this.domain.statusLabel(status);
  }

  roleVariant(role: UserRole) {
    return this.domain.roleVariant(role);
  }

  statusVariant(status: UserStatus) {
    return this.domain.statusVariant(status);
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.repository.getAll().subscribe({
      next: (users) => {
        this.users.set((users ?? []).map((user) => this.domain.normalizeUser(user)));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showToast('Load failed', 'danger', 'Error');
      },
    });
  }

  private bindFilters(): void {
    this.filtersForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.filters.set({
          search: value.search ?? '',
          roleType: value.roleType ?? null,
          status: value.status ?? null,
        });
      });
  }

  private bindRoleDefaults(): void {
    this.userForm
      .get('roleType')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => {
        if (!role) {
          return;
        }

        if (this.autoSyncRole()) {
          this.applyRoleDefaults(role as UserRole);
        }
      });
  }

  private setPasswordRequired(required: boolean): void {
    const passwordControl = this.userForm.get('password');
    if (!passwordControl) {
      return;
    }

    passwordControl.clearValidators();
    if (required) {
      passwordControl.setValidators([Validators.required, Validators.minLength(8)]);
    }
    passwordControl.updateValueAndValidity();
  }
}
