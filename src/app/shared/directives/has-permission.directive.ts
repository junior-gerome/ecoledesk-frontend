import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RbacService } from '@core/security/rbac.service';

@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly rbac = inject(RbacService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly requiredPermissions = signal<string | readonly string[]>([]);
  private readonly hasInput = signal(false);

  @Input({ required: true })
  set hasPermission(value: string | readonly string[]) {
    this.requiredPermissions.set(value);
    this.hasInput.set(true);
  }

  private readonly permissionEffect = effect(() => {
    const input = this.requiredPermissions();
    this.rbac.profile;
    if (!this.hasInput()) return;

    this.viewContainer.clear();
    const permissions: readonly string[] =
      typeof input === 'string' ? [input] : input;
    if (this.rbac.hasEveryPermission(permissions)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  });
}

