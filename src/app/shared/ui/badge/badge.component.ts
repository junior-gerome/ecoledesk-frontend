import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

export type BadgeVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

@Component({
  selector: "app-badge",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./badge.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = "neutral";
  @Input() size: "xs" | "sm" = "xs";
  @Input() dot = false;

  get badgeClasses(): string {
    const base = "badge";
    const sizeClass = this.size === "sm" ? "badge-sm" : "badge-xs";
    const variantClass = `badge-${this.variant}`;

    return `${base} ${sizeClass} ${variantClass}`;
  }

  get dotClasses(): string {
    const base = "h-1.5 w-1.5 rounded-full";

    const variantMap: Record<BadgeVariant, string> = {
      neutral: "bg-gray-500 dark:bg-gray-300",
      info: "bg-blue-500 dark:bg-blue-300",
      success: "bg-green-500 dark:bg-green-300",
      warning: "bg-amber-500 dark:bg-amber-300",
      danger: "bg-red-500 dark:bg-red-300",
    };

    return `${base} ${variantMap[this.variant]}`;
  }
}
