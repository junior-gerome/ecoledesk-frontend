import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { inject, Injectable, signal, computed, effect } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class LayoutService {
  private breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(map((result) => result.matches)),
    { initialValue: false }
  );

  
  private _sidebarOpen = signal<boolean>(false);

  readonly sidebarOpen = computed(() => this._sidebarOpen());

  constructor() {
   
    effect(
      () => {
        if (this.isMobile()) {
          this._sidebarOpen.set(false);
        } else {
          this._sidebarOpen.set(true);
        }
      },
      { allowSignalWrites: true },
    );
  }

  toggleSidebar() {
    this._sidebarOpen.update((v) => !v);
  }

  closeSidebarMobile() {
    if (this.isMobile()) {
      this._sidebarOpen.set(false);
    }
  }
}
