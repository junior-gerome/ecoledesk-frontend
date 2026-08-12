import { AfterViewInit, Directive, ElementRef, Input } from "@angular/core";

@Directive({
  selector: "[appAutoFocus]",
  standalone: true,
})
export class AutoFocusDirective implements AfterViewInit {
  @Input("appAutoFocus") shouldFocus = true;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (!this.shouldFocus) return;

    queueMicrotask(() => {
      this.elementRef.nativeElement.focus();
    });
  }
}
