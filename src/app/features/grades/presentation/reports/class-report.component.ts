import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DestroyRef } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Class } from "@app/features/classes/domain/models";
import { Sequence } from "@app/features/sequence/domain/models";
import { NotificationService } from "@app/core/notification/notification.service";
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { EmptyStateComponent } from "@app/shared/ui/empty-state/empty-state.component";
import { SelectComponent, SelectOption } from "@app/shared/ui/select/select.component";
import {
  GRADE_MANAGEMENT_REPOSITORY,
  GradeManagementRepository,
} from "@features/grades/domain/repositories/grade-management.repository";
import { GradeFileExportService } from "@features/grades/infrastructure/grade-file-export.service";

@Component({
  selector: "app-class-report",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    ButtonComponent,
    EmptyStateComponent,
    SelectComponent,
  ],
  templateUrl: "./class-report.component.html",
})
export class ClassReportComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly repository = inject<GradeManagementRepository>(
    GRADE_MANAGEMENT_REPOSITORY,
  );
  private readonly fileExport = inject(GradeFileExportService);
  private readonly notificationService = inject(NotificationService);

  readonly form = this.fb.group({
    classId: [null as number | null],
    period: [""],
  });

  classes: Class[] = [];
  sequences: Sequence[] = [];
  isSubmitting = false;
  isZipSubmitting = false;

  get classOptions(): SelectOption<number>[] {
    return (this.classes ?? [])
      .filter((entry) => Number(entry.id))
      .map((entry) => ({
        value: Number(entry.id),
        label: entry.nameClasse ?? `Classe ${entry.id}`,
      }));
  }

  get periodOptions(): SelectOption<string>[] {
    return (this.sequences ?? [])
      .filter((entry) => !!entry.libelleSequence)
      .map((entry) => ({
        value: entry.libelleSequence as string,
        label: entry.libelleSequence as string,
      }));
  }

  ngOnInit(): void {
    this.loadClasses();
    this.loadSequences();
  }

  generateReport(): void {
    const classId = this.form.get("classId")?.value;

    if (!classId) {
      this.notificationService.warning("Choisissez d'abord une classe.", 0);
      return;
    }

    const period = this.form.get("period")?.value || "";
    this.isSubmitting = true;

    this.repository
      .generateClassReport(classId, period)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          this.fileExport.downloadBlob(
            blob,
            `rapport-classe-${classId}-${period || "periode"}.pdf`,
          );
          this.notificationService.success(
            "Rapport de classe genere avec succes.",
            0,
          );
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error("Error generating class report from dedicated page:", error);
          this.notificationService.error(
            "Impossible de generer le rapport de classe.",
            0,
          );
          this.isSubmitting = false;
        },
      });
  }

  generateBulletinsZip(): void {
    const classId = this.form.get("classId")?.value;

    if (!classId) {
      this.notificationService.warning("Choisissez d'abord une classe.", 0);
      return;
    }

    const period = this.form.get("period")?.value || "";
    this.isZipSubmitting = true;

    this.repository
      .generateClassBulletinsZip(classId, period)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          this.fileExport.downloadBlob(
            blob,
            `bulletins-classe-${classId}-${period || "periode"}.zip`,
          );
          this.notificationService.success(
            "Archive ZIP des bulletins generee avec succes.",
            0,
          );
          this.isZipSubmitting = false;
        },
        error: (error) => {
          console.error("Error generating bulletin ZIP:", error);
          this.notificationService.error(
            "Impossible de generer le ZIP des bulletins.",
            0,
          );
          this.isZipSubmitting = false;
        },
      });
  }

  private loadClasses(): void {
    this.repository
      .getClasses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (classes) => {
          this.classes = classes ?? [];
        },
        error: (error) => {
          console.error("Error loading classes for class report:", error);
          this.notificationService.error(
            "Impossible de charger les classes.",
            0,
          );
        },
      });
  }

  private loadSequences(): void {
    this.repository
      .getSequences()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (sequences) => {
          this.sequences = sequences ?? [];
          if (!this.form.get("period")?.value && this.sequences.length > 0) {
            this.form.patchValue({
              period: this.sequences[0].libelleSequence ?? "",
            });
          }
        },
        error: (error) => {
          console.error("Error loading sequences for class report:", error);
          this.notificationService.error(
            "Impossible de charger les sequences.",
            0,
          );
        },
      });
  }
}
