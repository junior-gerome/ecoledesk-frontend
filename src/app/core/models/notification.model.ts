export type NotificationVariant = "success" | "info" | "warning" | "danger";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  variant: NotificationVariant;
  createdAt: string;
  read?: boolean;
}
