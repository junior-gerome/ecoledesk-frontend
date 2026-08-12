import { APP_PERMISSIONS } from '@core/constants/permissions.constants';
import { ROLE_GROUPS } from '@core/constants/roles.constants';

/** Frontend rules improve UX only; the server must enforce every permission too. */
export interface AccessPolicy {
  readonly roles?: readonly string[];
  readonly permissions?: readonly string[];
  readonly requireAllPermissions?: boolean;
}

export const ACCESS_POLICIES = {
  authenticated: {} as AccessPolicy,
  dashboard: {} as AccessPolicy,
  // Legacy areas remain authenticated-only until their backend permission contract is confirmed.
  subjects: {} as AccessPolicy,
  parents: {} as AccessPolicy,
  communication: {} as AccessPolicy,
  support: {} as AccessPolicy,
  studentsRead: { roles: ROLE_GROUPS.STAFF, permissions: [APP_PERMISSIONS.STUDENTS_READ] },
  studentsWrite: { roles: ROLE_GROUPS.STAFF, permissions: [APP_PERMISSIONS.STUDENTS_WRITE] },
  teachersRead: { roles: ROLE_GROUPS.ACADEMIC, permissions: [APP_PERMISSIONS.TEACHERS_READ] },
  teachersWrite: { roles: ROLE_GROUPS.ACADEMIC, permissions: [APP_PERMISSIONS.TEACHERS_WRITE] },
  classesRead: { roles: ROLE_GROUPS.ACADEMIC, permissions: [APP_PERMISSIONS.CLASSES_READ] },
  classesWrite: { roles: ROLE_GROUPS.ACADEMIC, permissions: [APP_PERMISSIONS.CLASSES_WRITE] },
  attendanceRead: { roles: ROLE_GROUPS.STAFF, permissions: [APP_PERMISSIONS.ATTENDANCE_READ] },
  attendanceWrite: { roles: ROLE_GROUPS.STAFF, permissions: [APP_PERMISSIONS.ATTENDANCE_WRITE] },
  gradesRead: { roles: ROLE_GROUPS.ACADEMIC, permissions: [APP_PERMISSIONS.GRADES_READ] },
  gradesWrite: { roles: ROLE_GROUPS.ACADEMIC, permissions: [APP_PERMISSIONS.GRADES_WRITE] },
  paymentsRead: { roles: ROLE_GROUPS.FINANCE, permissions: [APP_PERMISSIONS.PAYMENTS_READ] },
  paymentsWrite: { roles: ROLE_GROUPS.FINANCE, permissions: [APP_PERMISSIONS.PAYMENTS_WRITE] },
  reportsRead: { permissions: [APP_PERMISSIONS.REPORTS_READ] },
  settingsRead: { roles: ROLE_GROUPS.ADMIN_ONLY, permissions: [APP_PERMISSIONS.SETTINGS_READ] },
  settingsWrite: { roles: ROLE_GROUPS.ADMIN_ONLY, permissions: [APP_PERMISSIONS.SETTINGS_WRITE] },
} as const satisfies Record<string, AccessPolicy>;

