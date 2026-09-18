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
    const base =
      "bg-white dark:bg-slate-800/90 overflow-hidden rounded-2xl ring-1 ring-slate-200/70 dark:ring-white/10 shadow-sm shadow-slate-200/60 dark:shadow-black/20";

    const paddingMap: Record<CardPadding, string> = {
      none: "",
      sm: "p-4",
      md: "p-5",
      lg: "p-6",
    };

    const hoverClass = this.hoverable
      ? "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70 dark:hover:shadow-black/30"
      : "";

    return `${base} ${paddingMap[this.padding]} ${hoverClass}`.trim();
  }
}

