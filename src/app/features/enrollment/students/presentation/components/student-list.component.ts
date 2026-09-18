import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BadgeComponent } from '@app/shared/ui/badge/badge.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { TableComponent } from '@app/shared/ui/table/table.component';
import { HasPermissionDirective } from '@app/shared/directives/has-permission.directive';
import { IndeterminateCheckboxDirective } from '@app/shared/ui/checkbox/indeterminate-checkbox.directive';
import { StudentEntity } from '../../domain/models/student.entity';
import { APP_PERMISSIONS } from '@app/core/constants/permissions.constants';

import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    BadgeComponent,
    ButtonComponent,
    TableComponent,
    HasPermissionDirective,
    IndeterminateCheckboxDirective,
  ],
  templateUrl: './student-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentListComponent {
  readonly permissions = APP_PERMISSIONS;
  @Input({ required: true }) students: readonly StudentEntity[] = [];
  @Input() studentClasses: Readonly<Record<string, string>> = {};
  @Input() selectedIds: ReadonlySet<string> = new Set<string>();
  @Input() allSelected = false;
  @Input() someSelected = false;

  @Output() viewProfile = new EventEmitter<string>();
  @Output() editRequested = new EventEmitter<string>();
  @Output() deleteRequested = new EventEmitter<string>();
  @Output() toggleSelection = new EventEmitter<string>();
  @Output() toggleSelectAll = new EventEmitter<boolean>();

  trackStudent(index: number, student: StudentEntity): number | string {
    return student.id ?? index;
  }

  isSelected(student: StudentEntity): boolean {
    return !!student.id && this.selectedIds.has(student.id);
  }

  onToggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggleSelectAll.emit(checked);
  }

  onToggleSelection(student: StudentEntity): void {
    if (!student.id) return;
    this.toggleSelection.emit(student.id);
  }

  studentClass(student: StudentEntity): string {
    const studentId = student.id?.trim() ?? null;

    if (!studentId) {
      return "studentPage.notEnrolled";
    }

    return this.studentClasses[studentId] ?? "studentPage.notEnrolled";
  }

  requestViewProfile(student: StudentEntity): void {
    if (!student.id) return;
    this.viewProfile.emit(student.id);
  }

  requestEdit(student: StudentEntity): void {
    if (!student.id) {
      return;
    }

    this.editRequested.emit(student.id);
  }

  requestDelete(student: StudentEntity): void {
    if (!student.id) {
      return;
    }

    this.deleteRequested.emit(student.id);
  }
}



