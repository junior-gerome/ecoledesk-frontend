import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@core/tokens/api-base-url.token';
import { Observable } from 'rxjs';
import { SearchFilters } from '../domain/search-filters.model';

export type SearchCriteria = SearchFilters;

export interface FavoriteSearch {
  id: string;
  name: string;
  criteria: SearchCriteria;
}

@Injectable({
  providedIn: 'root',
})
export class AdvancedSearchService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly apiUrl = `${this.apiBaseUrl}/search`;

  searchStudents(criteria: SearchCriteria): Observable<unknown[]> {
    return this.http.post<unknown[]>(`${this.apiUrl}/students`, criteria);
  }

  searchPayments(criteria: SearchCriteria): Observable<unknown[]> {
    return this.http.post<unknown[]>(`${this.apiUrl}/payments`, criteria);
  }

  searchGrades(criteria: SearchCriteria): Observable<unknown[]> {
    return this.http.post<unknown[]>(`${this.apiUrl}/grades`, criteria);
  }

  searchClasses(criteria: SearchCriteria): Observable<unknown[]> {
    return this.http.post<unknown[]>(`${this.apiUrl}/classes`, criteria);
  }

  searchTeachers(criteria: SearchCriteria): Observable<unknown[]> {
    return this.http.post<unknown[]>(`${this.apiUrl}/teachers`, criteria);
  }

  globalSearch(query: string): Observable<unknown[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<unknown[]>(`${this.apiUrl}/global`, { params });
  }

  getSearchSuggestions(query: string): Observable<string[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<string[]>(`${this.apiUrl}/suggestions`, { params });
  }

  saveFavoriteSearch(
    name: string,
    criteria: SearchCriteria,
  ): Observable<FavoriteSearch> {
    return this.http.post<FavoriteSearch>(`${this.apiUrl}/favorites`, {
      name,
      criteria,
    });
  }

  getFavoriteSearches(): Observable<FavoriteSearch[]> {
    return this.http.get<FavoriteSearch[]>(`${this.apiUrl}/favorites`);
  }

  deleteFavoriteSearch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/favorites/${id}`);
  }
}
