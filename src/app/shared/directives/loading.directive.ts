import {
  DestroyRef,
  Directive,
  ElementRef,
  effect,
  inject,
  input,
  Renderer2,
} from '@angular/core';

@Directive({ selector: '[appLoading]', standalone: true })
export class LoadingDirective {
  readonly appLoading = input<boolean>(false);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private overlay: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.appLoading()) {
        this.showOverlay();
        return;
      }

      this.hideOverlay();
    });

    this.destroyRef.onDestroy(() => this.hideOverlay());
  }

  private showOverlay(): void {
    if (this.overlay) {
      return;
    }

    const hostElement = this.host.nativeElement;
    const currentPosition =
      typeof window !== 'undefined'
        ? window.getComputedStyle(hostElement).position
        : hostElement.style.position;

    if (!currentPosition || currentPosition === 'static') {
      this.renderer.setStyle(hostElement, 'position', 'relative');
    }

    const overlay = this.renderer.createElement('div');
    this.renderer.setAttribute(overlay, 'aria-hidden', 'true');
    this.renderer.setStyle(overlay, 'position', 'absolute');
    this.renderer.setStyle(overlay, 'inset', '0');
    this.renderer.setStyle(overlay, 'display', 'flex');
    this.renderer.setStyle(overlay, 'alignItems', 'center');
    this.renderer.setStyle(overlay, 'justifyContent', 'center');
    this.renderer.setStyle(overlay, 'borderRadius', 'inherit');
    this.renderer.setStyle(overlay, 'background', 'rgba(255,255,255,0.75)');
    this.renderer.setStyle(overlay, 'backdropFilter', 'blur(2px)');
    this.renderer.setStyle(overlay, 'zIndex', '10');

    const spinner = this.renderer.createElement('div');
    this.renderer.setStyle(spinner, 'width', '1.75rem');
    this.renderer.setStyle(spinner, 'height', '1.75rem');
    this.renderer.setStyle(spinner, 'borderRadius', '9999px');
    this.renderer.setStyle(spinner, 'border', '3px solid #cbd5e1');
    this.renderer.setStyle(spinner, 'borderTopColor', '#0284c7');
    this.renderer.setStyle(spinner, 'animation', 'spin 0.8s linear infinite');

    this.renderer.appendChild(overlay, spinner);
    this.renderer.appendChild(hostElement, overlay);
    this.renderer.setAttribute(hostElement, 'aria-busy', 'true');
    this.overlay = overlay;
  }

  private hideOverlay(): void {
    if (!this.overlay) {
      return;
    }

    this.renderer.removeChild(this.host.nativeElement, this.overlay);
    this.renderer.removeAttribute(this.host.nativeElement, 'aria-busy');
    this.overlay = null;
  }
}
