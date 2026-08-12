import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, input } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="rounded-2xl border border-dashed border-gray-300 bg-white/80 p-8 text-center shadow-sm dark:border-gray-700 dark:bg-slate-800/60" role="status" aria-live="polite">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200" aria-hidden="true">
        {{ icon() }}
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ title() }}</h3>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ description() }}</p>
      @if (actionLabel()) {
        <div class="mt-5">
          <app-button variant="secondary" type="button" (clicked)="actionClicked.emit()">
            {{ actionLabel() }}
          </app-button>
        </div>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input<string>('Aucune donnée');
  readonly description = input<string>('Aucun résultat ne correspond à votre recherche.');
  readonly icon = input<string>('○');
  readonly actionLabel = input<string>('');

  @Output() readonly actionClicked = new EventEmitter<void>();
}

