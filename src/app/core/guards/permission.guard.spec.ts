import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RbacService } from '@app/core/security/rbac.service';
import { permissionGuard } from './permission.guard';

describe('permissionGuard', () => {
  let rbac: jasmine.SpyObj<RbacService>;
  let router: jasmine.SpyObj<Router>;
  const forbiddenTree = {} as UrlTree;

  beforeEach(() => {
    rbac = jasmine.createSpyObj<RbacService>('RbacService', ['hasPermission', 'hasEveryPermission']);
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
    TestBed.runInInjectionContext(() => permissionGuard({ data } as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

  it('allows a user with the required permission', () => {
    rbac.hasEveryPermission.and.returnValue(true);
    expect(guard({ permissions: ['students:read'] })).toBeTrue();
  });

  it('redirects a user without the required permission', () => {
    rbac.hasEveryPermission.and.returnValue(false);
    expect(guard({ permissions: ['settings:read'] })).toBe(forbiddenTree);
  });

  it('requires every permission by default', () => {
    rbac.hasEveryPermission.and.returnValue(false);
    expect(guard({ permissions: ['students:read', 'students:write'] })).toBe(forbiddenTree);
    expect(rbac.hasEveryPermission).toHaveBeenCalledWith(['students:read', 'students:write']);
  });

  it('supports OR policies when explicitly configured', () => {
    rbac.hasPermission.withArgs('reports:read').and.returnValue(true);
    rbac.hasPermission.withArgs('reports:export').and.returnValue(false);
    expect(guard({ accessPolicy: {
      permissions: ['reports:read', 'reports:export'],
      requireAllPermissions: false,
    } })).toBeTrue();
  });

  it('allows a route with an empty permission declaration', () => {
    expect(guard({ permissions: [] })).toBeTrue();
    expect(rbac.hasEveryPermission).not.toHaveBeenCalled();
  });

  it('uses the central policy for combined role and permission metadata', () => {
    rbac.hasEveryPermission.and.returnValue(true);
    expect(guard({ permissions: ['wrong'], accessPolicy: { permissions: ['students:read'] } })).toBeTrue();
    expect(rbac.hasEveryPermission).toHaveBeenCalledWith(['students:read']);
  });
});

