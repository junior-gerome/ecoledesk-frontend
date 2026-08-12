import { inject, Injectable } from '@angular/core';
import { DailyAttendanceUseCase } from '../use-cases/daily-attendance.use-case';

/**
 * Point d'entrée application pour la présentation (pattern Facade).
 */
@Injectable()
export class AttendanceDailyFacade {
  private readonly dailyUseCase = inject(DailyAttendanceUseCase);

  readonly students = this.dailyUseCase.students;
  readonly sections = this.dailyUseCase.sections;
  readonly classes = this.dailyUseCase.classes;
  readonly stats = this.dailyUseCase.stats;
  readonly form = this.dailyUseCase.form;
  readonly toast = this.dailyUseCase.toast;
  readonly loadingSections = this.dailyUseCase.loadingSections;
  readonly loadingClasses = this.dailyUseCase.loadingClasses;
  readonly loadingStudents = this.dailyUseCase.loadingStudents;
  readonly loadingRecords = this.dailyUseCase.loadingRecords;
  readonly saving = this.dailyUseCase.saving;
  readonly existingRecordsCount = this.dailyUseCase.existingRecordsCount;
  readonly selectedDateLabel = this.dailyUseCase.selectedDateLabel;
  readonly today = this.dailyUseCase.today;

  get sectionOptions() {
    return this.dailyUseCase.sectionOptions;
  }

  get classOptions() {
    return this.dailyUseCase.classOptions;
  }

  initialize(): void {
    this.dailyUseCase.initialize();
  }

  setStatus(
    ...args: Parameters<DailyAttendanceUseCase['setStatus']>
  ): ReturnType<DailyAttendanceUseCase['setStatus']> {
    return this.dailyUseCase.setStatus(...args);
  }

  updateHours(
    ...args: Parameters<DailyAttendanceUseCase['updateHours']>
  ): ReturnType<DailyAttendanceUseCase['updateHours']> {
    return this.dailyUseCase.updateHours(...args);
  }

  setAllStatuses(
    ...args: Parameters<DailyAttendanceUseCase['setAllStatuses']>
  ): ReturnType<DailyAttendanceUseCase['setAllStatuses']> {
    return this.dailyUseCase.setAllStatuses(...args);
  }

  markAttendance(): void {
    this.dailyUseCase.markAttendance();
  }

  hideToast(): void {
    this.dailyUseCase.hideToast();
  }
}
