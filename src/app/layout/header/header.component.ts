import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthenticatedUserProfile, UserRole, UserStatus } from '@app/core/models';
import { NotificationComponent } from '@app/core/notification/notification.component';
import { AuthService, SessionService } from '@app/core/services';
import { SchoolContextService } from '@app/core/context/school-context.service';
import { SearchFacade } from '@app/features/search/application/search.facade';
import { LanguageSwitcherComponent } from '@app/shared/language-switcher/language-switcher.component';
import { ThemeComponent } from '@app/shared/theme/theme.component';
import { AvatarComponent } from '@app/shared/ui/avatar/avatar.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, ThemeComponent, AvatarComponent, NotificationComponent, LanguageSwitcherComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input() isSidebarOpen = false;
  @Output() toggleSidebarEvent = new EventEmitter<void>();
  private readonly authService = inject(AuthService);
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);
  private readonly searchFacade = inject(SearchFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput$ = new Subject<string>();
  readonly schoolContext = inject(SchoolContextService);
  readonly userProfile = this.sessionService.userProfile;
  readonly headerSearch = signal('');
  readonly headerSuggestions = signal<string[]>([]);
  readonly headerSearchLoading = signal(false);
  readonly displayName = computed(() => this.resolveDisplayName(this.userProfile()));
  readonly avatarStatus = computed(() => this.resolveAvatarStatus(this.userProfile()?.status));
  readonly roleLabel = computed(() => this.getRoleLabel(this.userProfile()?.roleType));

  constructor() {
    this.searchInput$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((query) => {
        const value = query.trim();
        if (!value) return of([]);
        this.headerSearchLoading.set(true);
        return this.searchFacade.getSearchSuggestions(value).pipe(catchError(() => of([])));
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((suggestions) => {
      this.headerSuggestions.set(suggestions);
      this.headerSearchLoading.set(false);
    });
  }

  onHeaderSearch(value: string): void {
    this.headerSearch.set(value);
    this.searchInput$.next(value);
  }

  submitHeaderSearch(): void {
    const query = this.headerSearch().trim();
    if (query) void this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  selectHeaderSuggestion(value: string): void {
    this.headerSearch.set(value);
    this.headerSuggestions.set([]);
    void this.router.navigate(['/search'], { queryParams: { q: value } });
  }

  getRoleLabel(role?: UserRole | null): string {
    const roleLabels: Partial<Record<UserRole, string>> = { ADMIN: 'Administrateur', PARENT: 'Parent', ELEVE: 'Eleve', AGENT: 'Agent', ENSEIGNANT: 'Enseignant', TEACHER: 'Enseignant', STUDENT: 'Élève' };
    return role ? roleLabels[role] || role : 'Utilisateur';
  }
  onToggleSidebar(): void { this.toggleSidebarEvent.emit(); }
  logout(): void { this.authService.logout(); }
  private resolveDisplayName(profile: AuthenticatedUserProfile | null): string { return profile ? (`${profile.firstName} ${profile.lastName}`.trim() || profile.email || 'Utilisateur') : 'Invite'; }
  private resolveAvatarStatus(status?: UserStatus): 'online' | 'away' | 'busy' | 'offline' { if (status === 'SUSPENDED') return 'busy'; if (status === 'PENDING') return 'away'; if (status === 'ACTIVE') return 'online'; return this.userProfile() ? 'online' : 'offline'; }
}
