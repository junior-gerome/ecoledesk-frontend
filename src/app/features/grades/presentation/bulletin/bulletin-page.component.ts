/**
 * BulletinPageComponent
 * Page conteneur moderne du bulletin
 */
import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest, finalize } from "rxjs";

import { BulletinDTO, GradeRowDTO } from "@features/grades/application/dtos";
import {
  ExportBulletinExcelUseCase,
  ExportBulletinPdfUseCase,
  ViewBulletinUseCase,
} from "@features/grades/application/use-cases";

import { BadgeComponent } from "@app/shared/ui/badge/badge.component";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { CardComponent } from "@app/shared/ui/card/card.component";
import {
  BulletinBrandingService,
  BulletinBrandingConfig,
  DEFAULT_BULLETIN_BRANDING_CONFIG,
} from "@features/grades/infrastructure/services";
import {
  SelectComponent,
  SelectOption,
} from "@app/shared/ui/select/select.component";
import { SkeletonComponent } from "@app/shared/ui/skeleton/skeleton.component";

interface BulletinSequenceColumn {
  key: string;
  label: string;
  average: number | null;
}

@Component({
  selector: "app-bulletin-page",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TranslateModule,
    ButtonComponent,
    CardComponent,
    SelectComponent,
    SkeletonComponent,
    BadgeComponent,
  ],
  templateUrl: "./bulletin-page.component.html",
  styleUrl: "./bulletin-page.component.scss",
})
export class BulletinPageComponent implements OnInit {
  private readonly route = inject<ActivatedRoute>(ActivatedRoute);
  private readonly viewBulletinUseCase =
    inject<ViewBulletinUseCase>(ViewBulletinUseCase);
  private readonly exportPdfUseCase = inject<ExportBulletinPdfUseCase>(
    ExportBulletinPdfUseCase,
  );
  private readonly exportExcelUseCase = inject<ExportBulletinExcelUseCase>(
    ExportBulletinExcelUseCase,
  );
  private readonly brandingService = inject(BulletinBrandingService);

  readonly bulletin = signal<BulletinDTO | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly exporting = signal(false);
  readonly exportingPdf = signal(false);
  readonly pdfMode = signal(false);
  readonly autoPrint = signal(false);
  readonly branding = signal<BulletinBrandingConfig>(
    DEFAULT_BULLETIN_BRANDING_CONFIG,
  );
  readonly logoLoadFailed = signal(false);

  readonly periodOptions = signal<SelectOption<string>[]>([]);
  readonly selectedPeriod = signal("");
  readonly bulletinSheetRef =
    viewChild<ElementRef<HTMLElement>>("bulletinSheet");
  private hasTriggeredAutoPrint = false;

  readonly officialLines = computed(() => this.branding().institutionLines);
  readonly footerLines = computed(() => this.branding().footerLines);
  readonly hasLogo = computed(
    () => !!this.branding().logoUrl && !this.logoLoadFailed(),
  );

