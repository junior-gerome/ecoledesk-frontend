import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RbacService } from '@app/core/security/rbac.service';
import { HasRoleDirective } from './has-role.directive';

@Component({
  standalone: true,
  imports: [HasRoleDirective],
  template: '<span *hasRole="roles">protected</span>',
})
class RoleHostComponent { roles: string | readonly string[] = ['ADMIN', 'TEACHER']; }

describe('HasRoleDirective', () => {
  let fixture: ComponentFixture<RoleHostComponent>;
  let rbac: jasmine.SpyObj<RbacService>;

  beforeEach(() => {
    rbac = jasmine.createSpyObj<RbacService>('RbacService', ['hasAnyRole'], { profile: null });
    TestBed.configureTestingModule({
      imports: [RoleHostComponent],
      providers: [{ provide: RbacService, useValue: rbac }],
    });
    fixture = TestBed.createComponent(RoleHostComponent);
  });

  it('renders content for an authorized role', () => {
    rbac.hasAnyRole.and.returnValue(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('protected');
  });

  it('removes content for an unauthorized role', () => {
    rbac.hasAnyRole.and.returnValue(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('protected');
  });

  it('supports multiple roles', () => {
    rbac.hasAnyRole.and.returnValue(true);
    fixture.detectChanges();
    expect(rbac.hasAnyRole).toHaveBeenCalledWith(['ADMIN', 'TEACHER']);
  });
});

