import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RbacService } from '@app/core/security/rbac.service';
import { HasPermissionDirective } from './has-permission.directive';

@Component({
  standalone: true,
  imports: [HasPermissionDirective],
  template: '<span *hasPermission="permission">protected</span>',
})
class PermissionHostComponent { permission: string | readonly string[] = 'students:read'; }

describe('HasPermissionDirective', () => {
  let fixture: ComponentFixture<PermissionHostComponent>;
  let rbac: jasmine.SpyObj<RbacService>;

  beforeEach(() => {
    rbac = jasmine.createSpyObj<RbacService>('RbacService', ['hasEveryPermission'], { profile: null });
    TestBed.configureTestingModule({
      imports: [PermissionHostComponent],
      providers: [{ provide: RbacService, useValue: rbac }],
    });
    fixture = TestBed.createComponent(PermissionHostComponent);
  });

  it('renders content when the permission is present', () => {
    rbac.hasEveryPermission.and.returnValue(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('protected');
  });

  it('removes content when the permission is absent', () => {
    rbac.hasEveryPermission.and.returnValue(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('protected');
  });

  it('passes multiple permissions using AND semantics', () => {
    fixture.componentInstance.permission = ['students:read', 'students:write'];
    rbac.hasEveryPermission.and.returnValue(false);
    fixture.detectChanges();
    expect(rbac.hasEveryPermission).toHaveBeenCalledWith(['students:read', 'students:write']);
    expect(fixture.nativeElement.textContent).not.toContain('protected');
  });
});

