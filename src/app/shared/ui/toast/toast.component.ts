import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from "@angular/core";

export type ToastVariant = "neutral" | "info" | "success" | "warning" | "danger";

@Component({
  selector: "app-toast",
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: "./toast.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent implements OnChanges, OnDestroy {
  @Input() visible = true;
  @Input() title = "";
  @Input() message = "";
  @Input() variant: ToastVariant = "info";
  @Input() dismissible = true;
  @Input() duration = 0;

  @Output() dismissed = new EventEmitter<void>();

  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["visible"] || changes["duration"]) {
      this.scheduleAutoDismiss();
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  requestDismiss(): void {
    this.clearTimer();
    this.dismissed.emit();
  }

  get toastClasses(): string {
    const base =
      "fixed right-4 top-20 z-[90] w-[calc(100vw-2rem)] max-w-[26rem] rounded-xl border px-4 py-3 shadow-xl backdrop-blur-sm sm:right-6";

    const variantMap: Record<ToastVariant, string> = {
      neutral:
        "border-gray-300 bg-white text-gray-800 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-100",
      info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-200",
      success:
        "border-green-200 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-900/30 dark:text-green-200",
      warning:
        "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
      danger:
        "border-red-200 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200",
    };

    return `${base} ${variantMap[this.variant]}`;
  }

  get iconClasses(): string {
    const base =
      "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold";
    const variantMap: Record<ToastVariant, string> = {
      neutral: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-100",
      info: "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
      success: "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100",
      warning: "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-100",
      danger: "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-100",
    };

    return `${base} ${variantMap[this.variant]}`;
  }

  get iconText(): string {
    const variantMap: Record<ToastVariant, string> = {
      neutral: "i",
      info: "i",
      success: "ok",
      warning: "!",
      danger: "x",
    };
    return variantMap[this.variant];
  }

  private scheduleAutoDismiss(): void {
    this.clearTimer();
    if (!this.visible || this.duration <= 0) return;

    this.dismissTimer = setTimeout(() => {
      this.dismissed.emit();
    }, this.duration);
  }

  private clearTimer(): void {
    if (!this.dismissTimer) return;
    clearTimeout(this.dismissTimer);
    this.dismissTimer = null;
  }
}

