import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '@app/shared/ui/button/button.component';

@Component({
  selector: 'app-forbidden-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <section class="flex min-h-[60vh] items-center justify-center p-6">
      <div class="max-w-xl rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-10 text-center shadow-lg dark:border-amber-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-300">
          Acces refuse
        </p>
        <h1 class="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Vous n'avez pas l'autorisation pour cette page.
        </h1>
        <p class="mt-4 text-sm text-gray-600 dark:text-gray-300">
          Revenez au tableau de bord ou reconnectez-vous avec un compte autorise.
        </p>
        <div class="mt-6 flex justify-center gap-3">
          <app-button type="button" variant="secondary" routerLink="/dashboard">
            Tableau de bord
          </app-button>
          <app-button type="button" variant="ghost" routerLink="/auth/login">
            Connexion
          </app-button>
        </div>
      </div>
    </section>
  `,
})
export class ForbiddenPageComponent {}
