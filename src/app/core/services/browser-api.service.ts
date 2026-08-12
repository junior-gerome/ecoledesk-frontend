import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";

@Injectable({ providedIn: "root" })
export class BrowserApiService {
  constructor(
    @Inject(DOCUMENT) private readonly documentRef: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  get window(): Window | null {
    return this.isBrowser ? this.documentRef.defaultView : null;
  }

  get localStorage(): Storage | null {
    try {
      return this.window?.localStorage ?? null;
    } catch {
      return null;
    }
  }

  get sessionStorage(): Storage | null {
    try {
      return this.window?.sessionStorage ?? null;
    } catch {
      return null;
    }
  }
}
