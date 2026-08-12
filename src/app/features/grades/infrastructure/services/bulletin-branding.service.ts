import { inject, Injectable } from "@angular/core";
import {
  AppPreferences,
  PreferencesService,
} from "@app/features/settings/infrastructure/preferences.service";
import { catchError, map, Observable, of } from "rxjs";

const BULLETIN_BRANDING_STORAGE_KEY = "grades.bulletin.branding";

export interface BulletinBrandingOverrides {
  logoUrl?: string;
  institutionLinesText?: string;
  contactLine?: string;
  documentTitle?: string;
  documentSubtitle?: string;
  footerLinesText?: string;
  parentSignatureLabel?: string;
  teacherSignatureLabel?: string;
  headSignatureLabel?: string;
  accentColor?: string;
  secondaryColor?: string;
}

export interface BulletinBrandingConfig {
  logoUrl: string;
  institutionLines: string[];
  contactLine: string;
  documentTitle: string;
  documentSubtitle: string;
  footerLines: string[];
  parentSignatureLabel: string;
  teacherSignatureLabel: string;
  headSignatureLabel: string;
  accentColor: string;
  accentSoftColor: string;
  secondaryColor: string;
  secondarySoftColor: string;
}

export interface BulletinBrandingEditorValue {
  logoUrl: string;
  institutionLinesText: string;
  contactLine: string;
  documentTitle: string;
  documentSubtitle: string;
  footerLinesText: string;
  parentSignatureLabel: string;
  teacherSignatureLabel: string;
  headSignatureLabel: string;
  accentColor: string;
  secondaryColor: string;
}

export const DEFAULT_BULLETIN_BRANDING_CONFIG: BulletinBrandingConfig = {
  logoUrl: "/assets/icons/logo.png",
  institutionLines: [
    "REPUBLIQUE DU CAMEROUN",
    "MINISTERE DE L'EDUCATION DE BASE",
    "Etablissement scolaire",
  ],
  contactLine: "Bulletin scolaire officiel",
  documentTitle: "Bulletin officiel",
  documentSubtitle: "Synthese pedagogique printable et exportable au format A4.",
  footerLines: [
    "Ce bulletin est genere automatiquement a partir des notes validees dans le systeme.",
    "Sans rature ni surcharge, il constitue une synthese de reference pour la periode selectionnee.",
  ],
  parentSignatureLabel: "Signature du parent",
  teacherSignatureLabel: "Signature de l'enseignant",
  headSignatureLabel: "Chef d'etablissement",
  accentColor: "#0f766e",
  accentSoftColor: "rgba(15, 118, 110, 0.12)",
  secondaryColor: "#b6853d",
  secondarySoftColor: "rgba(182, 133, 61, 0.14)",
};

@Injectable({
  providedIn: "root",
})
export class BulletinBrandingService {
  private readonly preferencesService = inject(PreferencesService);

  getConfig(): Observable<BulletinBrandingConfig> {
    const overrides = this.loadOverrides();

    return this.preferencesService.get().pipe(
      map((preferences) => this.composeConfig(preferences, overrides)),
      catchError(() => of(this.composeConfig(undefined, overrides))),
    );
  }

  getEditorValue(): Observable<BulletinBrandingEditorValue> {
    return this.getConfig().pipe(map((config) => this.toEditorValue(config)));
  }

  saveEditorValue(value: BulletinBrandingEditorValue): BulletinBrandingConfig {
    const overrides: BulletinBrandingOverrides = {
      logoUrl: this.cleanString(value.logoUrl),
      institutionLinesText: this.cleanMultiline(value.institutionLinesText),
      contactLine: this.cleanString(value.contactLine),
      documentTitle: this.cleanString(value.documentTitle),
      documentSubtitle: this.cleanString(value.documentSubtitle),
      footerLinesText: this.cleanMultiline(value.footerLinesText),
      parentSignatureLabel: this.cleanString(value.parentSignatureLabel),
      teacherSignatureLabel: this.cleanString(value.teacherSignatureLabel),
      headSignatureLabel: this.cleanString(value.headSignatureLabel),
      accentColor: this.cleanColor(value.accentColor),
      secondaryColor: this.cleanColor(value.secondaryColor),
    };

    this.writeOverrides(overrides);
    return this.composeConfig(undefined, overrides);
  }

  resetEditorValue(): BulletinBrandingConfig {
    this.removeOverrides();
    return this.composeConfig(undefined, {});
  }

  resolveLogoUrl(logoUrl: string): string {
    const value = this.cleanString(logoUrl);
    if (!value) {
      return DEFAULT_BULLETIN_BRANDING_CONFIG.logoUrl;
    }

    if (/^https?:\/\//i.test(value) || value.startsWith("data:")) {
      return value;
    }

    if (value.startsWith("/")) {
      return value;
    }

    return `/${value.replace(/^\/+/, "")}`;
  }

