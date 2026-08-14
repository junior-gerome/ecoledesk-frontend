import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '@core/services/loading.service';
import { SILENT_REQUEST } from './http-context-tokens';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  // Use HttpContext token (client-side only) — also keep legacy X-Silent header for compat
  const silent = req.context.get(SILENT_REQUEST) || req.headers.has('X-Silent');

  if (!silent) {
    loadingService.show();
  }

  return next(req).pipe(
    finalize(() => {
      if (!silent) {
        loadingService.hide();
      }
    }),
  );
};
