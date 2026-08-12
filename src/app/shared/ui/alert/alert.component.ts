import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

type AlertType = "success" | "error" | "warning" | "info";

@Component({
  selector: "app-alert",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./alert.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  @Input() type: AlertType = "info";
  @Input() title = "";
  @Input() message = "";

  get alertClasses(): string {
    const variants: Record<AlertType, string> = {
      success:
        "rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300",
      error:
        "rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300",
      warning:
        "rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-900/40 dark:bg-yellow-900/20 dark:text-yellow-300",
      info:
        "rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300",
    };

    return variants[this.type];
  }
}
