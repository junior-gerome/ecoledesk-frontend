import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";
import { TeacherEntity } from "../models/teacher.entity";
import {
  TeacherScheduleItem,
  TeacherSubjectAssignment,
} from "../models/teacher-workload.model";

export interface TeacherRepository {
  getAll(): Observable<TeacherEntity[]>;
  getTeacher(id: number): Observable<TeacherEntity>;
  getTotalTeachers(): Observable<number>;
  getSubjects(teacherId?: number | null): Observable<TeacherSubjectAssignment[]>;
  getSchedule(teacherId?: number | null): Observable<TeacherScheduleItem[]>;
  create(teacher: TeacherEntity): Observable<TeacherEntity>;
  update(id: number, teacher: TeacherEntity): Observable<TeacherEntity>;
  delete(id: number): Observable<void>;
}

export const TEACHER_REPOSITORY = new InjectionToken<TeacherRepository>("TEACHER_REPOSITORY");
