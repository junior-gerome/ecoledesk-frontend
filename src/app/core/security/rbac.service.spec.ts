import { TestBed } from '@angular/core/testing';
import { SessionService } from '@app/core/services/session.service';
import { APP_PERMISSIONS } from '@app/core/constants/permissions.constants';
import { ROLE_GROUPS } from '@app/core/constants/roles.constants';
import { ACCESS_POLICIES } from './access-policy';
import { RbacService } from './rbac.service';

describe('RbacService', () => {
  const profile = {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    roleType: 'AGENT' as const,
    permissions: [APP_PERMISSIONS.STUDENTS_READ],
  };

  let session: { getUserProfile: jasmine.Spy };

  beforeEach(() => {
    session = { getUserProfile: jasmine.createSpy('getUserProfile').and.returnValue(profile) };
    TestBed.configureTestingModule({
      providers: [
        RbacService,
        { provide: SessionService, useValue: session },
      ],
    });
  });

  it('accepts a role from a multi-role group', () => {
    const rbac = TestBed.inject(RbacService);
    expect(rbac.hasAnyRole(ROLE_GROUPS.STAFF)).toBeTrue();
  });

  it('accepts an explicit permission and refuses an absent one', () => {
    const rbac = TestBed.inject(RbacService);
    expect(rbac.hasPermission(APP_PERMISSIONS.STUDENTS_READ)).toBeTrue();
    expect(rbac.hasPermission(APP_PERMISSIONS.STUDENTS_WRITE)).toBeFalse();
  });

  it('requires every permission by default', () => {
    const rbac = TestBed.inject(RbacService);
    expect(rbac.canAccess({
      permissions: [
        APP_PERMISSIONS.STUDENTS_READ,
        APP_PERMISSIONS.STUDENTS_WRITE,
      ],
    })).toBeFalse();
  });

  it('supports a policy requiring at least one permission', () => {
    const rbac = TestBed.inject(RbacService);
    expect(rbac.canAccess({
      permissions: [
        APP_PERMISSIONS.STUDENTS_READ,
        APP_PERMISSIONS.STUDENTS_WRITE,
      ],
      requireAllPermissions: false,
    })).toBeTrue();
  });

  it('allows the administrator wildcard', () => {
    session.getUserProfile.and.returnValue({ ...profile, roleType: 'ADMIN', permissions: [] });
    const rbac = TestBed.inject(RbacService);
    expect(rbac.canAccess(ACCESS_POLICIES.settingsRead)).toBeTrue();
  });
});

