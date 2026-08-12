import { Injectable, inject, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { SessionService } from '@core/services';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  targetId: number;
  read: boolean;
  timestamp: Date;
}

interface NotificationMessage { body: string; }
interface NotificationSocketClient {
  connect(headers: Record<string, string>, onConnect: () => void, onError?: () => void): void;
  subscribe(destination: string, callback: (message: NotificationMessage) => void): void;
  disconnect(): void;
}
interface SockJsModule { default?: new (url: string) => unknown; }
type BrowserGlobal = typeof globalThis & { global?: typeof globalThis };

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly session = inject(SessionService);
  private stompClient: NotificationSocketClient | null = null;
  private readonly notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private connected = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  readonly connectionState = signal<'offline' | 'connecting' | 'connected' | 'error'>('offline');
  readonly connectionError = signal<string | null>(null);

  constructor() {
    if (this.session.isAuthenticated()) void this.initializeWebSocketConnection();
  }

  connectAfterLogin(): void {
    if (this.session.isAuthenticated()) void this.initializeWebSocketConnection();
  }

  private async initializeWebSocketConnection(): Promise<void> {
    if (this.connected || this.stompClient || !this.session.isAuthenticated()) return;
    const token = this.session.getToken();
    if (!token) return;
    this.connectionState.set('connecting');
    this.connectionError.set(null);
    try {
      const browserGlobal = globalThis as BrowserGlobal;
      browserGlobal.global ??= globalThis;
      const [{ Stomp }, sockJSImport] = await Promise.all([import('@stomp/stompjs'), import('sockjs-client')]);
      const SockJS = (sockJSImport as SockJsModule).default;
      if (!SockJS) throw new Error('SockJS unavailable');
      const ws = new SockJS(`${environment.apiUrl}/ws`);
      this.stompClient = Stomp.over(ws as never) as NotificationSocketClient;
      this.stompClient.connect({ Authorization: `Bearer ${token}` }, () => {
        this.connected = true;
        this.connectionState.set('connected');
        this.connectionError.set(null);
        const userId = this.session.getUserId();
        if (userId) this.stompClient?.subscribe(`/user/${userId}/notifications`, (message) => this.receive(message.body));
      }, () => this.scheduleReconnect());
    } catch {
      this.connectionState.set('error');
      this.connectionError.set('notifications.connectionError');
      this.scheduleReconnect();
    }
  }

  private receive(payload: string): void {
    try {
      const parsed = JSON.parse(payload) as Partial<Notification>;
      this.addNotification({
        id: parsed.id ?? this.generateId(),
        message: parsed.message ?? 'Nouvelle notification',
        type: parsed.type ?? 'info',
        targetId: Number(parsed.targetId ?? 0),
        read: Boolean(parsed.read),
        timestamp: parsed.timestamp ? new Date(parsed.timestamp) : new Date(),
      });
    } catch {
      this.connectionError.set('notifications.invalidMessage');
    }
  }

  private addNotification(notification: Notification): void {
    if (this.notificationsSubject.value.some((item) => item.id === notification.id)) return;
    this.notificationsSubject.next([notification, ...this.notificationsSubject.value]);
  }

  private scheduleReconnect(): void {
    this.connectionState.set('error');
    this.connectionError.set('notifications.connectionError');
    if (this.reconnectTimer || !this.session.isAuthenticated()) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.stompClient = null;
      this.connected = false;
      void this.initializeWebSocketConnection();
    }, 5000);
  }

  success(message: string, targetId = 0): void { this.addManual(message, 'success', targetId); }
  error(message: string, targetId = 0): void { this.addManual(message, 'error', targetId); }
  info(message: string, targetId = 0): void { this.addManual(message, 'info', targetId); }
  warning(message: string, targetId = 0): void { this.addManual(message, 'warning', targetId); }
  private addManual(message: string, type: Notification['type'], targetId: number): void {
    this.addNotification({ id: this.generateId(), message, type, targetId, read: false, timestamp: new Date() });
  }
  private generateId(): string { return Math.random().toString(36).substring(2, 15); }
  getNotifications(): Observable<Notification[]> { return this.notificationsSubject.asObservable(); }
  markAsRead(notificationId: string): void {
    this.notificationsSubject.next(this.notificationsSubject.value.map((item) => item.id === notificationId ? { ...item, read: true } : item));
  }
  clearNotifications(): void { this.notificationsSubject.next([]); }
  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.stompClient?.disconnect();
    this.stompClient = null;
    this.connected = false;
    this.connectionState.set('offline');
    this.connectionError.set(null);
    this.clearNotifications();
  }
}
