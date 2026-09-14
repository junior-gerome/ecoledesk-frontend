import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '@core/notification/notification.service';
import { toAppError } from '@core/errors/app-error.model';
import { SILENT_REQUEST } from './http-context-tokens';
import { catchError, from, map, of, switchMap, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const router = inject(Router);
  // Use HttpContext token (client-side only) — avoids CORS preflight issues
  const silent = req.context.get(SILENT_REQUEST) || req.headers.has('X-Silent-Error');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Quand la requete utilise `responseType: 'blob'`, le corps d'erreur du backend
      // arrive sous forme de Blob et ne peut pas etre lu tel quel : on le retranscrit
      // en texte puis JSON pour recuperer le vrai message (ex: MinIO introuvable).
      const normalized$ =
        error.error instanceof Blob
          ? from(error.error.text()).pipe(
              map((text) => {
                try {
                  return new HttpErrorResponse({
                    error: JSON.parse(text),
                    headers: error.headers,
                    status: error.status,
                    statusText: error.statusText,
                    url: error.url ?? undefined,
                  });
                } catch {
                  return error;
                }
              }),
            )
          : of(error);

      return normalized$.pipe(
        switchMap((normalized: HttpErrorResponse) => {
          const appError = toAppError(normalized);
          if (normalized.status === 401 && !silent) {
            router.navigate(['/auth/login']);
          } else if (!silent) {
            notificationService.error(appError.message, 0);
          }
          return throwError(() => appError);
        }),
      );
    }),
  );
};
