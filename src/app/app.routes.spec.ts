import { appRoutes } from './app.routes';
import { ACCESS_POLICIES } from '@app/core/security/access-policy';

describe('appRoutes security contract', () => {
  const layout = appRoutes.find((route) => route.path === '');
  const protectedRoutes = layout?.children ?? [];
  const route = (path: string) => protectedRoutes.find((candidate) => candidate.path === path);

  it('keeps authentication routes public and the application layout protected', () => {
    expect(appRoutes.find((candidate) => candidate.path === 'auth')).toBeDefined();
    expect(layout?.canActivate).toBeDefined();
  });

  it('protects the main sensitive domains with both RBAC guards', () => {
    for (const path of ['students', 'attendance', 'payments', 'grades', 'settings']) {
      expect(route(path)?.canActivate).toEqual(jasmine.arrayContaining([jasmine.any(Function), jasmine.any(Function)]));
    }
  });

  it('declares representative central policies for direct URL navigation', () => {
    expect(route('students')?.data?.['accessPolicy']).toBe(ACCESS_POLICIES.studentsRead);
    expect(route('payments')?.data?.['accessPolicy']).toBe(ACCESS_POLICIES.paymentsRead);
    expect(route('settings')?.data?.['accessPolicy']).toBe(ACCESS_POLICIES.settingsRead);
  });

  it('keeps forbidden reachable inside the authenticated layout and preserves the fallback', () => {
    expect(route('forbidden')).toBeDefined();
    expect(route('forbidden')?.canActivate).toBeUndefined();
    expect(protectedRoutes.find((candidate) => candidate.path === '**')?.redirectTo).toBe('dashboard');
    expect(appRoutes.find((candidate) => candidate.path === '**')?.redirectTo).toBe('auth');
  });
});
