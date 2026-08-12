import { TestBed } from '@angular/core/testing';
import { BrowserApiService } from './browser-api.service';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let session: SessionService;
  let storage: Map<string, string>;

  beforeEach(() => {
    storage = new Map<string, string>();
    const area = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    };
    TestBed.configureTestingModule({
      providers: [SessionService, { provide: BrowserApiService, useValue: {
        sessionStorage: area,
        localStorage: area,
      } }],
    });
    session = TestBed.inject(SessionService);
  });

  it('stores and removes access and refresh tokens', () => {
    session.setToken('access');
    session.setRefreshToken('refresh');
    expect(session.getToken()).toBe('access');
    expect(session.getRefreshToken()).toBe('refresh');
    session.clearSession();
    expect(session.getToken()).toBeNull();
    expect(session.getRefreshToken()).toBeNull();
  });

  it('persists a valid profile and exposes its permissions', () => {
    session.setUserProfile({ id: 1, firstName: 'A', lastName: 'B', roleType: 'AGENT', permissions: ['students:read'] });
    expect(session.isAuthenticated()).toBeFalse();
    session.setToken('access');
    expect(session.isAuthenticated()).toBeTrue();
    expect(session.getUserProfile()?.permissions).toEqual(['students:read']);
  });

  it('rejects corrupted profile data and clears all identity state on logout', () => {
    storage.set('userProfile', '{invalid');
    expect(session.getUserProfile()).toBeNull();
    session.setToken('access');
    session.setUserId(42);
    session.clearSession();
    expect(session.getUserId()).toBeNull();
    expect(session.userProfile()).toBeNull();
  });
});
