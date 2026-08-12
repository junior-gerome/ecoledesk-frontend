import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { BadgeComponent } from '@app/shared/ui/badge/badge.component';
import { ButtonComponent } from '@app/shared/ui/button/button.component';
import { EmptyStateComponent } from '@app/shared/ui/empty-state/empty-state.component';
import {
  Notification,
  NotificationService,
} from './notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    BadgeComponent,
    EmptyStateComponent,
  ],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent implements OnInit {
  @ViewChild('triggerBtn', { read: ElementRef }) triggerBtn!: ElementRef<HTMLButtonElement>;

  readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef);

  readonly isOpen = signal(false);
  readonly notifications = signal<Notification[]>([]);
  readonly unreadCount = computed(() =>
    this.notifications().filter((n) => !n.read).length,
  );

  dropdownTop = 0;
  dropdownRight = 0;

  ngOnInit(): void {
    this.notificationService
      .getNotifications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((notifications) => {
        this.notifications.set(notifications);
      });
  }

  togglePanel(): void {
    if (!this.isOpen()) {
      const rect = this.triggerBtn.nativeElement.getBoundingClientRect();
      this.dropdownTop = rect.bottom + 8;
      this.dropdownRight = window.innerWidth - rect.right;
    }
    this.isOpen.update((v) => !v);
  }

  closePanel(): void {
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.closePanel();
    }
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId);
  }

  clearAll(): void {
    this.notificationService.clearNotifications();
  }

  getNotificationClasses(notification: Notification): string {
    const classes: Record<Notification['type'], string> = {
      success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/40 dark:text-green-100',
      error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100',
      info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100',
      warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100',
    };
    return classes[notification.type];
  }

  getBadgeVariant(notification: Notification): 'success' | 'danger' | 'info' | 'warning' {
    const variants: Record<Notification['type'], 'success' | 'danger' | 'info' | 'warning'> = {
      success: 'success',
      error: 'danger',
      info: 'info',
      warning: 'warning',
    };
    return variants[notification.type];
  }

  getTimeAgo(timestamp: Date): string {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return `${diff} sec`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
    return `${Math.floor(diff / 86400)} j`;
  }
}
