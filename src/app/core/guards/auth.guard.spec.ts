import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/students' } as RouterStateSnapshot;
  const loginTree = {} as UrlTree;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated']);
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue(loginTree);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('allows an authenticated user', () => {
    auth.isAuthenticated.and.returnValue(true);
    expect(TestBed.runInInjectionContext(() => authGuard(route, state))).toBeTrue();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirects an unauthenticated user to login', () => {
    auth.isAuthenticated.and.returnValue(false);
    expect(TestBed.runInInjectionContext(() => authGuard(route, state))).toBe(loginTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });

  it('denies an expired session according to AuthService state', () => {
    auth.isAuthenticated.and.returnValue(false);
    expect(TestBed.runInInjectionContext(() => authGuard(route, state))).toBe(loginTree);
  });
});
