import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { AuditLog } from "../../domain/audit-log.model";
import { AuditLogService } from "../../infrastructure/audit-log.service";

@Component({
  selector: "app-audit-log",
  standalone: true,
  imports: [CommonModule, TranslateModule, PageHeaderComponent, PageLayoutComponent],
  templateUrl: "./audit-log.component.html",
  styleUrls: ["./audit-log.component.scss"],
})
export class AuditLogComponent implements OnInit {
  private readonly auditLogService = inject(AuditLogService);

  readonly loading = signal(true);
  readonly logs = signal<AuditLog[]>([]);
  readonly error = signal("");

  ngOnInit(): void {
    this.auditLogService.getRecentLogs().subscribe({
      next: (logs) => {
        this.logs.set(logs);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Impossible de charger le journal d'audit.");
        this.loading.set(false);
      },
    });
  }
}
