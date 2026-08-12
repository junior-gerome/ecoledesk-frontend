import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';
import { AttendanceSummaryRow } from "@app/features/attendance/domain/models";
import { AttendanceSummaryDomainService, AttendanceSummaryMetrics } from "@app/features/attendance/domain/services/attendance-summary-domain.service";
import { Class } from "@app/features/classes/domain/models";
import { AttendanceService } from "@app/features/attendance/infrastructure/attendance.service";
import { ClassRoomService } from "@app/features/classes/infrastructure/classRoom.service";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { BadgeVariant, BadgeComponent } from "@app/shared/ui/badge/badge.component";
import { ButtonComponent } from "@app/shared/ui/button/button.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { SelectComponent, SelectOption } from "@app/shared/ui/select/select.component";
import { TableComponent } from "@app/shared/ui/table/table.component";
import { ToastComponent, ToastVariant } from "@app/shared/ui/toast/toast.component";

@Component({
  selector: "app-absence-tracking",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    PageLayoutComponent,
    PageHeaderComponent,
    BadgeComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TableComponent,
    ToastComponent,
  ],
  providers: [AttendanceSummaryDomainService],
  templateUrl: "./absence-tracking.component.html",
  styleUrls: ["./absence-tracking.component.scss"],
})
export class AbsenceTrackingComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceService);
  private readonly classRoomService = inject(ClassRoomService);
  private readonly summaryDomain = inject(AttendanceSummaryDomainService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly rows = signal<AttendanceSummaryRow[]>([]);
  readonly classes = signal<Class[]>([]);
  readonly loading = signal(false);
  readonly toast = signal<{
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

  readonly today = this.formatDate(new Date());
  readonly defaultFrom = this.formatDate(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  );

  filterForm = this.fb.group({
    classId: [null],
    dateFrom: [this.defaultFrom],
    dateTo: [this.today],
    search: [""],
  });

  get classOptions(): SelectOption<number>[] {
    return (this.classes() || [])
      .filter((classroom) => Number(classroom.id))
      .map((classroom) => ({
        value: Number(classroom.id),
        label: classroom.nameClasse ?? `Classe ${classroom.id}`,
      }));
  }

  get filteredRows(): AttendanceSummaryRow[] {
    return this.summaryDomain.filterAndSortSummaryRows(
      this.rows(),
      String(this.filterForm.value.search || ""),
    );
  }

  get metrics(): AttendanceSummaryMetrics {
    return this.summaryDomain.computeSummaryMetrics(this.filteredRows);
  }

  ngOnInit(): void {
    this.loadClasses();
    this.loadSummary();
  }

  applyFilters(): void {
    this.loadSummary();
  }

  async openJustifications(): Promise<void> {
    await this.router.navigate(["/attendance/justification"]);
  }

  hideToast(): void {
    this.toast.update((current) => ({ ...current, visible: false }));
  }

  resetFilters(): void {
    this.filterForm.reset({
      classId: null,
      dateFrom: this.defaultFrom,
      dateTo: this.today,
      search: "",
    });
    this.loadSummary();
  }

  summaryLabel(row: AttendanceSummaryRow): string {
    return this.summaryDomain.summaryLabel(row);
  }

  summaryVariant(row: AttendanceSummaryRow): BadgeVariant {
    return this.summaryDomain.summaryBadgeVariant(row);
  }

  private loadClasses(): void {
    this.classRoomService.getAll().subscribe({
      next: (data) => {
        this.classes.set(data || []);
      },
      error: () => {
        this.showToast(
          "Impossible de charger les classes.",
          "danger",
          "Chargement impossible",
        );
      },
    });
  }

  private loadSummary(): void {
    const classId = this.filterForm.value.classId as number | null;
    const dateFrom = this.filterForm.value.dateFrom as string | null;
    const dateTo = this.filterForm.value.dateTo as string | null;

    this.loading.set(true);
    this.attendanceService
      .getSummary({
        classId: classId ?? undefined,
        dateFrom: dateFrom ?? undefined,
        dateTo: dateTo ?? undefined,
      })
      .subscribe({
        next: (rows) => {
          this.rows.set(rows || []);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.showToast(
            "Erreur lors du chargement du suivi des absences.",
            "danger",
            "Chargement impossible",
          );
        },
      });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private showToast(
    message: string,
    variant: ToastVariant,
    title: string,
  ): void {
    this.toast.set({
      visible: true,
      title,
      message,
      variant,
    });
  }
}
