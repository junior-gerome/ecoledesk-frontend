import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService, LoginApiResponse } from "@core/services/auth.service";
import { TokenService } from "@core/authentication";
import { API_BASE_URL } from "@core/tokens/api-base-url.token";
import { environment } from "@environments/environment";
import { catchError, finalize, Observable, shareReplay, switchMap, throwError } from "rxjs";

let refreshRequest$: Observable<LoginApiResponse> | null = null;
const SKIP_AUTH_REFRESH = new HttpContextToken(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const apiBaseUrl = inject(API_BASE_URL);
  const token = tokenService.getAccessToken();
  const apiOrigins = [
    apiBaseUrl,
    environment.billingApiUrl,
    environment.attendanceApiUrl,
  ].filter(Boolean);
  const isApiRequest =
    req.url.startsWith("/") ||
    apiOrigins.some((origin) => req.url.startsWith(origin));
  const isAuthRequest = req.url.includes("/auth/");

  const request = token && isApiRequest && !isAuthRequest
    ? withAuthorization(req, token)
    : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        !shouldRefresh(error, isApiRequest, isAuthRequest) ||
        req.context.get(SKIP_AUTH_REFRESH)
      ) {
        return throwError(() => error);
      }

      return getRefreshRequest(authService).pipe(
        catchError(() => {
          authService.logout();
          return throwError(
            () =>
              new HttpErrorResponse({
                status: 401,
                statusText: "Unauthorized",
                url: req.url,
              }),
          );
        }),
        switchMap(() => {
          const refreshedToken = tokenService.getAccessToken();

          if (!refreshedToken) {
            return throwError(() => error);
          }

          return next(
            withAuthorization(
              req.clone({
                context: req.context.set(SKIP_AUTH_REFRESH, true),
              }),
              refreshedToken,
            ),
          );
        }),
      );
    }),
  );
};

function getRefreshRequest(authService: AuthService): Observable<LoginApiResponse> {
  if (!refreshRequest$) {
    refreshRequest$ = authService.refreshSession().pipe(
      finalize(() => {
        refreshRequest$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

  return refreshRequest$;
}

function shouldRefresh(
  error: unknown,
  isApiRequest: boolean,
  isAuthRequest: boolean,
): boolean {
  return (
    isApiRequest &&
    !isAuthRequest &&
    error instanceof HttpErrorResponse &&
    error.status === 401
  );
}

function withAuthorization(
  request: HttpRequest<unknown>,
  token: string,
): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
