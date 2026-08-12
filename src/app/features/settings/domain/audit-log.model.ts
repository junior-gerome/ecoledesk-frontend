export interface AuditLog {
  id: number;
  username?: string | null;
  action: string;
  dateAction?: string | null;
  ipAdresse?: string | null;
  tableCible?: string | null;
  referenceId?: number | null;
}
