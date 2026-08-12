import { InjectionToken } from '@angular/core';
import { SchoolDocumentsData } from '@app/features/reports/domain/models';
import { Observable } from 'rxjs';

export interface SchoolDocumentsRepository {
  loadData(): Observable<SchoolDocumentsData>;
}

export const SCHOOL_DOCUMENTS_REPOSITORY =
  new InjectionToken<SchoolDocumentsRepository>('SCHOOL_DOCUMENTS_REPOSITORY');
