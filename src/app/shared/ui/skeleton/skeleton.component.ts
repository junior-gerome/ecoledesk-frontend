import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div [class]="containerClass()" role="status" aria-live="polite" aria-label="Chargement en cours">
      @for (item of items(); track $index) {
        <div
          class="animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          [style.height]="height()"
          [style.width]="width()"
          aria-hidden="true"
        ></div>
      }
    </div>
  `,
})
export class SkeletonComponent {
  readonly count = input<number>(3);
  readonly height = input<string>('1.5rem');
  readonly width = input<string>('100%');
  readonly containerClass = input<string>('grid gap-3');
  readonly items = computed(() => Array.from({ length: this.count() }));
}

