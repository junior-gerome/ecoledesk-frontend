import { Routes } from '@angular/router';
import { APP_PERMISSIONS } from '@core/constants/permissions.constants';
import { ROLE_GROUPS } from '@core/constants/roles.constants';
import { authGuard } from '@core/guards/auth.guard';
import { permissionGuard } from '@core/guards/permission.guard';
import { roleGuard } from '@core/guards/role.guard';
import { ACCESS_POLICIES } from '@core/security/access-policy';
import { MainLayoutComponent } from './layout/MainLayout.component';

export const appRoutes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'search',
        loadComponent: () => import('./features/search/presentation/advanced-search.component').then((m) => m.AdvancedSearchComponent),
      },
      {
        path: 'dashboard',
                canActivate: [roleGuard, permissionGuard],
        data: { accessPolicy: ACCESS_POLICIES.dashboard },
loadComponent: () =>
          import('./features/dashboard/presentation/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'attendance',
        canActivate: [roleGuard, permissionGuard],
        data: {
          accessPolicy: ACCESS_POLICIES.attendanceRead,
          roles: ROLE_GROUPS.STAFF,
          permissions: [APP_PERMISSIONS.ATTENDANCE_READ],
        },
        loadChildren: () =>
          import('./features/attendance/attendance.routes').then(
            (m) => m.ATTENDANCE_ROUTES,
          ),
      },
      {
        path: 'pre-enrollments',
        canActivate: [roleGuard, permissionGuard],
        data: {
          accessPolicy: ACCESS_POLICIES.studentsRead,
          roles: ROLE_GROUPS.STAFF,
          permissions: [APP_PERMISSIONS.STUDENTS_READ],
        },
        loadChildren: () =>
          import('./features/pre-enrollments/pre-enrollments.routes').then(
            (m) => m.PRE_ENROLLMENTS_ROUTES,
          ),
      },
      {
        path: 'students',
        canActivate: [roleGuard, permissionGuard],
        data: {
          accessPolicy: ACCESS_POLICIES.studentsRead,
          roles: ROLE_GROUPS.STAFF,
          permissions: [APP_PERMISSIONS.STUDENTS_READ],
        },
        loadChildren: () =>
          import('./features/students/students.routes').then(
            (m) => m.STUDENTS_ROUTES,
          ),
      },
      {
        path: 'subjects',
                canActivate: [roleGuard, permissionGuard],
        data: { accessPolicy: ACCESS_POLICIES.subjects },
loadChildren: () =>
          import('./features/subjects/subject.routes').then(
            (m) => m.SubjectRoutes,
          ),
      },
      {
        path: 'teachers',
                canActivate: [roleGuard, permissionGuard],
        data: { accessPolicy: ACCESS_POLICIES.authenticated },
loadChildren: () =>
          import('./features/teachers/teachers.routes').then(
            (m) => m.TEACHERS_ROUTES,
          ),
      },
      {
        path: 'classes',
                canActivate: [roleGuard, permissionGuard],
        data: { accessPolicy: ACCESS_POLICIES.authenticated },
loadChildren: () =>
          import('./features/classes/classes.routes').then(
            (m) => m.CLASSES_ROUTES,
          ),
      },
      {
        path: 'trimestre',
                canActivate: [roleGuard, permissionGuard],
        data: { accessPolicy: ACCESS_POLICIES.authenticated },
loadChildren: () =>
          import('./features/trimestre/routes/trimestre.routes').then(
            (m) => m.TrimestreRoutes,
          ),
      },
      {
        path: 'sequence',
                canActivate: [roleGuard, permissionGuard],
        data: { accessPolicy: ACCESS_POLICIES.authenticated },
loadChildren: () =>
          import('./features/sequence/routes/sequence.routes').then(
            (m) => m.SequenceRoutes,
          ),
      },
      {
        path: 'payments',
        canActivate: [roleGuard, permissionGuard],
        data: {
          accessPolicy: ACCESS_POLICIES.paymentsRead,
          roles: ROLE_GROUPS.FINANCE,
          permissions: [APP_PERMISSIONS.PAYMENTS_READ],
        },
        loadChildren: () =>
          import('./features/payments/payments.routes').then(
            (m) => m.PAYMENTS_ROUTES,
          ),
      },
      {
        path: 'reports',
        canActivate: [permissionGuard],
        data: { accessPolicy: ACCESS_POLICIES.reportsRead, permissions: [APP_PERMISSIONS.REPORTS_READ] },
        loadChildren: () =>
          import('./features/reports/reports.routes').then(
            (m) => m.REPORTS_ROUTES,
          ),
      },
      {
        path: 'grades',
        canActivate: [roleGuard, permissionGuard],
        data: {
          accessPolicy: ACCESS_POLICIES.gradesRead,
          roles: ROLE_GROUPS.ACADEMIC,
          permissions: [APP_PERMISSIONS.GRADES_READ],
        },
        loadChildren: () =>
          import('./features/grades/grades.routes').then(
            (m) => m.GRADES_ROUTES,
          ),
      },
      {
        path: 'annees',
        canActivate: [roleGuard, permissionGuard],
        data: {
          accessPolicy: ACCESS_POLICIES.settingsWrite,
          roles: ROLE_GROUPS.ADMIN_ONLY,
          permissions: [APP_PERMISSIONS.SETTINGS_WRITE],
        },
        loadChildren: () =>
          import('./features/gestion-annees/annees.routes').then(
            (m) => m.GestionAnneesRoutes,
          ),
      },
      {
        path: 'montant',
        canActivate: [roleGuard, permissionGuard],
        data: {
          accessPolicy: ACCESS_POLICIES.paymentsWrite,
          roles: ROLE_GROUPS.FINANCE,
          permissions: [APP_PERMISSIONS.PAYMENTS_WRITE],
        },
        loadChildren: () =>
          import('./features/montant/montant.routes').then(
            (m) => m.MontantRoutes,
          ),
      },
      {
        path: 'staff',
        canActivate: [roleGuard, permissionGuard],
        data: {
          accessPolicy: ACCESS_POLICIES.settingsRead,
          roles: ROLE_GROUPS.ADMIN_ONLY,
          permissions: [APP_PERMISSIONS.SETTINGS_READ],
        },
        loadChildren: () =>
          import('./features/staff/staff.routes').then(
            (m) => m.STAFF_ROUTES,
          ),
      },
      {
        path: 'settings',
        canActivate: [roleGuard, permissionGuard],
        data: {
          accessPolicy: ACCESS_POLICIES.settingsRead,
          roles: ROLE_GROUPS.ADMIN_ONLY,
          permissions: [APP_PERMISSIONS.SETTINGS_READ],
        },
        loadChildren: () =>
          import('./features/settings/settings.routes').then(
            (m) => m.SETTINGS_ROUTES,
          ),
      },
      {
        path: 'section',
                canActivate: [roleGuard, permissionGuard],
        data: { accessPolicy: ACCESS_POLICIES.authenticated },
loadChildren: () =>
          import('./features/section/section.routes').then(
            (m) => m.SectionRoutes,
          ),
      },
      {
        path: 'parents',
        pathMatch: 'full',
        redirectTo: 'guardians',
      },
      {
        path: 'parents/links',
        redirectTo: 'guardians/links',
      },
      {
        path: 'parents/messages',
        redirectTo: 'guardians/messages',
      },
      {
        path: 'guardians',
                canActivate: [roleGuard, permissionGuard],
        data: { accessPolicy: ACCESS_POLICIES.parents },
loadChildren: () =>
          import('./features/parent/parent.routes').then(
            (m) => m.PARENT_ROUTES,
          ),
      },
      {
        path: 'communication',
                canActivate: [roleGuard, permissionGuard],
        data: { accessPolicy: ACCESS_POLICIES.communication },
loadChildren: () =>
          import('./features/communication/communication.routes').then(
            (m) => m.COMMUNICATION_ROUTES,
          ),
      },
      {
        path: 'support',
                canActivate: [roleGuard, permissionGuard],
        data: { accessPolicy: ACCESS_POLICIES.support },
loadChildren: () =>
          import('./features/support/support.routes').then(
            (m) => m.SUPPORT_ROUTES,
          ),
      },
      {
        path: 'forbidden',
        loadComponent: () =>
          import('./layout/forbidden/forbidden-page.component').then(
            (m) => m.ForbiddenPageComponent,
          ),
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];





