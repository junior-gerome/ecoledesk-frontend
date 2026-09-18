/**
 * BulletinSheetComponent
 * Composant presentational : rendu A4 d'un bulletin (reutilise aussi pour le PDF combine)
 * Le CSS est fourni globalement dans src/styles.scss (classes bulletin-*).
 */
import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { ElementRef } from "@angular/core";
import { BadgeComponent } from "@app/shared/ui/badge/badge.component";
import { BulletinDTO, GradeRowDTO } from "@features/grades/application/dtos";
import {
  BulletinBrandingConfig,
} from "@features/grades/infrastructure/services";

interface BulletinSequenceColumn {
  key: string;
  label: string;
  average: number | null;
}

@Component({
  selector: "app-bulletin-sheet",
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[style.--bulletin-accent]": "branding.accentColor",
    "[style.--bulletin-accent-soft]": "branding.accentSoftColor",
    "[style.--bulletin-gold]": "branding.secondaryColor",
    "[style.--bulletin-gold-soft]": "branding.secondarySoftColor",
  },
  templateUrl: "./bulletin-sheet.component.html",
  styles: [
    `
    :host {
      display: block;
    }
    `,
  ],
})
export class BulletinSheetComponent {
  readonly bulletin = input<BulletinDTO | null>(null);
  @Input() branding: BulletinBrandingConfig = {
    logoUrl: "",
    institutionLines: [],
    contactLine: "",
    documentTitle: "",
    documentSubtitle: "",
    footerLines: [],
    parentSignatureLabel: "",
    teacherSignatureLabel: "",
    headSignatureLabel: "",
    accentColor: "#0f766e",
    accentSoftColor: "rgba(15, 118, 110, 0.12)",
    secondaryColor: "#b6853d",
    secondarySoftColor: "rgba(182, 133, 61, 0.14)",
  };
  @Input() pdfMode = false;

  readonly logoLoadFailed = signal(false);

  readonly sheetElement =
    viewChild<ElementRef<HTMLElement>>("bulletinSheet");

  readonly officialLines = computed(() => this.branding.institutionLines);
  readonly footerLines = computed(() => this.branding.footerLines);
  readonly hasLogo = computed(
    () => !!this.branding.logoUrl && !this.logoLoadFailed(),
  );

  readonly studentInitials = computed(() => {
    const studentName = this.bulletin()?.studentName || "";
    const parts = studentName.split(/\s+/).filter(Boolean).slice(0, 2);
    return (
      parts.map((part) => part[0]?.toUpperCase() || "").join("") || "BS"
    ).slice(0, 2);
  });

  readonly sequenceColumns = computed<BulletinSequenceColumn[]>(() => {
    const bulletinData = this.bulletin();

    if (!bulletinData) {
      return [];
    }

    const sequenceKeys = new Set<string>();

    bulletinData.gradeRows.forEach((row) => {
      Object.keys(row.scores || {}).forEach((key) => {
        sequenceKeys.add(key);
      });
    });

    const allKeys = Array.from(sequenceKeys);

    // Une periode "sequence" donne des scores sous cle seqN
    if (!allKeys.length) {
      return [];
    }

    return allKeys
      .sort(
        (left, right) => this.sequenceOrder(left) - this.sequenceOrder(right),
      )
      .map((key) => ({
        key,
        label: this.formatSequenceLabel(key),
        average: this.computeSequenceAverage(bulletinData, key),
      }));
  });

  readonly bulletinTitle = computed(() => {
    const bulletinData = this.bulletin();
    if (!bulletinData) {
      return "Bulletin scolaire";
    }

    const trimester = String(bulletinData.trimester || "").trim();
    return trimester
      ? `Bulletin du ${trimester.toLowerCase()}`
      : "Bulletin scolaire";
  });

  readonly masteryRate = computed(() => {
    const bulletinData = this.bulletin();
    if (!bulletinData || !bulletinData.gradeRows.length) {
      return 0;
    }

    return Math.round(
      (bulletinData.passingCount / bulletinData.gradeRows.length) * 100,
    );
  });

  readonly strongestSubject = computed<GradeRowDTO | null>(() => {
    const rows = this.bulletin()?.gradeRows ?? [];
    if (!rows.length) {
      return null;
    }

    return (
      [...rows].sort((left, right) => right.average - left.average)[0] ?? null
    );
  });

  readonly supportSubject = computed<GradeRowDTO | null>(() => {
    const rows = this.bulletin()?.gradeRows ?? [];
    if (!rows.length) {
      return null;
    }

    return (
      [...rows].sort((left, right) => left.average - right.average)[0] ?? null
    );
  });

