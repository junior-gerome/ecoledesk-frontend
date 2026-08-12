import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { NotificationService } from '@app/core/notification/notification.service';
import { BrowserApiService } from './browser-api.service';
import { SessionService } from './session.service';
import { AuthService } from './auth.service';
import { TokenService } from '@app/core/authentication/token.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  let session: SessionService;

  beforeEach(() => {
    const store = new Map<string, string>();
    const area = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    };
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        SessionService,
        TokenService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BrowserApiService, useValue: { sessionStorage: area, localStorage: area } },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate']) },
        { provide: NotificationService, useValue: jasmine.createSpyObj<NotificationService>('NotificationService', ['connectAfterLogin', 'disconnect']) },
      ],
    });
    service = TestBed.inject(AuthService);
    session = TestBed.inject(SessionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('trims login email, persists tokens and updates authentication state', () => {
    let authenticated = false;
    service.isAuthenticated$.subscribe((value) => { authenticated = value; });
    service.login({ email: '  user@test.local  ', password: 'secret' }).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(request.request.body).toEqual({ email: 'user@test.local', password: 'secret' });
    request.flush({
      token: 'access-token',
      refreshToken: 'refresh-token',
      userId: 7,
      Email: 'user@test.local',
      userProfile: { firstName: 'User', lastName: 'Test', roleType: 'AGENT', permissions: ['students:read'] },
    });

    expect(session.getToken()).toBe('access-token');
    expect(session.getRefreshToken()).toBe('refresh-token');
    expect(session.getUserId()).toBe(7);
    expect(service.isAuthenticated()).toBeTrue();
    expect(authenticated).toBeTrue();
  });

  it('does not invent a refresh request when no refresh token exists', () => {
    let failed = false;
    service.refreshSession().subscribe({ error: () => { failed = true; } });
    expect(failed).toBeTrue();
    http.expectNone(`${environment.apiUrl}/auth/refresh`);
  });
});
