import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { AuthService } from "@core/services/auth.service";

@Component({
  selector: "app-reset-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputComponent, ButtonComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Nouveau mot de passe
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Saisissez le nouveau mot de passe associe au lien recu.
          </p>
        </div>

        <form class="mt-8 space-y-6" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <app-input
              label="Email"
              id="email"
              type="email"
              formControlName="email"
              [control]="form.get('email')"
              placeholder="Adresse email"
            />
            <app-input
              label="Jeton"
              id="resetToken"
              type="text"
              formControlName="resetToken"
              [control]="form.get('resetToken')"
              placeholder="Jeton de reinitialisation"
            />
            <app-input
              label="Nouveau mot de passe"
              id="newPassword"
              type="password"
              formControlName="newPassword"
              [control]="form.get('newPassword')"
              placeholder="Nouveau mot de passe"
            />
          </div>

          <app-button type="submit" variant="primary" [disabled]="form.invalid || isLoading">
            {{ isLoading ? "Enregistrement..." : "Changer le mot de passe" }}
          </app-button>

          <div class="text-center">
            <a routerLink="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
              Retour a la connexion
            </a>
          </div>
        </form>

        <div *ngIf="error" class="mt-4 text-center text-sm text-red-600">{{ error }}</div>
        <div *ngIf="success" class="mt-4 text-center text-sm text-green-600">{{ success }}</div>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent {
  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  form = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    resetToken: ["", [Validators.required]],
    newPassword: [
      "",
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.\-_@$!%*?&#])[A-Za-z\d.\-_@$!%*?&#]{8,}$/),
      ],
    ],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.form.patchValue({
      email: this.route.snapshot.queryParamMap.get("email") ?? "",
      resetToken: this.route.snapshot.queryParamMap.get("token") ?? "",
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.isLoading = true;
    this.error = null;
    this.success = null;

    this.auth
      .resetPassword({
        email: String(value.email),
        resetToken: String(value.resetToken),
        newPassword: String(value.newPassword),
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.success = "Mot de passe mis a jour.";
          setTimeout(() => void this.router.navigate(["/auth/login"]), 1500);
        },
        error: () => {
          this.isLoading = false;
          this.error = "Lien invalide ou expire.";
        },
      });
  }
}
