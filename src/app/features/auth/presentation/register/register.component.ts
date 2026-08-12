import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import {
  AuthService,
  RegisterRequest,
} from "@app/core/services";
import { FormBodyComponent } from "@app/shared/form-body/form-body.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import {
  SelectComponent,
  SelectOption,
} from "@app/shared/ui/select/select.component";
import { SchoolIllustrationComponent } from "@app/shared/schoolIllustration/school-illustration.component";

type RegisterFormValue = RegisterRequest & {
  confirmPassword: string;
};

@Component({
  selector: "app-register",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    InputComponent,
    SelectComponent,
    FormBodyComponent, 
    SchoolIllustrationComponent,
  ],
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  roles: SelectOption<string>[] = [
    { label: "Parent", value: "PARENT" },
    { label: "Eleve", value: "ELEVE" },
    { label: "Administrateur", value: "ADMIN" },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: ["", [Validators.required, Validators.minLength(2)]],
        lastName: ["", [Validators.required, Validators.minLength(2)]],
        email: ["", [Validators.required, Validators.email]],
        password: [
          "",
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.\-_@$!%*?&#])[A-Za-z\d.\-_@$!%*?&#]{8,}$/,
            ),
          ],
        ],
        confirmPassword: ["", Validators.required],
        roleType: ["PARENT", Validators.required],
        referenceId: [""],
      },
      { validators: this.passwordsMatch },
    );
  }

  private passwordsMatch(group: FormGroup) {
    return group.get("password")!.value === group.get("confirmPassword")!.value
      ? null
      : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const { confirmPassword, ...data } =
      this.registerForm.getRawValue() as RegisterFormValue;

    if (!data.referenceId) {
      data.referenceId = undefined;
    }

    this.auth.register(data as RegisterRequest).subscribe({
      next: () => {
        this.isLoading = false;
        void this.router.navigate(["/auth/login"], {
          queryParams: { registered: "true" },
        });
      },
      error: (err: {
        message?: string;
        error?: { message?: string; error?: string };
      }) => {
        this.isLoading = false;
        this.error =
          err.message ||
          err.error?.message ||
          err.error?.error ||
          "Erreur lors de l'inscription, veuillez reessayer.";
      },
    });
  }
}
