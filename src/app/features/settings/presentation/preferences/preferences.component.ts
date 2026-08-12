import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  AppPreferences,
  DateFormat,
  PreferencesService,
  TimeFormat,
  WeekStart,
} from "@app/features/settings/infrastructure/preferences.service";
import { ThemeMode, ThemeService } from "@app/core/services/theme/theme.service";
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { CardComponent } from "@app/shared/ui/card/card.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { SelectComponent, SelectOption } from "@app/shared/ui/select/select.component";
import { TextareaComponent } from "@app/shared/ui/textarea/textarea.component";
import { ToastComponent, ToastVariant } from "@app/shared/ui/toast/toast.component";
import {
  BulletinBrandingConfig,
  BulletinBrandingEditorValue,
  BulletinBrandingService,
  DEFAULT_BULLETIN_BRANDING_CONFIG,
} from "@app/features/grades/infrastructure/services/bulletin-branding.service";

type BulletinBrandingFormValue = Partial<
  Record<keyof BulletinBrandingEditorValue, string | null>
>;

@Component({
  selector: "app-preferences",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    PageHeaderComponent,
    PageLayoutComponent,
    SelectComponent,
    TextareaComponent,
    ToastComponent,
  ],
  templateUrl: "./preferences.component.html",
  styleUrls: ["./preferences.component.scss"],
})
export class PreferencesComponent {
  private readonly preferencesService = inject(PreferencesService);
  private readonly bulletinBrandingService = inject(BulletinBrandingService);
  private readonly themeService = inject(ThemeService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  loading = signal(false);
  saving = signal(false);
  brandingLoading = signal(false);
  brandingSaving = signal(false);
  brandingLogoPreviewFailed = signal(false);

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

  readonly yesNoOptions: SelectOption<boolean>[] = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];

  readonly languageOptions: SelectOption<string>[] = [
    { value: "fr", label: "French" },
    { value: "en", label: "English" },
  ];

  readonly timezoneOptions: SelectOption<string>[] = [
    { value: "Africa/Douala", label: "Africa/Douala" },
    { value: "UTC", label: "UTC" },
    { value: "Europe/Paris", label: "Europe/Paris" },
  ];

  readonly currencyOptions: SelectOption<string>[] = [
    { value: "XAF", label: "XAF (FCFA)" },
    { value: "EUR", label: "EUR" },
    { value: "USD", label: "USD" },
  ];

  readonly dateFormatOptions: SelectOption<DateFormat>[] = [
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  ];

  readonly timeFormatOptions: SelectOption<TimeFormat>[] = [
    { value: "24h", label: "24h" },
    { value: "12h", label: "12h" },
  ];

  readonly themeOptions: SelectOption<ThemeMode>[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];

  readonly weekStartOptions: SelectOption<WeekStart>[] = [
    { value: "MONDAY", label: "Monday" },
    { value: "SUNDAY", label: "Sunday" },
  ];

  readonly defaultPreferences: AppPreferences = {
    schoolName: "",
    schoolCode: "",
    schoolEmail: "",
    schoolPhone: "",
    schoolWebsite: "",
    schoolAddress: "",
    language: "fr",
    timezone: "Africa/Douala",
    currency: "XAF",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    theme: "light",
    startOfWeek: "MONDAY",
    pageSize: 25,
    notifyEmail: true,
    notifySms: false,
    notifyAbsence: true,
    notifyGrades: true,
    requireTwoFactor: false,
    sessionTimeoutMinutes: 30,
    passwordMinLength: 8,
  };

  readonly defaultBulletinBranding: BulletinBrandingEditorValue =
    this.toBrandingEditorValue(DEFAULT_BULLETIN_BRANDING_CONFIG);

  readonly bulletinBrandingPreview = signal<BulletinBrandingEditorValue>(
    this.defaultBulletinBranding,
  );

  preferencesForm = this.fb.group({
    schoolName: ["", [Validators.required, Validators.minLength(2)]],
    schoolCode: [""],
    schoolEmail: ["", [Validators.required, Validators.email]],
    schoolPhone: [""],
    schoolWebsite: [""],
    schoolAddress: [""],
    language: ["fr", Validators.required],
    timezone: ["Africa/Douala", Validators.required],
    currency: ["XAF", Validators.required],
    dateFormat: ["DD/MM/YYYY" as DateFormat, Validators.required],
    timeFormat: ["24h" as TimeFormat, Validators.required],
    theme: ["light" as ThemeMode, Validators.required],
    startOfWeek: ["MONDAY" as WeekStart, Validators.required],
    pageSize: [25, [Validators.required, Validators.min(5), Validators.max(100)]],
    notifyEmail: [true],
    notifySms: [false],
    notifyAbsence: [true],
    notifyGrades: [true],
    requireTwoFactor: [false],
    sessionTimeoutMinutes: [30, [Validators.required, Validators.min(5), Validators.max(240)]],
    passwordMinLength: [8, [Validators.required, Validators.min(6), Validators.max(32)]],
  });

