import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { RouterModule } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";

import { AttendanceRecord } from "@app/features/attendance/domain/models";
import { AttendanceService } from "@app/features/attendance/infrastructure/attendance.service";
import { normalizeUpdatedAt } from "@app/features/attendance/infrastructure/attendance-api.mapper";
import { NotificationService } from "@app/core/notification/notification.service";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { TextareaComponent } from "@app/shared/ui/textarea/textarea.component";

@Component({
  selector: "app-justifications",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    RouterModule,
    PageLayoutComponent,
    PageHeaderComponent,
    ButtonComponent,
    InputComponent,
    TextareaComponent,
  ],
  templateUrl: "./justifications.component.html",
  styleUrls: ["./justifications.component.scss"],
})
export class JustificationsComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  records: AttendanceRecord[] = [];
  submitting = false;
  loading = false;

  justificationForm: FormGroup = this.fb.group({
    recordId: [null, Validators.required],
    justificationNote: ["", [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit(): void {
    this.loadRecords();
  }

  private loadRecords(): void {
    this.loading = true;
    this.attendanceService
      .getRecords({ statuses: ["ABSENT", "LATE"] })
      .subscribe({
        next: (records) => {
          this.records = (records || [])
            .filter((record) => record.id > 0)
            .sort(
              (a, b) =>
                normalizeUpdatedAt(b.updatedAt).localeCompare(
                  normalizeUpdatedAt(a.updatedAt),
                ),
            );
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.notificationService.error(
            "Erreur lors du chargement des justificatifs.",
            0,
          );
        },
      });
  }

  startEdit(record: AttendanceRecord): void {
    this.justificationForm.patchValue({
      recordId: record.id,
      justificationNote: record.justificationNote || "",
    });
  }

  submitJustification(): void {
    if (this.justificationForm.invalid) {
      this.justificationForm.markAllAsTouched();
      return;
    }

    const recordId = Number(this.justificationForm.value.recordId);
    const justificationNote = String(
      this.justificationForm.value.justificationNote || "",
    );

    this.submitting = true;

    this.attendanceService
      .updateJustification(recordId, justificationNote, true)
      .subscribe({
        next: (updated) => {
          this.submitting = false;
          this.notificationService.success("Justificatif enregistre.", 0);
          this.records = this.records.map((record) =>
            record.id === updated.id ? updated : record,
          );
          this.justificationForm.reset();
        },
        error: () => {
          this.submitting = false;
          this.notificationService.error("Erreur lors de l'enregistrement.", 0);
        },
      });
  }

  clearJustification(record: AttendanceRecord): void {
    this.attendanceService
      .updateJustification(record.id, "", false)
      .subscribe({
        next: (updated) => {
          this.notificationService.info("Justificatif retire.", 0);
          this.records = this.records.map((item) =>
            item.id === updated.id ? updated : item,
          );
        },
        error: () => {
          this.notificationService.error("Erreur lors de la mise a jour.", 0);
        },
      });
  }

  deleteRecord(record: AttendanceRecord): void {
    this.attendanceService.removeRecord(record.id).subscribe({
      next: () => {
        this.notificationService.success("Ligne supprimee.", 0);
        this.records = this.records.filter((item) => item.id !== record.id);
      },
      error: () => {
        this.notificationService.error("Suppression impossible.", 0);
      },
    });
  }

  statusLabel(record: AttendanceRecord): string {
    if (record.status === "LATE") return "Retard";
    if (record.status === "ABSENT") return "Absence";
    return record.status;
  }
}
