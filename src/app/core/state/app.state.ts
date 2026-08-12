import { computed, Injectable, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class AppState {
  private readonly pendingRequests = signal(0);
  private readonly sidebarOpenState = signal(true);

  readonly isLoading = computed(() => this.pendingRequests() > 0);
  readonly sidebarOpen = this.sidebarOpenState.asReadonly();

  startRequest(): void {
    this.pendingRequests.update((count) => count + 1);
  }

  finishRequest(): void {
    this.pendingRequests.update((count) => Math.max(0, count - 1));
  }

  setSidebarOpen(open: boolean): void {
    this.sidebarOpenState.set(open);
  }

  toggleSidebar(): void {
    this.sidebarOpenState.update((open) => !open);
  }
}
