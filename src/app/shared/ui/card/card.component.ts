import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

type CardPadding = "none" | "sm" | "md" | "lg";

@Component({
  selector: "app-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./card.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() padding: CardPadding = "none";
  @Input() hoverable = false;

  get cardClasses(): string {
    const base = "bg-white dark:bg-slate-700 overflow-hidden shadow rounded-lg";

    const paddingMap: Record<CardPadding, string> = {
      none: "",
      sm: "p-4",
      md: "p-5",
      lg: "p-6",
    };

    const hoverClass = this.hoverable
      ? "transition-shadow duration-200 hover:shadow-md"
      : "";

    return `${base} ${paddingMap[this.padding]} ${hoverClass}`.trim();
  }
}

