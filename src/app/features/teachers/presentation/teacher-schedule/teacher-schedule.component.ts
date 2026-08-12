import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TeacherScheduleUseCase } from "@features/teachers/application/use-cases/teacher-schedule.use-case";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { SelectComponent, SelectOption } from "@app/shared/ui/select/select.component";
import { TableComponent } from "@app/shared/ui/table/table.component";

@Component({
  selector: "app-teacher-schedule",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageLayoutComponent,
    PageHeaderComponent,
    SelectComponent,
    TableComponent,
  ],
  templateUrl: "./teacher-schedule.component.html",
  providers: [TeacherScheduleUseCase],
})
export class TeacherScheduleComponent implements OnInit {
  readonly useCase = inject(TeacherScheduleUseCase);

  readonly rows = this.useCase.rows;
  readonly loading = this.useCase.loading;
  readonly selectedTeacherId = signal<number | null>(null);

  get teacherOptions(): SelectOption<number>[] {
    return this.useCase.teachers().map((teacher) => ({
      value: Number(teacher.id),
      label: `${teacher.firstnameTeacher} ${teacher.lastnameTeacher}`,
    }));
  }

  ngOnInit(): void {
    this.useCase.loadTeachers();
    this.loadRows();
  }

  loadRows(): void {
    this.useCase.loadSchedule(this.selectedTeacherId());
  }
}