  readonly generalCommentary = computed(() => {
    const bulletinData = this.bulletin();
    if (!bulletinData) {
      return "";
    }

    if (bulletinData.generalAverage >= 16) {
      return "Parcours remarquable avec une maitrise solide des apprentissages et une excellente regularite.";
    }

    if (bulletinData.generalAverage >= 13) {
      return "Ensemble tres satisfaisant. L'eleve progresse avec constance et confirme de bonnes bases.";
    }

    if (bulletinData.generalAverage >= 10) {
      return "Resultats encourageants. La dynamique est positive et merite d'etre consolidee par un suivi regulier.";
    }

    return "Des renforcements cibles sont recommandes pour consolider les acquis et retrouver une progression stable.";
  });

  readonly weakSubjects = computed(() =>
    (this.bulletin()?.gradeRows ?? [])
      .filter((row) => row.average < 10)
      .sort((left, right) => left.average - right.average),
  );

  readonly progressionPoints = computed(() => {
    const bulletinData = this.bulletin();
    if (!bulletinData) {
      return [];
    }

    const points = [
      `Moyenne generale: ${this.formatNumericValue(bulletinData.generalAverage)}/20 (${bulletinData.generalMention}).`,
      `Taux de validation des matieres: ${this.masteryRate()}%.`,
    ];

    const best = this.strongestSubject();
    if (best) {
      points.push(`Point fort a maintenir: ${best.subjectName} (${this.formatNumericValue(best.average)}/20).`);
    }

    const support = this.supportSubject();
    if (support) {
      points.push(`Priorite de suivi: ${support.subjectName} (${this.formatNumericValue(support.average)}/20).`);
    }

    return points;
  });

  readonly teacherRecommendations = computed(() => {
    const weakSubjects = this.weakSubjects();
    if (!weakSubjects.length) {
      return [
        "Maintenir le rythme de travail actuel avec des exercices de consolidation.",
        "Encourager la participation active et le travail regulier a la maison.",
      ];
    }

    return [
      `Planifier un renforcement cible en ${weakSubjects.slice(0, 2).map((row) => row.subjectName).join(" et ")}.`,
      "Prevoir des exercices courts et frequents pour verifier les acquis essentiels.",
      "Faire un point de suivi a la prochaine sequence pour mesurer la progression.",
    ];
  });

  getScoreValue(row: GradeRowDTO, sequenceKey: string): string {
    const value = row.scores?.[sequenceKey];
    return typeof value === "number" && !Number.isNaN(value)
      ? this.formatNumericValue(value)
      : "-";
  }

  getSubjectTotal(row: GradeRowDTO): string {
    const values = Object.values(row.scores || {}).filter(
      (value): value is number =>
        typeof value === "number" && !Number.isNaN(value),
    );

    if (!values.length) {
      return "-";
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    return this.formatNumericValue(total);
  }

  getObservation(row: GradeRowDTO): string {
    const comment = String(row.comments || "").trim();
    return comment || row.mention;
  }

  getAverageBand(average: number): "excellent" | "steady" | "alert" {
    if (average >= 14) {
      return "excellent";
    }

    if (average >= 10) {
      return "steady";
    }

    return "alert";
  }

  getResultLabel(isSuccessful: boolean): string {
    return isSuccessful ? "Parcours satisfaisant" : "Suivi renforce recommande";
  }

  formatAverageCell(value: number | null): string {
    return value === null ? "-" : this.formatNumericValue(value);
  }

  onLogoError(): void {
    this.logoLoadFailed.set(true);
  }

  private computeSequenceAverage(
    bulletinData: BulletinDTO,
    sequenceKey: string,
  ): number | null {
    let weightedTotal = 0;
    let totalCoefficient = 0;

    bulletinData.gradeRows.forEach((row) => {
      const score = row.scores?.[sequenceKey];
      const coefficient = Number(row.coefficient || 0);

      if (
        typeof score === "number" &&
        !Number.isNaN(score) &&
        coefficient > 0
      ) {
        weightedTotal += score * coefficient;
        totalCoefficient += coefficient;
      }
    });

    return totalCoefficient ? weightedTotal / totalCoefficient : null;
  }

  private formatSequenceLabel(sequenceKey: string): string {
    const order = this.sequenceOrder(sequenceKey);
    return order ? `Sequence ${order}` : sequenceKey;
  }

  private sequenceOrder(sequenceKey: string): number {
    const parsed = Number(sequenceKey.match(/(\d+)/)?.[1]);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  private formatNumericValue(value: number): string {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}