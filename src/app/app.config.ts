import { HttpClient, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withComponentInputBinding,
} from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { appRoutes } from './app.routes';
import { API_BASE_URL_PROVIDER } from './core/config/api-base-url';
import {
  authInterceptor,
  errorInterceptor,
  loadingInterceptor,
} from './core/interceptors';
import { I18nLangLoader } from './core/i18n/i18n-lang.loader';
import { I18nService } from './core/services/i18n.service';

export function createTranslateLoader(http: HttpClient): TranslateLoader {
  return new I18nLangLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true, runCoalescing: true }),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor]),
    ),
    provideAnimations(),
    API_BASE_URL_PROVIDER,
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'fr',
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient],
        },
      }),
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: (i18n: I18nService) => () => i18n.init(),
      deps: [I18nService],
      multi: true,
    },
  ],
};
