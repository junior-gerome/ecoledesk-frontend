import { Directive, ElementRef, Input, OnChanges, Renderer2 } from "@angular/core";

@Directive({
  selector: "[appStatusBadge]",
  standalone: true,
})
export class StatusBadgeDirective implements OnChanges {
  @Input("appStatusBadge") statusValue = "";

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2
  ) {}

  ngOnChanges(): void {
    const element = this.elementRef.nativeElement;
    this.renderer.setAttribute(element, "class", this.resolveClasses(this.statusValue));
  }

  private resolveClasses(status: string): string {
    const base = "inline-flex rounded-full px-2 py-1 text-xs font-medium";
    const normalized = (status || "").toUpperCase();

    if (normalized.includes("PRESENT")) {
      return `${base} bg-emerald-100 text-emerald-700`;
    }
    if (normalized.includes("LATE")) {
      return `${base} bg-amber-100 text-amber-700`;
    }
    if (normalized.includes("ABSENT")) {
      return `${base} bg-red-100 text-red-700`;
    }
    if (normalized.includes("JUSTIF")) {
      return `${base} bg-sky-100 text-sky-700`;
    }

    return `${base} bg-gray-100 text-gray-700`;
  }
}
