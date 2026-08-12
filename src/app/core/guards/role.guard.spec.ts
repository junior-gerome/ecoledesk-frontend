import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RbacService } from '@app/core/security/rbac.service';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  let rbac: jasmine.SpyObj<RbacService>;
  let router: jasmine.SpyObj<Router>;
  const forbiddenTree = {} as UrlTree;

  beforeEach(() => {
    rbac = jasmine.createSpyObj<RbacService>('RbacService', ['hasAnyRole']);
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue(forbiddenTree);
    TestBed.configureTestingModule({
      providers: [
        { provide: RbacService, useValue: rbac },
        { provide: Router, useValue: router },
      ],
    });
  });

  const guard = (data: Record<string, unknown>) =>
    TestBed.runInInjectionContext(() => roleGuard({ data } as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

  it('allows the exact required role', () => {
    rbac.hasAnyRole.and.returnValue(true);
    expect(guard({ roles: ['ADMIN'] })).toBeTrue();
    expect(rbac.hasAnyRole).toHaveBeenCalledWith(['ADMIN']);
  });

  it('allows a role from the configured group', () => {
    rbac.hasAnyRole.and.returnValue(true);
    expect(guard({ roles: ['AGENT', 'TEACHER', 'ADMIN'] })).toBeTrue();
  });

  it('redirects a user with an unauthorized role to forbidden', () => {
    rbac.hasAnyRole.and.returnValue(false);
    expect(guard({ roles: ['ADMIN'] })).toBe(forbiddenTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/forbidden']);
  });

  it('redirects a session without a role without throwing', () => {
    rbac.hasAnyRole.and.returnValue(false);
    expect(guard({ roles: ['ADMIN'] })).toBe(forbiddenTree);
  });

  it('allows an authenticated route with no role declaration', () => {
    expect(guard({})).toBeTrue();
    expect(rbac.hasAnyRole).not.toHaveBeenCalled();
  });

  it('prefers the central access policy over legacy route data', () => {
    rbac.hasAnyRole.and.returnValue(true);
    expect(guard({ roles: ['STAFF'], accessPolicy: { roles: ['ADMIN'] } })).toBeTrue();
    expect(rbac.hasAnyRole).toHaveBeenCalledWith(['ADMIN']);
  });
});

