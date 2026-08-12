import { inject, Injectable } from "@angular/core";
import { SessionService } from "@core/services/session.service";

@Injectable({ providedIn: "root" })
export class TokenService {
  private readonly session = inject(SessionService);

  getAccessToken(): string | null {
    return this.session.getToken();
  }

  setAccessToken(token: string): void {
    this.session.setToken(token);
  }

  removeAccessToken(): void {
    this.session.removeToken();
  }

  getRefreshToken(): string | null {
    return this.session.getRefreshToken();
  }

  setRefreshToken(token: string): void {
    this.session.setRefreshToken(token);
  }

  clear(): void {
    this.session.clearSession();
  }
}
