import { Component, computed, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@app/core/services/i18n.service';
import { AppLanguage } from '@app/core/models/i18n.model';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './language-switcher.component.html',
})
export class LanguageSwitcherComponent {
  private readonly i18n = inject(I18nService);

  readonly currentFlag = computed(() => this.i18n.language() === 'fr' ? '🇫🇷' : '🇬🇧');
  readonly currentLabel = computed(() => this.i18n.language() === 'fr' ? 'FR' : 'EN');

  toggle(): void {
    const next: AppLanguage = this.i18n.language() === 'fr' ? 'en' : 'fr';
    this.i18n.setLanguage(next);
  }
}
