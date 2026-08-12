import { inject, Injectable, signal } from "@angular/core";
import { AuthenticatedUserProfile } from "@app/core/models";
import { BrowserApiService } from "./browser-api.service";

type StorageArea = "local" | "session";
type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

@Injectable({ providedIn: "root" })
export class SessionService {
  private readonly browserApi = inject(BrowserApiService);
  private readonly volatileStorage = new Map<string, string>();
  private readonly tokenKey = "token";
  private readonly refreshTokenKey = "refreshToken";
  private readonly userIdKey = "userId";
  private readonly userProfileKey = "userProfile";
  private readonly userProfileState = signal<AuthenticatedUserProfile | null>(
    this.readUserProfile(),
  );

  readonly userProfile = this.userProfileState.asReadonly();

  setToken(token: string): void {
    this.sessionStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return this.sessionStorage.getItem(this.tokenKey);
  }

  removeToken(): void {
    this.sessionStorage.removeItem(this.tokenKey);
  }

  setRefreshToken(token: string): void {
    this.sessionStorage.setItem(this.refreshTokenKey, token);
  }

  getRefreshToken(): string | null {
    return this.sessionStorage.getItem(this.refreshTokenKey);
  }

  setUserId(userId: number): void {
    this.sessionStorage.setItem(this.userIdKey, String(userId));
  }

  getUserId(): number | null {
    const raw = this.sessionStorage.getItem(this.userIdKey);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  clearSession(): void {
    this.sessionStorage.removeItem(this.tokenKey);
    this.sessionStorage.removeItem(this.refreshTokenKey);
    this.sessionStorage.removeItem(this.userIdKey);
    this.sessionStorage.removeItem(this.userProfileKey);
    this.userProfileState.set(null);
  }

  setUserProfile(profile: AuthenticatedUserProfile | null): void {
    if (!profile) {
      this.removeUserProfile();
      return;
    }

    this.sessionStorage.setItem(this.userProfileKey, JSON.stringify(profile));
    this.userProfileState.set(profile);
  }

  getUserProfile(): AuthenticatedUserProfile | null {
    return this.userProfile();
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null && this.getUserProfile() !== null;
  }

  removeUserProfile(): void {
    this.sessionStorage.removeItem(this.userProfileKey);
    this.userProfileState.set(null);
  }

  setItem(key: string, value: string, storage: StorageArea = "session"): void {
    this.resolveStorage(storage).setItem(key, value);
  }

  getItem(key: string, storage: StorageArea = "session"): string | null {
    return this.resolveStorage(storage).getItem(key);
  }

  removeItem(key: string, storage: StorageArea = "session"): void {
    this.resolveStorage(storage).removeItem(key);
  }

  private get sessionStorage(): StorageLike {
    return this.browserApi.sessionStorage ?? this.memoryStorage;
  }

  private get localStorage(): StorageLike {
    return this.browserApi.localStorage ?? this.memoryStorage;
  }

  private get memoryStorage(): StorageLike {
    return {
      getItem: (key) => this.volatileStorage.get(key) ?? null,
      setItem: (key, value) => {
        this.volatileStorage.set(key, value);
      },
      removeItem: (key) => {
        this.volatileStorage.delete(key);
      },
    };
  }

  private resolveStorage(storage: StorageArea): StorageLike {
    return storage === "local" ? this.localStorage : this.sessionStorage;
  }

  private readUserProfile(): AuthenticatedUserProfile | null {
    const raw = this.sessionStorage.getItem(this.userProfileKey);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<AuthenticatedUserProfile>;
      if (
        typeof parsed.id !== "number" ||
        typeof parsed.firstName !== "string" ||
        typeof parsed.lastName !== "string" ||
        typeof parsed.roleType !== "string"
      ) {
        return null;
      }

      return {
        id: parsed.id,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        roleType: parsed.roleType,
        status: parsed.status,
        email: parsed.email,
        permissions: Array.isArray(parsed.permissions)
          ? parsed.permissions.filter(
              (permission): permission is string =>
                typeof permission === "string",
            )
          : undefined,
        avatarUrl: parsed.avatarUrl ?? null,
      };
    } catch {
      return null;
    }
  }
}
