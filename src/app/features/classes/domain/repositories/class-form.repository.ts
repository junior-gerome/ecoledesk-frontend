import { AnneeScolaire } from "@app/features/gestion-annees/domain/models";
import { Class } from "@app/features/classes/domain/models";
import { Section } from "@app/features/section/domain/models";
import { StaffMemberBasic } from "@app/features/staff/domain/models/staff.model";
import { Observable } from "rxjs";

export abstract class ClassFormRepository {
  abstract getSections(): Observable<Section[]>;
  abstract getTeachers(): Observable<StaffMemberBasic[]>;
  abstract getActiveAcademicYear(): Observable<AnneeScolaire>;
  abstract getClassById(id: number): Observable<Class>;
  abstract createClass(classroom: Class): Observable<Class>;
  abstract updateClass(id: number, classroom: Class): Observable<Class>;
}
