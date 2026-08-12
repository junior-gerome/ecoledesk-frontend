
import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { AppError } from "@core/errors/app-error.model";
import { AuthService } from "@core/services/auth.service";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { FormBodyComponent } from "@app/shared/form-body/form-body.component";
import { SchoolIllustrationComponent } from "@app/shared/schoolIllustration/school-illustration.component";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputComponent, FormBodyComponent, TranslateModule, SchoolIllustrationComponent],
  templateUrl: `./login.component.html`,
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  message: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params["registered"]) {
        this.message = this.translate.instant('auth.loginSuccess');
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        void this.router.navigate(["/dashboard"]);
      },
      error: (err: AppError) => {
        this.isLoading = false;
        this.error =
          err.status === 400
            ? this.formatValidationError(err)
            : err.status === 429
              ? err.message
            : "Email ou mot de passe incorrect";
      },
    });
  }

  private formatValidationError(err: AppError): string {
    const details = err.details as Record<string, unknown> | undefined;
    if (!details) {
      return err.message || "Donnees de connexion invalides.";
    }

    const fieldErrors = details["errors"] ?? details["fieldErrors"];
    if (Array.isArray(fieldErrors)) {
      return fieldErrors
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }
          const entry = item as { defaultMessage?: string; message?: string };
          return entry.defaultMessage ?? entry.message ?? "";
        })
        .filter(Boolean)
        .join(" ");
    }

    if (typeof fieldErrors === "object" && fieldErrors !== null) {
      return Object.values(fieldErrors as Record<string, string>).join(" ");
    }

    const message = details["message"];
    return typeof message === "string" ? message : "Donnees de connexion invalides.";
  }
}
