import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, tap } from 'rxjs';
import { AppLanguage } from '@app/core/models/i18n.model';

const LANG_KEY = 'app_language';
const DEFAULT_LANG: AppLanguage = 'fr';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly translate = inject(TranslateService);

  private readonly languageState = signal<AppLanguage>(this.getSavedLang());
  readonly language = this.languageState.asReadonly();

  init(): Observable<unknown> {
    this.translate.addLangs(['fr', 'en']);
    this.translate.setDefaultLang(DEFAULT_LANG);

    return this.activate(this.languageState());
  }

  setLanguage(lang: AppLanguage): void {
    if (lang === this.languageState()) {
      return;
    }

    localStorage.setItem(LANG_KEY, lang);
    this.activate(lang).subscribe();
  }

  private activate(lang: AppLanguage): Observable<unknown> {
    return this.translate.use(lang).pipe(
      tap(() => {
        this.languageState.set(lang);
        this.document.documentElement.lang = lang;
      }),
    );
  }

  private getSavedLang(): AppLanguage {
    const saved = localStorage.getItem(LANG_KEY) as AppLanguage | null;
    return saved === 'en' ? 'en' : DEFAULT_LANG;
  }
}
