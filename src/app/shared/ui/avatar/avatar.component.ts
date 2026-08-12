import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from "@angular/core";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
type AvatarStatus = "none" | "online" | "away" | "busy" | "offline";

@Component({
  selector: "app-avatar",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./avatar.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent implements OnChanges {
  @Input() src = "";
  @Input() alt = "avatar";
  @Input() name = "";
  @Input() size: AvatarSize = "md";
  @Input() status: AvatarStatus = "none";
  @Input() rounded = true;

  imageFailed = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["src"]) {
      this.imageFailed = false;
    }
  }

  onImageError(): void {
    this.imageFailed = true;
  }

  get showImage(): boolean {
    return !!this.src && !this.imageFailed;
  }

  get initials(): string {
    const trimmed = this.name.trim();
    if (!trimmed) return "?";

    const parts = trimmed.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return `${first}${second}`.toUpperCase();
  }

  get avatarClasses(): string {
    const sizeMap: Record<AvatarSize, string> = {
      xs: "h-6 w-6 text-[10px]",
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
      xl: "h-16 w-16 text-lg",
    };

    const shape = this.rounded ? "rounded-full" : "rounded-lg";
    const base =
      "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-gray-200 text-gray-700 dark:bg-slate-600 dark:text-gray-100";

    return `${base} ${shape} ${sizeMap[this.size]}`;
  }

  get statusClasses(): string {
    const colorMap: Record<Exclude<AvatarStatus, "none">, string> = {
      online: "bg-green-500",
      away: "bg-amber-500",
      busy: "bg-red-500",
      offline: "bg-gray-400 dark:bg-gray-500",
    };

    if (this.status === "none") return "";
    return `absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-700 ${colorMap[this.status]}`;
  }
}

