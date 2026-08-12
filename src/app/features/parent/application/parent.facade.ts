import { Injectable, inject } from "@angular/core";
import { Parents } from "@features/parent/domain/models";
import {
  ParentLinkedStudent,
  ParentMessageResponse,
} from "@features/parent/domain/models/parent-link.model";
import { PARENT_REPOSITORY } from "@features/parent/domain/repositories/parent.repository";
import { Observable } from "rxjs";

@Injectable()
export class ParentFacade {
  private readonly repository = inject(PARENT_REPOSITORY);

  getAll(): Observable<Parents[]> {
    return this.repository.getAll();
  }

  create(parent: Parents): Observable<Parents> {
    return this.repository.create(parent);
  }

  update(id: number, parent: Parents): Observable<Parents> {
    return this.repository.update(id, parent);
  }

  deleteParent(id: number): Observable<void> {
    return this.repository.deleteParent(id);
  }

  getLinkedStudents(parentId: number): Observable<ParentLinkedStudent[]> {
    return this.repository.getLinkedStudents(parentId);
  }

  sendMessage(parentId: number, message: string): Observable<ParentMessageResponse> {
    return this.repository.sendMessage(parentId, message);
  }
}
