import { inject, Injectable } from "@angular/core";
import { BrowserApiService } from "./browser-api.service";

type StorageArea = "local" | "session";
type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

@Injectable({ providedIn: "root" })
export class StorageService {
  private readonly browserApi = inject(BrowserApiService);
  private readonly memoryStorage = new Map<string, string>();

  getItem(key: string, area: StorageArea = "session"): string | null {
    return this.resolveStorage(area).getItem(key);
  }

  setItem(key: string, value: string, area: StorageArea = "session"): void {
    this.resolveStorage(area).setItem(key, value);
  }

  removeItem(key: string, area: StorageArea = "session"): void {
    this.resolveStorage(area).removeItem(key);
  }

  private resolveStorage(area: StorageArea): StorageLike {
    if (area === "local") {
      return this.browserApi.localStorage ?? this.fallbackStorage;
    }

    return this.browserApi.sessionStorage ?? this.fallbackStorage;
  }

  private get fallbackStorage(): StorageLike {
    return {
      getItem: (key) => this.memoryStorage.get(key) ?? null,
      setItem: (key, value) => {
        this.memoryStorage.set(key, value);
      },
      removeItem: (key) => {
        this.memoryStorage.delete(key);
      },
    };
  }
}
