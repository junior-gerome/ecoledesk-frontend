import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";
import { Parents } from "../models";
import {
  ParentLinkedStudent,
  ParentMessageResponse,
} from "../models/parent-link.model";

export interface ParentRepository {
  getAll(): Observable<Parents[]>;
  getById(id: number): Observable<Parents>;
  create(parent: Parents): Observable<Parents>;
  update(id: number, parent: Parents): Observable<Parents>;
  patch(id: number, parent: Parents): Observable<Parents>;
  deleteParent(id: number): Observable<void>;
  getLinkedStudents(parentId: number): Observable<ParentLinkedStudent[]>;
  sendMessage(parentId: number, message: string): Observable<ParentMessageResponse>;
}

export const PARENT_REPOSITORY = new InjectionToken<ParentRepository>("PARENT_REPOSITORY");
