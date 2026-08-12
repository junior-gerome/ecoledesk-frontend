import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { BadgeComponent } from '@app/shared/ui/badge/badge.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';
import { TableComponent } from '@app/shared/ui/table/table.component';
import { TeacherListUseCase } from '@features/teachers/application/use-cases/teacher-list.use-case';
import { TeacherEntity } from '@features/teachers/domain/models/teacher.entity';

@Component({
  selector: 'app-teacher-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterLink,
    ButtonComponent,
    BadgeComponent,
    ModalComponent,
    PageHeaderComponent,
    PageLayoutComponent,
    TableComponent,
  ],
  providers: [TeacherListUseCase],
  templateUrl: './teacher-list.component.html',
  styleUrls: ['./teacher-list.component.scss'],
})
export class TeacherListComponent implements OnInit {
  readonly useCase = inject(TeacherListUseCase);
  readonly teacherPendingDeletion = signal<TeacherEntity | null>(null);

  ngOnInit(): void {
    this.useCase.loadTeachers();
  }

  requestDelete(teacher: TeacherEntity): void {
    this.teacherPendingDeletion.set(teacher);
  }

  closeDeleteModal(): void {
    this.teacherPendingDeletion.set(null);
  }

  confirmDelete(): void {
    const teacher = this.teacherPendingDeletion();
    if (!teacher?.id) {
      this.closeDeleteModal();
      return;
    }

    this.useCase.deleteTeacher(teacher.id, () => {
      this.closeDeleteModal();
      this.useCase.loadTeachers();
    });
  }
}
