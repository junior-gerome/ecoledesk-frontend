import { HttpErrorResponse, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthService, LoginApiResponse } from '@app/core/services/auth.service';
import { TokenService } from '@app/core/authentication/token.service';
import { API_BASE_URL } from '@app/core/tokens/api-base-url.token';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let token: jasmine.SpyObj<TokenService>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    token = jasmine.createSpyObj<TokenService>('TokenService', ['getAccessToken']);
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['refreshSession', 'logout']);
    TestBed.configureTestingModule({
      providers: [
        { provide: TokenService, useValue: token },
        { provide: AuthService, useValue: auth },
        { provide: API_BASE_URL, useValue: 'http://api.test' },
      ],
    });
  });

  it('adds the current bearer token to API requests', () => {
    token.getAccessToken.and.returnValue('current-token');
    let captured!: HttpRequest<unknown>;
    const request = new HttpRequest('POST', 'http://api.test/students', { name: 'A' });

    TestBed.runInInjectionContext(() => authInterceptor(request, (req) => {
      captured = req;
      return of(new HttpResponse({ status: 200, body: req.url }));
    })).subscribe();

    expect(captured.headers.get('Authorization')).toBe('Bearer current-token');
    expect(captured.method).toBe('POST');
    expect(captured.body).toEqual({ name: 'A' });
  });

  it('does not send a null or undefined bearer token', () => {
    token.getAccessToken.and.returnValue(null);
    let captured!: HttpRequest<unknown>;
    const request = new HttpRequest('GET', '/students', null, { headers: new HttpHeaders({ 'X-Test': '1' }) });

    TestBed.runInInjectionContext(() => authInterceptor(request, (req) => {
      captured = req;
      return of(new HttpResponse({ status: 200, body: req.url }));
    })).subscribe();

    expect(captured.headers.has('Authorization')).toBeFalse();
    expect(captured.headers.get('X-Test')).toBe('1');
  });

  it('does not add a token to public auth endpoints', () => {
    token.getAccessToken.and.returnValue('token');
    let captured!: HttpRequest<unknown>;
    const request = new HttpRequest('POST', '/auth/login', { email: 'a@b.test' });

    TestBed.runInInjectionContext(() => authInterceptor(request, (req) => {
      captured = req;
      return of(new HttpResponse({ status: 200, body: req.url }));
    })).subscribe();

    expect(captured.headers.has('Authorization')).toBeFalse();
  });

  it('refreshes once after a protected 401 and retries with the new token', () => {
    token.getAccessToken.and.returnValues('expired-token', 'fresh-token');
    const response: LoginApiResponse = {
      token: 'fresh-token',
      refreshToken: 'refresh-token',
      userId: 1,
      userProfile: { id: 1, firstName: 'A', lastName: 'B', roleType: 'AGENT' },
    };
    auth.refreshSession.and.returnValue(of(response));
    const request = new HttpRequest('GET', '/students');
    const requests: HttpRequest<unknown>[] = [];
    let call = 0;

    TestBed.runInInjectionContext(() => authInterceptor(request, (req) => {
      requests.push(req);
      call += 1;
      return call === 1
        ? throwError(() => new HttpErrorResponse({ status: 401, url: req.url }))
        : of(new HttpResponse({ status: 200, body: req.url }));
    })).subscribe();

    expect(auth.refreshSession).toHaveBeenCalledTimes(1);
    expect(requests[1].headers.get('Authorization')).toBe('Bearer fresh-token');
  });
});


