import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ThemeService } from "@app/core/services/theme/theme.service";
import { ButtonComponent } from "@app/shared/ui/button/button.component";

@Component({
  selector: "app-theme",
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl:"./theme.component.html",
})
export class ThemeComponent {
  private readonly themeService = inject(ThemeService);

  isDarkMode(): boolean {
    return this.themeService.darkModeSignal() === "dark";
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  ariaLabel(): string {
    return this.isDarkMode() ? "Activer theme clair" : "Activer theme sombre";
  }
}
