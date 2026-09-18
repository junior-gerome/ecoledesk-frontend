import { inject, Injectable, signal, computed } from "@angular/core";

@Injectable({ providedIn: "root" })
export class LayoutService {
  /**
   * Ouverture du tiroir de navigation (mobile < lg) — fermé par défaut.
   * Sur desktop (>= lg) la sidebar est épinglée par CSS : cet état n'a
   * pas d'effet de position, uniquement le mode "rail" (.sidebar-collapsed).
   */
  private _sidebarOpen = signal<boolean>(false);

  readonly sidebarOpen = computed(() => this._sidebarOpen());

  /** Mode "rail" : sidebar réduite (icônes seules), applicable à partir de lg */
  private _sidebarCollapsed = signal<boolean>(false);

  readonly sidebarCollapsed = computed(() => this._sidebarCollapsed());

  toggleSidebar() {
    this._sidebarOpen.update((v) => !v);
  }

  toggleSidebarCollapsed() {
    this._sidebarCollapsed.update((v) => !v);
  }

  /** Referme le tiroir après navigation ; sans effet sur desktop (CSS épinglé) */
  closeSidebarMobile() {
    this._sidebarOpen.set(false);
  }
}