  readonly sequenceColumns = computed<BulletinSequenceColumn[]>(() => {
    const bulletinData = this.bulletin();

    if (!bulletinData) {
      return [];
    }

    const selectedPeriod = this.selectedPeriod().trim();

    // Récupération de toutes les clés disponibles
    const sequenceKeys = new Set<string>();

    bulletinData.gradeRows.forEach((row) => {
      Object.keys(row.scores || {}).forEach((key) => {
        sequenceKeys.add(key);
      });
    });

    const allKeys = Array.from(sequenceKeys);

    // =========================
    // CAS : SEQUENCE SPECIFIQUE
    // =========================
    // Recherche de la clé correspondant exactement à la période sélectionnée
    const matchedKey = allKeys.find((key) => {
      // Normalisation pour comparaison
      const normalizedKey = key
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const normalizedPeriod = selectedPeriod
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return normalizedKey.toLowerCase() === normalizedPeriod.toLowerCase();
    });

    // Si une correspondance exacte est trouvée, afficher uniquement cette séquence
    if (matchedKey) {
      return [
        {
          key: matchedKey,
          label: this.formatSequenceLabel(matchedKey),
          average: this.computeSequenceAverage(bulletinData, matchedKey),
        },
      ];
    }

    // =========================
    // CAS : TRIMESTRE (afficher toutes les séquences)
    // =========================
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

  readonly studentInitials = computed(() => {
    const studentName = this.bulletin()?.studentName || "";
    const parts = studentName.split(/\s+/).filter(Boolean).slice(0, 2);
    return (
      parts.map((part) => part[0]?.toUpperCase() || "").join("") || "BS"
    ).slice(0, 2);
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

  studentId = 0;

  ngOnInit(): void {
    this.loadBranding();

    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe({
      next: ([paramMap, queryParamMap]) => {
        const nextStudentId =
          Number.parseInt(paramMap.get("studentId") || "", 10) || 0;
        const requestedPeriod = String(
          queryParamMap.get("period") || "",
        ).trim();

        this.autoPrint.set(queryParamMap.get("print") === "pdf");
        this.hasTriggeredAutoPrint = false;
        this.error.set(null);

        if (!nextStudentId) {
          this.studentId = 0;
          this.bulletin.set(null);
          this.loading.set(false);
          this.error.set("Identifiant eleve invalide.");
          return;
        }

        const studentChanged = this.studentId !== nextStudentId;
        this.studentId = nextStudentId;
        this.loading.set(true);
        this.loadAvailablePeriods(requestedPeriod, studentChanged);
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set("Erreur lors de l'initialisation du bulletin.");
        console.error(error);
      },
    });
  }

  private loadBulletin(period: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.viewBulletinUseCase.execute(this.studentId, period).subscribe({
      next: (bulletinData: BulletinDTO) => {
        this.bulletin.set(bulletinData);
        document.title = `bulletin-${this.studentId}-${this.selectedPeriod() || bulletinData.sequence}`;
        this.loading.set(false);
        this.triggerAutoPrintIfNeeded();
      },
      error: (err: unknown) => {
        this.error.set("Erreur au chargement du bulletin");
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  private loadAvailablePeriods(
    preferredPeriod = "",
    forceReload = false,
  ): void {
    this.viewBulletinUseCase.listAvailablePeriods(this.studentId).subscribe({
      next: (periods: string[]) => {
        this.periodOptions.set(
          periods.map((period) => ({ label: period, value: period })),
        );

        const nextPeriod =
          preferredPeriod || this.selectedPeriod() || periods[0] || "";

        if (!nextPeriod) {
          this.bulletin.set(null);
          this.loading.set(false);
          this.error.set("Aucune periode disponible pour cet eleve.");
          return;
        }

        const shouldReload =
          forceReload ||
          nextPeriod !== this.selectedPeriod() ||
          !this.bulletin();

        this.selectedPeriod.set(nextPeriod);

        if (shouldReload) {
          this.loadBulletin(nextPeriod);
        }
      },
      error: (err: unknown) => {
        console.error("Erreur chargement periodes:", err);

        if (preferredPeriod) {
          const shouldReload =
            forceReload ||
            preferredPeriod !== this.selectedPeriod() ||
            !this.bulletin();

          this.selectedPeriod.set(preferredPeriod);

          if (shouldReload) {
            this.loadBulletin(preferredPeriod);
          }
          return;
        }

        this.bulletin.set(null);
        this.loading.set(false);
        this.error.set("Impossible de charger les periodes du bulletin.");
      },
    });
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod.set(period);
    this.loadBulletin(period);
  }

  printBulletin(): void {
    if (!this.bulletin()) {
      return;
    }

    window.print();
  }

  exportPdf(): void {
    const bulletinSheet = this.bulletinSheetRef()?.nativeElement;
    const period = this.selectedPeriod();

    if (!bulletinSheet || !this.bulletin() || !period) {
      this.error.set("Le bulletin n'est pas pret pour la generation PDF.");
      return;
    }

    this.exportingPdf.set(true);
    this.pdfMode.set(true);
    this.error.set(null);

    window.setTimeout(() => {
      this.exportPdfUseCase
        .execute(bulletinSheet, `bulletin-${this.studentId}-${period}.pdf`)
        .pipe(
          finalize(() => {
            this.exportingPdf.set(false);
            this.pdfMode.set(false);
          }),
        )
        .subscribe({
          error: (err: unknown) => {
            this.error.set("Erreur lors de la generation du PDF.");
            console.error(err);
          },
        });
    }, 80);
  }

  exportExcel(): void {
    this.exporting.set(true);
    this.exportExcelUseCase
      .executeSingle(this.studentId, this.selectedPeriod())
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `bulletin-${this.studentId}-${this.selectedPeriod()}.xlsx`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.exporting.set(false);
        },
        error: (err: unknown) => {
          this.error.set("Erreur export Excel");
          this.exporting.set(false);
          console.error(err);
        },
      });
  }

  getScoreValue(row: GradeRowDTO, sequenceKey: string): string {
    const value = row.scores?.[sequenceKey];
    return typeof value === "number" && !Number.isNaN(value)
      ? this.formatNumericValue(value)
      : "-";
  }

  getSubjectTotal(row: GradeRowDTO): string {
    const selectedPeriod = this.selectedPeriod().trim();

    // Recherche de la clé correspondant exactement à la période sélectionnée
    const matchedKey = Object.keys(row.scores || {}).find((key) => {
      const normalizedKey = key
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const normalizedPeriod = selectedPeriod
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return normalizedKey.toLowerCase() === normalizedPeriod.toLowerCase();
    });

    // =========================
    // CAS : UNE SEQUENCE SPECIFIQUE
    // =========================
    if (matchedKey) {
      const value = row.scores?.[matchedKey];
      return typeof value === "number" ? this.formatNumericValue(value) : "-";
    }

    // =========================
    // CAS : TRIMESTRE (somme de toutes les séquences)
    // =========================
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

  private loadBranding(): void {
    this.brandingService.getConfig().subscribe({
      next: (config) => {
        this.branding.set(config);
        this.logoLoadFailed.set(false);
      },
      error: (error) => {
        console.error("Erreur chargement branding bulletin:", error);
      },
    });
  }

  private triggerAutoPrintIfNeeded(): void {
    if (!this.autoPrint() || this.hasTriggeredAutoPrint || !this.bulletin()) {
      return;
    }

    this.hasTriggeredAutoPrint = true;

    setTimeout(() => {
      window.print();
    }, 350);
  }
}
