import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, catchError, Observable, of, tap, throwError } from "rxjs";
import { AuthenticatedUserProfile } from "@core/models";
import { NotificationService } from "@core/notification/notification.service";
import { TokenService } from "@core/authentication";
import { SessionService } from "./session.service";
import { environment } from "@environments/environment";

/** Corps attendu par POST /auth/login (backend LoginRequest). */
export interface LoginApiRequest {
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleType: string;
  referenceId?: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}

/** Réponse backend LoginResponse. */
export interface LoginApiResponse {
  token: string;
  refreshToken: string;
  userId: number;
  NameUser?: string;
  Email?: string;
  nameUser?: string;
  email?: string;
  userProfile: {
    id?: number;
    firstName?: string;
    lastName?: string;
    roleType?: string | null;
    roleCode?: string | null;
    permissions?: unknown;
    [key: string]: unknown;
  };
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly tokenService = inject(TokenService);
  private readonly notifications = inject(NotificationService);

  private readonly API = environment.apiUrl + "/auth";

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.session.isAuthenticated(),
  );

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  login(credentials: LoginCredentials): Observable<LoginApiResponse> {
    const body: LoginApiRequest = {
      email: credentials.email.trim(),
      password: credentials.password,
    };

    return this.http.post<LoginApiResponse>(`${this.API}/login`, body).pipe(
      tap((response) => this.persistLogin(response)),
    );
  }

  register(data: RegisterRequest): Observable<unknown> {
    return this.http.post(`${this.API}/register`, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      roleType: data.roleType,
      referenceId: data.referenceId,
    });
  }

  forgotPassword(email: string): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/users/password-reset-request`, { email });
  }

  resetPassword(data: ResetPasswordRequest): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/users/password-reset`, data);
  }

  refreshSession(): Observable<LoginApiResponse> {
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error("Refresh token absent."));
    }

    return this.http
      .post<LoginApiResponse>(
        `${this.API}/refresh`,
        { refreshToken },
        {
          headers: {
            "X-Silent": "true",
            "X-Silent-Error": "true",
          },
        },
      )
      .pipe(tap((response) => this.persistLogin(response)));
  }

  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();
    if (refreshToken) {
      this.http
        .post(
          `${this.API}/logout`,
          { refreshToken },
          { headers: { "X-Silent-Error": "true" } },
        )
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
    this.notifications.disconnect();
    this.session.clearSession();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(["/auth/login"]);
  }

  isAuthenticated(): boolean {
    return this.session.isAuthenticated();
  }

  private persistLogin(response: LoginApiResponse): void {
    this.tokenService.setAccessToken(response.token);
    if (response.refreshToken) {
      this.tokenService.setRefreshToken(response.refreshToken);
    }
    if (response.userId) {
      this.session.setUserId(response.userId);
    }
    this.session.setUserProfile(this.toUserProfile(response));
    this.isAuthenticatedSubject.next(true);
    this.notifications.connectAfterLogin();
  }

  private toUserProfile(response: LoginApiResponse): AuthenticatedUserProfile {
    const profile = response.userProfile;
    const email = response.Email ?? response.email;
    const name = response.NameUser ?? response.nameUser ?? "";

    return {
      id: profile?.id ?? response.userId,
      email,
      username: email,
      firstName: profile?.firstName ?? name.split(" ")[0] ?? "",
      lastName:
        profile?.lastName ??
        name.split(" ").slice(1).join(" ") ??
        "",
      roleType: (profile?.roleType ??
        profile?.roleCode ??
        "ADMIN") as AuthenticatedUserProfile["roleType"],
      permissions: this.normalizePermissions(profile?.permissions),
    };
  }

  private normalizePermissions(value: unknown): string[] | undefined {
    if (!Array.isArray(value)) {
      return undefined;
    }

    const permissions = value.filter(
      (permission): permission is string => typeof permission === "string",
    );

    return permissions.length ? permissions : undefined;
  }
}
