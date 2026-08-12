import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NotificationService } from '@app/core/notification/notification.service';
import { errorInterceptor } from './error.interceptor';
import { throwError } from 'rxjs';

describe('errorInterceptor', () => {
  let notifications: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;
  const request = new HttpRequest('GET', '/students');

  beforeEach(() => {
    notifications = jasmine.createSpyObj<NotificationService>('NotificationService', ['error']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        { provide: NotificationService, useValue: notifications },
        { provide: Router, useValue: router },
      ],
    });
  });

  function run(status: number, headers: Record<string, string> = {}) {
    let received: unknown;
    TestBed.runInInjectionContext(() => errorInterceptor(request, () =>
      throwError(() => new HttpErrorResponse({ status, url: request.url })))
    ).subscribe({ error: (error) => { received = error; } });
    return received as { status: number; statusGroup: string; isNetworkError: boolean };
  }

  it('redirects to login for 401 without disconnecting through the interceptor', () => {
    const error = run(401);
    expect(error.status).toBe(401);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('keeps the session and notifies for 403', () => {
    const error = run(403);
    expect(error.statusGroup).toBe('4xx');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalledTimes(1);
  });

  it('propagates 404 as an application error', () => {
    const error = run(404);
    expect(error.status).toBe(404);
    expect(notifications.error).toHaveBeenCalledTimes(1);
  });

  it('maps 500 to a generic server error without exposing a stack trace', () => {
    const error = run(500);
    expect(error.statusGroup).toBe('5xx');
    expect(notifications.error).toHaveBeenCalledTimes(1);
  });

  it('maps network errors and honors local silent handling', () => {
    const networkError = run(0);
    expect(networkError.isNetworkError).toBeTrue();

    const silentRequest = request.clone({ setHeaders: { 'X-Silent-Error': 'true' } });
    TestBed.runInInjectionContext(() => errorInterceptor(silentRequest, () =>
      throwError(() => new HttpErrorResponse({ status: 500 })))
    ).subscribe({ error: () => undefined });
    expect(notifications.error).toHaveBeenCalledTimes(1);
  });
});
