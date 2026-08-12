import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({ selector: 'app-modal', standalone: true, imports: [CommonModule], templateUrl: './modal.component.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class ModalComponent implements OnChanges, AfterViewInit {
  @Input() open = false;
  @Input() title = '';
  @Input() size: ModalSize = 'md';
  @Input() closeOnBackdrop = true;
  @Input() closeOnEscape = true;
  @Input() showCloseButton = true;
  @Input() showFooter = false;
  @Output() closed = new EventEmitter<void>();
  @ViewChild('panel') panel?: ElementRef<HTMLElement>;
  private previousFocus: HTMLElement | null = null;
  private viewReady = false;

  ngAfterViewInit(): void { this.viewReady = true; if (this.open) this.focusPanel(); }
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.viewReady || !changes['open']) return;
    if (this.open) { this.previousFocus = document.activeElement as HTMLElement | null; setTimeout(() => this.focusPanel()); }
    else { this.restoreFocus(); }
  }
  @HostListener('document:keydown.escape') handleEscapeKey(): void { if (this.open && this.closeOnEscape) this.requestClose(); }
  @HostListener('document:keydown', ['$event']) handleTabKey(event: KeyboardEvent): void {
    if (!this.open || event.key !== 'Tab' || !this.panel) return;
    const focusable = this.getFocusable(); if (!focusable.length) { event.preventDefault(); this.panel.nativeElement.focus(); return; }
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  onBackdropClick(event: MouseEvent): void { if (this.closeOnBackdrop && event.target === event.currentTarget) this.requestClose(); }
  requestClose(): void { this.restoreFocus(); this.closed.emit(); }
  get panelClasses(): string { const base = 'w-full max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-slate-800 border border-gray-200 dark:border-slate-700'; const sizeMap: Record<ModalSize, string> = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' }; return `${base} ${sizeMap[this.size]}`; }
  private focusPanel(): void { this.panel?.nativeElement.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus(); }
  private getFocusable(): HTMLElement[] { return Array.from(this.panel?.nativeElement.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? []).filter((item) => !item.hasAttribute('disabled')); }
  private restoreFocus(): void { const target = this.previousFocus; this.previousFocus = null; if (target && document.contains(target)) setTimeout(() => target.focus()); }
}
