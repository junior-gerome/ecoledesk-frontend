import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GradeListDTO } from '../dtos';
import { ListGradesUseCase } from '../use-cases';

export interface GradeListFilterState {
  classId?: number;
  period?: string;
  subjectId?: number;
  searchText?: string;
}

@Injectable()
export class GradeListFacade {
  private readonly listGradesUseCase = inject(ListGradesUseCase);

  listGrades(filters: GradeListFilterState): Observable<GradeListDTO[]> {
    return this.listGradesUseCase.execute({
      classId: filters.classId,
      period: filters.period,
      subjectId: filters.subjectId,
    });
  }

  listClasses(): Observable<Array<{ id: number; name: string }>> {
    return this.listGradesUseCase.listClasses();
  }

  listSubjects(): Observable<Array<{ id: number; name: string }>> {
    return this.listGradesUseCase.listSubjects();
  }

  listPeriods(): Observable<string[]> {
    return this.listGradesUseCase.listPeriods();
  }
}
