import { inject, Injectable } from '@angular/core';
import { AttendanceDailyFacade } from '../../application/facades/attendance-daily.facade';

/**
 * Store Signals — couche présentation (référence architecture enterprise).
 * Les composants injectent le store, pas le use case directement.
 */
@Injectable()
export class AttendanceDailyStore {
  private readonly facade = inject(AttendanceDailyFacade);

  readonly students = this.facade.students;
  readonly sections = this.facade.sections;
  readonly classes = this.facade.classes;
  readonly stats = this.facade.stats;
  readonly form = this.facade.form;
  readonly toast = this.facade.toast;
  readonly loadingSections = this.facade.loadingSections;
  readonly loadingClasses = this.facade.loadingClasses;
  readonly loadingStudents = this.facade.loadingStudents;
  readonly loadingRecords = this.facade.loadingRecords;
  readonly saving = this.facade.saving;
  readonly existingRecordsCount = this.facade.existingRecordsCount;
  readonly selectedDateLabel = this.facade.selectedDateLabel;
  readonly today = this.facade.today;

  get sectionOptions() {
    return this.facade.sectionOptions;
  }

  get classOptions() {
    return this.facade.classOptions;
  }

  initialize(): void {
    this.facade.initialize();
  }

  setStatus: AttendanceDailyFacade['setStatus'] = (...args) =>
    this.facade.setStatus(...args);

  updateHours: AttendanceDailyFacade['updateHours'] = (...args) =>
    this.facade.updateHours(...args);

  setAllStatuses: AttendanceDailyFacade['setAllStatuses'] = (...args) =>
    this.facade.setAllStatuses(...args);

  markAttendance(): void {
    this.facade.markAttendance();
  }

  hideToast(): void {
    this.facade.hideToast();
  }
}
