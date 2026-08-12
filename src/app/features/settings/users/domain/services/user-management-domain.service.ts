import { Injectable } from '@angular/core';
import { APP_PERMISSIONS } from '@app/core/constants/permissions.constants';
import { BadgeVariant } from '@app/shared/ui/badge/badge.component';
import {
  PermissionDef,
  PermissionGroup,
  UserEntity,
  UserFilters,
  UserRole,
  UserStatus,
  UserWritePayload,
} from '../models/user.entity';

@Injectable()
export class UserManagementDomainService {
  readonly roleOptions: Array<{ value: UserRole; label: string }> = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'AGENT', label: 'Agent' },
    { value: 'ENSEIGNANT', label: 'Enseignant' },
    { value: 'PARENT', label: 'Parent' },
    { value: 'ELEVE', label: 'Eleve' },
  ];

  readonly statusOptions: Array<{ value: UserStatus; label: string }> = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'PENDING', label: 'Pending' },
  ];

  readonly permissionDefs: PermissionDef[] = [
    {
      key: APP_PERMISSIONS.USERS_READ,
      label: 'Users read',
      description: 'View users list and details',
      group: 'Users',
    },
    {
      key: APP_PERMISSIONS.USERS_WRITE,
      label: 'Users write',
      description: 'Create or update users',
      group: 'Users',
    },
    {
      key: APP_PERMISSIONS.USERS_RIGHTS,
      label: 'Users rights',
      description: 'Manage user permissions',
      group: 'Users',
    },
    {
      key: APP_PERMISSIONS.STUDENTS_READ,
      label: 'Students read',
      description: 'View students data',
      group: 'Students',
    },
    {
      key: APP_PERMISSIONS.STUDENTS_WRITE,
      label: 'Students write',
      description: 'Create or update students',
      group: 'Students',
    },
    {
      key: APP_PERMISSIONS.TEACHERS_READ,
      label: 'Teachers read',
      description: 'View teachers data',
      group: 'Teachers',
    },
    {
      key: APP_PERMISSIONS.TEACHERS_WRITE,
      label: 'Teachers write',
      description: 'Create or update teachers',
      group: 'Teachers',
    },
    {
      key: APP_PERMISSIONS.CLASSES_READ,
      label: 'Classes read',
      description: 'View classes and sections',
      group: 'Classes',
    },
    {
      key: APP_PERMISSIONS.CLASSES_WRITE,
      label: 'Classes write',
      description: 'Create or update classes',
      group: 'Classes',
    },
    {
      key: APP_PERMISSIONS.ATTENDANCE_READ,
      label: 'Attendance read',
      description: 'View attendance records',
      group: 'Attendance',
    },
    {
      key: APP_PERMISSIONS.ATTENDANCE_WRITE,
      label: 'Attendance write',
      description: 'Create or update attendance',
      group: 'Attendance',
    },
    {
      key: APP_PERMISSIONS.GRADES_READ,
      label: 'Grades read',
      description: 'View grades and report cards',
      group: 'Grades',
    },
    {
      key: APP_PERMISSIONS.GRADES_WRITE,
      label: 'Grades write',
      description: 'Create or update grades',
      group: 'Grades',
    },
    {
      key: APP_PERMISSIONS.PAYMENTS_READ,
      label: 'Payments read',
      description: 'View payments',
      group: 'Payments',
    },
    {
      key: APP_PERMISSIONS.PAYMENTS_WRITE,
      label: 'Payments write',
      description: 'Create or update payments',
      group: 'Payments',
    },
    {
      key: APP_PERMISSIONS.SETTINGS_READ,
      label: 'Settings read',
      description: 'View settings',
      group: 'Settings',
    },
    {
      key: APP_PERMISSIONS.SETTINGS_WRITE,
      label: 'Settings write',
      description: 'Update settings',
      group: 'Settings',
    },
  ];

  readonly roleDefaults: Record<UserRole, string[]> = {
    ADMIN: this.permissionDefs.map((permission) => permission.key),
    AGENT: [
      APP_PERMISSIONS.STUDENTS_READ,
      APP_PERMISSIONS.STUDENTS_WRITE,
      APP_PERMISSIONS.CLASSES_READ,
      APP_PERMISSIONS.ATTENDANCE_READ,
      APP_PERMISSIONS.ATTENDANCE_WRITE,
      APP_PERMISSIONS.GRADES_READ,
      APP_PERMISSIONS.PAYMENTS_READ,
      APP_PERMISSIONS.PAYMENTS_WRITE,
    ],
    ENSEIGNANT: [
      APP_PERMISSIONS.STUDENTS_READ,
      APP_PERMISSIONS.CLASSES_READ,
      APP_PERMISSIONS.ATTENDANCE_READ,
      APP_PERMISSIONS.ATTENDANCE_WRITE,
      APP_PERMISSIONS.GRADES_READ,
      APP_PERMISSIONS.GRADES_WRITE,
    ],
    PARENT: [APP_PERMISSIONS.GRADES_READ, APP_PERMISSIONS.ATTENDANCE_READ],
    ELEVE: [APP_PERMISSIONS.GRADES_READ, APP_PERMISSIONS.ATTENDANCE_READ],
  };

  readonly permissionGroups: PermissionGroup[] =
    this.buildPermissionGroups(this.permissionDefs);

  filterUsers(users: UserEntity[], filters: UserFilters): UserEntity[] {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch);
      const matchesRole = !filters.roleType || user.roleType === filters.roleType;
      const matchesStatus = !filters.status || user.status === filters.status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  normalizeUser(user: UserEntity): UserEntity {
    return {
      ...user,
      permissions: Array.isArray(user.permissions)
        ? user.permissions.map((permission) => this.normalizePermission(permission))
        : [],
    };
  }

  buildPayload(rawValue: {
    firstName?: unknown;
    lastName?: unknown;
    email?: unknown;
    roleType?: unknown;
    status?: unknown;
    permissions?: unknown;
    password?: unknown;
  }): UserWritePayload {
    const permissions = Array.isArray(rawValue.permissions)
      ? rawValue.permissions.filter((permission): permission is string =>
          typeof permission === 'string',
        ).map((permission) => this.normalizePermission(permission))
      : [];

    const payload: UserWritePayload = {
      firstName: String(rawValue.firstName ?? '').trim(),
      lastName: String(rawValue.lastName ?? '').trim(),
      email: String(rawValue.email ?? '').trim().toLowerCase(),
      roleType: rawValue.roleType as UserRole,
      status: rawValue.status as UserStatus,
      permissions,
    };

    const password = String(rawValue.password ?? '').trim();
    if (password) {
      payload.password = password;
    }

    return payload;
  }

  roleLabel(role: UserRole): string {
    const found = this.roleOptions.find((option) => option.value === role);
    return found?.label ?? role;
  }

  statusLabel(status: UserStatus): string {
    const found = this.statusOptions.find((option) => option.value === status);
    return found?.label ?? status;
  }

  roleVariant(role: UserRole): BadgeVariant {
    if (role === 'ADMIN') {
      return 'danger';
    }

    if (role === 'ENSEIGNANT') {
      return 'success';
    }

    if (role === 'AGENT') {
      return 'info';
    }

    if (role === 'ELEVE') {
      return 'warning';
    }

    return 'neutral';
  }

  statusVariant(status: UserStatus): BadgeVariant {
    if (status === 'ACTIVE') {
      return 'success';
    }

    if (status === 'SUSPENDED') {
      return 'danger';
    }

    return 'warning';
  }

  private buildPermissionGroups(list: PermissionDef[]): PermissionGroup[] {
    const groupMap = new Map<string, PermissionDef[]>();

    list.forEach((permission) => {
      if (!groupMap.has(permission.group)) {
        groupMap.set(permission.group, []);
      }
      groupMap.get(permission.group)?.push(permission);
    });

    return Array.from(groupMap.entries()).map(([group, items]) => ({
      group,
      items,
    }));
  }

  private normalizePermission(permission: string): string {
    return permission.trim().replace('.', ':');
  }
}