  bulletinBrandingForm = this.fb.group({
    logoUrl: [this.defaultBulletinBranding.logoUrl],
    institutionLinesText: [this.defaultBulletinBranding.institutionLinesText],
    contactLine: [this.defaultBulletinBranding.contactLine],
    documentTitle: [this.defaultBulletinBranding.documentTitle],
    documentSubtitle: [this.defaultBulletinBranding.documentSubtitle],
    footerLinesText: [this.defaultBulletinBranding.footerLinesText],
    parentSignatureLabel: [this.defaultBulletinBranding.parentSignatureLabel],
    teacherSignatureLabel: [this.defaultBulletinBranding.teacherSignatureLabel],
    headSignatureLabel: [this.defaultBulletinBranding.headSignatureLabel],
    accentColor: [this.defaultBulletinBranding.accentColor],
    secondaryColor: [this.defaultBulletinBranding.secondaryColor],
  });

  get ctrl() {
    return this.preferencesForm.controls;
  }

  get bulletinCtrl() {
    return this.bulletinBrandingForm.controls;
  }

  constructor() {
    this.loadPreferences();
    this.loadBulletinBranding();

    this.bulletinBrandingForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateBrandingPreview();
      });
  }

  showToast(message: string, variant: ToastVariant, title = ""): void {
    this.toast.set({ visible: true, title, message, variant });
  }

  hideToast(): void {
    this.toast.update((current) => ({ ...current, visible: false }));
  }

  loadPreferences(): void {
    this.loading.set(true);
    this.preferencesService.get().subscribe({
      next: (prefs) => {
        const merged = { ...this.defaultPreferences, ...(prefs ?? {}) };
        this.preferencesForm.reset(merged);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showToast("Failed to load preferences", "danger", "Error");
      },
    });
  }

  resetDefaults(): void {
    this.preferencesForm.reset({ ...this.defaultPreferences });
    this.showToast("Defaults loaded", "info", "Defaults");
  }

  savePreferences(): void {
    if (this.preferencesForm.invalid) {
      this.preferencesForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();

    this.saving.set(true);
    this.preferencesService.update(payload).subscribe({
      next: (updated) => {
        const merged = { ...this.defaultPreferences, ...(updated ?? payload) };
        this.preferencesForm.reset(merged);
        this.saving.set(false);
        this.themeService.setTheme(merged.theme);
        this.showToast("Preferences saved", "success", "Success");
      },
      error: () => {
        this.saving.set(false);
        this.showToast("Save failed", "danger", "Error");
      },
    });
  }

  loadBulletinBranding(): void {
    this.brandingLoading.set(true);
    this.bulletinBrandingService.getEditorValue().subscribe({
      next: (value) => {
        const normalized = this.normalizeBrandingValue(value);
        this.bulletinBrandingForm.reset(normalized);
        this.updateBrandingPreview(normalized);
        this.brandingLoading.set(false);
      },
      error: () => {
        this.brandingLoading.set(false);
        this.showToast(
          "Impossible de charger le branding du bulletin",
          "danger",
          "Bulletin",
        );
      },
    });
  }

  saveBulletinBranding(): void {
    const payload = this.normalizeBrandingValue(
      this.bulletinBrandingForm.getRawValue(),
    );

    this.brandingSaving.set(true);

    try {
      const config = this.bulletinBrandingService.saveEditorValue(payload);
      const nextValue = this.toBrandingEditorValue(config);
      this.bulletinBrandingForm.reset(nextValue);
      this.updateBrandingPreview(nextValue);
      this.brandingSaving.set(false);
      this.showToast(
        "Le branding du bulletin a ete enregistre",
        "success",
        "Bulletin",
      );
    } catch {
      this.brandingSaving.set(false);
      this.showToast(
        "L'enregistrement du branding a echoue",
        "danger",
        "Bulletin",
      );
    }
  }

  resetBulletinBranding(): void {
    const config = this.bulletinBrandingService.resetEditorValue();
    const nextValue = this.toBrandingEditorValue(config);
    this.bulletinBrandingForm.reset(nextValue);
    this.updateBrandingPreview(nextValue);
    this.showToast(
      "Le branding du bulletin a ete reinitialise",
      "info",
      "Bulletin",
    );
  }

  getBrandingPreviewInstitutionLines(): string[] {
    return this.parseMultiline(
      this.bulletinBrandingPreview().institutionLinesText,
      DEFAULT_BULLETIN_BRANDING_CONFIG.institutionLines,
    );
  }

  getBrandingPreviewFooterLines(): string[] {
    return this.parseMultiline(
      this.bulletinBrandingPreview().footerLinesText,
      DEFAULT_BULLETIN_BRANDING_CONFIG.footerLines,
    );
  }

  getBrandingPreviewLogoUrl(): string {
    return this.cleanString(this.bulletinBrandingPreview().logoUrl);
  }

  hasBrandingPreviewLogo(): boolean {
    return !!this.getBrandingPreviewLogoUrl() && !this.brandingLogoPreviewFailed();
  }

  getBrandingPreviewAccentColor(): string {
    return this.normalizeColor(
      this.bulletinBrandingPreview().accentColor,
      DEFAULT_BULLETIN_BRANDING_CONFIG.accentColor,
    );
  }

  getBrandingPreviewSecondaryColor(): string {
    return this.normalizeColor(
      this.bulletinBrandingPreview().secondaryColor,
      DEFAULT_BULLETIN_BRANDING_CONFIG.secondaryColor,
    );
  }

  getBrandingPreviewField(
    key: keyof BulletinBrandingEditorValue,
    fallback: string,
  ): string {
    return this.cleanString(this.bulletinBrandingPreview()[key]) || fallback;
  }

  onBrandingLogoError(): void {
    this.brandingLogoPreviewFailed.set(true);
  }

  private buildPayload(): AppPreferences {
    const raw = this.preferencesForm.getRawValue();

    return {
      schoolName: String(raw.schoolName ?? "").trim(),
      schoolCode: String(raw.schoolCode ?? "").trim(),
      schoolEmail: String(raw.schoolEmail ?? "").trim(),
      schoolPhone: String(raw.schoolPhone ?? "").trim(),
      schoolWebsite: String(raw.schoolWebsite ?? "").trim(),
      schoolAddress: String(raw.schoolAddress ?? "").trim(),
      language: String(raw.language ?? "fr"),
      timezone: String(raw.timezone ?? "Africa/Douala"),
      currency: String(raw.currency ?? "XAF"),
      dateFormat: raw.dateFormat as DateFormat,
      timeFormat: raw.timeFormat as TimeFormat,
      theme: raw.theme as ThemeMode,
      startOfWeek: raw.startOfWeek as WeekStart,
      pageSize: Number(raw.pageSize ?? 25),
      notifyEmail: Boolean(raw.notifyEmail),
      notifySms: Boolean(raw.notifySms),
      notifyAbsence: Boolean(raw.notifyAbsence),
      notifyGrades: Boolean(raw.notifyGrades),
      requireTwoFactor: Boolean(raw.requireTwoFactor),
      sessionTimeoutMinutes: Number(raw.sessionTimeoutMinutes ?? 30),
      passwordMinLength: Number(raw.passwordMinLength ?? 8),
    };
  }

  private updateBrandingPreview(
    value: BulletinBrandingFormValue = this.bulletinBrandingForm.getRawValue(),
  ): void {
    this.bulletinBrandingPreview.set(this.normalizeBrandingValue(value));
    this.brandingLogoPreviewFailed.set(false);
  }

  private normalizeBrandingValue(
    value: BulletinBrandingFormValue,
  ): BulletinBrandingEditorValue {
    return {
      logoUrl:
        this.cleanString(value.logoUrl) || this.defaultBulletinBranding.logoUrl,
      institutionLinesText:
        this.cleanMultiline(value.institutionLinesText) ||
        this.defaultBulletinBranding.institutionLinesText,
      contactLine:
        this.cleanString(value.contactLine) ||
        this.defaultBulletinBranding.contactLine,
      documentTitle:
        this.cleanString(value.documentTitle) ||
        this.defaultBulletinBranding.documentTitle,
      documentSubtitle:
        this.cleanString(value.documentSubtitle) ||
        this.defaultBulletinBranding.documentSubtitle,
      footerLinesText:
        this.cleanMultiline(value.footerLinesText) ||
        this.defaultBulletinBranding.footerLinesText,
      parentSignatureLabel:
        this.cleanString(value.parentSignatureLabel) ||
        this.defaultBulletinBranding.parentSignatureLabel,
      teacherSignatureLabel:
        this.cleanString(value.teacherSignatureLabel) ||
        this.defaultBulletinBranding.teacherSignatureLabel,
      headSignatureLabel:
        this.cleanString(value.headSignatureLabel) ||
        this.defaultBulletinBranding.headSignatureLabel,
      accentColor: this.normalizeColor(
        value.accentColor,
        this.defaultBulletinBranding.accentColor,
      ),
      secondaryColor: this.normalizeColor(
        value.secondaryColor,
        this.defaultBulletinBranding.secondaryColor,
      ),
    };
  }

  private toBrandingEditorValue(
    config: BulletinBrandingConfig,
  ): BulletinBrandingEditorValue {
    return {
      logoUrl: config.logoUrl,
      institutionLinesText: config.institutionLines.join("\n"),
      contactLine: config.contactLine,
      documentTitle: config.documentTitle,
      documentSubtitle: config.documentSubtitle,
      footerLinesText: config.footerLines.join("\n"),
      parentSignatureLabel: config.parentSignatureLabel,
      teacherSignatureLabel: config.teacherSignatureLabel,
      headSignatureLabel: config.headSignatureLabel,
      accentColor: config.accentColor,
      secondaryColor: config.secondaryColor,
    };
  }

  private parseMultiline(value: string, fallback: string[]): string[] {
    const lines = this.cleanMultiline(value)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    return lines.length ? lines : fallback;
  }

  private cleanString(value: unknown): string {
    return String(value ?? "").trim();
  }

  private cleanMultiline(value: unknown): string {
    return String(value ?? "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");
  }

  private normalizeColor(value: unknown, fallback: string): string {
    const normalized = this.cleanString(value);
    return /^#([0-9a-fA-F]{6})$/.test(normalized) ? normalized : fallback;
  }
}
