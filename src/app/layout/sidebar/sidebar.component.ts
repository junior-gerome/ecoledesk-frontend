import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Router, RouterModule } from "@angular/router";
import { SidebarCategory, SidebarItems } from "@app/layout/sidebarItems";
import { LayoutService } from "@app/layout/layout.service";
import { AuthService } from "@app/core/services";
import { BadgeComponent } from "@app/shared/ui/badge/badge.component";
import { ACCESS_POLICIES } from '@app/core/security/access-policy';
import { RbacService } from '@app/core/security/rbac.service';
import { SchoolContextService } from '@app/core/context/school-context.service';
import { computed } from "@angular/core";
import { TranslateModule } from '@ngx-translate/core';
const ICON = {
  dashboard: `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
  students:  `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l6.16-3.422A12.083 12.083 0 0121 13c0 5.523-4.477 10-10 10S1 18.523 1 13c0-.85.095-1.678.274-2.476L12 14z"/></svg>`,
  parents:   `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  teachers:  `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
  classes:   `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
  subjects:  `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
  attendance:`<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`,
  grades:    `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
  payments:  `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`,
  reports:   `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
  communication:`<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`,
  settings:  `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  staff:     `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
  support:   `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
};

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule, RouterModule, BadgeComponent, TranslateModule],
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent {
  readonly layoutService = inject(LayoutService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly rbac = inject(RbacService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly schoolContext = inject(SchoolContextService);
  readonly accessPolicies = ACCESS_POLICIES;
  readonly menuState = signal<Record<string, boolean>>({});
  readonly categoryState = signal<Record<string, boolean>>({});

  /** Label de l'année scolaire active — affiché dans le pied de sidebar */
  readonly activeYearLabel = computed(() => {
    const year = this.schoolContext.selectedSchoolYear();
    return year
      ? year.libelleAcademicYear
      : null;
  });

  readonly categories: SidebarCategory[] = [
    {
      id: 'general',
      label: '',
      defaultOpen: true,
      items: [
        {
          id: "dashboard",
          label: "nav.dashboard",
          iconSvg: ICON.dashboard,
          routerLink: "/dashboard",
          menuKey: "dashboard",
        },
      ],
    },
    {
      id: 'eleves',
      label: 'nav.categories.students',
      defaultOpen: false,
      items: [
        {
          id: "pre-enrollments",
          label: "Préinscriptions",
          iconSvg: ICON.students,
          routerLink: "/pre-enrollments",
          accessPolicy: ACCESS_POLICIES.studentsRead,
          children: [
            { label: "Dossiers de préinscription", routerLink: "/pre-enrollments" },
            { label: "Nouvelle préinscription", routerLink: "/pre-enrollments/new" },
          ],
        },
        {
          id: "students",
          label: "nav.students",
          iconSvg: ICON.students,
          routerLink: "/students",
          accessPolicy: ACCESS_POLICIES.studentsRead,
          children: [
            { label: "students.list", routerLink: "/students" },
          ],
        },
        {
          id: "parents",
          label: "nav.parents",
          iconSvg: ICON.parents,
          routerLink: "/guardians",
          children: [
            { label: "parents.list", routerLink: "/guardians" },
            { label: "parents.links", routerLink: "/guardians/links" },
            { label: "parents.messages", routerLink: "/guardians/messages" },
          ],
        },
      ],
    },
    {
      id: 'scolaire',
      label: 'nav.categories.school',
      defaultOpen: false,
      items: [
        {
          id: "teachers",
          label: "nav.teachers",
          iconSvg: ICON.teachers,
          routerLink: "/teachers",
          children: [
            { label: "teachers.list", routerLink: "/teachers" },
            { label: "teachers.new", routerLink: "/teachers/new" },
            { label: "teachers.subjects", routerLink: "/teachers/subjects" },
            { label: "teachers.schedule", routerLink: "/teachers/schedule" },
          ],
        },
        {
          id: "classes",
          label: "nav.classes",
          iconSvg: ICON.classes,
          routerLink: "/classes",
          children: [
            { label: "classes.section", routerLink: "/section" },
            { label: "classes.create", routerLink: "/classes/form" },
            { label: "classes.list", routerLink: "/classes" },
            { label: "classes.assign", routerLink: "/classes/assignments" },
          ],
        },
        {
          id: "subjects",
          label: "nav.subjects",
          iconSvg: ICON.subjects,
          routerLink: "/subjects",
          children: [
            { label: "subjects.list", routerLink: "/subjects" },
            { label: "subjects.create", routerLink: "/subjects/new" },
            { label: "subjects.trimestres", routerLink: "/trimestre" },
            { label: "subjects.newTrimestre", routerLink: "/trimestre/new" },
            { label: "subjects.sequences", routerLink: "/sequence" },
            { label: "subjects.newSequence", routerLink: "/sequence/new" },
          ],
        },
      ],
    },
    {
      id: 'pedagogique',
      label: 'nav.categories.pedagogical',
      defaultOpen: false,
      items: [
        {
          id: "attendance",
          label: "nav.attendance",
          iconSvg: ICON.attendance,
          routerLink: "/attendance/daily",
          accessPolicy: ACCESS_POLICIES.attendanceRead,
          children: [
            { label: "attendance.daily", routerLink: "/attendance/daily" },
            { label: "attendance.justification", routerLink: "/attendance/justification" },
            { label: "attendance.absence", routerLink: "/attendance/absence" },
          ],
        },
        {
          id: "grades",
          label: "nav.grades",
          iconSvg: ICON.grades,
          routerLink: "/grades",
          accessPolicy: ACCESS_POLICIES.gradesRead,
          children: [
            { label: "grades.form", routerLink: "/grades/form" },
            { label: "grades.list", routerLink: "/grades" },
            { label: "grades.bulletin", routerLink: "/grades/bulletin" },
            { label: "grades.classReport", routerLink: "/grades/class-report" },
          ],
        },
      ],
    },
    {
      id: 'finance',
      label: 'nav.categories.finance',
      defaultOpen: false,
      items: [
        {
          id: "payments",
          label: "nav.payments",
          iconSvg: ICON.payments,
          routerLink: "/payments/list",
          accessPolicy: ACCESS_POLICIES.paymentsRead,
          children: [
            { label: "payments.new", routerLink: "/payments/new" },
            { label: "payments.list", routerLink: "/payments/list" },
          ],
        },
        {
          id: "reports",
          label: "nav.reports",
          iconSvg: ICON.reports,
          routerLink: "/reports/performance",
          accessPolicy: ACCESS_POLICIES.reportsRead,
          children: [
            { label: "reports.performance", routerLink: "/reports/performance" },
            { label: "reports.financial", routerLink: "/reports/financial" },
            { label: "reports.documents", routerLink: "/reports/documents" },
          ],
        },
      ],
    },
    {
      id: 'communication',
      label: 'nav.categories.communication',
      defaultOpen: false,
      items: [
        {
          id: "communication",
          label: "nav.communication",
          iconSvg: ICON.communication,
          comingSoon: true,
          children: [
            { label: "nav.internalMessaging", routerLink: "/communication", disabled: true },
            { label: "nav.alertsNotifications", routerLink: "/communication", disabled: true },
          ],
        },
      ],
    },
    {
      id: 'administration',
      label: 'nav.categories.administration',
      defaultOpen: false,
      items: [
        // {
        //   id: "staff",
        //   label: "staff",
        //   iconSvg: ICON.staff,
        //   routerLink: "/staff",
        //   accessPolicy: ACCESS_POLICIES.settingsRead,
        //   children: [
        //     { label: "list",   routerLink: "/staff" },
        //     { label: "new",    routerLink: "/staff/new" },
        //   ],
        // },
        {
          id: "settings",
          label: "nav.settings",
          iconSvg: ICON.settings,
          routerLink: "/settings",
          accessPolicy: ACCESS_POLICIES.settingsRead,
          children: [
            { label: "settings.users", routerLink: "/settings/users" },
            { label: "settings.preferences", routerLink: "/settings/preferences" },
            { label: "settings.audit", routerLink: "/settings/audit" },
            { label: "settings.fees", routerLink: "/montant" },
            { label: "settings.years", routerLink: "/annees" },
          ],
        },
        {
          id: "support",
          label: "nav.support",
          iconSvg: ICON.support,
          routerLink: "/support/helpcenter",
          children: [
            { label: "support.helpCenter", routerLink: "/support/helpcenter" },
            { label: "support.contact",    routerLink: "/support/contact" },
          ],
        },
      ],
    },
  ];

  isItemVisible(item: SidebarItems): boolean {
    return !item.accessPolicy || this.rbac.canAccess(item.accessPolicy);
  }

  isCategoryExpanded(category: SidebarCategory): boolean {
    const explicit = this.categoryState()[category.id];
    if (explicit !== undefined) return explicit;
    if (category.defaultOpen) return true;
    return category.items.some((item) => this.isMenuActive(item));
  }

  toggleCategory(categoryId: string, currentState: boolean): void {
    this.categoryState.update((s) => ({ ...s, [categoryId]: !currentState }));
  }

  toggleMenu(menuId: string): void {
    this.menuState.update((current) => ({
      ...current,
      [menuId]: !this.isMenuExpandedByState(menuId),
    }));
  }

  onMenuClick(item: SidebarItems): void {
    const shouldOpen = !this.isMenuExpanded(item);
    this.menuState.update((current) => ({
      ...current,
      [item.id]: shouldOpen,
    }));

    if (!shouldOpen || !item.routerLink || item.disabled || item.comingSoon) {
      return;
    }

    this.layoutService.closeSidebarMobile();
    void this.router.navigateByUrl(item.routerLink);
  }

  isMenuActive(item: SidebarItems): boolean {
    const currentUrl = this.router.url;
    if (item.routerLink && this.matchesRoute(currentUrl, item.routerLink)) return true;
    return item.children?.some(
      (child) => !child.disabled && this.matchesRoute(currentUrl, child.routerLink),
    ) ?? false;
  }

  isMenuExpanded(item: SidebarItems): boolean {
    const explicitState = this.menuState()[item.id];
    if (explicitState !== undefined) return explicitState;
    return this.isMenuActive(item);
  }

  private isMenuExpandedByState(menuId: string): boolean {
    return this.menuState()[menuId] ?? false;
  }

  safeIcon(svg: string | undefined): SafeHtml { return this.sanitizer.bypassSecurityTrustHtml(svg ?? ''); }

  logout(): void {
    this.authService.logout();
  }

  private matchesRoute(currentUrl: string, targetRoute: string): boolean {
    return (
      currentUrl === targetRoute ||
      currentUrl.startsWith(`${targetRoute}/`) ||
      currentUrl.startsWith(`${targetRoute}?`)
    );
  }
}


