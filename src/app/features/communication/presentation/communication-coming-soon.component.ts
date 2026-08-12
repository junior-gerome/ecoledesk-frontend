import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '@app/shared/page-header/page-header.component';
import { PageLayoutComponent } from '@app/shared/page-layout/page-layout.component';
import { AlertComponent } from '@app/shared/ui/alert/alert.component';
import { CardComponent } from '@app/shared/ui/card/card.component';

@Component({
  selector: 'app-communication-coming-soon',
  standalone: true,
  imports: [CommonModule, TranslateModule, PageLayoutComponent, PageHeaderComponent, CardComponent, AlertComponent],
  template: `
    <app-page-layout>
      <app-page-header [title]="'communication.title' | translate" />
      <app-card padding="lg" class="block">
        <app-alert type="info" [title]="'communication.unavailableTitle' | translate" [message]="'communication.unavailableDescription' | translate" />
        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <section class="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <h2 class="font-semibold">{{ 'communication.availableNowTitle' | translate }}</h2>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ 'communication.availableNowDescription' | translate }}</p>
          </section>
          <section class="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <h2 class="font-semibold">{{ 'communication.requiredContractTitle' | translate }}</h2>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ 'communication.requiredContractDescription' | translate }}</p>
          </section>
        </div>
      </app-card>
    </app-page-layout>
  `,
})
export class CommunicationComingSoonComponent {}
