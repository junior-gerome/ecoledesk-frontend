import { InjectionToken } from '@angular/core';
import { Class } from '@app/features/classes/domain/models';
import { Observable } from 'rxjs';

export interface ClassListRepository {
  getAll(): Observable<Class[]>;
  delete(id: number): Observable<void>;
}

export const CLASS_LIST_REPOSITORY = new InjectionToken<ClassListRepository>(
  'CLASS_LIST_REPOSITORY',
);
