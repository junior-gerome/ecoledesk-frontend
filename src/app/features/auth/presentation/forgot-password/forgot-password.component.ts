import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { AuthService } from "@core/services/auth.service";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { FormBodyComponent } from "@app/shared/form-body/form-body.component";
import { ButtonComponent } from "@app/shared/ui/button/button.component";

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule, InputComponent, ButtonComponent, FormBodyComponent],
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.error = null;
      this.success = null;

      this.authService
        .forgotPassword(this.forgotPasswordForm.value.email)
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.success = this.translate.instant('auth.loginSuccess');
            setTimeout(() => {
              this.router.navigate(["/auth/login"]);
            }, 3000);
          },
          error: (err) => {
            this.isLoading = false;
            this.error = this.translate.instant('errors.serverError');
          },
        });
    }
  }
}
