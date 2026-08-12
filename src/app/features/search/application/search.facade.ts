import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AdvancedSearchService,
  FavoriteSearch,
  SearchCriteria,
} from '../infrastructure/advanced-search.service';

export type { FavoriteSearch, SearchCriteria };

@Injectable({
  providedIn: 'root',
})
export class SearchFacade {
  private readonly searchApi = inject(AdvancedSearchService);

  searchStudents(criteria: SearchCriteria): Observable<unknown[]> {
    return this.searchApi.searchStudents(criteria);
  }

  getSearchSuggestions(query: string): Observable<string[]> {
    return this.searchApi.getSearchSuggestions(query);
  }

  saveFavoriteSearch(
    name: string,
    criteria: SearchCriteria,
  ): Observable<FavoriteSearch> {
    return this.searchApi.saveFavoriteSearch(name, criteria);
  }
}
