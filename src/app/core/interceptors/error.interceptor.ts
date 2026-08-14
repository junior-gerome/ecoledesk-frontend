import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '@core/notification/notification.service';
import { toAppError } from '@core/errors/app-error.model';
import { SILENT_REQUEST } from './http-context-tokens';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const router = inject(Router);
  // Use HttpContext token (client-side only) — avoids CORS preflight issues
  const silent = req.context.get(SILENT_REQUEST) || req.headers.has('X-Silent-Error');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const appError = toAppError(error);

      if (error.status === 401 && !silent) {
        router.navigate(['/auth/login']);
      } else if (!silent) {
        notificationService.error(appError.message, 0);
      }

      return throwError(() => appError);
    }),
  );
};
