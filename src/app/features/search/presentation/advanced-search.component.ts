import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import {
  SearchFacade,
  SearchCriteria,
} from '../application/search.facade';
import { InputComponent } from '@app/shared/ui/input/input.component';
import { SelectComponent, SelectOption } from '@app/shared/ui/select/select.component';

interface AdvancedSearchResult {
  type: 'student' | 'grade' | 'payment' | string;
  firstName?: string;
  lastName?: string;
  class?: string;
  section?: string;
  subject?: string;
  value?: number;
  date?: string | Date;
  amount?: number;
  status?: string;
}

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, SelectComponent],
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedSearchComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly keywordsSubject = new Subject<string>();
  private readonly searchFacade = inject(SearchFacade);

  readonly searchResults = signal<AdvancedSearchResult[]>([]);
  readonly suggestions = signal<string[]>([]);
  readonly searchContext = signal('');
  readonly sectionOptions: SelectOption<string>[] = [
    { label: 'Toutes les sections', value: '' },
    { label: 'Francophone', value: 'FRANCOPHONE' },
    { label: 'Anglophone', value: 'ANGLOPHONE' },
  ];
  readonly levelOptions: SelectOption<string>[] = [
    { label: 'Tous les niveaux', value: '' },
    { label: 'Maternelle', value: 'MATERNELLE' },
    { label: 'Primaire', value: 'PRIMAIRE' },
  ];
  readonly paymentStatusOptions: SelectOption<string>[] = [
    { label: 'Tous les statuts', value: '' },
    { label: 'Paye', value: 'PAID' },
    { label: 'En attente', value: 'PENDING' },
    { label: 'En retard', value: 'OVERDUE' },
  ];

  readonly searchForm = this.fb.group({
    section: [''],
    level: [''],
    startDate: [''],
    endDate: [''],
    keywords: [''],
    minGrade: [''],
    maxGrade: [''],
    paymentStatus: [''],
  });

  constructor() {
    this.keywordsSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => this.searchFacade.getSearchSuggestions(query)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((suggestions) => {
        this.suggestions.set(suggestions);
      });

    this.searchForm
      .get('keywords')
      ?.valueChanges.pipe(
        debounceTime(150),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.keywordsSubject.next(String(value ?? ''));
      });
  }

  onSubmit(): void {
    const criteria = this.searchForm.getRawValue() as SearchCriteria;
    this.searchFacade
      .searchStudents(criteria)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        this.searchResults.set(results as AdvancedSearchResult[]);
      });
  }

  selectSuggestion(suggestion: string): void {
    this.searchForm.patchValue({ keywords: suggestion });
    this.suggestions.set([]);
  }

  resetForm(): void {
    this.searchForm.reset();
    this.searchResults.set([]);
    this.suggestions.set([]);
  }

  saveAsFavorite(): void {
    const name = prompt('Nom de la recherche :');
    if (!name) {
      return;
    }

    this.searchFacade
      .saveFavoriteSearch(name, this.searchForm.getRawValue() as SearchCriteria)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}



