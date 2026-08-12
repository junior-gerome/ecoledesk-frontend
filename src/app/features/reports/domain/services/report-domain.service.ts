import { Injectable } from '@angular/core';

@Injectable()
export class ReportDomainService {
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  defaultFromDate(): string {
    return this.formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  }

  today(): string {
    return this.formatDate(new Date());
  }
}
