import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { AutoFocusDirective } from '@app/shared/directives/auto-focus.directive';

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutoFocusDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent<T = string> implements ControlValueAccessor, OnChanges {
  private static nextId = 0;

  @Input() label = '';
  @Input() id = '';
  @Input() options: SelectOption<T>[] = [];
  @Input() placeholder = '-- Choisir --';
  @Input() required = false;
  @Input() autoFocus = false;
  @Input() control: AbstractControl | null = null;
  @Input() hint = '';
  @Input() errorMessage = 'Ce champ est requis';

  protected value: T | null = null;
  protected selectedIndex: number | null = null;
  protected isDisabled = false;

  constructor() {
    this.ensureId();
  }

  protected get hasError(): boolean {
    return !!(this.control?.invalid && (this.control.touched || this.control.dirty));
  }

  protected get hintId(): string {
    return this.id + '-hint';
  }

  protected get errorId(): string {
    return this.id + '-error';
  }

  protected get describedBy(): string | null {
    if (this.hasError) {
      return this.errorId;
    }

    return this.hint ? this.hintId : null;
  }

  protected get selectClasses(): string {
    const base = ['form-control'];
    if (this.hasError) {
      base.push('border-red-400 focus:border-red-500 focus:ring-red-400 dark:border-red-500');
    } else {
      base.push('border-gray-300 focus:border-blue-500 focus:ring-blue-400 dark:border-gray-600');
    }
    return base.join(' ');
  }

  private onChange = (_: T | null) => {};
  private onTouched = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      this.ensureId();
    }

    if (changes['options']) {
      this.selectedIndex = this.computeSelectedIndex(this.value);
    }
  }

  writeValue(value: T | null): void {
    this.value = value ?? null;
    this.selectedIndex = this.computeSelectedIndex(this.value);
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled = disabled;
  }

  protected handleChange(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    if (raw === '') {
      this.value = null;
      this.selectedIndex = null;
      this.onChange(null);
      this.onTouched();
      return;
    }

    const idx = Number(raw);
    const nextValue = Number.isFinite(idx) && idx >= 0 && idx < this.options.length
      ? (this.options[idx]?.value ?? null)
      : null;

    this.value = nextValue;
    this.selectedIndex = nextValue === null ? null : idx;
    this.onChange(nextValue);
    this.onTouched();
  }

  private computeSelectedIndex(value: T | null): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    const index = this.options.findIndex((option) => option.value === value);
    return index >= 0 ? index : null;
  }

  private ensureId(): void {
    if (!this.id.trim()) {
      SelectComponent.nextId += 1;
      this.id = 'app-select-' + SelectComponent.nextId;
    }
  }
}

