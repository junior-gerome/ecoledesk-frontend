import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pagination', standalone: true, imports: [CommonModule, TranslateModule], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="flex flex-wrap items-center justify-center gap-3" [attr.aria-label]="ariaLabel | translate">
      <button type="button" class="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50" [disabled]="currentPage <= 1" (click)="goToPage(currentPage - 1)" [attr.aria-label]="previousLabel | translate">{{ previousText | translate }}</button>
      <span class="text-sm text-gray-600" aria-live="polite">{{ 'common.pageOf' | translate:{ current: currentPage, total: totalPages } }}</span>
      <button type="button" class="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50" [disabled]="currentPage >= totalPages" (click)="goToPage(currentPage + 1)" [attr.aria-label]="nextLabel | translate">{{ nextText | translate }}</button>
    </nav>
  `,
})
export class PaginationComponent {
  @Input() currentPage = 1; @Input() totalPages = 1; @Input() ariaLabel = 'common.pagination';
  @Input() previousText = 'common.previous'; @Input() nextText = 'common.next';
  @Input() previousLabel = 'common.previousPage'; @Input() nextLabel = 'common.nextPage';
  @Output() readonly pageChange = new EventEmitter<number>();
  goToPage(page: number): void { if (page < 1 || page > this.totalPages || page === this.currentPage) return; this.pageChange.emit(page); }
}
