import { Injectable, signal } from '@angular/core';
import { SessionService } from '../session.service';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'theme';
  readonly darkModeSignal = signal<ThemeMode>('light');

  constructor(private readonly session: SessionService) {
    const savedTheme = this.session.getItem(this.storageKey, 'local');

    if (savedTheme === 'dark') {
      this.setDarkMode();
      return;
    }

    if (savedTheme === 'light') {
      this.setLightMode();
      return;
    }

    this.setTheme(this.resolveSystemTheme(), false);
  }

  setTheme(mode: ThemeMode, persist = true): void {
    this.darkModeSignal.set(mode);

    if (persist) {
      this.session.setItem(this.storageKey, mode, 'local');
    }

    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      return;
    }

    document.documentElement.classList.remove('dark');
  }

  setDarkMode(): void {
    this.setTheme('dark');
  }

  setLightMode(): void {
    this.setTheme('light');
  }

  toggleTheme(): void {
    this.setTheme(this.darkModeSignal() === 'dark' ? 'light' : 'dark');
  }

  private resolveSystemTheme(): ThemeMode {
    const prefersDark =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    return prefersDark ? 'dark' : 'light';
  }
}
