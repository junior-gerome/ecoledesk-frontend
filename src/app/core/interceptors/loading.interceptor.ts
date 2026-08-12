import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '@core/services/loading.service';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const silent = req.headers.has('X-Silent');

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
