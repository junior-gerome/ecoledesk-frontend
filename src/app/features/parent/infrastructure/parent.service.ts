import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import {
  ParentLinkedStudent,
  ParentMessageResponse,
  Parents,
  GuardianApi,
} from "@app/features/parent/domain/models";
import { ParentRepository } from "@features/parent/domain/repositories/parent.repository";
import { map, Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ParentService implements ParentRepository {
  private readonly baseUrl = `${environment.apiUrl}/guardians`;

  private http = inject(HttpClient);

  constructor() {}

  getAll(): Observable<Parents[]> {
    return this.http
      .get<GuardianApi[] | { content?: GuardianApi[] }>(`${this.baseUrl}?size=500`)
      .pipe(map((response) => this.toParentsList(response)));
  }

  getById(id: number): Observable<Parents> {
    return this.http
      .get<GuardianApi>(`${this.baseUrl}/${id}`)
      .pipe(map((guardian) => this.fromApi(guardian)));
  }

  create(parent: Parents): Observable<Parents> {
    return this.http
      .post<GuardianApi>(this.baseUrl, this.toApi(parent))
      .pipe(map((guardian) => this.fromApi(guardian)));
  }

  update(id: number, parent: Parents): Observable<Parents> {
    return this.http
      .put<GuardianApi>(`${this.baseUrl}/${id}`, this.toApi(parent))
      .pipe(map((guardian) => this.fromApi(guardian)));
  }

  patch(id: number, parent: Parents): Observable<Parents> {
    return this.http
      .patch<GuardianApi>(`${this.baseUrl}/${id}`, this.toApi(parent))
      .pipe(map((guardian) => this.fromApi(guardian)));
  }

  deleteParent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getLinkedStudents(guardianId: number): Observable<ParentLinkedStudent[]> {
    return this.http.get<ParentLinkedStudent[]>(
      `${this.baseUrl}/${guardianId}/students`,
    );
  }

  sendMessage(guardianId: number, message: string): Observable<ParentMessageResponse> {
    return this.http.post<ParentMessageResponse>(
      `${this.baseUrl}/${guardianId}/messages`,
      { message },
    );
  }

  private toParentsList(response: GuardianApi[] | { content?: GuardianApi[] }): Parents[] {
    const guardians = Array.isArray(response) ? response : response.content ?? [];
    return guardians.map((guardian) => this.fromApi(guardian));
  }

  private fromApi(guardian: GuardianApi): Parents {
    return {
      id: guardian.id,
      lastNameParent: guardian.lastNameGuardian,
      firstNameParent: guardian.firstNameGuardian,
      email: guardian.email,
      address: guardian.address,
      professionParent: guardian.occupation,
      phoneNumber: guardian.phoneNumber,
      typeParent: null,
    };
  }

  private toApi(parent: Parents): GuardianApi {
    return {
      id: parent.id,
      lastNameGuardian: parent.lastNameParent.trim(),
      firstNameGuardian: parent.firstNameParent.trim(),
      email: parent.email.trim(),
      address: parent.address.trim(),
      occupation: parent.professionParent.trim(),
      phoneNumber: parent.phoneNumber.trim(),
    };
  }
}
