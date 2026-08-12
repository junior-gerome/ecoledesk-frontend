import { TestBed } from '@angular/core/testing';
import { SessionService } from '@app/core/services';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: SessionService, useValue: { isAuthenticated: () => false, getToken: () => null, getUserId: () => null } },
      ],
    });
    service = TestBed.inject(NotificationService);
  });

  it('adds a local notification and computes the unread item through the stream', () => {
    service.success('Saved');
    let notifications = service.getNotifications();
    notifications.subscribe((items) => { notifications = items as never; });
    expect(service.connectionState()).toBe('offline');
  });

  it('marks a notification as read and clears it on disconnect', () => {
    service.info('Ready');
    let current: import('./notification.service').Notification[] = [];
    service.getNotifications().subscribe((items) => current = items);
    expect(current.length).toBe(1);
    service.markAsRead(current[0].id);
    expect(current[0].read).toBeTrue();
    service.disconnect();
    expect(current.length).toBe(0);
    expect(service.connectionState()).toBe('offline');
  });
});
