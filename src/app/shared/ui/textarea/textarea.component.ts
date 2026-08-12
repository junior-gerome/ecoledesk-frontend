import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  OnChanges,
  signal,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './textarea.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent implements ControlValueAccessor, OnChanges {
  private static nextId = 0;

  @Input() label = '';
  @Input() id = '';
  @Input() placeholder = '';
  @Input() rows = 3;
  @Input() required = false;
  @Input() hint = '';
  @Input() control: AbstractControl | null = null;
  @Input() errorMessages: Record<string, string> = {};

  value = signal<string>('');
  disabled = signal(false);

  constructor() {
    this.ensureId();
  }

  get hasError(): boolean {
    return !!(this.control?.invalid && (this.control.touched || this.control.dirty));
  }

  get textareaClasses(): string {
    const base = ['form-control'];
    if (this.hasError) {
      base.push('border-red-400 focus:border-red-500 focus:ring-red-400 dark:border-red-500');
    } else {
      base.push('border-gray-300 focus:border-blue-500 focus:ring-blue-400 dark:border-gray-600');
    }
    return base.join(' ');
  }

  get hintId(): string {
    return this.id + '-hint';
  }

  get errorId(): string {
    return this.id + '-error';
  }

  get describedBy(): string | null {
    if (this.hasError) {
      return this.errorId;
    }

    return this.hint ? this.hintId : null;
  }

  get errorEntries(): Array<{ key: string; msg: string }> {
    const defaults: Record<string, string> = {
      required: 'Ce champ est requis',
      minlength: 'Valeur trop courte',
      maxlength: 'Valeur trop longue',
      pattern: 'Format invalide',
    };

    return Object.entries({ ...defaults, ...this.errorMessages }).map(([key, msg]) => ({ key, msg }));
  }

  private onChange = (_: string) => {};
  private onTouched = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      this.ensureId();
    }
  }

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  handleInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  handleBlur(): void {
    this.onTouched();
  }

  private ensureId(): void {
    if (!this.id.trim()) {
      TextareaComponent.nextId += 1;
      this.id = 'app-textarea-' + TextareaComponent.nextId;
    }
  }
}