  private composeConfig(
    preferences?: Partial<AppPreferences>,
    overrides: BulletinBrandingOverrides = {},
  ): BulletinBrandingConfig {
    const defaultInstitutionLines = [
      "REPUBLIQUE DU CAMEROUN",
      "MINISTERE DE L'EDUCATION DE BASE",
      this.cleanString(preferences?.schoolName) || "Etablissement scolaire",
    ];
    const institutionLines =
      this.parseMultiline(overrides.institutionLinesText) || defaultInstitutionLines;

    const accentColor =
      this.cleanColor(overrides.accentColor) ||
      DEFAULT_BULLETIN_BRANDING_CONFIG.accentColor;
    const secondaryColor =
      this.cleanColor(overrides.secondaryColor) ||
      DEFAULT_BULLETIN_BRANDING_CONFIG.secondaryColor;

    return {
      logoUrl: this.resolveLogoUrl(
        this.cleanString(overrides.logoUrl) ||
          DEFAULT_BULLETIN_BRANDING_CONFIG.logoUrl,
      ),
      institutionLines,
      contactLine:
        this.cleanString(overrides.contactLine) ||
        this.composeContactLine(preferences),
      documentTitle:
        this.cleanString(overrides.documentTitle) ||
        DEFAULT_BULLETIN_BRANDING_CONFIG.documentTitle,
      documentSubtitle:
        this.cleanString(overrides.documentSubtitle) ||
        this.composeDocumentSubtitle(preferences),
      footerLines:
        this.parseMultiline(overrides.footerLinesText) ||
        DEFAULT_BULLETIN_BRANDING_CONFIG.footerLines,
      parentSignatureLabel:
        this.cleanString(overrides.parentSignatureLabel) ||
        DEFAULT_BULLETIN_BRANDING_CONFIG.parentSignatureLabel,
      teacherSignatureLabel:
        this.cleanString(overrides.teacherSignatureLabel) ||
        DEFAULT_BULLETIN_BRANDING_CONFIG.teacherSignatureLabel,
      headSignatureLabel:
        this.cleanString(overrides.headSignatureLabel) ||
        DEFAULT_BULLETIN_BRANDING_CONFIG.headSignatureLabel,
      accentColor,
      accentSoftColor: this.hexToSoftColor(accentColor, 0.12),
      secondaryColor,
      secondarySoftColor: this.hexToSoftColor(secondaryColor, 0.14),
    };
  }

  private toEditorValue(
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

  private composeContactLine(preferences?: Partial<AppPreferences>): string {
    const parts = [
      this.cleanString(preferences?.schoolCode),
      this.cleanString(preferences?.schoolPhone),
      this.cleanString(preferences?.schoolEmail),
    ].filter(Boolean);

    return parts.join(" | ") || DEFAULT_BULLETIN_BRANDING_CONFIG.contactLine;
  }

  private composeDocumentSubtitle(
    preferences?: Partial<AppPreferences>,
  ): string {
    const parts = [
      this.cleanString(preferences?.schoolAddress),
      this.cleanString(preferences?.schoolWebsite),
    ].filter(Boolean);

    return (
      parts.join(" | ") || DEFAULT_BULLETIN_BRANDING_CONFIG.documentSubtitle
    );
  }

  private parseMultiline(value?: string): string[] | null {
    const lines = String(value || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    return lines.length ? lines : null;
  }

  private cleanString(value?: string | null): string {
    return String(value || "").trim();
  }

  private cleanMultiline(value?: string | null): string {
    return String(value || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");
  }

  private cleanColor(value?: string | null): string {
    const normalized = this.cleanString(value);
    return /^#([0-9a-fA-F]{6})$/.test(normalized) ? normalized : "";
  }

  private hexToSoftColor(hex: string, alpha: number): string {
    const normalized = hex.replace("#", "");
    const red = Number.parseInt(normalized.slice(0, 2), 16);
    const green = Number.parseInt(normalized.slice(2, 4), 16);
    const blue = Number.parseInt(normalized.slice(4, 6), 16);

    if ([red, green, blue].some((value) => Number.isNaN(value))) {
      return "rgba(15, 118, 110, 0.12)";
    }

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  private loadOverrides(): BulletinBrandingOverrides {
    if (typeof window === "undefined") {
      return {};
    }

    try {
      const raw = window.localStorage.getItem(BULLETIN_BRANDING_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as BulletinBrandingOverrides) : {};
    } catch {
      return {};
    }
  }

  private writeOverrides(overrides: BulletinBrandingOverrides): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      BULLETIN_BRANDING_STORAGE_KEY,
      JSON.stringify(overrides),
    );
  }

  private removeOverrides(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(BULLETIN_BRANDING_STORAGE_KEY);
  }
}
