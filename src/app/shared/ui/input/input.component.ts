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

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'number'
  | 'date'
  | 'url'
  | 'search'
  | 'hidden';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor, OnChanges {
  private static nextId = 0;

  @Input() label = '';
  @Input() id = '';
  @Input() required = false;
  @Input() readonly = false;
  @Input() type: InputType = 'text';
  @Input() placeholder = '';
  @Input() title = '';
  @Input('value') valueInput: string | number | null = null;
  @Input() min: number | string | null = null;
  @Input() max: number | string | null = null;
  @Input() step: number | string | null = null;
  @Input() minlength: number | null = null;
  @Input() maxlength: number | null = null;
  @Input() pattern: string | null = null;
  @Input() autocomplete: string | null = null;
  @Input() hint = '';
  @Input() control: AbstractControl | null = null;
  @Input() errorMessages: Record<string, string> = {};

  value = signal<string>('');
  disabled = signal(false);
  showPassword = signal(false);

  constructor() {
    this.ensureId();
  }

  get inputType(): string {
    return this.type === 'password' && this.showPassword() ? 'text' : this.type;
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

  get passwordToggleLabel(): string {
    return this.showPassword() ? 'Masquer le mot de passe' : 'Afficher le mot de passe';
  }

  get hasError(): boolean {
    return !!(this.control?.invalid && (this.control.touched || this.control.dirty));
  }

  get inputClasses(): string {
    const base = ['form-control'];

    if (this.hasError) {
      base.push('border-red-400 focus:border-red-500 focus:ring-red-400 dark:border-red-500');
    } else {
      base.push('border-gray-300 focus:border-blue-500 focus:ring-blue-400 dark:border-gray-600');
    }

    return base.join(' ');
  }

  get errorEntries(): Array<{ key: string; msg: string }> {
    const defaults: Record<string, string> = {
      required: 'Ce champ est requis',
      email: 'Adresse e-mail invalide',
      date: 'La date est requise',
      minlength: 'Valeur trop courte',
      maxlength: 'Valeur trop longue',
      pattern: 'Format invalide',
      min: 'Valeur trop petite',
      max: 'Valeur trop grande',
    };

    return Object.entries({ ...defaults, ...this.errorMessages }).map(([key, msg]) => ({ key, msg }));
  }

  private onChange = (_: string | number | null) => {};
  private onTouched = () => {};

  writeValue(value: string | number | null): void {
    this.value.set(value === null || value === undefined ? '' : String(value));
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  handleInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.value.set(raw);
    this.onChange(this.coerceValue(raw));
  }

  handleBlur(): void {
    this.onTouched();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      this.ensureId();
    }

    if (changes['valueInput']) {
      this.writeValue(changes['valueInput'].currentValue);
    }
  }

  private ensureId(): void {
    if (!this.id.trim()) {
      InputComponent.nextId += 1;
      this.id = 'app-input-' + InputComponent.nextId;
    }
  }

  private coerceValue(raw: string): string | number | null {
    if (this.type !== 'number') {
      return raw;
    }

    if (raw === '') {
      return null;
    }

    const parsed = Number(raw);
    return Number.isNaN(parsed) ? null : parsed;
  }
}

