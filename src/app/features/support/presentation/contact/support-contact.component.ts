import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { SupportPriority, SupportTicketPayload } from "@app/features/support/domain/models";
import { SupportService } from "@app/features/support/infrastructure/support.service";
import { FormBodyComponent } from "@app/shared/form-body/form-body.component";
import { PageFormBodyComponent } from "@app/shared/page-form-body/page-form-body.component";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { SelectComponent, SelectOption } from "@app/shared/ui/select/select.component";
import { TextareaComponent } from "@app/shared/ui/textarea/textarea.component";
import { ToastComponent, ToastVariant } from "@app/shared/ui/toast/toast.component";

@Component({
  selector: "app-support-contact",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    FormBodyComponent,
    InputComponent,
    PageFormBodyComponent,
    PageHeaderComponent,
    PageLayoutComponent,
    SelectComponent,
    TextareaComponent,
    ToastComponent,
    TranslateModule,
  ],
  templateUrl: "./support-contact.component.html",
  styleUrls: ["./support-contact.component.scss"],
})
export class SupportContactComponent {
  private readonly supportService = inject(SupportService);
  private readonly fb = inject(FormBuilder);

  saving = signal(false);

  toast = signal<{
    visible: boolean;
    title: string;
    message: string;
    variant: ToastVariant;
  }>({
    visible: false,
    title: "",
    message: "",
    variant: "info",
  });

  readonly priorityOptions: SelectOption<SupportPriority>[] = [
    { value: "LOW", label: "Basse" },
    { value: "MEDIUM", label: "Moyenne" },
    { value: "HIGH", label: "Haute" },
  ];

  contactForm = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    email: ["", [Validators.required, Validators.email]],
    subject: ["", [Validators.required, Validators.minLength(3)]],
    priority: ["MEDIUM" as SupportPriority, Validators.required],
    message: ["", [Validators.required, Validators.minLength(10)]],
  });

  get ctrl() {
    return this.contactForm.controls;
  }

  resetForm(): void {
    this.contactForm.reset({ name: "", email: "", subject: "", priority: "MEDIUM", message: "" });
  }

  hideToast(): void {
    this.toast.update((current) => ({ ...current, visible: false }));
  }

  submit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const payload: SupportTicketPayload = {
      name: String(this.contactForm.value.name ?? "").trim(),
      email: String(this.contactForm.value.email ?? "").trim().toLowerCase(),
      subject: String(this.contactForm.value.subject ?? "").trim(),
      priority: this.contactForm.value.priority as SupportPriority,
      message: String(this.contactForm.value.message ?? "").trim(),
    };

    this.saving.set(true);
    this.supportService.createTicket(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.contactForm.reset({
          name: "",
          email: "",
          subject: "",
          priority: "MEDIUM",
          message: "",
        });
        this.showToast("Demande envoyée avec succès", "success", "Succès");
      },
      error: () => {
        this.saving.set(false);
        this.showToast("Échec de l'envoi de la demande", "danger", "Erreur");
      },
    });
  }

  private showToast(message: string, variant: ToastVariant, title = ""): void {
    this.toast.set({ visible: true, title, message, variant });
  }
}
