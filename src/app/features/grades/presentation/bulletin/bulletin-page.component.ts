/**
 * BulletinPageComponent
 * Page conteneur moderne du bulletin (le rendu A4 vit dans BulletinSheetComponent)
 */
import { CommonModule } from "@angular/common";
import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { BulletinDTO } from "@features/grades/application/dtos";
import {
  ExportBulletinExcelUseCase,
  ViewBulletinUseCase,
} from "@features/grades/application/use-cases";

import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { CardComponent } from "@app/shared/ui/card/card.component";
import { BulletinSheetComponent } from "./bulletin-sheet.component";
import {
  BulletinBrandingService,
  BulletinBrandingConfig,
  DEFAULT_BULLETIN_BRANDING_CONFIG,
} from "@features/grades/infrastructure/services";
import { BulletinCombinePdfService } from "@features/grades/infrastructure/services/bulletin-combine-pdf.service";
import {
  SelectComponent,
  SelectOption,
} from "@app/shared/ui/select/select.component";
import { SkeletonComponent } from "@app/shared/ui/skeleton/skeleton.component";

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
    BulletinSheetComponent,
  ],
  templateUrl: "./bulletin-page.component.html",
  styleUrl: "./bulletin-page.component.scss",
})
export class BulletinPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject<ActivatedRoute>(ActivatedRoute);
  private readonly viewBulletinUseCase =
    inject<ViewBulletinUseCase>(ViewBulletinUseCase);
  private readonly exportExcelUseCase = inject<ExportBulletinExcelUseCase>(
    ExportBulletinExcelUseCase,
  );
  private readonly combinePdfService = inject(BulletinCombinePdfService);
  private readonly brandingService = inject(BulletinBrandingService);

  readonly bulletin = signal<BulletinDTO | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly exporting = signal(false);
  readonly exportingPdf = signal(false);
  readonly autoPrint = signal(false);
  readonly branding = signal<BulletinBrandingConfig>(
    DEFAULT_BULLETIN_BRANDING_CONFIG,
  );

  readonly periodOptions = signal<SelectOption<string>[]>([]);
  readonly selectedPeriod = signal("");
  private hasTriggeredAutoPrint = false;

  studentId = 0;

  ngOnInit(): void {
    this.loadBranding();

    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
    const bulletinData = this.bulletin();
    const period = this.selectedPeriod();

    if (!bulletinData || !period) {
      this.error.set("Le bulletin n'est pas pret pour la generation PDF.");
      return;
    }

    this.exportingPdf.set(true);
    this.error.set(null);

    this.combinePdfService
      .combineToPdf(
        [bulletinData],
        this.branding(),
        `bulletin-${this.studentId}-${period}.pdf`,
      )
      .subscribe({
        next: () => this.exportingPdf.set(false),
        error: (err: unknown) => {
          this.exportingPdf.set(false);
          this.error.set("Erreur lors de la generation du PDF.");
          console.error(err);
        },
      });
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

  private loadBranding(): void {
    this.brandingService.getConfig().subscribe({
      next: (config) => {
        this.branding.set(config);
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