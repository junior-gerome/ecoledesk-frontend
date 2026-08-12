import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, map, shareReplay } from 'rxjs';

type TranslationDictionary = Record<string, unknown>;
type TranslationCatalog = Record<'fr' | 'en', TranslationDictionary>;

@Injectable()
export class I18nLangLoader implements TranslateLoader {
  private readonly catalog$ = this.http
    .get<TranslationCatalog>('./assets/i18n/i18n_lang.json')
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  constructor(private readonly http: HttpClient) {}

  getTranslation(language: string): Observable<TranslationDictionary> {
    const lang = language === 'en' ? 'en' : 'fr';

    return this.catalog$.pipe(
      map((catalog) => catalog[lang] ?? catalog.fr),
    );
  }
}
