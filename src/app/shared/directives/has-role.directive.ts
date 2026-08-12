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
  selector: '[hasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private readonly rbac = inject(RbacService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly requiredRoles = signal<string | readonly string[]>([]);
  private readonly hasInput = signal(false);

  @Input({ required: true })
  set hasRole(value: string | readonly string[]) {
    this.requiredRoles.set(value);
    this.hasInput.set(true);
  }

  private readonly roleEffect = effect(() => {
    this.requiredRoles();
    this.rbac.profile;
    if (!this.hasInput()) return;

    this.viewContainer.clear();
    const input = this.requiredRoles();
    const roles: readonly string[] = typeof input === 'string' ? [input] : input;
    if (this.rbac.hasAnyRole(roles)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  });
}



